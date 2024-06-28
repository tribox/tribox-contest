/**
 * add-777.js
 *
 * 2018-07 用
 * イベントに777を追加する。
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

            // 2018-07-01 用
            // 777追加
            contestRef.child('events').child('e777').set({
                'attempts': 3,
                'format': 'time',
                'hasInspection': true,
                'method': 'mean',
                'name': '7×7×7',
                'scramblePuzzle': '777'
            }, function(error) {
                if (error) {
                    console.error(error);
                    process.exit(1);
                } else {
                    contestRef.child('events').child('e777').setPriority(60, function(error) {
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
