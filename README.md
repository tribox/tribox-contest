# tribox Contest

tribox Contest is an Online Rubik's Cube Competition organized by [Tribox Inc](http://tribox.com).
The application is based on [Play Framework](https://www.playframework.com) and [Firebase](https://www.firebase.com).

URL: https://contest.tribox.com


## Requirements

* Java 8
* Scala 2.11.8
* Node.js v0.10.42
* [TNoodle](https://github.com/cubing/tnoodle) v0.11.1
* [Sarumawashi](https://github.com/kotarot/Sarumawashi)
* [wca-importer](https://github.com/kotarot/wca-importer)


## Setup

Install required node modules.
```
cd contestmanager
npm install firebase firebase-token-generator alg async argv mysql request twitter
```

Set up config files.
```
cd conf
cp prod.conf.sample prod.conf
```
Edit `prod.conf`.

```
cd contestmanager
cp config.js.sample config.js
```
Edit `config.js`.


## Run

### http サーバ起動

```
(開発) activator run -Dconfig.resource=dev.conf
(本番) activator clean stage && target/universal/stage/bin/contest -Dconfig.file=/path/to/contestapp/conf/prod.conf
```

### [1週間に1回] 日曜日午後9時 (JST) 自動実行

inProgressのコンテストを書き換える。
毎週日曜日の午後9時0分0.001秒に実行すればよいが、実行時刻に合わせるだけなのでいつでも好きなだけ実行して大丈夫。
```
node contestmanager/update-inprogress.js
```

結果の集計をする。
```
node contestmanager/collect-results.js --contest=2016121 --lottery --tweet
node contestmanager/collect-results.js --lastcontest --lottery --tweet
```
`--contest` オプションは指定したコンテストの結果を集計する。
`--lastcontest` を指定した場合は、inProgress.lastContest のコンテストが対象となる。
`--lottery` を指定した場合は、当選ポイント抽選して、該当者をfirebaseに書き込む。さらにポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。
`--lotteryall` を指定した場合は、認証アカウントかつDNFでない結果に対して当選ポイントを記録する。上のオプションと同様に、ポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。
`--tweet` オプションは付けると結果をツイートする。

ポイント加算する。
```
node contestmanager/append-points.js
```
上の `collect-results.js` スクリプトを実行して該当者を待ちレコードに記録した後に実行する。
本当に対象者が正しいことを目視で確認した後、このスクリプトを実行して実際に抽選ポイントをストアポイントに加算する。

### [半年に1回程度] 実行

一応、シーズン開始の少し前に実行する想定だが、いつやっても大丈夫。

まず、別のシェルでtnoodleを立ち上げる。
```
cd /path/to/tnoodle
./tmt make dist -p wca
java -jar wca/dist/TNoodle-WCA.jar
```

スクランブルデータ生成して、firebaseデータベースに書き込む。
引数は、シーズン。例えば、20161 (2016年前半期)、20162 (2016年後半期)、20171 (2017年前半期)、......
```
node contestmanager/create-season.js 20162
```

### [不定期] 必要時に実行する

WCAデータベースインポートと、WCA APPの更新。
[wca-importer](https://github.com/kotarot/wca-importer) を用いる。
```
php -f /path/to/wca_importer/import.php
node contestmanager/update-wcaapp.js
```


## Crontab

```
################################
# tribox Contest
################################

# Play application
*/1 * * * * /path/to/contestapp/play-start.sh

# Update inProgress
0 21 * * 0 /usr/bin/node /path/to/contestapp/contestmanager/update-inprogress.js > /path/to/contestapp/logs/update-inprogress.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/update-inprogress.`date +\%Y\%m\%d`.stderr.log
1 21 * * 0 /usr/bin/node /path/to/contestapp/contestmanager/collect-results.js --lastcontest --lottery --tweet > /path/to/contestapp/logs/collect-results.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/contestmanager/collect-results.`date +\%Y\%m\%d`.stderr.log

# Backup
2 0 * * * /usr/bin/node /path/to/contestapp/contestmanager/backup.js > /path/to/contestapp/logs/backup.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/backup.`date +\%Y\%m\%d`.stderr.log
```


## License

tribox Contest
Copyright (C) 2016  Tribox Inc.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
