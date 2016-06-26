/**
 * count-usernames.js
 *
 * ユーザ名をカウントする。
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

var countUsernames = function() {
    contestRef.child('usernames').once('value', function(snapUsernames) {
        var usernames = snapUsernames.val();
        var counts = {};
        Object.keys(usernames).forEach(function(username) {
            username = username.toLowerCase();
            if (username in counts) {
                counts[username]++;
            } else {
                counts[username] = 1;
            }
        });
        console.dir(counts);
        process.exit(0);
    });
};
countUsernames();

/*var setEventsPriorities = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            async.each(Object.keys(EventsPriorities), function(eid, next) {
                var priority = EventsPriorities[eid];
                contestRef.child('events').child(eid).setPriority(priority, function(error) {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log(eid + ': ' + priority);
                        next();
                    }
                });
            }, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Complete!');
                    process.exit(0);
                }
            });

        }
    });
};
setEventsPriorities();*/
