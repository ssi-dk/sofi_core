FROM python:3.9-slim-buster AS base

COPY usr/local/share/ca-certificates/ usr/local/share/ca-certificates/
RUN /usr/sbin/update-ca-certificates  

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ["__init__.py", "main.py", "aggregation.py", "/app/"]

CMD [ "python", "-u", "/app/main.py" ]

FROM base AS final