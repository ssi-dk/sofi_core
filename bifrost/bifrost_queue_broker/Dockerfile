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
env TBR_API_URL="https://tbr_integration:5000"

ENV LOGLEVEL="INFO"

CMD [ "python", "-u", "/app/main.py" ]

FROM base AS final