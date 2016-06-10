/**
 * create-dummyresult.js
 *
 * 指定コンテストにダミーデータを作成する。
 */

var async = require('async');
var request = require('request');

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


var usage = function() {
    console.error('Usage: node create-dummydata.js 2016121');
    process.exit(1);
}

var CONTEST_ID = 'c' + process.argv[2];
if (!(/^c[0-9]{4}(1|2)[0-9]{2}$/.test(CONTEST_ID))) {
    usage();
}

// 乱数
// シードを用いたかったので、線形合同法で自作
var seed = parseInt(process.argv[2]);
var RAND_MAX = 2147483647;
var random = function() {
    seed = (69069 * seed + 1) & RAND_MAX;
    return seed / RAND_MAX;
};

var range = function(n) {
    var arr = [];
    for (var i = 0; i < n; i++)
        arr.push(i);
    return arr;
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
                        best = d;
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

// OK か +2 か DNF を適当な割合で作る
var getRandomCondition = function(format) {
    var r = random();
    if (format == 'time') {
        if (r < 0.6) {
            return 'OK';
        } else if (r < 0.8) {
            return '+2';
        } else {
            return 'DNF';
        }
    } else if (format == 'number') {
        if (r < 0.6) {
            return 'OK';
        } else {
            return 'DNF';
        }
    }
};

// 10秒以上120秒以下のタイムを適当に作る
var getRandomRecord = function(format) {
    if (format == 'time')
        return Math.floor(random() * (120000 - 10000) + 10000) / 1000;
    else if (format == 'number')
        return Math.floor(random() * (50 - 20) + 20);
};

var addRandomResults = function(contestData, eid) {
    Config.DUMMY_USERS.forEach(function(uid, index) {
        if (index == 0 || random() < 0.8) {
            var results = {};
            var details = [];
            if (eid == 'e333bf') {
                range(3).forEach(function(n) {
                    details.push({
                        'condition': getRandomCondition('time'),
                        'record': getRandomRecord('time')
                    });
                });
                results = {
                    'details': details,
                    'result': calcResult('best', 'time', details),
                    'puzzle': {
                        'type': 'database',
                        'brand': 471,
                        'product': 1786
                    }
                };
            } else if (eid == 'e333fm') {
                details = [{
                    'condition': getRandomCondition('number'),
                    'record': getRandomRecord('number'),
                    'solution': 'U U U U F F F F R R R R',
                    'note': 'ここでNISS。ここでNISS。\nここでNISS。ここでNISS。'
                }];
                results = {
                    'details': details,
                    'result': calcResult('best', 'number', details),
                    'puzzle': {
                        'type': 'nodatabase',
                        'input': 'ろーきゅーぶ'
                    }
                };
            } else {
                range(5).forEach(function(n) {
                    details.push({
                        'condition': getRandomCondition('time'),
                        'record': getRandomRecord('time')
                    });
                });
                results = {
                    'details': details,
                    'result': calcResult('average', 'time', details),
                    'puzzle': {
                        'type': 'unknown'
                    }
                };
            }
            var r = random();
            if (r < 0.5)
                results.type = 'timer';
            else
                results.type = 'form';
            results.beginAt = contestData.beginAt + 1000;
            results.endAt = contestData.beginAt + 2000;

            console.log('eid:', eid);
            console.log('uid:', uid);
            //console.dir(details);
            console.dir(results);

            var priority = toFixedForPriority(results.result.record)
                         + '+'
                         + toFixedForPriority(results.details[results.result.best].record);
            console.log(priority);

            // Save
            contestRef.child('results').child(CONTEST_ID).child(eid).child(uid).set(results, function(error) {
                if (!error) {
                    contestRef.child('results').child(CONTEST_ID).child(eid).child(uid).setPriority(priority, function(error) {
                        if (!error) {
                            console.log('saved');
                        } else {
                            console.error(error);
                        }
                    });
                } else {
                    console.error(error);
                }
            });
        }
    });
};

contestRef.authWithCustomToken(token, function(error, authData) {
    if (error) {
        console.error('Authentication Failed!', error);
    } else {
        console.log('Authenticated successfully with payload:', authData);

        // イベント、コンテストのデータ取得
        contestRef.child('events').once('value', function(snapEvents) {

            contestRef.child('contests').child(CONTEST_ID).once('value', function(snapContest) {
                if (snapContest.exists()) {
                    var contestData = snapContest.val();
                    contestData.events.forEach(function(eid) {
                        addRandomResults(contestData, eid);
                    });
                }
            });
        });
    }
});
