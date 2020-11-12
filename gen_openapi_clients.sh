rm -r web/src/services/lims/openapi
docker run --rm --user "$(id -u):$(id -g)" -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
    -i /local/openapi_specs/lims.v1.yaml \
    -g python \
    -o /local \
    --additional-properties packageName=web.src.services.lims.openapi \
    --additional-properties generateSourceCodeOnly=true \
    --global-property apiTests=false,apiDocs=false \
    --global-property modelTests=false,modelDocs=false