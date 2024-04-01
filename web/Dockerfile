FROM tiangolo/meinheld-gunicorn-flask:python3.8-2023-06-19@sha256:d5e0957705c1d74e6f6b5bbfb7145bad3f9487a5bee8cdfbaef68250d9bb9f1f AS base

COPY ["requirements.txt", "/app/"]
RUN pip install -r requirements.txt

COPY usr/local/share/ca-certificates/ usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates 

COPY ["main.py", "start.sh", "gunicorn_conf.py", "/app/"]
COPY "permission-config.jsonc" "/app/"
COPY src /app/web/src
COPY openapi_specs /app/openapi_specs
RUN chmod +x start.sh

FROM base AS testingbase
COPY ["test-requirements.txt", "/app/"]
RUN pip install -r test-requirements.txt

FROM testingbase AS testing
COPY tests /app/tests
LABEL test=true
RUN pytest -rx tests --junitxml=junit.xml; exit 0

FROM base AS final