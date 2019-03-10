/**
 * wcaref.js
 *
 * Admin権限で全データベースのアクセス (読み出し・書き込み) 権限をもつ参照
 * `wcaRef` を定義する。
 */

var Config = require('./config.js');

var admin = require("firebase-admin");
//admin.database.enableLogging(true);

var serviceAccount = require("./secret/wca/serviceAccountKey.json");

admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://" + Config.WCAAPP + ".firebaseio.com"
});

var db = admin.database();
var wcaRef = db.ref();

exports.ref = wcaRef;
