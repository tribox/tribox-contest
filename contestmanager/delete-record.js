/**
 * delete-record.js
 *
 * 不正等した記録を消去する
 */

var exec = require('child_process').exec;
var fs = require('fs');
require('date-utils');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;
var contestAdmin = require('./contestref.js').admin;

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
        name: 'dryrun',
        type: 'boolean',
        description: 'Enable dryrun',
        example: "'delete-record.js --dryrun'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象コンテスト (c2016xxx)
var targetContest;
// ユーザテーブル、ユーザシークレットテーブル
var Users;


// 記録を削除する
var deleteRecord = function(targetUID, targetEmail) {
    var targetUsername = argvrun.options.username;
    var targetEvent = argvrun.options.event;

    contestRef.child('results').child(targetContest).child('e' + targetEvent).child(targetUID).once('value', function(snapResults) {
        var targetResult = snapResults.val();

        // 消す記録
        delete_log = {
            "email": targetEmail,
            "username": targetUsername,
            "contest": targetContest,
            "uid": targetUID,
            "event": targetEvent,
            "deletingResult": targetResult,
        }
        console.log('');
        console.log('** NOTICE -- about to delete **');
        console.log('********************************');
        console.dir(delete_log, {depth: null});
        console.log('********************************');
        console.log('');

        if (argvrun.options.dryrun) {
            console.log('dryrun!!!!');
            process.exit(0);
        } else {
            // 削除前にログに保存
            var filename = Config.PATH_TO_DELETELOGS + (new Date().toFormat('/YYYYMMDD_HH24MISS'));
            filename += '_' + targetContest;
            filename += '_' + targetUsername;
            filename += '_e' + targetEvent;
            filename += '.log';
            fs.writeFileSync(filename, JSON.stringify(delete_log, null, 4));

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
};


// ユーザー名からメールアドレスを取得する
var getEmail = function() {
    var targetUsername = argvrun.options.username;

    contestRef.child('users').once('value', function(snapUsers) {
        Users = snapUsers.val();

        // UID を調べる
        var foundUID = '';
        Object.keys(Users).forEach(function(uid) {
            if (Users[uid].username == targetUsername) {
                foundUID = uid;
            }
        });

        if (!foundUID) {
            console.error('Username does not exist');
            process.exit(1);
        }

        // Note: node version 8 だとBigInt型のエラーにより以下の auth() が実行不可能
        contestAdmin.auth().getUser(foundUID).then(function(userRecord) {
            console.log("Successfully getting user");
            deleteRecord(foundUID, userRecord.email);
        }).catch(function(error) {
            console.error("Error getting user:", error);
            process.exit(1);
        });

    });
};


// 存在するコンテストか調べる
var checkExists = function() {
    contestRef.child('contests').child(targetContest).once('value', function(snap) {
        if (snap.exists()) {
            getEmail();
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
