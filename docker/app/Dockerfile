FROM python:3.12-bullseye

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

RUN apt update \
    && apt install -y default-mysql-client \
    && apt install --no-install-recommends -y tzdata curl \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Poetry
RUN curl -sSL https://install.python-poetry.org | python -
ENV PATH /root/.local/bin:$PATH
RUN poetry config virtualenvs.create false

# Python App
ENV FLASK_APP=src.app:app
COPY pyproject.toml poetry.lock README.md ./
COPY src src
RUN poetry install

EXPOSE 5000
