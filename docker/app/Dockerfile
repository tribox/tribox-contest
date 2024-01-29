FROM python:3.12-bullseye
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt update \
  && apt install -y default-mysql-client \
  && apt install --no-install-recommends -y tzdata \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Poetry
RUN curl -sSL https://install.python-poetry.org | python -
ENV PATH /root/.local/bin:$PATH
RUN poetry config virtualenvs.create false

# App
ENV FLASK_APP=src.app:app
# 0: production / 1: development
ENV FLASK_DEBUG=1
COPY pyproject.toml poetry.lock README.md ./
COPY src src

RUN poetry install
