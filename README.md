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

Install required node modules:
```
cd contestmanager
npm install firebase@2.4.2 firebase-token-generator@2.0.0 alg async argv mysql request twitter
```

コンフィグファイルを設定する:
```
cp conf/prod.conf.sample conf/prod.conf  # and edit conf/prod.conf
cp contestmanager/config.sample.js contestmanager/config.js  # and edit contestmanager/config.js
```

データベースの用意:
```
TODO
```


## Run

### http サーバ起動

#### 開発

```
activator run -Dconfig.resource=dev.conf
```

#### 本番

本番サーバでは、cron で定期的にチェック＆再起動のスクリプトが実行されるため、
まず1つ目のコマンドでコンパイルして，次に2つ目のコマンドでプロセスを落とす。
すると、あとは放置してればそのうち play が再起動する．

```
activator clean stage
./play-kill.sh
```

### :alarm_clock: 1週間に1回 -- 日曜日午後9時 (JST) 自動実行

#### inProgress 更新

inProgressのコンテストを書き換える。
毎週日曜日の午後9時0分0.001秒に実行すればよいが、実行時刻に合わせるだけなのでいつでも好きなだけ実行して大丈夫。
```
node contestmanager/update-inprogress.js --tweet
```
* `--tweet` オプションで、コンテスト開始告知をツイートする。

#### 結果集計

結果の集計をする。
```
node contestmanager/collect-results.js --contest=2016121 --check --checkfmc --resetlottery --lottery --triboxteam --tweet
node contestmanager/collect-results.js --lastcontest --check --checkfmc --resetlottery --lottery --triboxteam --tweet
```
* `--contest` オプションは指定したコンテストの結果を集計する。
* 代わりに `--lastcontest` を指定した場合は、inProgress.lastContest のコンテストが対象となる。
* `--check` はFMC以外の競技の結果 (average または best) を再計算して上書きする。
* `--checkfmc` はFMC競技の解答を解析して結果を上書きする。
* `--resetlottery` は当選者をリセットする。
* `--lottery` を指定した場合は、当選ポイント抽選して、該当者をfirebaseに書き込む。さらにポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。
* 代わりに `--lotteryall` を指定した場合は、認証アカウントの333の全競技者に対して当選ポイントを記録する。333以外は抽選。上のオプションと同様に、ポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。このオプションは、これまで「初回コンテストで全員当選にするため」、「通算100回目のコンテスト (2018 1H 21) で333ストア連携全員当選にするため」に使用したことがある。
* `--triboxteam` は契約アカウントにポイントを与える。ポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。
* `--tweet` オプションは付けると結果をツイートする。

#### ポイント進呈

ポイント進呈する。
```
node contestmanager/append-points.js
```
上の `collect-results.js` スクリプトを実行して該当者を待ちレコードに記録した後に実行する。
本当に対象者が正しいことを目視で確認した後、このスクリプトを実行して実際に抽選ポイントをストアポイントに加算する。

### :alarm_clock: 1週間に1回 -- 土曜日午後9時 (JST) 自動実行

#### リマインダ

24時間後にコンテスト終了するというリマインダ。
```
node contestmanager/reminder.js
```

### :alarm_clock: 半年に1回程度 -- 実行

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

#### 皆勤賞ポイント進呈

次のコマンドを実行して `kaikin` テーブルの内容をチェックする。
```
node contestmanager/tabulate-kaikin.js --season=20162
```

よければ、次のコマンドでポイント加算とメール送信。
```
node contestmanager/append-kaikin.js
```

#### 入賞賞金ポイント進呈

次のコマンドを実行して `winners` テーブルの内容をチェックする。
```
node contestmanager/tabulate-winners.js --season=20162
```

よければ、次のコマンドでポイント加算とメール送信。
```
node contestmanager/append-winners.js
```


### :alarm_clock: 不定期 -- 必要時に実行する

#### 参加済み人数の更新

参加済み人数を表示するために、適当な間隔でポーリングする。カウント結果はfirebaseデータベースに書き込まれる。
```
node contestmanager/count-participants.js --inprogress --save
```

#### WCAデータベースインポートとWCA APPの更新
[wca-importer](https://github.com/kotarot/wca-importer) を用いる。
```
php -f /path/to/wca_importer/import.php
node contestmanager/update-wcaapp.js
```


## Abuse 関係

#### ユーザーを凍結する

(1) Firebase の Database で `users.<UID>.isSuspended` を `true` に設定する。  
(2) Firebase の Authentication で「アカウントを無効にする」を設定する (忘れがちなので注意！)。  

#### 記録を削除する

(1) Firebase のエクスポート機能で、データをエクスポートしておく (TODO もっとスマートにやりたい)。
(2) Firebase の Authentication で対象ユーザーのメールアドレスを探しておく (TODO 自動取得したい)。
(3) 次のコマンドで dryrun して削除対象を確認。例: `node contestmanager/delete-record.js --contest=2018120 --username=kotarot --email="kotaro@tribox.jp" --event=333fm --dryrun`
(4) (3)の dryrun オプションだけを外して、記録削除＆メール送信。
(5) 次のコマンドでランキング集計し直す。例: `node contestmanager/collect-results.js --contest=2018120 --check --checkfmc`


## Crontab example

```
################################
# tribox Contest
################################

# Play application
*/1 * * * * /path/to/contestapp/play-start.sh

# Update inProgress contest and results
0 21 * * 0 /usr/bin/node /path/to/contestapp/contestmanager/update-inprogress.js --tweet > /path/to/contestapp/logs/update-inprogress.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/update-inprogress.`date +\%Y\%m\%d`.stderr.log && /usr/bin/node /path/to/contestapp/contestmanager/collect-results.js --lastcontest --check --checkfmc --resetlottery --lottery --tweet > /path/to/contestapp/logs/collect-results.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/collect-results.`date +\%Y\%m\%d`.stderr.log

# Reminder
0 21 * * 6 /usr/bin/node /path/to/contestapp/contestmanager/reminder.js > /path/to/contestapp/logs/reminder.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/reminder.`date +\%Y\%m\%d`.stderr.log

# Count participants
5,15,25,35,45,55 * * * * /usr/bin/node /path/to/contestapp/contestmanager/count-participants.js --inprogress -save

# Backup
2 0 * * * curl "https://##firebaseapp##.firebaseio.com//.json?print=pretty&auth=##AUTHTOKEN##" -o /path/to/contestapp/backup/contestapp-curl.`date +\%Y\%m\%d`.json
# Backup (古い)
#2 0 * * * /usr/bin/node /path/to/contestapp/contestmanager/backup.js > /path/to/contestapp/logs/backup.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/backup.`date +\%Y\%m\%d`.stderr.log

# Force verify
5 0 * * * /usr/bin/node /path/to/contestapp/contestmanager/force-verify.js > /path/to/contestapp/logs/force-verify.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/force-verify.`date +\%Y\%m\%d`.stderr.log
```
