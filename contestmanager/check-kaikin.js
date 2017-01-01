/**
 * check-kaikin.js
 *
 * 指定シーズンの皆勤賞を調べる。
 * 皆勤賞の条件等:
 *   - 種目ごと
 *   - 全種目
 *   - 全て参加
 *   - DNF3回以下
 *   - 認証アカウントであること
 *
 * 以下を更新する:
 *   - 皆勤ポイント (MySQL) ただし待ちレコードを生成するだけで実際にポイントは加算されない
 */

var async = require('async');
//var mysql = require('mysql');

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
        example: "'check-kaikin.js --season=20161' or 'check-kaikin.js -s 20161'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象シーズン (20161)
var targetSeason, targetSeasonObj;
// ユーザテーブル、ユーザシークレットテーブル
var Users, Usersecrets;

// 書き込むデータ (順位、シーズンポイント、当選)
var ready = {};
// 契約アカウント用
var readyTriboxTeam = {};


// 配列のシャッフル
//  * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
// 
// Fisher–Yates Shuffle というらしい
//  * https://bost.ocks.org/mike/shuffle/
//  * https://bost.ocks.org/mike/shuffle/compare.html
var shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};


/*var connection = mysql.createConnection({
    host: Config.MYSQL_HOST,
    user: Config.MYSQL_USER,
    password: Config.MYSQL_PASSWORD,
    database: Config.MYSQL_DATABASE
});
connection.connect();*/


// コンテストの集計結果を firebase と MySQL に書き込む
/*var writeResults = function() {
    console.dir(ready);
    console.dir(readyTriboxTeam);

    // 書き込むデータを配列化する
    var readyArr = [];
    Object.keys(ready).forEach(function(eventId) {
        Object.keys(ready[eventId]).forEach(function(userId) {
            readyArr.push({ 'eventId': eventId, 'userId': userId });
        });
    });

    // 結果をひとつひとつ書き込む (順位とSPを上書きする)
    var count = 0;
    async.each(readyArr, function(r, next) {
        var eventId = r.eventId;
        var userId = r.userId;

        // Firebase に書き込む
        contestRef.child('results').child(targetContest).child(eventId).child(userId).update(ready[eventId][userId], function(error) {
            if (error) {
                console.error(error);
            } else {
                console.log('Completed updating place, SP, and lottery: ' + eventId + ' ' + userId);

                // ユーザの参加履歴をfirebaseに保存する
                contestRef.child('userhistories').child(userId).child(targetContest).child(eventId).set({
                    'hasCompeted': true
                }, function(error) {
                    if (error) {
                        console.error(error);
                    } else {
                        count++;
                        next();
                    }
                });

            }
        });

    }, function(err) {
        if (!err) {
            console.log('Completed updating user histories! (' + count + ' records)');

            var readyForMysql = [];
            if (argvrun.options.lottery || argvrun.options.lotteryall) {
                // 抽選ポイントを加算するための待ちレコードを作成する
                Object.keys(ready).forEach(function(eventId) {
                    Object.keys(ready[eventId]).forEach(function(userId) {
                        if (ready[eventId][userId].lottery) {
                            readyForMysql.push({
                                'eventId': eventId, 'userId': userId,
                                'customerId': Usersecrets[userId].triboxStoreCustomerId,
                                'point': Config.LOTTERY_POINT, 'pointType': 0
                            });
                        }
                    });
                });
            }
            if (argvrun.options.triboxteam) {
                // 契約アカウント用
                Object.keys(readyTriboxTeam).forEach(function(eventId) {
                    Object.keys(readyTriboxTeam[eventId]).forEach(function(userId) {
                        if (readyTriboxTeam[eventId][userId]) {
                            readyForMysql.push({
                                'eventId': eventId, 'userId': userId,
                                'customerId': Usersecrets[userId].triboxStoreCustomerId,
                                'point': Config.TRIBOXTEAM_POINT, 'pointType': 1
                            });
                        }
                    });
                });
            }

            if (argvrun.options.lottery || argvrun.options.lotteryall || argvrun.options.triboxteam) {
                console.dir(readyForMysql);

                var countLottery = 0;
                async.each(readyForMysql, function(r, next) {
                    var eventId = r.eventId;
                    var userId = r.userId;
                    var customerId = r.customerId;

                    // ポイント加算履歴に待ちレコードとして登録する
                    connection.query('INSERT INTO lottery_log SET ?', {
                        'user_id': userId,
                        'username': Users[userId].username,
                        'contest_id': targetContest,
                        'event_id': eventId,
                        'customer_type': 0,
                        'customer_id': customerId,
                        'point': r.point,
                        'point_type': r.pointType
                    }, function(error, results, fields) {
                        if (error) {
                            console.error(error);
                        } else {
                            countLottery++;
                            next();
                        }
                    });

                }, function(err) {
                    if (!err) {
                        console.log('Completed creating ready records of lottery point! (' + countLottery + ' records)');
                        doTweet();
                    } else {
                        console.error(err);
                        process.exit(1);
                    }
                });

            } else {
                console.log('Skipped lottery point');
                doTweet();
            }
        } else {
            console.error(err);
            process.exit(1);
        }
    });

};*/

// 皆勤賞を調べる
var checkKaikin = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

    contestRef.child('users').once('value', function(snapUsers) {
    //contestRef.child('usersecrets').once('value', function(snapUsersecrets) {
    contestRef.child('events').once('value', function(snapEvents) {
    contestRef.child('contests').once('value', function(snapContests) {
    contestRef.child('results').once('value', function(snapResults) {
        var Users = snapUsers.val();
        //var Usersecrets = snapUsersecrets.val();
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

        // 皆勤賞のリスト
        var Kaikin = {};
        Object.keys(Events).forEach(function(eventId) {
            Kaikin[eventId] = {};
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
                        var countCompleted = 0;
                        var countCompletedSuccess = 0;
                        Object.keys(targetContests).forEach(function(contestId) {
                            if (Results[contestId][eventId][userId]) {
                                if ('endAt' in Results[contestId][eventId][userId]) {
                                    countCompleted++;
                                    if (Results[contestId][eventId][userId]['result']['condition'] != 'DNF') {
                                        countCompletedSuccess++;
                                    }
                                }
                            }
                        });
                        // 全部終わっているかつDNF規定回数以内
                        if (countCompleted == countTargetContests && countTargetContests - 1 <= countCompletedSuccess) {
                            //console.log(eventId + ' ' + countCompleted);
                            Kaikin[eventId][userId] = {
                                'userId': userId,
                                'username': Users[userId].username,
                                'displayname': Users[userId].displayname,
                                'countCompleted': countCompleted,
                                'countCompletedSuccess': countCompletedSuccess,
                            };
                        }
                    });
                }
            }
        });

        // 皆勤賞リストの表示
        Object.keys(Kaikin).forEach(function(eventId) {
            Object.keys(Kaikin[eventId]).forEach(function(userId) {
                console.log(eventId + ' ' + Kaikin[eventId][userId].username + ' ' + Kaikin[eventId][userId].countCompletedSuccess + '/' + Kaikin[eventId][userId].countCompleted);
            });
        });
        process.exit(0);

    });
    });
    });
    //});
    });

        }
    });
};

// 存在するシーズンか調べる
var checkExists = function() {
    // コンテストから検索 (認証不要)
    contestRef.child('contests').child('c' + targetSeason + '01').once('value', function(snap) {
        if (snap.exists()) {
            checkKaikin();
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
