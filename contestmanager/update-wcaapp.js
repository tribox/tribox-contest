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
            var CountriesData = {};
            Countries.forEach(function(data) {
                CountriesData[data.id] = data;
            });
            var PersonsData = {};
            Persons.forEach(function(data) {
                PersonsData[data.id] = data;
            });

            wcaRef.set({
                'countries': CountriesData,
                'persons': PersonsData
            }, function(error) {
                if (error) {
                    console.error(error);
                    process.exit(1);
                } else {
                    console.log('Completed updating!');
                    process.exit(0);
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
