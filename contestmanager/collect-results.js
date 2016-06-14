/**
 * collect-results.js
 *
 * 毎週コンテストが終わるごとに実行する。
 * 以下を更新する。
 *   - 順位
 *   - SP
 *   - 参加履歴
 */

var async = require('async');
var mysql = require('mysql');

var Config = require('./config.js');
var fmcchecker = require('./fmcchecker.js');

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
        name: 'contest',
        short: 'c',
        type: 'string',
        description: 'Target contest',
        example: "'collect-results.js --contest=2016121' or 'collect-results.js -c 2016121'"
    },
    {
        name: 'lastcontest',
        short: 'l',
        type: 'boolean',
        description: 'Set target contest to inProgress.lastContest',
        example: "'collect-results.js --lastcontest' or 'collect-results.js -l'"
    },
    {
        name: 'tweet',
        short: 't',
        type: 'boolean',
        description: 'Tweet the results',
        example: "'collect-results.js --tweet' or 'collect-results.js -t'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象コンテスト (c2016xxx)
var targetContest;

// 書き込むデータ
var ready = {};

// コンテストの集計結果を firebase と MySQL に書き込む
var writeResults = function() {
    console.dir(ready);

    var connection = mysql.createConnection({
        host: Config.MYSQL_HOST,
        user: Config.MYSQL_USER,
        password: Config.MYSQL_PASSWORD,
        database: Config.MYSQL_DATABASE
    });
    connection.connect();

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
                console.log('Completed updating place and SP: ' + eventId + ' ' + userId);

                // ユーザの参加履歴を MySQL に保存する
                // 存在する場合は update, 存在しない場合は insert
                connection.query('SELECT id FROM competed_history WHERE user_id = ? AND contest_id = ? AND event_id = ?', [
                    userId, targetContest, eventId
                ], function(error, results, fields) {
                    if (error) {
                        console.error(error);
                    } else {
                        if (results[0] && 'id' in results[0]) {
                            console.log('UPDATE');
                            connection.query('UPDATE competed_history SET has_competed = 1, updated_at = NOW() WHERE user_id = ? AND contest_id = ? AND event_id = ?', [
                                userId, targetContest, eventId
                            ], function(error, results, fields) {
                                if (error) {
                                    console.error(error);
                                }
                                count++;
                                next();
                            });
                        } else {
                            console.log('INSERT');
                            connection.query('INSERT INTO competed_history SET ?', {
                                'user_id': userId,
                                'contest_id': targetContest,
                                'event_id': eventId,
                                'has_competed': 1
                            }, function(error, results, fields) {
                                if (error) {
                                    console.error(error);
                                }
                                count++;
                                next();
                            });
                        }
                    }
                });

            }
        });

    }, function(err) {
        if (!err) {
            console.log('Completed all! updated ' + count + ' records');
            process.exit(0);
        } else {
            console.error(err);
            process.exit(1);
        }
    });

};

// 順位とSPの記録をリセットする
var resetResults = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            contestRef.child('results').child(targetContest).once('value', function(snapResults) {
                var results = snapResults.val();

                var resets = [];
                Object.keys(results).forEach(function(eid) {
                    Object.keys(results[eid]).forEach(function(uid) {
                        if (!(results[eid][uid]._dummy)) {
                            resets.push({ 'eid': eid, 'uid': uid });
                        }
                    });
                });
                //console.dir(resets);

                // 実行
                async.each(resets, function(r, next) {
                    contestRef.child('results').child(targetContest).child(r.eid).child(r.uid).update({
                        'place': null,
                        'seasonPoint': null
                    }, function(error) {
                        if (error) {
                            console.error(error);
                            process.exit(1);
                        } else {
                            next();
                        }
                    });
                }, function(err) {
                    if (!err) {
                        console.log('Completed reset!');
                        writeResults();
                    } else {
                        console.error(err);
                        process.exit(1);
                    }
                });

            });
        }
    });
};

// コンテストの結果を集計（整形）する
var collectResults = function() {
    console.log('Collecting contest: ', targetContest);

    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            contestRef.child('results').child(targetContest).once('value', function(snapResults) {
                var results = snapResults.val();

                ready = {};
                Object.keys(results).forEach(function(eventId) {
                    ready[eventId] = {};

                    var place = 1;
                    var placePrev = -1;
                    var priorityPrev = "";
                    Object.keys(results[eventId]).forEach(function(userId) {
                        if (results[eventId][userId]._dummy == true) {
                            return;
                        }
                        ready[eventId][userId] = {};

                        var priority = snapResults.child(eventId).child(userId).getPriority();

                        // 計測が完了していない場合は無視する
                        if ('endAt' in results[eventId][userId]) {
                            if (results[eventId][userId]['result']['condition'] == 'DNF') {
                                ready[eventId][userId]['place'] = place;
                            } else {
                                if (priority == priorityPrev) {
                                    ready[eventId][userId]['place'] = prevPlace;
                                } else {
                                    ready[eventId][userId]['place'] = place;
                                    placePrev = place;
                                }
                                // ここで、placePrev に順位が入っている
                                if (placePrev in Config.SP) {
                                    ready[eventId][userId]['seasonPoint'] = Config.SP[placePrev];
                                }

                                priorityPrev = priority;
                                place++;
                            }
                        }
                    });

                });

                resetResults();

            });
        }
    });
};

// FMC の解答チェック
var checkFMC = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            contestRef.child('scrambles').child(targetContest).once('value', function(snapScrambles) {
                var scrambles = snapScrambles.val();
                if ('e333fm' in scrambles) {
                    contestRef.child('results').child(targetContest).child('e333fm').once('value', function(snapResults) {
                        var results = snapResults.val();
                        var fmcResults = {};

                        async.each(Object.keys(results), function(userId, next) {
                            if (results[userId]._dummy == true) {
                                next();
                            } else {
                                fmcResults[userId] = {};

                                var solution = results[userId]['details'][0]['solution'];

                                fmcchecker.checkSolution(scrambles['e333fm'][0], solution, function(moves) {
                                    console.log(scrambles['e333fm'][0]);
                                    console.log(solution + ' --> ' + moves);
                                    fmcResults[userId]['result'] = {};
                                    if (moves < 0) {
                                        fmcResults[userId]['result']['condition'] = 'DNF';
                                        fmcResults[userId]['result']['record'] = 9999;
                                        fmcResults[userId]['.priority'] = '999000+999000';
                                    } else {
                                        fmcResults[userId]['result']['condition'] = 'OK';
                                        fmcResults[userId]['result']['record'] = moves;
                                        var p = ('000' + moves).slice(-3) + '000';
                                        fmcResults[userId]['.priority'] = p + '+' + p;
                                    }
                                    next();
                                });
                            }

                        }, function(err) {
                            if (!err) {
                                //console.dir(fmcResults);
                                async.each(Object.keys(fmcResults), function(userId, next) {
                                    contestRef.child('results').child(targetContest).child('e333fm').child(userId).child('result').update({
                                        'condition': fmcResults[userId]['result']['condition'],
                                        'record': fmcResults[userId]['result']['record']
                                    }, function(error) {
                                        if (error) {
                                            console.error(error);
                                        } else {
                                            contestRef.child('results').child(targetContest).child('e333fm').child(userId).setPriority(fmcResults[userId]['.priority'], function(error) {
                                                if (error) {
                                                    console.error(error);
                                                } else {
                                                    next();
                                                }
                                            });
                                        }
                                    });
                                }, function(err) {
                                    if (!err) {
                                        collectResults();
                                    } else {
                                        console.error(err);
                                        process.exit(1);
                                    }
                                });

                            } else {
                                console.error(err);
                                process.exit(1);
                            }
                        });
                    });
                } else {
                    collectResults();
                }
            });
        }
    });
};

// 存在するコンテストか調べる
var checkExists = function() {
    // コンテストから検索 (認証不要)
    contestRef.child('contests').child(targetContest).once('value', function(snap) {
        if (snap.exists()) {
            checkFMC();
        } else {
            console.error('Contest does not exist');
            process.exit(1);
        }
    });
};

// inProgess.lastContest を取得
var getLastContest = function() {
    // lastContest を取得 (認証不要)
    contestRef.child('inProgress').child('lastContest').once('value', function(snap) {
        targetContest = snap.val();
        checkFMC();
    });
}

var main = function() {
    if (argvrun.options.contest) {
        targetContest = 'c' + argvrun.options.contest;
        checkExists();
    } else if (argvrun.options.lastcontest) {
        getLastContest();
    }
}
main();
