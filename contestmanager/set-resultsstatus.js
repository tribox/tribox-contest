/**
 * set-resultsstatus.js
 *
 * 全コンテストに結果公開ステータスをセットする。
 */

var async = require('async');

var contestRef = require('./contestref.js').ref;

var setResultsStatus = function() {
    contestRef.child('contests').once('value', function(snapContests) {
        var contests = snapContests.val();

        async.each(Object.keys(contests), function(contestId, next) {
            //console.log(contestId);
            contestRef.child('contests').child(contestId).child('resultsStatus').set('public', function(error) {
                if (error) {
                    console.error(error);
                } else {
                    console.log(contestId + ' set.');
                    next();
                }
            });
        }, function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log('Completed!');
                process.exit(0);
            }
        });

    });
};
setResultsStatus();
