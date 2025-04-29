FROM python:3.9-slim-buster AS base

COPY bifrost_queue_broker_lims_request/requirements.txt .
RUN pip install -r requirements.txt

COPY usr/local/share/ca-certificates/ usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates 

# COPY bifrost_queue_broker/brokers/ /app/brokers/
COPY common/ /app/common/
COPY brokers/ /app/brokers/
COPY api_clients/ /app/api_clients/
COPY bifrost_queue_broker_lims_request/main.py /app/bifrost_queue_broker_lims_request/
COPY bifrost_queue_broker_lims_request/lims_request_broker_sync.py /app/bifrost_queue_broker_lims_request/

ENV LOGLEVEL="INFO"
ENV PYTHONPATH=/app
WORKDIR /app/
CMD [ "python", "-u", "bifrost_queue_broker_lims_request/main.py" ]

FROM base AS final
