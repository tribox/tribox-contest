/**
 * check-usernames.js
 *
 * ユーザ名をチェックする (カウントとか)。
 */

var contestRef = require('./contestref.js').ref;

var checkUsernames = function() {
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
};
checkUsernames();
