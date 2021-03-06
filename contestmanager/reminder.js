/**
 * reminder.js
 *
 * 土曜日21時に実行されて、リマインドツイートする。
 */

var Twitter = require('twitter');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

// 対象のコンテスト
var targetContest;

// ツイートオプションがついていれば開始を告知する
var reminder = function() {
    contestRef.child('inProgress').child('contest').once('value', function(snapInProgressContest) {
        var contestId = snapInProgressContest.val();
    contestRef.child('contests').child(contestId).once('value', function(snapContest) {
        var contest = snapContest.val();

        // ツイートテキスト
        // 例 "TORIBO Contest Week1 (2016, 2H) closes tomorrow! The deadline is Sunday 21:00 (GMT+9). https://contest.tribox.com/"
        var status = 'TORIBO Contest Week ' + contest.number + ' (' + contest.year + ', ' + contest.season + 'H) closes tomorrow! '
                   + 'The deadline is Sunday 21:00 (GMT+9). https://contest.tribox.com/';

        var client = new Twitter({
            consumer_key: Config.CONSUMER_KEY,
            consumer_secret: Config.CONSUMER_SECRET,
            access_token_key: Config.ACCESS_TOKEN,
            access_token_secret: Config.ACCESS_TOKEN_SECRET
        });
        client.post('statuses/update', {status: status}, function(error, tweet, response) {
            if (!error) {
                console.log(tweet);
                process.exit(0);
            } else {
                console.error(error);
                process.exit(1);
            }
        });

    });
    });
};
reminder();
