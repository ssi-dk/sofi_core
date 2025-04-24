FROM python:3.9-slim-buster AS base

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY usr/local/share/ca-certificates/ usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates 

COPY brokers/ /app/brokers/
COPY common/ /app/common/
COPY api_clients/ /app/api_clients/
COPY main.py /app/

ENV LOGLEVEL="INFO"
WORKDIR /app/
CMD [ "python", "-u", "main.py" ]

FROM base AS testing
COPY ["test-requirements.txt", "/app/"]
COPY tests/ /app/tests
WORKDIR /app/
RUN pip install -r test-requirements.txt
LABEL test=true
RUN pytest tests --junitxml=junit.xml; exit 0

FROM base AS final
