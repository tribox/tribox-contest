/**
 * generate-fmcimages.js
 *
 * 指定シーズンのFMC画像を生成して public/333fm/ のディレクトリに保存する。
 */

var async = require('async');
var fs = require('fs');
var generate = require('nanoid/generate');
var request = require('request');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

var argv = require('argv');
argv.option([
    {
        name: 'season',
        short: 's',
        type: 'string',
        description: 'Target season',
        example: "'tabulate-winners.js --season=20161' or 'tabulate-winners.js -s 20161'"
    }
]);
var argvrun = argv.run();
console.log(argvrun);

// 対象シーズン (20161)
var targetSeason, targetSeasonObj;
// ユーザテーブル、ユーザシークレットテーブル
var Users, Usersecrets;


// 指定シーズンのFMCスクランブルを取得する
var getScrambles = function() {
    contestRef.child('scrambles').once('value', function(snapScrambles) {
        var Scrambles = snapScrambles.val();

        // 各スクランブルの画像をTnoodleで生成して保存
        //
        // 例えば
        // ```
        // R' U' F U2 F2 L2 F2 D' F2 D2 B2 D F' D' L' R2 F D2 B L2 F2 U R' U' F
        // ```
        // というスクランブルの展開図の画像は
        // ```
        // http://localhost:2014/view/333.png?scramble=R%27%20U%27%20F%20U2%20F2%20L2%20F2%20D%27%20F2%20D2%20B2%20D%20F%27%20D%27%20L%27%20R2%20F%20D2%20B%20L2%20F2%20U%20R%27%20U%27%20F
        // ```
        // で得られる。
        var countContests = 0;
        Object.keys(Scrambles).forEach(function(contestId) {
            if (contestId.slice(1, 6) == targetSeason) {
                var scramble = Scrambles[contestId]['e333fm'][0];
                var scrambleEscaped = scramble.replace(/'/g, '%27').replace(/ /g, '%20');
                var scrambleId = generate('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 21);
                var savePath = Config.PATH_TO_CONTEST + '/public/333fm/' + scrambleId + '.png';

                // TNoodle でスクランブル画像を生成して取得
                var url = 'http://localhost:2014/view/333.png?scramble=' + scrambleEscaped;
                var options = {
                    'url': url,
                    'method': 'GET',
                    'headers': { 'Content-Type': 'image/png' },
                    'encoding': null
                };
                request(options, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        fs.writeFileSync(savePath, body, 'binary');
                    } else {
                        console.error(error);
                        process.exit(1);
                    }
                });

                console.log(contestId);
                console.log(scramble);
                console.log(scrambleEscaped);
                console.log(scrambleId);
                console.log(savePath);

                // スクランブル画像のパスを保存
                contestRef.child('scramblesimg').child(contestId).child('e333fm').set([scrambleId]);

                countContests++;
            }
        });
        console.log(countContests + ' contests in the target season.');

        // 画像の取得とFirebaseへの書き込みが非同期に実行されるので待つ (時間ないので無理やり実装)
        setTimeout(function() {
            process.exit(0);
        }, 30000);

    });
};

// 存在するシーズンか調べる
var checkExists = function() {
    // コンテストから検索 (認証不要)
    contestRef.child('contests').child('c' + targetSeason + '01').once('value', function(snap) {
        if (snap.exists()) {
            getScrambles();
        } else {
            console.error('Season does not exist');
            process.exit(1);
        }
    });
};

var main = function() {
    if (argvrun.options.season) {
        targetSeason = argvrun.options.season;
        checkExists();
    } else {
        console.error('Specify season!');
        process.exit(1);
    }
};
main();
