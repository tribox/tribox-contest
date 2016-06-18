# tribox Contest

tribox Contest is an Online Rubik's Cube Competition organized by [Tribox Inc](http://tribox.com).
The application is based on [Play Framework](https://www.playframework.com) and [Firebase](https://www.firebase.com).

URL: https://contest.tribox.com


## Setup

Install [Sarumawashi](https://github.com/kotarot/Sarumawashi).
```
cd /path/to/sarumawashi
git clone https://github.com/kotarot/Sarumawashi.git
cd Sarumawashi
make all
```

Install node modules
```
cd contestmanager
npm install firebase firebase-token-generator alg async argv mysql request twitter
```


## Run

### http サーバ起動

```
(開発) activator run -Dconfig.resource=dev.conf
(本番) activator clean stage && target/universal/stage/bin/contest -Dconfig.file=/var/www/contest/conf/prod.conf
```

### 1週間に1回、日曜日午後9時 (JST) 自動実行

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
`--lottery` を指定した場合は、当選ポイントをfirebaseに書き込んでポイントをストアに付加する。指定しても既にポイント付加している場合は（MySQLデータベースにそう記録してある場合は）ポイント付加しない。
`--tweet` オプションは付けると結果をツイートする。


### 半年に1回程度実行

一応、シーズン開始の少し前に実行する想定だが、いつやっても大丈夫。

別のシェルでtnoodleを立ち上げる。
```
cd /path/to/tnoodle
./tmt make dist -p wca
java -jar wca/dist/TNoodle-WCA.jar
```

スクランブルデータ生成して、firebaseデータベースに書き込む。
引数は、例えば、20161 (2016年前半期)、20162 (2016年後半期)、20171 (2017年前半期)、......
```
node contestmanager/create-season.js 20162
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
