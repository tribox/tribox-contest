/**
 * update-wcaapp.js
 *
 * MySQL のデータを firebase (wcaapp) に移す。
 */

var async = require('async');
var mysql = require('mysql');

var Config = require('./config.js');

var wcaRef = require('./wcaref.js').ref;


var connection = mysql.createConnection({
    host: Config.MYSQL_WCA_HOST,
    user: Config.MYSQL_WCA_USER,
    password: Config.MYSQL_WCA_PASSWORD,
    database: Config.MYSQL_WCA_DATABASE
});
connection.connect();

var Countries = null;
var Persons = null;

// Persons と Countries をアップデート
var update = function() {
    // Countries
    var CountriesData = {};
    Countries.forEach(function(data) {
        CountriesData[data.id] = data;
    });

    // Persons はまとめて入れてしまうとデータサイズが大きすぎてエラーとなってしまうから適当に分割させる
    var PersonsData = [];
    var personIndex = 0;
    var batchIndex = -1;
    Persons.forEach(function(data) {
        if ((personIndex % 10000) == 0) {
            batchIndex++;
            PersonsData[batchIndex] = {};
        }
        PersonsData[batchIndex][data.id] = data;
        personIndex++;
    });
    console.log(personIndex + ' persons are divided into ' + (batchIndex + 1) + ' batches.');

    // Countries をセット
    wcaRef.child('countries').set(CountriesData, function(error) {
        if (error) {
            console.error(error);
            process.exit(1);
        } else {
            console.log('Completed setting countries!');

            // Persons をセット
            var batchNum = 1;
            async.eachSeries(PersonsData, function(batchPersonsData, next) {
                wcaRef.child('persons').update(batchPersonsData, function(error) {
                    if (error) {
                        console.error(error);
                        process.exit(1);
                    } else {
                        console.log('Completed updating persons... batch ' + batchNum);
                        batchNum++;
                        next();
                    }
                });

            }, function(err) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                } else {
                    console.log('Completed updating all persons!');
                    process.exit(0);
                }
            });

        }
    });

};

// Persons と Countries を取得
var fetch = function(callback) {
    connection.query('SET NAMES utf8mb4', function(error, results, fields) {
        connection.query('SELECT id, name, iso2 FROM Countries', function(error, results, fields) {
            if (error) {
                console.error(error);
                process.exit(1);
            } else {
                Countries = results;

                connection.query('SELECT id, name, countryId FROM Persons WHERE subid = 1', function(error, results, fields) {
                    if (error) {
                        console.error(error);
                        process.exit(1);
                    } else {
                        Persons = results;
                        callback();
                    }
                });
            }
        });
    });
};

var main = function() {
    fetch(update);
};
main();
