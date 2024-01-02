from python:3-slim

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y gcc libpq-dev wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./requirements.txt requirements.txt

RUN pip install -r requirements.txt
