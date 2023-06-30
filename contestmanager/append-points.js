/**
 * append-points.js
 *
 * 毎週コンテストが終わるごとに実行する。
 * MySQL の lottery_log テーブルに存在する待ちレコードに対して、実際にストアポイントを追加する。
 */

var async = require('async');
var mysql = require('mysql');
var exec = require('child_process').exec;

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

require('date-utils');
var fs = require('fs');

var Contests, Events;


var connection = mysql.createConnection({
    host: Config.MYSQL_HOST,
    user: Config.MYSQL_USER,
    password: Config.MYSQL_PASSWORD,
    database: Config.MYSQL_DATABASE
});
connection.connect();

var connectionStore = mysql.createConnection({
    host: Config.MYSQL_STORE_HOST,
    user: Config.MYSQL_STORE_USER,
    password: Config.MYSQL_STORE_PASSWORD,
    database: Config.MYSQL_STORE_DATABASE
});
connectionStore.connect();

// MySQL lottery_log テーブルの待ちレコードを対象にして、抽選ポイント加算
var appendPoints = function() {
    // ポイント加算履歴を検索して、未加算のものを対象とする。
    connection.query('SELECT id, contest_id, event_id, customer_type, customer_id, point, point_type FROM lottery_log WHERE appended_at IS NULL', function(error, results, fields) {
        if (error) {
            console.error(error);
            process.exit(1);
        }

        connectionStore.query('SET NAMES utf8', function() {
            var count = 0;
            var append_log = {};
            async.eachSeries(results, function(result, next) {
                var logging_key = result.contest_id + '-' + result.event_id + '-' + result.customer_id;
                append_log[logging_key] = {};
                // ポイント加算処理・メール送信
                if (result.customer_type == 0) { // store
                    connectionStore.query('SELECT name01, name02, email, point FROM dtb_customer WHERE customer_id = ?', [
                        result.customer_id
                    ], function(error, results, fields) {
                        if (error) {
                            console.error(error);
                            console.error('Failed getting email address!');
                            process.exit(1);
                        }

                        // ポイント加算顧客情報
                        var name = results[0].name01 + ' ' + results[0].name02;
                        var email = results[0].email;
                        console.log(email);

                        // 進呈前ポイント数 (参考値でログに残すだけ)
                        append_log[logging_key]['point_before'] = results[0].point;

                        console.log('UPDATE (id = ' + result.id + ')');
                        connectionStore.query('UPDATE dtb_customer SET point = point + ? WHERE customer_id = ?', [
                            result.point, result.customer_id
                        ], function(error, results, fields) {
                            if (error) {
                                console.error(error);
                                console.error('Failed updating point!');
                                process.exit(1);
                            }
                            console.log('Succeeded updating point!');
                            connection.query('UPDATE lottery_log SET appended_at = NOW() WHERE id = ?', [
                                result.id
                            ], function(error, results, fields) {
                                if (error) {
                                    console.error(error);
                                    process.exit(1);
                                }
                                count++;
                                // メール送信
                                var command = '/usr/bin/php ' + __dirname + '/send-pointemail.php'
                                            + ' "' + email + '"'
                                            + ' "' + name + '"'
                                            + ' "' + Contests[result.contest_id].contestName + '"'
                                            + ' "' + Events[result.event_id].name + '"'
                                            + ' ' + result.point + ' ' + result.point_type;
                                exec(command, function(err, stdout, stderr) {
                                    if (err) {
                                        console.error(err);
                                        process.exit(1);
                                    }
                                    //console.log(stdout);
                                    console.error(stderr);

                                    // ポイント進呈後のポイント数をログしておく (参考値)
                                    connectionStore.query('SELECT point FROM dtb_customer WHERE customer_id = ?', [
                                        result.customer_id
                                    ], function(error, results, fields) {
                                        if (error) {
                                            console.error(error);
                                            console.error('Failed getting point (after)!');
                                            process.exit(1);
                                        }
                                        append_log[logging_key]['point_after'] = results[0].point;
                                    });

                                    setTimeout(function() {
                                        next();
                                    }, 1000);
                                });
                            });
                        });
                    });
                } else {
                    // triboxstickers
                    console.error('Not implemented yet! (triboxstickers)');
                    process.exit(1);
                }
            }, function(err) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                console.log('Completed! (' + count + ' records)');
                console.dir(append_log, {depth: null});
                var filename = new Date().toFormat(Config.PATH_TO_APPENDLOGS + '/YYYYMMDD_HH24MISS.log');
                fs.writeFileSync(filename, JSON.stringify(append_log, null, 4));
                process.exit(0);
            });
        });
    });
};

var getContestInfo = function() {
    contestRef.child('contests').once('value', function(snapContests) {
        Contests = snapContests.val();
        contestRef.child('events').once('value', function(snapEvents) {
            Events = snapEvents.val();

            appendPoints();
        });
    });
};

var main = function() {
    getContestInfo();
};
main();
