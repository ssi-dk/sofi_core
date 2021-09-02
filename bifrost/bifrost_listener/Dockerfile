FROM python:3.9-slim-buster AS base 

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ["__init__.py", "main.py", "aggregation.py", "/app/"]

CMD [ "python", "-u", "/app/main.py" ]

FROM base AS final