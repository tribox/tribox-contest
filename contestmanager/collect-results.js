/**
 * collect-results.js
 *
 * 毎週コンテストが終わるごとに実行する。
 * (1) 以下を更新する。
 *   - 順位 (firebase)
 *   - シーズンポイントSP (firebase)
 *   - 参加履歴 (firebase)
 *   - 抽選ポイント (MySQL) ただし待ちレコードを生成するだけで実際にポイントは加算されない
 * (2) 結果をツイートする。
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
        name: 'check',
        type: 'boolean',
        description: 'Check (re-calc) average or best results',
        example: "'collect-results.js --check'"
    },
    {
        name: 'checkfmc',
        type: 'boolean',
        description: 'Check FMC results',
        example: "'collect-results.js --checkfmc'"
    },
    {
        name: 'lottery',
        type: 'boolean',
        description: 'Set lottery',
        example: "'collect-results.js --lottery'"
    },
    {
        name: 'lotteryall',
        type: 'boolean',
        description: 'Set lottery to all verified users in 333',
        example: "'collect-results.js --lotteryall'"
    },
    {
        name: 'resetlottery',
        type: 'boolean',
        description: 'Reset lottery',
        example: "'collect-results.js --resetlottery'"
    },
    {
        name: 'triboxteam',
        type: 'boolean',
        description: 'Prepare points for tribox team',
        example: "'collect-results.js --triboxteam'"
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

// app/views/contestjs.scala.html のコピー
var calcResult = function(method, format, data) {
    method = method.toLowerCase();
    format = format.toLowerCase();

    // Average of X
    if (method == 'average') {
        var lowerIndex = -1, upperIndex = -1;
        if (format == 'time') {
            var sum = 0.000;
            var count = 0, countDNF = 0;
            var lower = 9999.999, upper = 0.000;
            data.forEach(function(d, index) {
                if (d.condition == 'DNF') {
                    countDNF++;
                    upperIndex = index;
                    if (lowerIndex == -1) {
                        lowerIndex = index;
                    }
                } else {
                    var t;
                    if (d.condition == 'OK') {
                        t = d.record;
                    } else if (d.condition == '+2') {
                        t = d.record + 2.000;
                    } else {
                        return null;
                    }

                    sum += t;
                    count++;
                    if (t < lower) {
                        lower = t;
                        lowerIndex = index;
                    }
                    if (upper < t) {
                        upper = t;
                        upperIndex = index;
                    }
                }
            });
            if (countDNF == 0) {
                return {'record': (Math.round(((sum - lower - upper) / (count - 2)) * 1000)) / 1000,
                        'best': lowerIndex, 'worst': upperIndex, 'condition': 'OK' };
            } else if (countDNF == 1) {
                return {'record': (Math.round(((sum - lower) / (count - 1)) * 1000)) / 1000,
                        'best': lowerIndex, 'worst': upperIndex, 'condition': 'OK' };
            } else {
                return {'record': 9999.999, 'best': lowerIndex, 'worst': upperIndex, 'condition': 'DNF'};
            }
        } else {
            return null;
        }
    }

    // Mean of X (Not implemented yet)
    else if (method == 'mean') {
        return null;
    }

    // Best of X
    else if (method == 'best') {
        var bestIndex = -1;
        if (format == 'time') {
            var best = {'record': 9999.999, 'condition': 'DNF'};
            data.forEach(function(d, index) {
                if (d.condition == 'DNF') {
                    if (bestIndex == -1) {
                        bestIndex = index;
                    }
                } else {
                    var t;
                    if (d.condition == 'OK') {
                        t = d.record;
                    } else if (d.condition == '+2') {
                        t = d.record + 2.000;
                    } else {
                        return null;
                    }
                    if (t < best.record) {
                        best.record = t;
                        best.condition = 'OK';
                        bestIndex = index;
                    }
                }
            });
            return {'record': best.record, 'best': bestIndex, 'condition': best.condition};
        } else if (format == 'number') {
            var best = {'record': 9999, 'condition': 'DNF'};
            data.forEach(function(d, index) {
                if (d.condition == 'DNF') {
                    if (bestIndex == -1) {
                        bestIndex = index;
                    }
                } else {
                    if (d.record < best.record) {
                        best = d;
                        bestIndex = index;
                    }
                }
            });
            return {'record': best.record, 'best': bestIndex, 'condition': best.condition};
        } else {
            return null;
        }
    } else {
        return null;
    }
};

// app/views/contestjs.scala.html のコピー
var toFixedForPriority = function(n) {
    nstr = String(n);
    if (nstr.indexOf('.') != -1) {
        var p0 = nstr.split('.')[0];
        var p1 = nstr.split('.')[1];
        return ('000' + p0).slice(-3) + (p1 + '000').slice(0, 3);
    } else {
        return ('000' + nstr).slice(-3) + '000';
    }
};
// ================================================================

var connection = mysql.createConnection({
    host: Config.MYSQL_HOST,
    user: Config.MYSQL_USER,
    password: Config.MYSQL_PASSWORD,
    database: Config.MYSQL_DATABASE
});
connection.connect();


// 結果をツイートする
var doTweet = function() {
    if (argvrun.options.tweet) {
        // ツイートテキスト
        // 例 "Yueh-Lin Tsai (tribox SCT) wins Week 24 (2016, 1H). https://contest.tribox.com/contest/2016124"
        var status = ' wins Week ' + targetContestObj.number + ' (' + targetContestObj.year + ', ' + targetContestObj.season + 'H).'
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
        console.log('Skipped tweet!');
        process.exit(0);
    }
};

// コンテストの集計結果を firebase と MySQL に書き込む
var writeResults = function() {
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

};

// 順位、SP、当選の記録をリセットする
// ただし、当選のリセットは当選リセットのオプションがあるときのみ
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
                    var updateData;
                    if (argvrun.options.resetlottery) {
                        updateData = {
                            'place': null,
                            'seasonPoint': null,
                            'lottery': null
                        };
                    } else {
                        updateData = {
                            'place': null,
                            'seasonPoint': null
                        };
                    }
                    contestRef.child('results').child(targetContest).child(r.eid).child(r.uid).update(updateData, function(error) {
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
                        readyTriboxTeam[eventId] = {};

                        var place = 1;
                        var placePrev = -1;
                        var priorityPrev = "";
                        var lotteryTargets = [];
                        var triboxTeamTargets = [];
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
                                        ready[eventId][userId]['place'] = placePrev;
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

                                    // 当選者候補 (3人選ぶやつ)
                                    if (argvrun.options.lottery) {
                                        if (Users[userId].isTriboxCustomer) {
                                            lotteryTargets.push(userId);
                                        }
                                    }

                                    // 契約アカウント (333のみ)
                                    if (argvrun.options.triboxteam) {
                                        if (Users[userId].isTriboxTeam && eventId == 'e333') {
                                            triboxTeamTargets.push(userId);
                                        }
                                    }
                                }
                                // 当選者候補 (全員当選・DNFも含む)
                                if (argvrun.options.lotteryall) {
                                    if (Users[userId].isTriboxCustomer) {
                                        lotteryTargets.push(userId);
                                    }
                                }
                            }

                        });

                        // 当選者全員
                        if (argvrun.options.lotteryall && eventId == 'e333') {
                            for (var i = 0, l = lotteryTargets.length; i < l; i++) {
                                ready[eventId][lotteryTargets[i]]['lottery'] = true;
                            }
                        }
                        // 当選者抽選
                        else if (argvrun.options.lotteryall || argvrun.options.lottery) {
                            shuffle(lotteryTargets);
                            for (var i = 0, l = Math.min(Config.NUM_LOTTERY, lotteryTargets.length); i < l; i++) {
                                ready[eventId][lotteryTargets[i]]['lottery'] = true;
                            }
                        }

                        // 契約アカウント
                        if (argvrun.options.triboxteam) {
                            for (var i = 0, l = triboxTeamTargets.length; i < l; i++) {
                                readyTriboxTeam[eventId][triboxTeamTargets[i]] = true;
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

            // コンテストにFMC競技がある、かつFMCチェックを実行するとき
            if ('e333fm' in scrambles && argvrun.options.checkfmc) {
                contestRef.child('results').child(targetContest).child('e333fm').once('value', function(snapResults) {
                    var results = snapResults.val();
                    var fmcResults = {};

                    async.each(Object.keys(results), function(userId, next) {
                        if (results[userId]._dummy == true || !(results[userId].endAt)) {
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

                            // FMC結果の書き込み
                            async.each(Object.keys(fmcResults), function(userId, next) {
                                contestRef.child('results').child(targetContest).child('e333fm').child(userId).update({
                                    'result': {
                                        'condition': fmcResults[userId]['result']['condition'],
                                        'record': fmcResults[userId]['result']['record']
                                    },
                                    'priority': fmcResults[userId]['.priority']
                                }, function(error) {
                                    if (error) {
                                        console.error(error);
                                        process.exit(1);
                                    } else {
                                        contestRef.child('results').child(targetContest).child('e333fm').child(userId).setPriority(fmcResults[userId]['.priority'], function(error) {
                                            if (error) {
                                                console.error(error);
                                                process.exit(1);
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

            // コンテストにFMC競技がないとき、またはFMCチェックしないとき
            else {
                collectResults();
            }
            });
        }
    });
};

// 結果 (average と best) の再計算
var checkResults = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            // コンテスト結果を再計算するとき
            if (argvrun.options.check) {
                contestRef.child('events').once('value', function(snapEvents) {
                    var Events = snapEvents.val();
                contestRef.child('results').child(targetContest).once('value', function(snapResults) {
                    var results = snapResults.val();
                    var readyResults = []; // 更新するデータ
                    //console.dir(results);

                    Object.keys(results).forEach(function(eid) {
                        if (eid != 'e333fm') {
                            Object.keys(results[eid]).forEach(function(uid) {
                                if (!(results[eid][uid]._dummy) && results[eid][uid].endAt) {
                                    //console.dir(results[eid][uid]);
                                    var result = calcResult(Events[eid].method, Events[eid].format, results[eid][uid].details);
                                    //console.dir(result);

                                    var _ready = {
                                        'eid': eid,
                                        'uid': uid,
                                        'data': {
                                            'result': result,
                                            '.priority': toFixedForPriority(result.record) + '+' + toFixedForPriority(results[eid][uid].details[result.best].record)
                                        }
                                    };
                                    //console.dir(_ready);
                                    readyResults.push(_ready);
                                }
                            });
                        }
                    });

                    // 結果の更新書き込み
                    async.each(readyResults, function(_ready, next) {
                        contestRef.child('results').child(targetContest).child(_ready.eid).child(_ready.uid).update({
                            'result': _ready['data']['result'],
                            'priority': _ready['data']['.priority']
                        }, function(error) {
                            if (error) {
                                console.error(error);
                                process.exit(1);
                            } else {
                                contestRef.child('results').child(targetContest).child(_ready.eid).child(_ready.uid).setPriority(_ready['data']['.priority'], function(error) {
                                    if (error) {
                                        console.error(error);
                                        process.exit(1);
                                    } else {
                                        next();
                                    }
                                });
                            }
                        });
                    }, function(err) {
                        if (!err) {
                            checkFMC();
                        } else {
                            console.error(err);
                            process.exit(1);
                        }
                    });

                });
                });
            }

            // コンテスト結果を再計算しないとき
            else {
                checkFMC();
            }
        }
    });
};

// 存在するコンテストか調べる
var checkExists = function() {
    // コンテストから検索 (認証不要)
    contestRef.child('contests').child(targetContest).once('value', function(snap) {
        if (snap.exists()) {
            targetContestObj = snap.val();
            checkResults();
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
            checkResults();
        });
    });
};

var main = function() {
    if (argvrun.options.contest) {
        targetContest = 'c' + argvrun.options.contest;
        checkExists();
    } else if (argvrun.options.lastcontest) {
        getLastContest();
    } else {
        console.error('Specify contest!');
        process.exit(1);
    }
};
main();
