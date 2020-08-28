FROM tiangolo/meinheld-gunicorn-flask:python3.8

ADD ./requirements.txt .
RUN pip install -r requirements.txt

COPY ./ /app
RUN chmod +x start.sh