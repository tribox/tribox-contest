/**
 * delete-record.js
 *
 * 不正等した記録を消去する
 */

var async = require('async');
var exec = require('child_process').exec;

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
        type: 'string',
        description: 'Target contest',
        example: "'delete-record.js --contest=2018101'"
    },
    {
        name: 'event',
        type: 'string',
        description: 'Target event',
        example: "'delete-record.js --event=333'"
    },
    {
        name: 'username',
        type: 'string',
        description: 'Target username',
        example: "'delete-record.js --username=kotarot'"
    },
    {
        name: 'email',
        type: 'string',
        description: 'Target email (TODO: To get this automatically)',
        example: "'delete-record.js --email=kotarot'"
    },
    {
        name: 'dryrun',
        type: 'boolean',
        description: 'Enable dryrun',
        example: "'delete-record.js --dryrun'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象コンテスト (c2016xxx)
var targetContest, targetContestObj;
// ユーザテーブル、ユーザシークレットテーブル
var Users, Usersecrets;


// 記録を削除する
var deleteRecord = function() {
    // admin 権限でログインしてから操作する
    contestRef.authWithCustomToken(token, function(error, authData) {
        if (error) {
            console.error('Authentication Failed!', error);
        } else {
            //console.log('Authenticated successfully with payload:', authData);

            var targetEmail = argvrun.options.email;
            var targetUsername = argvrun.options.username;
            var targetEvent = argvrun.options.event;

            contestRef.child('users').once('value', function(snapUsers) {
            //contestRef.child('usersecrets').once('value', function(snapUsersecrets) {
                Users = snapUsers.val();
                //Usersecrets = snapUsersecrets.val();
                //console.log(Users);
                //console.log(Usersecrets);

                // UID を調べる
                var targetUID = '';
                Object.keys(Users).forEach(function(uid) {
                    if (Users[uid].username == targetUsername) {
                        targetUID = uid;
                    }
                });

                contestRef.child('results').child(targetContest).child('e' + targetEvent).child(targetUID).once('value', function(snapResults) {
                    var targetResult = snapResults.val();

                    // 消す記録
                    console.log('');
                    console.log('** NOTICE -- about to delete **');
                    console.log('Email    : ' + targetEmail);
                    console.log('Username : ' + targetUsername);
                    console.log('Contest  : ' + targetContest);
                    console.log('UID      : ' + targetUID);
                    console.log('Event    : ' + targetEvent);
                    console.log(targetResult);
                    console.log('********************************');
                    console.log('');

                    if (argvrun.options.dryrun) {
                        console.log('dryrun!!!!');
                        process.exit(0);
                    } else {
                        contestRef.child('results').child(targetContest).child('e' + targetEvent).child(targetUID).remove(function() {
                            console.log('delete success!!!!');
                            // メール送信
                            var command = '/usr/bin/php ' + __dirname + '/send-deleteemail.php'
                                        + ' "' + targetEmail + '"'
                                        + ' "' + targetUsername + '"'
                                        + ' "' + targetContest.substr(1) + '"'
                                        + ' "' + targetEvent + '"';
                            exec(command, function(err, stdout, stderr) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.error(stderr);
                                    process.exit(0);
                                }
                            });
                        });
                    }

                });
            //});
            });
        }
    });
};


// 存在するコンテストか調べる
var checkExists = function() {
    // コンテストから検索 (認証不要)
    contestRef.child('contests').child(targetContest).once('value', function(snap) {
        if (snap.exists()) {
            targetContestObj = snap.val();
            deleteRecord();
        } else {
            console.error('Contest does not exist');
            process.exit(1);
        }
    });
};


var main = function() {
    if (argvrun.options.contest) {
        targetContest = 'c' + argvrun.options.contest;
        checkExists();
    } else {
        console.error('Specify contest!');
        process.exit(1);
    }
};
main();
