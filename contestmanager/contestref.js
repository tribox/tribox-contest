/**
 * contestref.js
 *
 * Admin権限で全データベースのアクセス (読み出し・書き込み) 権限をもつ参照
 * `contestRef` を定義する。
 */

var Config = require('./config.js');

var admin = require("firebase-admin");
//admin.database.enableLogging(true);

var serviceAccount = require("./secret/serviceAccountKey.json");

admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://" + Config.CONTESTAPP + ".firebaseio.com"
});

var db = admin.database();
var contestRef = db.ref();
var contestAdmin = admin;

exports.ref = contestRef;
exports.admin = contestAdmin;
