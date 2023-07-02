/**
 * ban-user.js
 *
 * 指定したユーザをBAN (凍結) する。解除する場合もこのスクリプトのオプションで実行する。
 *
 * このスクリプトが実施する内容:
 * (1) Firebase の Database で users.<UID>.isSuspended を true に設定する。
 * (2) Firebase の Authentication で「アカウントを無効にする」を設定する。
 */

var contestRef = require('./contestref.js').ref;
var contestAdmin = require('./contestref.js').admin;

var argv = require('argv');
argv.option([
    {
        name: 'username',
        type: 'string',
        description: 'Username to be banned',
        example: "'ban-user.js --username=kotarot'"
    },
    {
        name: 'unban',
        type: 'boolean',
        description: 'Unban the user instead of banning (default)',
        example: "'ban-user.js --unban'"
    },
]);
var argvrun = argv.run();
console.log(argvrun);


var disableUser = function(uid) {
    // Note: node version 8 だとBigInt型のエラーにより以下の auth() が実行不可能
    contestAdmin.auth().updateUser(uid, {
        disabled: !argvrun.options.unban,
    }).then(function(userRecord) {
        console.log("Successfully updated user:");
        console.log(userRecord.toJSON());
        process.exit(0);
    }).catch(function(error) {
        console.error("Error updating user:", error);
        process.exit(1);
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

        if (!foundUID) {
            console.error("Username '" + username + "' does not exist");
            process.exit(1);
        }

        contestRef.child('users').child(foundUID).child('isSuspended').set(!argvrun.options.unban, function(error) {
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
