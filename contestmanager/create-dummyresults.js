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
    ;
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

var addRandomResults = function(eid) {
    Config.DUMMY_USERS.forEach(function(uid) {
        if (random() < 0.8) {
            var details = [];
            if (eid == 'e333bf') {
                range(3).forEach(function(n) {
                    details.push({
                        'condition': getRandomCondition('time'),
                        'record': getRandomRecord('time')
                    });
                });
            } else if (eid == 'e333fm') {
                details = [{
                    'condition': getRandomCondition('number'),
                    'record': getRandomRecord('number')
                }];
            } else {
                range(5).forEach(function(n) {
                    details.push({
                        'condition': getRandomCondition('time'),
                        'record': getRandomRecord('time')
                    });
                });
            }
            console.log(eid);
            console.log(uid);
            console.dir(details);
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
                    console.dir(contestData);

                    contestData.events.forEach(function(eid) {
                        addRandomResults(eid);
                    });
                }
            });
        });
    }
});
