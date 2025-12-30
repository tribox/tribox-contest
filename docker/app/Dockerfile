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

# Poetryをシステム全体にインストール
RUN pip install --no-cache-dir poetry
ENV PATH /usr/local/bin:$PATH
RUN poetry config virtualenvs.create false

# Python App
ENV FLASK_APP=src.app:app
COPY pyproject.toml poetry.lock README.md ./
COPY src src
RUN poetry install

# セキュリティ対策: 非rootユーザーを作成して切り替え
# RUN addgroup --system --gid 1000 triboxcontest \
#     && adduser --system --uid 1000 --ingroup triboxcontest triboxcontest \
#     && chown -R triboxcontest:triboxcontest /app
RUN addgroup --system --gid 1000 triboxcontest \
    && adduser --system --uid 1000 --ingroup triboxcontest triboxcontest
USER triboxcontest

EXPOSE 5000
