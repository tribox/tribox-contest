/**
 * backup.js
 *
 * Firebase コンテストアプリをバックアップ
 */

var fs = require('fs');

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

var backup = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            var d = new Date();
            var filename = __dirname + '/../backup/' + Config.CONTESTAPP + '.'
                         + d.getFullYear()
                         + ('0' + (d.getMonth() + 1)).slice(-2)
                         + ('0' + d.getDate()).slice(-2)
                         + '.json';
            contestRef.once('value', function(snap) {
                fs.writeFile(filename, JSON.stringify(snap.val(), null, '    '), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    } else {
                        console.log('Wrote backup: ' + filename);
                        process.exit(0);
                    }
                });
            }, function(err) {
                console.error(err);
            });
        }
    });
};
backup();
