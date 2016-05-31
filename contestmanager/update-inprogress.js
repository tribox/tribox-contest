/**
 * update-inprogress.js
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
    console.error('Usage: node update-inprogress.js');
    process.exit(1);
}

// コンテストデータを取得 (認証不要)
contestRef.child('contests').once('value', function(snap) {
    var Contests = snap.val();
    //console.dir(Contests);

    // 現在のタイムスタンプ
    var d = new Date();
    var currentTimestamp = parseInt(d.getTime());
    console.log('currentTimestamp:', currentTimestamp);

    // 現在のコンテストを見つける
    var founds = [];
    Object.keys(Contests).forEach(function(contestId) {
        var contest = Contests[contestId];
        //console.log(contestId);
        //console.dir(contest);

        var beginAt = parseInt(contest['beginAt']);
        var endAt = parseInt(contest['endAt']);
        if (beginAt <= currentTimestamp && currentTimestamp <= endAt) {
            founds.push(contestId);
        }
    });

    // 現在のコンテストが見つからないか、複数見つかってしまう (ごくまれ)
    if (founds.length != 1) {
        console.error('Try again');
        process.exit(1);
    }

    // 現在時刻の開催コンテストが求まる
    console.log('cuurent contest:', founds[0]);

    // 1個前のコンテストのタイムスタンプ
    var lastTimestamp = currentTimestamp - (7 * 24 * 60 * 60 * 1000);
    console.log('lastTimestamp:', lastTimestamp);

    // 1個前のコンテストを見つける
    var lastFounds = [];
    Object.keys(Contests).forEach(function(contestId) {
        var contest = Contests[contestId];
        //console.log(contestId);
        //console.dir(contest);

        var beginAt = parseInt(contest['beginAt']);
        var endAt = parseInt(contest['endAt']);
        if (beginAt <= lastTimestamp && lastTimestamp <= endAt) {
            lastFounds.push(contestId);
        }
    });

    // 1個前のコンテストが見つからないか、複数見つかってしまう (ごくまれ)
    if (lastFounds.length != 1) {
        console.error('Try again');
        process.exit(1);
    }

    // 現在時刻の開催コンテストが求まる
    console.log('last contest:', lastFounds[0]);

    // 書き込む (admin権限で)
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
            process.exit(1);
        } else {
            console.log('Authentication successfully with payload:', authData);

            contestRef.child('inProgress').set({
                'contest': founds[0],
                'lastContest': lastFounds[0]
            }, function(error) {
                if (error) {
                    console.err(err);
                    process.exit(1);
                } else {
                    console.log('completed');
                    process.exit(0);
                }
            });
        }
    });
});
