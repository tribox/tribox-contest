/**
 * check-usernames.js
 *
 * ユーザ名をチェックする (カウントとか)。
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

var checkUsernames = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            contestRef.child('users').once('value', function(snapUsers) {
                var users = snapUsers.val();
            contestRef.child('usernames').once('value', function(snapUsernames) {
                var usernames = snapUsernames.val();
                var counts = {};
                var usernamesMoreThanOne = {};
                Object.keys(usernames).forEach(function(username) {
                    username = username.toLowerCase();
                    if (username in counts) {
                        counts[username]++;
                    } else {
                        counts[username] = 1;
                    }
                });
                Object.keys(counts).forEach(function(username) {
                    if (1 < counts[username]) {
                        usernamesMoreThanOne[username] = counts[username];
                    }
                });
                console.dir(counts);
                console.dir(usernamesMoreThanOne);

                // ユーザ名チェック
                Object.keys(users).forEach(function(uid) {
                    var user = users[uid];
                    if (user._dummy) {
                        return;
                    }

                    if (!('username' in user)) {
                        console.error(uid + ' has no username');
                        process.exit(1);
                    } else {
                        var username = user.username;
                        if ('disabledAt' in usernames[username]) {
                            console.error(username + ' has disabledAt');
                            process.exit(1);
                        }
                    }
                });

                process.exit(0);
            });
            });

        }
    });
};
checkUsernames();
