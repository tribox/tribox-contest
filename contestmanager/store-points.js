/**
 * store-points.js
 *
 * ポイントの送り先（ストアの会員）とのやり取りをまとめる。
 *
 * - triboxストアの会員番号（〜1億）: これまでどおり、ストアの DB（dtb_customer）を読んで、ポイントを足す。
 * - tribox SELECT の番号（100,000,001〜）: wm-id に送る。wm-id が tribox SELECT のストアクレジットにする。
 *   番号は、連携のときに wm-id が配る（app/controllers/SettingController.scala の verify）。
 *
 * wm-id への送り方: POST {WM_ID_URL}/id/contest/{whois|award}
 *   ヘッダ X-Tribox-Timestamp（UNIX 秒）と X-Tribox-Signature（HMAC-SHA256(WM_ID_KEY, タイムスタンプ + "." + 本文) の16進）
 *   award は award_id ごとに1回しか足さないので、失敗したら同じ award_id で送り直してよい。
 */

var crypto = require('crypto');
var https = require('https');

var Config = require('./config.js');

var WM_ID_BASE = 100000001;

var isWmId = function(customerId) {
    return Number(customerId) >= WM_ID_BASE;
};

var callWmId = function(route, payload, callback) {
    var raw = JSON.stringify(payload);
    var ts = String(Math.floor(Date.now() / 1000));
    var sig = crypto.createHmac('sha256', Config.WM_ID_KEY).update(ts + '.' + raw).digest('hex');
    var url = new URL(Config.WM_ID_URL + '/id/contest/' + route);
    var req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(raw),
            'X-Tribox-Timestamp': ts,
            'X-Tribox-Signature': sig
        },
        timeout: 30000
    }, function(res) {
        var body = '';
        res.on('data', function(c) { body += c; });
        res.on('end', function() {
            var out = {};
            try { out = JSON.parse(body); } catch (e) {}
            if (res.statusCode !== 200) {
                return callback(new Error('wm-id ' + route + ': ' + res.statusCode + ' ' + body));
            }
            callback(null, out);
        });
    });
    req.on('timeout', function() { req.destroy(new Error('wm-id ' + route + ': timeout')); });
    req.on('error', function(e) { callback(e); });
    req.write(raw);
    req.end();
};

/**
 * 送り先の名前・メールアドレス・（ストアなら）いまのポイント
 * callback(error, { name, email, point })。tribox SELECT の人の point は null
 */
var getCustomer = function(connectionStore, customerId, callback) {
    if (isWmId(customerId)) {
        callWmId('whois', { number: Number(customerId) }, function(error, out) {
            if (error) return callback(error);
            callback(null, { name: (out.last_name + ' ' + out.first_name).trim(), email: out.email, point: null });
        });
        return;
    }
    connectionStore.query('SELECT name01, name02, email, point FROM dtb_customer WHERE customer_id = ?', [
        customerId
    ], function(error, results, fields) {
        if (error) return callback(error);
        if (!results.length) return callback(new Error('dtb_customer not found: ' + customerId));
        callback(null, { name: results[0].name01 + ' ' + results[0].name02, email: results[0].email, point: results[0].point });
    });
};

/**
 * ポイントを足す
 * awardId: 付与ごとに一意で、送り直しても変わらない文字列（例: 'lottery-' + lottery_log.id）
 * reason: 100文字まで（wm-id の記録に残す）
 */
var addPoint = function(connectionStore, customerId, point, awardId, reason, callback) {
    if (isWmId(customerId)) {
        callWmId('award', { award_id: awardId, number: Number(customerId), points: Number(point), reason: String(reason || '').slice(0, 100) }, function(error) {
            callback(error || null);
        });
        return;
    }
    connectionStore.query('UPDATE dtb_customer SET point = point + ? WHERE customer_id = ?', [
        point, customerId
    ], function(error) {
        callback(error || null);
    });
};

module.exports = {
    WM_ID_BASE: WM_ID_BASE,
    isWmId: isWmId,
    callWmId: callWmId,
    getCustomer: getCustomer,
    addPoint: addPoint
};
