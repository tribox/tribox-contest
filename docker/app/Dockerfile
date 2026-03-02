FROM python:3.12-bullseye

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

# Essential packages + Node.js 20 (via NodeSource) + PHP (cli) をインストール
RUN apt update \
    && apt install -y --no-install-recommends \
        default-mysql-client \
        tzdata curl ca-certificates gnupg \
        php-cli php-mbstring \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt install -y --no-install-recommends nodejs \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# PHP設定ファイル追加
COPY docker/app/99-mbstring.ini /etc/php/7.4/cli/conf.d/99-mbstring.ini

# Admin App
WORKDIR /app
COPY contestmanager contestmanager
WORKDIR /app/contestmanager
RUN npm install

# Poetryをシステム全体にインストール
WORKDIR /app
RUN pip install --no-cache-dir poetry
ENV PATH /usr/local/bin:$PATH
RUN poetry config virtualenvs.create false

# Python App
ENV FLASK_APP=src.app:app
COPY pyproject.toml poetry.lock README.md ./
COPY src src
RUN poetry install

# セキュリティ対策: アプリケーションユーザーとして非rootユーザーを作成
RUN addgroup --system --gid 1000 triboxcontest \
    && adduser --system --uid 1000 --ingroup triboxcontest triboxcontest \
    && chown -R triboxcontest:triboxcontest /app

# アプリケーションユーザーへ切り替え
USER triboxcontest

EXPOSE 5000
