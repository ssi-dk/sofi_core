FROM tiangolo/meinheld-gunicorn-flask:python3.8 AS base

COPY web/requirements.txt .
RUN pip install -r requirements.txt

COPY openapi_specs /app/openapi_specs/

COPY ["web/main.py", "web/start.sh", "web/gunicorn_conf.py", "/app/"]
COPY "web/permission-config.jsonc" "/app/"
COPY web/src /app/web/src
RUN chmod +x start.sh

FROM base AS testingbase
COPY ["web/test-requirements.txt", "/app/"]
RUN pip install -r test-requirements.txt

FROM testingbase AS testing
COPY web/tests /app/tests
LABEL test=true
RUN pytest -rx tests --junitxml=junit.xml; exit 0

FROM base AS final