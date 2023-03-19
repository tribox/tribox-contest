# TORIBO Contest

TORIBO Contest is an Online Speed-Solving Competition organized by [Tribox Inc](http://tribox.com).
The application is based on [Play Framework](https://www.playframework.com) and [Firebase](https://www.firebase.com).

URL: https://contest.tribox.com/


## Requirements

* Java 8
* Scala 2.11.8
* Node.js v8.14.0
* [TNoodle](https://github.com/cubing/tnoodle) v0.14.0
* [Sarumawashi](https://github.com/kotarot/Sarumawashi)
* [wca-importer](https://github.com/kotarot/wca-importer)
* [PHPMailer](https://github.com/PHPMailer/PHPMailer) is needed in the `contestmanager` directory.

## Setup

Install required node modules:
```
cd contestmanager
npm install
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

Firebase Admin SDK サービスアカウントの秘密鍵をダウンロードして `contestmanager/secret/serviceAccountKey.json` に保存する。


## Run

### http サーバ起動

#### 開発

```
activator run -Dconfig.resource=dev.conf
```

#### 本番

本番サーバでは、cron で定期的にチェック＆再起動のスクリプトが実行されるため、
まず1つ目のコマンドでコンパイルして，次に2つ目のコマンドでプロセスを落とす。
すると、あとは放置してればそのうち play が再起動する。  
本当はコンパイル済みのjarをデプロイしたいけど、まだできてない。

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
* `--lotteryall=333` を (`--lottery` の代わりに) 指定した場合は、認証アカウントの333の全競技者に対して当選ポイントを記録する。333以外は抽選になる。`--lottery` オプションと同様に、ポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。このオプションは、これまで「初回コンテストで全員当選にするため」、「通算100回目のコンテスト (2018H1 21節) で333ストア連携全員当選にするため」、「2019H2 24節 クリスマス」、「2020H1 14節, 15節」、「2020H2 1節」、「2020年末てこ入れ月間」で使用した。
* ~~`--lottery444` を (`--lottery` の代わりに) 指定した場合は、認証アカウントの444の全競技者に対して当選ポイントを記録する。444以外は抽選。上のオプションと同様に、ポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。このオプションは、これまで「2020H2 7」で使用した。~~ `--lotteryall` オプションに引数を与える仕様にしたため廃止された。
* `--triboxteam` は契約アカウントにポイントを与える。ポイント加算対象者をMySQLに待ちレコードとして保存する。ここでは実際にポイント加算はされない。
* `--tweet` オプションは付けると結果をツイートする。

#### ポイント進呈

ポイント進呈する。
```
node contestmanager/append-points.js
```
上の `collect-results.js` スクリプトを実行して該当者を待ちレコードに記録した後に実行する。
本当に対象者が正しいことを目視で確認した後、このスクリプトを実行して実際に抽選ポイントをストアポイントに加算する。

2019年1月から: 自動で実行して事後にチェックすることにした。

### :alarm_clock: 1週間に1回 -- 土曜日午後9時 (JST) 自動実行

#### リマインダ

24時間後にコンテスト終了するというリマインダ。
```
node contestmanager/reminder.js
```

### :alarm_clock: 1週間に1回 -- 日曜日午後9時 (JST) 以降に手動実行 (※自動化するまで手動実行する)

Adminアカウントでログインして、最新コンテストの結果を確認する。Adminアカウントでログインしないと「集計中」ステータスとなり、結果が閲覧できない。
結果が問題なければ以下のデータを更新し、結果ページを集計中から公開にする。
```
$.contests.<contest_id>.resultsStatus = "public"
```

参考: Adminアカウントにするには以下のデータを設定する。
```
$.usersecrets.<UID>.isAdmin = true
```

### :alarm_clock: 1か月に1回 -- 月はじめに実行 (これはcron化したい)

#### バックアップのアーカイブ

例えば、今が2019年2月の月はじめだとする。1月分のバックアップのアーカイブを作成する。
```
mkdir backup.archives/201901
mv backup/tribox-contest-curl.201901* backup.archives/201901/
cd backup.archives
tar czf 201901.tar.gz 201901
rm -rf 201901
```

### :alarm_clock: 半年に1回程度 -- 実行

一応、シーズン開始の少し前に実行する想定だが、いつやっても大丈夫。

まず、別のシェルもしくは別のホストでtnoodleを立ち上げる。
```
cd /path/to/tnoodle
./tmt make dist -p wca  # これはビルドコマンドなので不必要なら省略
java -jar wca/dist/TNoodle-WCA.jar  # TNoodle起動
```

スクランブルデータ生成して、firebaseデータベースに書き込む。
引数は、シーズン。例えば、20161 (2016年前半期)、20162 (2016年後半期)、20171 (2017年前半期)、......
```
node --max-old-space-size=3000 contestmanager/create-season.js 20162
node --max-old-space-size=3000 contestmanager/generate-fmcimages.js -s 20162
```
※ `create-season.js` の中でresultsのスナップショットを取得するので `--max-old-space-size` でヒープサイズを上げておく必要がある（根本を直したい）。

また、`app/views/index.scala.html` と `app/views/user.scala.html` と `app/views/ranking.scala.html` を変更して、シーズンリンク用のボタンを付ける。

編集後、再コンパイル (jarの再生成) が必要。

#### 皆勤賞ポイント進呈

次のコマンドを実行して `kaikin` テーブルの内容をチェックする。
```
node --max-old-space-size=3000 contestmanager/tabulate-kaikin.js --season=20162
```

よければ、次のコマンドでポイント加算とメール送信。
```
node contestmanager/append-kaikin.js
```

#### 入賞賞金ポイント進呈

次のコマンドを実行して `winners` テーブルの内容をチェックする。
```
node --max-old-space-size=3000 contestmanager/tabulate-winners.js --season=20162
```

よければ、次のコマンドでポイント加算とメール送信。
```
node contestmanager/append-winners.js
```


### :alarm_clock: 不定期 -- 必要時に実行する

#### ビデオボーナス

ビデオボーナス節に設定したい節は、`$.contests.<contest_id>.videoBonusStatus` のステータス文字列を `checking` に設定する。
ビデオチェックが完了したらこの項目を `done` に設定する。

ビデオボーナスのポイントは、`$.results.<contest_id>.<event_id>.<user_id>.seasonPointVideoBonus` に数値を設定する。

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

#### 種目を追加する

(1) `contestmanager/add-XXX.js` を作成して、種目追加スクリプトを用意する。  
(2) (1) を実行する。  
(3) `contestmanager/create-season.js` のデフォルトの競技を変更（追加）する。  
(4) `app/controllers/ContestController.scala` のパズルのカテゴリを変更（追加）する。  
(5) `contestmanager/create-season.js` を実行する（詳細なやり方は上の方に書いてある）。  
(6) `contentmanager/config.js` (sampleも) の当選者数を設定する。


## Abuse 関係

#### ユーザーを凍結する

(1) Firebase の Database で `users.<UID>.isSuspended` を `true` に設定する。  
(2) Firebase の Authentication で「アカウントを無効にする」を設定する (忘れがちなので注意！)。  

#### ユーザーを削除する（論理削除）

(1) Firebase の Database で `users.<UID>.isDeleted` を `true` に設定する。  
(2) Firebase の Authentication で「アカウントを無効にする」を設定する (忘れがちなので注意！)。  

#### 記録を削除する

(1) Firebase のエクスポート機能で、データをエクスポートしておく (TODO もっとスマートにやりたい)。  
(2) Firebase の Authentication で対象ユーザーのメールアドレスを探しておく (TODO 自動取得したい)。  
(3) 次のコマンドで dryrun して削除対象を確認。例: `node contestmanager/delete-record.js --contest=2018120 --username=kotarot --email="kotaro@tribox.jp" --event=333fm --dryrun`  
(4) (3)の dryrun オプションだけを外して、記録削除＆メール送信。  
(5) 次のコマンドでランキング再集計する。例: `node contestmanager/collect-results.js --contest=2018120 --check --checkfmc`  
(5)' ランキング再集計時に優勝者のツイートを同時にする場合。例: `node contestmanager/collect-results.js --contest=2018120 --check --checkfmc --tweet`  


## Crontab example

```
################################
# TORIBO Contest
################################

# Play application
*/1 * * * * /path/to/contestapp/play-start.sh

# Update inProgress contest and results
0 21 * * 0 /usr/bin/node /path/to/contestapp/contestmanager/update-inprogress.js --tweet > /path/to/contestapp/logs/update-inprogress.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/update-inprogress.`date +\%Y\%m\%d`.stderr.log && /usr/bin/node /path/to/contestapp/contestmanager/collect-results.js --lastcontest --check --checkfmc --resetlottery --lottery --tweet > /path/to/contestapp/logs/collect-results.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/collect-results.`date +\%Y\%m\%d`.stderr.log

# Reminder
0 21 * * 6 /usr/bin/node /path/to/contestapp/contestmanager/reminder.js > /path/to/contestapp/logs/reminder.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/reminder.`date +\%Y\%m\%d`.stderr.log

# Count participants
5,15,25,35,45,55 * * * * /usr/bin/node /path/to/contestapp/contestmanager/count-participants.js --inprogress -save

# Points
2 22 * * 0 /usr/bin/node /path/to/contestapp/contestmanager/append-points.js

# Backup
2 0 * * * curl "https://##firebaseapp##.firebaseio.com//.json?print=pretty&auth=##AUTHTOKEN##" -o /path/to/contestapp/backup/contestapp-curl.`date +\%Y\%m\%d`.json
# Backup (古い)
#2 0 * * * /usr/bin/node /path/to/contestapp/contestmanager/backup.js > /path/to/contestapp/logs/backup.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/backup.`date +\%Y\%m\%d`.stderr.log

# Force verify
5 0 * * * /usr/bin/node /path/to/contestapp/contestmanager/force-verify.js > /path/to/contestapp/logs/force-verify.`date +\%Y\%m\%d`.stdout.log 2> /path/to/contestapp/logs/force-verify.`date +\%Y\%m\%d`.stderr.log
```
