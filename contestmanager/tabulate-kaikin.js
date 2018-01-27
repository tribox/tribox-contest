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


// 皆勤賞の結果を MySQL に書き込む
var writeDB = function(Kaikin) {

    var countKaikin = 0;
    async.each(Kaikin, function(r, next) {
        //console.dir(r);

        // 待ちレコードとして登録する
        connection.query('INSERT INTO kaikin SET ?', {
            'user_id': r.userId,
            'username': r.username,
            'season': targetSeason,
            'event_id': r.eventId,
            'customer_type': 0,
            'customer_id': r.triboxStoreCustomerId,
            'point': r.point,
            'count_completed': r.countCompleted,
            'count_completed_success': r.countCompletedSuccess
        }, function(error, results, fields) {
            if (error) {
                console.error(error);
            } else {
                countKaikin++;
                next();
            }
        });

    }, function(err) {
        if (!err) {
            console.log('Completed creating ready records of Kaikin! (' + countKaikin + ' records)');
            process.exit(0);
        } else {
            console.error(err);
            process.exit(1);
        }
    });

};

// 皆勤賞を調べる
var checkKaikin = function() {
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

        // 皆勤賞のリスト
        var Kaikin = {};

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
                            if (Results[contestId][eventId] !== undefined) {
                                if (Results[contestId][eventId][userId]) {
                                    if ('endAt' in Results[contestId][eventId][userId]) {
                                        countCompleted++;
                                        if (Results[contestId][eventId][userId]['result']['condition'] != 'DNF') {
                                            countCompletedSuccess++;
                                        }
                                    }
                                }
                            }
                        });
                        // 全部終わっているかつDNF規定回数以内
                        if (countCompleted == countTargetContests && countTargetContests - 3 <= countCompletedSuccess) {
                            //console.log(eventId + ' ' + countCompleted);
                            Kaikin[userId + eventId] = {
                                'userId': userId,
                                'username': Users[userId].username,
                                'displayname': Users[userId].displayname,
                                'triboxStoreCustomerId': Usersecrets[userId].triboxStoreCustomerId,
                                'eventId': eventId,
                                'eventName': Events[eventId].name,
                                'countCompleted': countCompleted,
                                'countCompletedSuccess': countCompletedSuccess,
                                'point': 300
                            };
                        }
                    });
                }
            }
        });

        // 皆勤賞リストの表示
        Object.keys(Kaikin).forEach(function(id) {
            console.log(Kaikin[id].username + ' '/* + Kaikin[id].displayname + ' '*/
                + Kaikin[id].eventId + ' '/* + Kaikin[id].eventName + ' '*/
                + Kaikin[id].countCompletedSuccess + '/' + Kaikin[id].countCompleted + ' ' + Kaikin[id].point);
        });
        writeDB(Kaikin);

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
