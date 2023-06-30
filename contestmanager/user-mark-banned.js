/**
 * user-mark-banned.js
 *
 * 指定したユーザをBAN (凍結) する。解除する場合もこのスクリプトのオプションで実行する。
 *
 * このスクリプトが実施する内容:
 * (1) Firebase の Database で users.<UID>.isSuspended を true に設定する。
 * (2) Firebase の Authentication で「アカウントを無効にする」を設定する。
 */

var async = require('async');

var Config = require('./config.js');
var contestRef = require('./contestref.js').ref;
var contestAuth = require('./contestref.js').auth;

var argv = require('argv');
argv.option([
    {
        name: 'username',
        type: 'string',
        description: 'Username to be banned',
        example: "'user-mark-banned.js --username=kotarot'"
    },
    {
        name: 'unban',
        type: 'boolean',
        description: 'Unban the user instead of banning (default)',
        example: "'user-mark-banned.js --unban'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);


var disableUser = function(uid) {
    console.log(uid);
    contestAuth.getUser(uid, function(res) {
        console.log(res);
    });
};


var getUserId = function(username) {
    contestRef.child('users').once('value', function(snapUsers) {
        Users = snapUsers.val();

        // UID を調べる
        var foundUID = '';
        Object.keys(Users).forEach(function(uid) {
            if (Users[uid].username == username) {
                foundUID = uid;
            }
        });

        console.log(foundUID);
        if (!foundUID) {
            console.error('Username does not exist');
            process.exit(1);
        }

        setValue = 'true';
        if (argvrun.options.unban) {
            setValue = 'false';
        }
        contestRef.child('users').child(foundUID).child('isSuspended').set(setValue, function(error) {
            if (error) {
                console.error(error);
            } else {
                console.log('Success ' + username + ' (' + foundUID + ')');
                disableUser(foundUID);
            }
        });

    });
};

var main = function() {
    if (argvrun.options.username) {
        getUserId(argvrun.options.username);
    } else {
        console.error('Specify username!');
        process.exit(1);
    }
};
main();
