/**
 * newfirebasesdk_test.js
 *
 * 新しいFirebase SDKのテスト。
 * participants/c2018225 のを読んできて、
 * 5秒後に participants/c2018225/e333 を 99 に更新して、
 * 5秒後に participants/c2018225/e333 を元に戻すだけ。
 */

var contestRef = require('./contestref.js').ref;

var justTest = function() {
    contestRef.child('participants').child('c2018225').once('value', function(snap) {
        var participants = snap.val();
        console.log(participants);
        var original = participants['e333'];
        console.log(original)
        setTimeout(function() {
            contestRef.child('participants').child('c2018225').child('e333').set(99, function(error) {
                if (error) {
                    console.error(error);
                } else {
                    setTimeout(function() {
                        contestRef.child('participants').child('c2018225').child('e333').set(original, function(error) {
                            if (error) {
                                console.error(error);
                            } else {
                                process.exit(0);
                            }
                        });
                    }, 5000);
                }
            });
        }, 5000);
    });
};
justTest();

/*
    // admin 権限でログインしてから操作する
    //contestRef.authWithCustomToken(token, function(error, authData) {
    //    if (error) {
    //        console.error('Authentication Failed!', error);
    //    } else {
    //        //console.log('Authenticated successfully with payload:', authData);

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

    //    }
    //});
};
checkUsernames();*/
