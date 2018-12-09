/**
 * create-scramblesimg.js
 *
 * ルート以下に scramblesimg をただ作成するだけ。
 * Web UI 上だともうルート以下には読み取り専用になっちゃうため追加できない。
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


// admin 権限でログインしてから操作する
contestRef.authWithCustomToken(token, function(error, authData) {
    if (error) {
        console.error('Authentication Failed!', error);
    } else {
        console.log('Authenticated successfully with payload:', authData);

        contestRef.child('scramblesimg0').set({
            'cxxxxxxx': { '_dummy': true }
        });
    }
});
