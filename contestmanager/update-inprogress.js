/**
 * update-inprogress.js
 */

var Twitter = require('twitter');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

var argv = require('argv');
argv.option([
    {
        name: 'tweet',
        short: 't',
        type: 'boolean',
        description: 'Tweet starting notice',
        example: "'update-inprogress.js --tweet' or 'update-inprogress.js -t'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);


// 対象のコンテスト
var targetContest;

// ツイートオプションがついていれば開始を告知する
var tweetNotice = function() {
    if (argvrun.options.tweet) {
        // ツイートテキスト
        // 例 "TORIBO Contest Week 2 (2016, 2H) started. https://contest.tribox.com/"
        var status = 'TORIBO Contest Week ' + targetContest.number + ' (' + targetContest.year + ', ' + targetContest.season + 'H) started.'
                   + ' https://contest.tribox.com/';

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
    } else {
        console.log('Skipped tweet!');
        process.exit(0);
    }
};

// 関数: inProgress を更新する
var update = function() {
    // コンテストデータを取得 (認証不要)
    contestRef.child('contests').once('value', function(snap) {
        var Contests = snap.val();
        //console.dir(Contests);

        // 現在のタイムスタンプ
        var d = new Date();
        var currentTimestamp = parseInt(d.getTime());
        console.log('currentTimestamp:', currentTimestamp);

        // 現在のコンテストを見つける
        var founds = [];
        Object.keys(Contests).forEach(function(contestId) {
            var contest = Contests[contestId];
            //console.log(contestId);
            //console.dir(contest);

            var beginAt = parseInt(contest['beginAt']);
            var endAt = parseInt(contest['endAt']);
            if (beginAt <= currentTimestamp && currentTimestamp <= endAt) {
                founds.push(contestId);
            }
        });

        // 現在のコンテストが見つからないか、複数見つかってしまう (ごくまれ)
        if (founds.length != 1) {
            console.error('Try again');
            process.exit(1);
        }

        // 現在時刻の開催コンテストが求まる
        console.log('cuurent contest:', founds[0]);
        targetContest = Contests[founds[0]];

        // 1個前のコンテストのタイムスタンプ
        var lastTimestamp = currentTimestamp - (7 * 24 * 60 * 60 * 1000);
        console.log('lastTimestamp:', lastTimestamp);

        // 1個前のコンテストを見つける
        var lastFounds = [];
        Object.keys(Contests).forEach(function(contestId) {
            var contest = Contests[contestId];
            //console.log(contestId);
            //console.dir(contest);

            var beginAt = parseInt(contest['beginAt']);
            var endAt = parseInt(contest['endAt']);
            if (beginAt <= lastTimestamp && lastTimestamp <= endAt) {
                lastFounds.push(contestId);
            }
        });

        // 1個前のコンテストが見つからないか、複数見つかってしまう (ごくまれ)
        if (lastFounds.length != 1) {
            console.error('Try again');
            process.exit(1);
        }

         // 現在時刻の開催コンテストが求まる
        console.log('last contest:', lastFounds[0]);

        // 書き込む (admin権限で)
                contestRef.child('inProgress').set({
                    'contest': founds[0],
                    'lastContest': lastFounds[0]
                }, function(error) {
                    if (error) {
                        console.err(err);
                        process.exit(1);
                    } else {
                        console.log('completed');
                        tweetNotice();
                    }
                });
    });
};
update();
