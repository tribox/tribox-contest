/**
 * append-points.js
 *
 * 毎週コンテストが終わるごとに実行する。
 * MySQL の lottery_log テーブルに存在する待ちレコードに対して、実際にストアポイントを追加する。
 */

var async = require('async');
var mysql = require('mysql');

var Config = require('./config.js');


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
    connection.query('SELECT id, customer_type, customer_id, point FROM lottery_log WHERE appended_at IS NULL', function(error, results, fields) {
        if (error) {
            console.error(error);
        } else {
            //console.dir(results);

            var count = 0;
            async.each(results, function(result, next) {
                // 加算処理
                if (result.customer_type == 0) { // store
                    console.log('UPDATE (id = ' + result.id + ')');
                    connectionStore.query('UPDATE dtb_customer SET point = point + ? WHERE customer_id = ?', [
                        result.point, result.customer_id
                    ], function(error, results, fields) {
                        if (error) {
                            console.error(error);
                            console.log('Failed updating point!');
                            process.exit(1);
                        } else {
                            console.log('Succeeded updating point!');
                            connection.query('UPDATE lottery_log SET appended_at = NOW() WHERE id = ?', [
                                result.id
                            ], function(error, results, fields) {
                                if (error) {
                                    console.error(error);
                                    process.exit(1);
                                } else {
                                    count++;
                                    next();
                                }
                            });
                        }
                    });
                } else {
                    // triboxstickers
                    console.error('Not implemented yet! (triboxstickers)');
                    process.exit(1);
                }
            }, function(err) {
                if (!err) {
                    console.log('Completed! (' + count + ' records)');
                    process.exit(0);
                } else {
                    console.error(err);
                }
            });
        }
    });
};

var main = function() {
    appendPoints();
};
main();
