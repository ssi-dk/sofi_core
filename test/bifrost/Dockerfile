FROM python:3.9-slim-buster AS base

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY .. .

#CMD [ "python", "-m", "unittest", "AggregationPipelineTest.py" ]

ENTRYPOINT ["python", "-m", "unittest"]

FROM base AS final