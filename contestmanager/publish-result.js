/**
 * publish-result.js
 *
 * 結果ページを公開ステータスに変更する
 */

var contestRef = require('./contestref.js').ref;

var argv = require('argv');
argv.option([
    {
        name: 'contest',
        type: 'string',
        description: 'Target contest',
        example: "'publish-result.js --contest=2018101'"
    },
    {
        name: 'unpublish',
        type: 'boolean',
        description: 'Unpublish the result page instead of publishing (default)',
        example: "'publish-result.js --unpublish'"
    },
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象コンテスト (c2016xxx)
var targetContest;


// 結果ページを公開する
var publishResult = function() {
    resultsStatusVal = "public";
    if (argvrun.options.unpublish) {
        resultsStatusVal = "review";
    }

    contestRef.child('contests').child(targetContest).child('resultsStatus').set(resultsStatusVal, function(error) {
        if (error) {
            console.error(error);
        } else {
            console.log('Success ' + targetContest + ' resultsStatus to ' + resultsStatusVal);
            process.exit(0);
        }
    });
};


// 存在するコンテストか調べる
var checkExists = function() {
    contestRef.child('contests').child(targetContest).once('value', function(snap) {
        if (snap.exists()) {
            publishResult();
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
