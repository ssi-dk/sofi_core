FROM python:3.9-slim-buster AS base

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY brokers/ /app/brokers/
COPY common/ /app/common/
COPY api_clients/ /app/api_clients/
COPY main.py /app/

ENV LOGLEVEL="INFO"

CMD [ "python", "-u", "/app/main.py" ]

FROM base AS testing
COPY ["test-requirements.txt", "/app/"]
COPY tests/ /app/tests
COPY .certs/ /app/.certs
WORKDIR /app/
RUN pip install -r test-requirements.txt
LABEL test=true
RUN pytest tests --junitxml=junit.xml; exit 0

FROM base AS final
