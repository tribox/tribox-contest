/**
 * force-verify.js
 *
 * 認証メール内のリンクはクリックしたけど、ストアアカウントとひも付けされていないユーザを強制的にひも付ける。
 * Cronで定期実行されるスクリプト。
 */

var async = require('async');
var mysql = require('mysql');

var Config = require('./config.js');

var contestRef = require('./contestref.js').ref;

var connection = mysql.createConnection({
    host: Config.MYSQL_HOST,
    user: Config.MYSQL_USER,
    password: Config.MYSQL_PASSWORD,
    database: Config.MYSQL_DATABASE
});
connection.connect();


var main = function() {
    var UsersClicked = [];
    connection.query('SELECT * FROM verifying WHERE created_at IS NOT NULL AND verified_at IS NOT NULL AND unverified_at IS NULL', function(error, results, fields) {
        if (error) {
            console.error(error);
        } else {
            //console.dir(results);

            // クリック済みのユーザリスト
            results.forEach(function(r) {
                UsersClicked.push({
                    'user_id': r.user_id,
                    'customer_type': r.customer_type,
                    'customer_id': r.customer_id
                });
            });
            //console.dir(UsersClicked);

            contestRef.child('users').once('value', function(snapUsers) {
                var Users = snapUsers.val();
            contestRef.child('usersecrets').once('value', function(snapUsersecrets) {
                var Usersecrets = snapUsersecrets.val();
                
                async.each(UsersClicked, function(u, next) {
                    if (!(Users[u.user_id].isTriboxCustomer)) {
                        console.log('Force verify!');
                        console.dir(u);

                        contestRef.child('users').child(u.user_id).update({
                            'isTriboxCustomer': true
                        }, function(error) {
                            if (error) {
                                console.error(error);
                            } else {
                                contestRef.child('usersecrets').child(u.user_id).update({
                                    'triboxStoreCustomerId': u.customer_id
                                }, function(error) {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        next();
                                    }
                                });
                            }
                        });
                    } else {
                        console.log('skip: ' + u.user_id);
                        next();
                    }

                }, function(err) {
                    if (!err) {
                        process.exit(0);
                    } else {
                        console.error(err);
                        process.exit(1);
                    }
                });

            });
            });
        }
    });
};
main();
