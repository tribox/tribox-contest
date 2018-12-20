/**
 * check-kaikin100.js
 *
 * 100回記念の皆勤賞を調べる。
 * 皆勤賞の条件等:
 *   - 種目は333
 *   - 90回以上参加 (未参加とDNF合わせて10回以下)
 *   - 認証アカウントであること
 *   - 対象は、2016201 -- 2018121
 *
 * 以下を更新する:
 *   - 皆勤ポイント (MySQL) ただし待ちレコードを生成するだけで実際にポイントは加算されない
 */

var async = require('async');
var mysql = require('mysql');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

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
var writeDB = function(Kaikin100) {

    var countKaikin100 = 0;
    async.each(Kaikin100, function(r, next) {
        //console.dir(r);

        // 待ちレコードとして登録する
        connection.query('INSERT INTO kaikin100 SET ?', {
            'user_id': r.userId,
            'username': r.username,
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
                countKaikin100++;
                next();
            }
        });

    }, function(err) {
        if (!err) {
            console.log('Completed creating ready records of Kaikin100! (' + countKaikin100 + ' records)');
            process.exit(0);
        } else {
            console.error(err);
            process.exit(1);
        }
    });

};

// 皆勤賞を調べる
var checkKaikin100 = function() {
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
            if (parseInt(contestId.slice(1)) <= 2018121) {
                targetContests[contestId] = Contests[contestId];
                countTargetContests++;
            }
        });
        console.log(countTargetContests + ' contests in the target.');

        // 皆勤賞のリスト
        var Kaikin100 = {};

        // ユーザごと
        Object.keys(Users).forEach(function(userId) {
            if (!(Users[userId]._dummy) && Users[userId].isTriboxCustomer) {
                if (!(Users[userId].isTriboxCustomer)) {
                    //console.log(userId + ' (' + Users[userId].username + ') is not a tribox customer.');
                } else {
                    //console.log(userId + ' (' + Users[userId].username + ') is a tribox customer.');

                    // イベントは333
                    var eventId = 'e333';
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
                    // DNF規定回数以内
                    if (countTargetContests - 10 <= countCompletedSuccess) {
                        //console.log(eventId + ' ' + countCompleted);
                        Kaikin100[userId + eventId] = {
                            'userId': userId,
                            'username': Users[userId].username,
                            'displayname': Users[userId].displayname,
                            'triboxStoreCustomerId': Usersecrets[userId].triboxStoreCustomerId,
                            'eventId': eventId,
                            'eventName': Events[eventId].name,
                            'countCompleted': countCompleted,
                            'countCompletedSuccess': countCompletedSuccess,
                            'point': 1000
                        };
                    }
                }
            }
        });

        // 皆勤賞リストの表示
        Object.keys(Kaikin100).forEach(function(id) {
            console.log(Kaikin100[id].username + ' '
                + Kaikin100[id].eventId + ' '
                + Kaikin100[id].countCompletedSuccess + '/' + Kaikin100[id].countCompleted + '/' + countTargetContests + ' ' + Kaikin100[id].point);
        });
        writeDB(Kaikin100);

    });
    });
    });
    });
    });
};

var main = function() {
    checkKaikin100();
};
main();
