FROM python:3.9-slim-buster AS base

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ["main.py", "refresh_view.js", "/app/"]

CMD [ "python", "-u", "/app/main.py" ]

FROM base AS final