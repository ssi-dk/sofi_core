FROM tiangolo/meinheld-gunicorn-flask:python3.8

COPY ./requirements.txt .
RUN pip install -r requirements.txt

COPY ["main.py", "gunicorn_conf.py", "openapi-specs", "seed_data", "web", "/app"]
RUN chmod +x start.sh