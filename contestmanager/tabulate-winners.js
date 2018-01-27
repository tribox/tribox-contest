/**
 * tabulate-winners.js
 *
 * 指定シーズンの入賞者を調べる。
 *
 * 以下を更新する:
 *   - 入賞ポイント (MySQL) ただし待ちレコードを生成するだけで実際にポイントは加算されない
 */

var async = require('async');
var mysql = require('mysql');

var Config = require('./config.js');

var Firebase = require('firebase');
var contestRef = new Firebase('https://' + Config.CONTESTAPP + '.firebaseio.com/');

// Create admin user
var FirebaseTokenGenerator = require('firebase-token-generator');
var tokenGenerator = new FirebaseTokenGenerator(Config.CONTESTAPP_SECRET);
var token = tokenGenerator.createToken(
    { uid: '1', some: 'arbitrary', data: 'here' },
    { admin: true, debug: true }
);

var argv = require('argv');
argv.option([
    {
        name: 'season',
        short: 's',
        type: 'string',
        description: 'Target season',
        example: "'tabulate-winners.js --season=20161' or 'tabulate-winners.js -s 20161'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象シーズン (20161)
var targetSeason, targetSeasonObj;
// ユーザテーブル、ユーザシークレットテーブル
var Users, Usersecrets;

// 書き込むデータ (順位、シーズンポイント、当選)
//var ready = {};
// 契約アカウント用
//var readyTriboxTeam = {};


// 配列のシャッフル
//  * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
// 
// Fisher–Yates Shuffle というらしい
//  * https://bost.ocks.org/mike/shuffle/
//  * https://bost.ocks.org/mike/shuffle/compare.html
/*var shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};*/


var connection = mysql.createConnection({
    host: Config.MYSQL_HOST,
    user: Config.MYSQL_USER,
    password: Config.MYSQL_PASSWORD,
    database: Config.MYSQL_DATABASE
});
connection.connect();


// 入賞者の結果を MySQL に書き込む
var writeDB = function(Winners, Events) {

    // 配列にする
    var WinnersArr = [];
    Object.keys(Events).forEach(function(eventId) {
        for (var i = 0; i < 3; i++) {
            WinnersArr.push({ 'eventId': eventId, 'place': (i + 1), 'winner': Winners[eventId][i] });
        }
    });

    var countWinners = 0;
    async.each(WinnersArr, function(r, next) {
        //console.dir(r);

        // 待ちレコードとして登録する
        connection.query('INSERT INTO winners SET ?', {
            'user_id': r.winner.userId,
            'username': r.winner.userdata.username,
            'season': targetSeason,
            'event_id': r.eventId,
            'place': r.place,
            'customer_type': 0,
            'customer_id': r.winner.usersecretdata.triboxStoreCustomerId,
            'point': r.winner.point
        }, function(error, results, fields) {
            if (error) {
                console.error(error);
            } else {
                countWinners++;
                next();
            }
        });

    }, function(err) {
        if (!err) {
            console.log('Completed creating ready records of Winners! (' + countWinners + ' records)');
            process.exit(0);
        } else {
            console.error(err);
            process.exit(1);
        }
    });

};

// 入賞者を調べる
var checkWinners = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

    contestRef.child('users').once('value', function(snapUsers) {
    contestRef.child('usersecrets').once('value', function(snapUsersecrets) {
    contestRef.child('events').once('value', function(snapEvents) {
    contestRef.child('contests').once('value', function(snapContests) {
    contestRef.child('results').once('value', function(snapResults) {
        var Users = snapUsers.val();
        var Usersecrets = snapUsersecrets.val();
        var Events = snapEvents.val();
        var Contests = snapContests.val();
        var Results = snapResults.val();

        // シーズンのコンテスト数
        var targetContests = {};
        var countTargetContests = 0;
        Object.keys(Contests).forEach(function(contestId) {
            if (contestId.slice(1, 6) == targetSeason) {
                targetContests[contestId] = Contests[contestId];
                countTargetContests++;
            }
        });
        console.log(countTargetContests + ' contests in the target season.');

        // 入賞者のリスト
        var Winners = {};
        Object.keys(Events).forEach(function(eventId) {
            Winners[eventId] = [];
            Object.keys(Users).forEach(function(userId) {
                if (!(Users[userId]._dummy) && Users[userId].isTriboxCustomer) {
                    Winners[eventId].push({ 'userId': userId, 'userdata': Users[userId], 'usersecretdata': Usersecrets[userId], 'seasonPoint': 0 });
                }
            });
        });

        // ユーザごと
        Object.keys(Users).forEach(function(userId) {
            if (!(Users[userId]._dummy) && Users[userId].isTriboxCustomer) {
                if (!(Users[userId].isTriboxCustomer)) {
                    //console.log(userId + ' (' + Users[userId].username + ') is not a tribox customer.');
                } else {
                    //console.log(userId + ' (' + Users[userId].username + ') is a tribox customer.');

                    // イベントごとに調べる
                    Object.keys(Events).forEach(function(eventId) {
                        Object.keys(targetContests).forEach(function(contestId) {
                            if (Results[contestId][eventId] !== undefined) {
                                if (Results[contestId][eventId][userId]) {
                                    if ('seasonPoint' in Results[contestId][eventId][userId]) {
                                        if (0 < Results[contestId][eventId][userId].seasonPoint) {
                                            for (var i = 0; i < Winners[eventId].length; i++) {
                                                if (Winners[eventId][i].userId == userId) {
                                                    Winners[eventId][i].seasonPoint += Results[contestId][eventId][userId].seasonPoint;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });
                }
            }
        });

        // ソートする
        Object.keys(Events).forEach(function(eventId) {
            Winners[eventId].sort(function(a, b) {
                if (a.seasonPoint < b.seasonPoint) return 1;
                if (a.seasonPoint > b.seasonPoint) return -1;
                return 0;
            });
        });
        //console.dir(Winners);

        // 入賞ポイントの追加
        var EventsPoints = {
            'e333': [30000, 15000, 5000],
            'e444': [10000, 5000, 3000],
            'e555': [10000, 5000, 3000],
            'e222': [10000, 5000, 3000],
            'e333bf': [5000, 2000, 1000],
            'e333oh': [5000, 2000, 1000],
            'e333fm': [5000, 2000, 1000],
            'eminx':  [5000, 2000, 1000],
            'epyram': [5000, 2000, 1000],
            'esq1':   [5000, 2000, 1000]
        };
        Object.keys(Events).forEach(function(eventId) {
            for (var i = 0; i < 3; i++) {
                Winners[eventId][i].point = EventsPoints[eventId][i];
            }
        });

        // 入賞者の表示
        Object.keys(Events).forEach(function(eventId) {
            for (var i = 0; i < 3; i++) {
                console.log(eventId + ' ' + (i + 1) + ' ' + Winners[eventId][i].userdata.username + ' '
                    + Winners[eventId][i].point);
            }
        });
        writeDB(Winners, Events);

    });
    });
    });
    });
    });

        }
    });
};

// 存在するシーズンか調べる
var checkExists = function() {
    // コンテストから検索 (認証不要)
    contestRef.child('contests').child('c' + targetSeason + '01').once('value', function(snap) {
        if (snap.exists()) {
            checkWinners();
        } else {
            console.error('Season does not exist');
            process.exit(1);
        }
    });
};

var main = function() {
    if (argvrun.options.season) {
        targetSeason = argvrun.options.season;
        checkExists();
    } else {
        console.error('Specify season!');
        process.exit(1);
    }
};
main();
