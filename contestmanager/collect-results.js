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
var Twitter = require('twitter');

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
        name: 'lottery',
        short: 'p',
        type: 'boolean',
        description: 'Set lottery and add point to customer',
        example: "'collect-results.js --lottery' or 'collect-results.js -p'"
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
var targetContest, targetContestObj;
// ユーザテーブル、ユーザシークレットテーブル
var Users, Usersecrets;
// 優勝者 (333の)
var winner;

// 書き込むデータ (順位、シーズンポイント、当選)
var ready = {};


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

var connection = mysql.createConnection({
    host: Config.MYSQL_HOST,
    user: Config.MYSQL_USER,
    password: Config.MYSQL_PASSWORD,
    database: Config.MYSQL_DATABASE
});
connection.connect();

var connectionStore = mysql.createConnection({
    host: Config.MYSQL_STORE_HOST,
    user: Config.MYSQL_STORE_USER,
    password: Config.MYSQL_STORE_PASSWORD,
    database: Config.MYSQL_STORE_DATABASE
});
connectionStore.connect();

// 結果をツイートする
var doTweet = function() {
    if (argvrun.options.tweet) {
        // ツイートテキスト
        // 例 "Yueh-Lin Tsai (tribox SCT) wins 今週のコンテスト [URL]"
        var status = ' wins ' + targetContestObj.contestName
                   + ' https://contest.tribox.com/contest/' + targetContestObj.contestId;
        if (Users[winner].organization) {
            status = Users[winner].displayname + ' (' + Users[winner].organization + ')' + status;
        } else {
            status = Users[winner].displayname + status;
        }

        var client = new Twitter({
            consumer_key: Config.CONSUMER_KEY,
            consumer_secret: Config.CONSUMER_SECRET,
            access_token_key: Config.ACCESS_TOKEN,
            access_token_secret: Config.ACCESS_TOKEN_SECRET
        });
        client.post('statuses/update', {status: status}, function(error, tweet, response) {
            if (!error) {
                console.log(tweet);
                process.exit(0);
            } else {
                console.error(error);
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }
};

// コンテストの集計結果を firebase と MySQL に書き込む
var writeResults = function() {
    console.dir(ready);

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

                // ユーザの参加履歴を MySQL に保存する
                // 存在する場合は update, 存在しない場合は insert
                connection.query('SELECT id FROM competed_history WHERE user_id = ? AND contest_id = ? AND event_id = ?', [
                    userId, targetContest, eventId
                ], function(error, results, fields) {
                    if (error) {
                        console.error(error);
                    } else {
                        if (results[0] && 'id' in results[0]) {
                            console.log('UPDATE competed_history');
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
                            console.log('INSERT INTO competed_history');
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
            console.log('Completed updating! (' + count + ' records)');

            if (argvrun.options.lottery) {
                // 抽選ポイントを加算して履歴を記録する
                var lotteryReady = [];
                Object.keys(ready).forEach(function(eventId) {
                    Object.keys(ready[eventId]).forEach(function(userId) {
                        if (ready[eventId][userId].lottery) {
                            lotteryReady.push({
                                'eventId': eventId, 'userId': userId,
                                'customerId': Usersecrets[userId].triboxStoreCustomerId
                            });
                        }
                    });
                });
                console.dir(lotteryReady);

                var countLottery = 0;
                async.each(lotteryReady, function(r, next) {
                    var eventId = r.eventId;
                    var userId = r.userId;
                    var customerId = r.customerId;

                    // ポイント加算履歴を検索して、未加算なら加算する
                    connection.query('SELECT id FROM lottery_log WHERE user_id = ? AND contest_id = ? AND event_id = ?', [
                        userId, targetContest, eventId
                    ], function(error, results, fields) {
                        if (error) {
                            console.error(error);
                        } else {
                            if (results[0] && 'id' in results[0]) {
                                // 既に加算されている記録が残っている場合は加算しない
                                console.log('No need to update point!');
                                countLottery++;
                                next();
                            } else {
                                // 加算処理
                                console.log('UPDATE dtb_customer');
                                connectionStore.query('UPDATE dtb_customer SET point = point + ' + Config.LOTTERY_POINT + ' WHERE customer_id = ?', [
                                    customerId
                                ], function(error, results, fields) {
                                    var _updatedAt;
                                    if (error) {
                                        console.error(error);
                                        console.log('Succeeded updating point!');
                                        // 加算エラー記録用
                                        _updatedAt = 'NULL';
                                    } else {
                                        console.log('Failed updating point!');
                                        // 加算成功記録用
                                        _updatedAt = 'NOW()';
                                    }
                                    connection.query('INSERT INTO lottery_log SET ?', {
                                        'user_id': userId,
                                        'contest_id': targetContest,
                                        'event_id': eventId,
                                        'customer_type': 0,
                                        'customer_id': customerId,
                                        'point': Config.LOTTERY_POINT,
                                        'updated_at': _updatedAt
                                    }, function(error, results, fields) {
                                        if (error) {
                                            console.error(error);
                                        } else {
                                            countLottery++;
                                            next();
                                        }
                                    });

                                });
                            }
                        }
                    });
                }, function(err) {
                    if (!err) {
                        console.log('Completed updating lottery point! (' + countLottery + ' records)');
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

};

// 順位、SP、当選の記録をリセットする
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
                        'seasonPoint': null,
                        'lottery': null
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
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            contestRef.child('users').once('value', function(snapUsers) {
            contestRef.child('usersecrets').once('value', function(snapUsersecrets) {
                Users = snapUsers.val();
                Usersecrets = snapUsersecrets.val();

                contestRef.child('results').child(targetContest).once('value', function(snapResults) {
                    var results = snapResults.val();

                    ready = {};
                    Object.keys(results).forEach(function(eventId) {
                        ready[eventId] = {};

                        var place = 1;
                        var placePrev = -1;
                        var priorityPrev = "";
                        var lotteryTargets = [];
                        Object.keys(results[eventId]).forEach(function(userId) {
                            if (results[eventId][userId]._dummy == true) {
                                return;
                            }
                            ready[eventId][userId] = {};

                            var priority = snapResults.child(eventId).child(userId).getPriority();

                            // 計測が完了していない場合は無視する
                            if ('endAt' in results[eventId][userId]) {
                                // ツイート用に winner を保存しておく
                                if (!winner && eventId == 'e333' && place == 1) {
                                    winner = userId;
                                }

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

                                    // 当選者候補
                                    if (argvrun.options.lottery) {
                                        if (Users[userId].isTriboxCustomer) {
                                            lotteryTargets.push(userId);
                                        }
                                    }
                                }
                            }

                        });

                        // 当選者
                        if (argvrun.options.lottery) {
                            shuffle(lotteryTargets);
                            for (var i = 0, l = Math.min(Config.NUM_LOTTERY, lotteryTargets.length); i < l; i++) {
                                ready[eventId][lotteryTargets[i]]['lottery'] = true;
                            }
                        }
                    });
                    resetResults();

                });
            });
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

                // コンテストにFMC競技があるとき
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
                }

                // コンテストにFMC競技があるとき
                else {
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
            targetContestObj = snap.val();
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
        contestRef.child('contests').child(targetContest).once('value', function(snapContest) {
            targetContestObj = snapContest.val();
            checkFMC();
        });
    });
}

var main = function() {
    if (argvrun.options.contest) {
        targetContest = 'c' + argvrun.options.contest;
        checkExists();
    } else if (argvrun.options.lastcontest) {
        getLastContest();
    } else {
        process.exit(1);
    }
}
main();
