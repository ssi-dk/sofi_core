FROM python:3.9-slim-buster AS base

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY brokers/ /app/brokers/
COPY api_clients/ /app/api_clients/
COPY main.py /app/

ENV MONGO_HOST="bifrost_db"
ENV MONGO_PORT="27017"
ENV MONGO_DB="bifrost_test"
ENV MONGO_QUEUE_COLLECTION="sap_broker_queue"
ENV MONGO_TBR_METADATA_COLLECTION="sap_tbr_metadata"
ENV MONGO_LIMS_METADATA_COLLECTION="sap_lims_metadata"

env TBR_API_URL="https://tbr_integration"
env LIMS_API_URL="https://lims_integration"

ENV LOGLEVEL="INFO"

CMD [ "python", "-u", "/app/main.py" ]

FROM base AS testing
COPY ["test-requirements.txt", "/app/"]
COPY tests/ /app/tests
WORKDIR /app/
RUN pip install -r test-requirements.txt
LABEL test=true
RUN pytest tests --junitxml=junit.xml; exit 0

FROM base AS final
