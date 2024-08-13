/**
 * create-season.js
 *
 * 指定シーズンのデータを作成する。
 * データベースの contests, scrambles を生成し、該当する results を初期化する。
 * すでにデータが存在するときは上書きしない。
 */

var async = require('async');
var request = require('request');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

// デフォルトの競技
var EventsDefault = ['e333', 'e222', 'e444', 'e555', 'e666', 'e777', 'e333bf', 'e333fm', 'e333oh', 'eminx', 'epyram', 'eskewb', 'esq1', 'eclock'];


var usage = function() {
    console.error('Usage: node create-season.js 20161');
    process.exit(1);
}

// イベントのデータを取得 (認証不要)
contestRef.child('events').once('value', function(snap) {
    var Events = snap.val();
    //console.dir(Events);

    // Create data
    var year, season;
    if (process.argv[2] === undefined || !( /^[0-9]{4}(1|2)$/.test(process.argv[2]) ) ) {
        usage();
    } else {
        year = process.argv[2].substr(0, 4);
        season = process.argv[2].substr(4);
    }

    var beginMonth, endMonth, seasonName;
    if (season === '1') {
        beginMonth = 0; // January
        endMonth = 6;
        seasonName = '前半期';
    } else if (season === '2') {
        beginMonth = 6; // July
        endMonth = 0;
        seasonName = '後半期';
    } else {
        process.exit(1);
    }

    // Unix timestamp for first contest
    // 21:00:00 (JST) == 12:00:00 (UTC)
    var beginDate = 1;
    var beginTimestamp;
    while (true) {
        var d = new Date();
        d.setUTCFullYear(year);
        d.setUTCMonth(beginMonth);
        d.setUTCDate(beginDate);
        d.setUTCHours(12);
        d.setUTCMinutes(0);
        d.setUTCSeconds(0);
        d.setUTCMilliseconds(0);
        beginTimestamp = d.getTime();

        // If sunday
        if (d.getDay() === 0) {
            break;
        }
        beginDate++;
    }

    // コンテストデータ
    var contests = {};
    var contestsIndexes = [];

    // Basic contest data
    for (var i = 1; ; i++) {
        var d = new Date(beginTimestamp);
        if (d.getUTCMonth() === endMonth) {
            break;
        }
        var contestId = year + season + (('0') + i).substr(-2);
        contestsIndexes.push('c' + contestId);

        // next contest: Increment millisec for one week
        var nextTimestamp = beginTimestamp + 7 * 24 * 60 * 60 * 1000;
        contests['c' + contestId] = {
            'contestId': parseInt(contestId),
            'beginAt': beginTimestamp,
            'endAt': nextTimestamp,
            'contestName': 'TORIBO Contest ' + year + ' ' + seasonName + ' 第' + i + '節',
            'year': parseInt(year),
            'season': parseInt(season),
            'number': i
        }
        contests['c' + contestId]['events'] = EventsDefault;

        beginTimestamp = nextTimestamp;
    }

    // コンテストデータを保存する
    saveContests(contests, contestsIndexes, function() {

        // スクランブルを生成する
        var scrambles = {};
        var scramblesIndexes = contestsIndexes;

        async.eachSeries(contestsIndexes, function(contestId, next) {
            var contest = contests[contestId];

            var url = 'http://' + Config.TNOODLE_HOST + ':2014/scramble/.json?seed=' + contestId + Config.SEED;
            contest.events.forEach(function(eventId) {
                url += '&' + eventId + '=' + Events[eventId].scramblePuzzle + '*' + Events[eventId].attempts;
            });
            console.log('Creating scrambles for ' + contestId + ' ...');
            console.log('  ' + url);

            var options = {
                'url': url,
                'method': 'GET',
                'headers': { 'Content-Type': 'application/json' },
                'json': true
            };

            // TNoodle でスクランブルを生成して取得
            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    scrambles[contestId] = {};
                    scramblesIndexes.push(contestId);
                    body.forEach(function(result) {
                        var _title = result.title;
                        var _scrambles = result.scrambles;
                        scrambles[contestId][_title] = _scrambles;
                    });
                    console.log('done for ' + contestId);
                    next();
                } else {
                    console.error(error);
                    process.exit(1);
                }
            });

        }, function(err) {
            if (!err) {
                //console.dir(contests);
                console.log('Generated all scrambles');
                saveScrambles(scrambles, scramblesIndexes, function() {
                    // ダミー結果を生成
                    saveResults(contests, contestsIndexes, function() {
                        console.log('Completed ALL!');
                        process.exit(0);
                    });
                });
            } else {
                console.error(err);
                process.exit(1);
            }
        });
        //console.dir(contests);
    });
});

// Save contests to DB
var saveContests = function(contests, contestsIndexes, callback) {
    // read current data
    contestRef.child('contests').once('value', function(snap) {
        var current = snap.val();
        //console.dir(current);

        // write
        async.eachSeries(contestsIndexes, function(contestId, next) {
            // 上書きはしない
            if (current[contestId] !== undefined) {
                console.error('Already exists:', contestId);
                next();
            } else {
                contestRef.child('contests').child(contestId).set(contests[contestId], function(error) {
                    if (error) {
                        console.error('Set failed... contest: ' + contestId);
                        process.exit(1);
                    } else {
                        console.log('Set succeeded... contest: ' + contestId);
                        next();
                    }
                });
            }
        }, function(err) {
            if (!err) {
                // ダミーデータを削除する
                //contestRef.child('contests').child('cxxxxxxx').set(null, function(error) {
                //    if (error) {
                //        console.error('Remove failed');
                //        process.exit(1);
                //    } else {
                //        console.log('Remove succeeded');
                        callback();
                //    }
                //});
            } else {
                console.error(err);
                process.exit(1);
            }
        });
    });
};

// Save scrambles to DB
var saveScrambles = function(scrambles, scramblesIndexes, callback) {
    // read current data
    contestRef.child('scrambles').once('value', function(snap) {
        var current = snap.val();
        //console.dir(current);

        // write
        async.eachSeries(scramblesIndexes, function(contestId, next) {
            // 上書きはしない
            if (current[contestId] !== undefined) {
                console.error('Already exists:', contestId);
                next();
            } else {
                // Work around 処理
                // TNoodle 0.14.0 で生成される「クロック」のスクランブルには末尾にピンのスクランブルが入っているが、今は不要なので削除する。
                if (scrambles[contestId]['eclock']) {
                    for (var i = 0; i < scrambles[contestId]['eclock'].length; i++) {
                        // 末尾のピン情報のスクランブル文字列を削除
                        // ピンは「UR DR DL UL」の順で入っているので、末尾の3文字がこの文字列に一致すれば順に削除する
                        if (scrambles[contestId]['eclock'][i].slice(-3) === ' UL') {
                            scrambles[contestId]['eclock'][i] = scrambles[contestId]['eclock'][i].slice(0, -3);
                        }
                        if (scrambles[contestId]['eclock'][i].slice(-3) === ' DL') {
                            scrambles[contestId]['eclock'][i] = scrambles[contestId]['eclock'][i].slice(0, -3);
                        }
                        if (scrambles[contestId]['eclock'][i].slice(-3) === ' DR') {
                            scrambles[contestId]['eclock'][i] = scrambles[contestId]['eclock'][i].slice(0, -3);
                        }
                        if (scrambles[contestId]['eclock'][i].slice(-3) === ' UR') {
                            scrambles[contestId]['eclock'][i] = scrambles[contestId]['eclock'][i].slice(0, -3);
                        }
                    }
                }

                contestRef.child('scrambles').child(contestId).set(scrambles[contestId], function(error) {
                    if (error) {
                        console.error('Set failed... scramble: ' + contestId);
                        process.exit(1);
                    } else {
                        console.log('Set succeeded... scramble: ' + contestId);
                        next();
                    }
                });
            }
        }, function(err) {
            if (!err) {
                // ダミーデータを削除する
                //contestRef.child('scrambles').child('cxxxxxxx').set(null, function(error) {
                //    if (error) {
                //        console.error('Remove failed');
                //        process.exit(1);
                //    } else {
                //        console.log('Remove succeeded');
                        callback();
                //    }
                //});
            } else {
                console.error(err);
                process.exit(1);
            }
        });
    });
};

// Save dummy results to DB
var saveResults = function(contests, contestsIndexes, callback) {
    // read current data
    contestRef.child('results').once('value', function(snap) {
        var current = snap.val();
        //console.dir(current);

        // write
        async.eachSeries(contestsIndexes, function(contestId, next) {
            // 上書きはしない
            if (current[contestId] !== undefined) {
                console.error('Already exists:', contestId);
                next();
            } else {
                var dummyResults = {};
                contests[contestId].events.forEach(function(e) {
                    dummyResults[e] = {
                        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx': {
                            '_dummy' : true
                        }
                    };
                });
                contestRef.child('results').child(contestId).set(dummyResults, function(error) {
                    if (error) {
                        console.error('Set failed; result: ' + contestId);
                        process.exit(1);
                    } else {
                        console.log('Set succeeded; result: ' + contestId);
                        next();
                    }
                });
            }
        }, function(err) {
            if (!err) {
                // ダミーデータを削除する
                //contestRef.child('results').child('cxxxxxxx').set(null, function(error) {
                //    if (error) {
                //        console.error('Remove failed');
                //        process.exit(1);
                //    } else {
                //        console.log('Remove succeeded');
                        callback();
                //    }
                //});
            } else {
                console.error(err);
                process.exit(1);
            }
        });
    });
};
