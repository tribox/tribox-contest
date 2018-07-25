/**
 * set-eventspriorities.js
 *
 * 競技の優先度を設定する。
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

// 競技と優先度のリスト
var EventsPriorities = {
    'e333': 10.0,
    'e222': 20.0,
    'e444': 30.0,
    'e555': 40.0,
    'e666': 50.0,
    'e777': 60.0,
    'e333bf': 70.0,
    'e333fm': 80.0,
    'e333oh': 90.0,
    'eminx': 120.0,
    'epyram': 130.0,
    'esq1': 150.0
};

var setEventsPriorities = function() {
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
setEventsPriorities();
