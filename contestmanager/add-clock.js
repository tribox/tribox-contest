/**
 * add-clock.js
 *
 * 2024-07 用
 * イベントにクロックを追加する。
 */

var contestRef = require('./contestref.js').ref;

var updateEvents = function() {
    // 2024-07 用
    // クロック追加
    contestRef.child('events').child('eclock').set({
        'attempts': 5,
        'format': 'time',
        'hasInspection': true,
        'method': 'average',
        'name': 'Clock',
        'scramblePuzzle': 'clock'
    }, function(error) {
        if (error) {
            console.error(error);
            process.exit(1);
        } else {
            // WCAのランクは110であるが、末尾に追加するので190にする
            contestRef.child('events').child('eclock').setPriority(190, function(error) {
                if (error) {
                    console.error(error);
                    process.exit(1);
                } else {
                    process.exit(0);
                }
            });
        }
    });
}

var main = function() {
    // イベントのデータを取得 (認証不要)
    contestRef.child('events').once('value', function(snap) {
        var Events = snap.exportVal();
        console.dir(Events);

        updateEvents();
    });
};

main();
