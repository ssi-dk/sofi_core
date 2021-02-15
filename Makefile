
SHELL := /bin/bash

mkfile_u := $(shell id -u)
mkfile_g := $(shell id -g)
mkfile_user := $(mkfile_u):$(mkfile_g)
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
mkfile_dir := $(subst /Makefile,,$(mkfile_path))

.PHONY: all clean test

all: clean build

clean:
	rm -rf ${mkfile_dir}/bifrost/bifrost_db/data/db/*
	rm -rf ${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/tbr_client/
	rm -rf ${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/lims_client/
	rm -rf ${mkfile_dir}/auth/pg/pgdata/*
	rm -rf ${mkfile_dir}/web/src/SAP/generated/
	rm -rf ${mkfile_dir}/sap_tbr_integration/DG.SAP.TBRIntegration/bin/
	rm -rf ${mkfile_dir}/sap_tbr_integration/DG.SAP.TBRIntegration/obj/
	docker-compose rm -vf

${mkfile_dir}/.env : ${mkfile_dir}/.env.local.example
	if [ ! -f ${mkfile_dir}/.env ]; then \
		echo "existing .env found, not overwriting" \
	else \
		echo "no .env found, generating ..."; \
		cp ${mkfile_dir}/.env.local.example ${mkfile_dir}/.env; \
		cat ${mkfile_dir}/.env; \
		echo ""; \
	fi

${mkfile_dir}/.certs/sofi.local.crt : ${mkfile_dir}/.env
	export $(grep -Ev '^#' ${mkfile_dir}/.env | xargs) && \
	echo "Generating new dev certificates for ${SOFI_HOSTNAME} ..." && \
	openssl genrsa -out ${mkfile_dir}/.certs/sofi.local.pem 4096 && \
	openssl req -new \
				-x509 \
				-sha256 \
				-key ${mkfile_dir}/.certs/sofi.local.pem \
				-out ${mkfile_dir}/.certs/sofi.local.crt \
				-days 365 \
				-nodes \
				-addext "subjectAltName = DNS:${SOFI_HOSTNAME}" \
				-subj "/CN=${SOFI_HOSTNAME}"
	# Attempting to trust the dev certificates on local machine ...
	sudo ln -s "${mkfile_dir}/.certs/sofi.local.crt" /usr/local/share/ca-certificates/sofi.local.crt
	sudo update-ca-certificates

${mkfile_dir}/node_modules :
	# install lefthook for management of git hooks
	yarn add -D @arkweid/lefthook

lefthook : ${mkfile_dir}/node_modules
	# install autoformatting tools: prettier, black
	yarn exec lefthook install
	pip3 install black

${mkfile_dir}/app/src/sap-client : ${mkfile_dir}/openapi_specs/SAP/SAP.yaml
	# Generate web app client
	rm -rf "${mkfile_dir}/app/sap-client/src"
	rm -rf "${mkfile_dir}/app/sap-client/dist"
	docker run --rm -v "${mkfile_dir}:/mnt" \
		--user ${mkfile_user} \
		"openapitools/openapi-generator:cli-v5.0.0" \
		generate \
		-i "/mnt/openapi_specs/SAP/SAP.yaml" \
		--additional-properties=modelPropertyNaming=original,enumPropertyNaming=original \
		-g typescript-redux-query \
		-o /mnt/app/src/sap-client
	cp -r "${mkfile_dir}/app/src/sap-client/src/"* "${mkfile_dir}/app/src/sap-client"
	rm -rf "${mkfile_dir}/app/src/sap-client/src/"
	yarn --cwd "${mkfile_dir}/app/" prettier --write src/

${mkfile_dir}/web/src/SAP/generated : ${mkfile_dir}/openapi_specs/SAP/SAP.yaml
	# Generate flask api
	docker run --rm -v "${mkfile_dir}:/mnt" \
		--user ${mkfile_user} \
		"openapitools/openapi-generator:cli-v4.3.1" \
		generate \
		-i "/mnt/openapi_specs/SAP/SAP.yaml" \
		-g python-flask \
		-o "/mnt/web/src/SAP" \
		-t "/mnt/openapi_specs/SAP/templates" \
		-c "/mnt/openapi_specs/SAP/SAP-config.yaml"
	rm -rf "${mkfile_dir}/web/src/SAP/generated"
	mv "${mkfile_dir}/web/src/SAP/web/src/SAP/generated" "${mkfile_dir}/web/src/SAP/generated"

${mkfile_dir}/web/src/services/lims/openapi : ${mkfile_dir}/openapi_specs/lims.v1.yaml
	# Generate LIMS client for flask api
	rm -rf ${mkfile_dir}/web/src/services/lims/openapi
	docker run --rm -v "${mkfile_dir}:/local" \
		--user ${mkfile_user} \
		"openapitools/openapi-generator:cli-v5.0.0" \
		generate \
		-i /local/openapi_specs/lims.v1.yaml \
		-g python \
		-o /local \
		--additional-properties packageName=web.src.services.lims.openapi \
		--additional-properties generateSourceCodeOnly=true \
		--global-property apiTests=false,apiDocs=false \
		--global-property modelTests=false,modelDocs=false

${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/tbr_client : ${mkfile_dir}/openapi_specs/tbr.v1.yaml
	# Generate TBR client for broker
	rm -rf ${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/tbr_client
	docker run --rm -v "${mkfile_dir}:/local" \
		--user ${mkfile_user} \
		"openapitools/openapi-generator:cli-v5.0.0" \
		generate \
		-i /local/openapi_specs/tbr.v1.yaml \
		-g python \
		-o /local/bifrost/bifrost_queue_broker \
		--additional-properties packageName=api_clients.tbr_client \
		--additional-properties generateSourceCodeOnly=true \
		--global-property apiTests=false,apiDocs=false \
		--global-property modelTests=false,modelDocs=false

${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/lims_client : ${mkfile_dir}/openapi_specs/lims.v1.yaml
	# Generate LIMS client for broker
	rm -rf ${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/lims_client
	docker run --rm -v "${mkfile_dir}:/local" \
		--user ${mkfile_user} \
		"openapitools/openapi-generator:cli-v5.0.0" \
		generate \
		-i /local/openapi_specs/lims.v1.yaml \
		-g python \
		-o /local/bifrost/bifrost_queue_broker \
		--additional-properties packageName=api_clients.lims_client \
		--additional-properties generateSourceCodeOnly=true \
		--global-property apiTests=false,apiDocs=false \
		--global-property modelTests=false,modelDocs=false

${mkfile_dir}/app/node_modules/ : ${mkfile_dir}/app/package.json
	pushd ${mkfile_dir}/app && yarn install

build: ${mkfile_dir}/app/src/sap-client ${mkfile_dir}/web/src/SAP/generated ${mkfile_dir}/web/src/services/lims/openapi
	CURRENT_UID=${mkfile_user} docker-compose build --no-cache

RUN_DEPS := ${mkfile_dir}/app/src/sap-client ${mkfile_dir}/web/src/SAP/generated 
RUN_DEPS += ${mkfile_dir}/web/src/services/lims/openapi ${mkfile_dir}/app/node_modules/
RUN_DEPS += ${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/tbr_client ${mkfile_dir}/bifrost/bifrost_queue_broker/api_clients/lims_client 
RUN_DEPS += ${mkfile_dir}/.env
RUN_DEPS += lefthook
run: $(RUN_DEPS)
	CURRENT_UID=${mkfile_user} docker-compose up --build
