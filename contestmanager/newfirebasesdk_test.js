/**
 * newfirebasesdk_test.js
 *
 * 新しいFirebase SDKのテスト。
 * participants/c2018225 のを読んできて、
 * 5秒後に participants/c2018225/e333 を 99 に更新して、
 * 5秒後に participants/c2018225/e333 を元に戻すだけ。
 */

var contestRef = require('./contestref.js').ref;

console.log(Config); // undefined のはず

var Config = require('./config.js');
console.log(Config); // 実体があるはず

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
