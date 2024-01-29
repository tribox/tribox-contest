# TORIBO Contest

(Python版, あとで README.md に置き換える用)


## Requirements

* Docker
* Poetry
* Python 3.12
* Node.js v8.14.0
* [TNoodle](https://github.com/cubing/tnoodle) v0.14.0
* [Sarumawashi](https://github.com/kotarot/Sarumawashi)
* wca-importer
* [PHPMailer](https://github.com/PHPMailer/PHPMailer) is needed in the `contestmanager` directory.


## Setup

アプリケーションの設定ファイル:
```bash
cp .env.example .env
```

Firebase の用意:
```bash
TODO
```

MySQL データベースの用意:
```bash
TODO
```

Firebase Admin SDK サービスアカウントの秘密鍵をダウンロードして `contestmanager/secret/serviceAccountKey.json` に保存する。


## Run

### Flask アプリケーション起動

```bash
# Dockerを使わない場合
poetry install
FLASK_APP="src.app:app" flask run --host=0.0.0.0 --port=5000

# Dockerで起動する場合
docker compose up
```
