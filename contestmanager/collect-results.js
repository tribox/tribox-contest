/**
 * collect-results.js
 */

var async = require('async');

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
        name: 'contest',
        short: 'c',
        type: 'string',
        description: 'Target contest',
        example: "'collect-results.js --contest=2016121' or 'collect-results.js -c 2016121'"
    },
    {
        name: 'tweet',
        short: 't',
        type: 'boolean',
        description: 'Tweet the results',
        example: "'collect-results.js --tweet' or '-t'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象コンテスト (c2016xxx)
var targetContest;

// コンテストの結果を集計（整形）する
var collectResults = function() {
    console.log('Collecting contest: ', targetContest);

    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            console.log('Authenticated successfully with payload:', authData);

            // スクランブルを取得しておく
            contestRef.child('scrambles').child(targetContest).once('value', function(snapScrambles) {
                var scrambles = snapScrambles.val();
                console.dir(scrambles);

                // 333fm 以外はすでに結果が入っているから place に順位だけ入れて完了
                // 333fm は結果がまだ入っていないので、解答をチェックして結果を記録する
                contestRef.child('results').child(targetContest).once('value', function(snapResults) {
                    var results = snapResults.val();

                    // 書き込むデータ
                    var ready = {};

                    Object.keys(results).forEach(function(eventId) {
                        console.log(eventId);
                        ready[eventId] = {};

                        // 333fm 以外
                        if (eventId != 'e333fm') {
                            var place = 1;
                            var placePrev = -1;
                            var priorityPrev = "";
                            Object.keys(results[eventId]).forEach(function(userId) {
                                if (results[eventId][userId]._dummy == true) {
                                    return;
                                }
                                ready[eventId][userId] = {};

                                var priority = snapResults.child(eventId).child(userId).getPriority();
                                if (results[eventId][userId]['result']['condition'] == 'DNF') {
                                    ready[eventId][userId]['place'] = place;
                                } else {
                                    if (priority == priorityPrev) {
                                        ready[eventId][userId]['place'] = prevPlace;
                                    } else {
                                        ready[eventId][userId]['place'] = place;
                                        placePrev = place;
                                    }
                                    priorityPrev = priority;
                                    place++;
                                }
                            });
                        }

                        // 333fm は解答チェックする
                        else {
                            Object.keys(results[eventId]).forEach(function(userId) {
                                if (results[eventId][userId]._dummy == true) {
                                    return;
                                }
                                ready[eventId][userId] = {};

                                var solution = results[eventId][userId]['details'][0]['solution'];
                                console.log(solution);
                            });
                            console.log();
                        }
                    });
                    console.dir(ready);

                    // それぞれ書き込む
                    /*Object.keys(ready).forEach(function(eventId) {
                        Object.keys(ready[eventId]).forEach(function(userId) {
                            contestRef.child('results').child(targetContest).child(eventId).child(userId).update(ready[eventId][userId], function(error) {
                                if (error) {
                                    console.error(error);
                                } else {
                                    console.log('Completed updating place: ' + eventId + ' ' + userId);
                                }
                            });
                        });
                    });*/

                });
            });
        }
    });
};

// inProgess.lastContest を取得
var getLastContest = function(callback) {
    // lastContest を取得 (認証不要)
    contestRef.child('inProgress').child('lastContest').once('value', function(snap) {
        targetContest = snap.val();
        callback();
    });
}

var main = function() {
    if (argvrun.options.contest) {
        targetContest = 'c' + argvrun.options.contest;
        collectResults();
    } else {
        getLastContest(collectResults);
    }
}
main();
