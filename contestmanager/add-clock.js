/**
 * add-clock.js
 *
 * 2024-07 用
 * イベントにクロックを追加する。
 */

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


var updateEvents = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            console.log('Authenticated successfully with payload:', authData);

            // 2024-07 用
            // クロック追加
            contestRef.child('events').child('eclock').set({
                'attempts': 5,
                'format': 'time',
                'hasInspection': true,
                'method': 'average',
                'name': 'Clock',
                'scramblePuzzle': 'clock'
            }, function(error) {
                if (error) {
                    console.error(error);
                    process.exit(1);
                } else {
                    // WCAのランクは110であるが、末尾に追加するので190にする
                    contestRef.child('events').child('eclock').setPriority(190, function(error) {
                        if (error) {
                            console.error(error);
                            process.exit(1);
                        } else {
                            process.exit(0);
                        }
                    });
                }
            });

        }
    });
}

var main = function() {
    // イベントのデータを取得 (認証不要)
    contestRef.child('events').once('value', function(snap) {
        var Events = snap.exportVal();
        console.dir(Events);

        updateEvents();
    });
};

main();
