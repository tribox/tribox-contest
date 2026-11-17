"""
wm-id（tribox SELECT のアカウントの窓口。Cloud Run のサービス）とのやり取り

連携のとき、メールアドレスの tribox SELECT の顧客がいれば、wm-id が番号（100,000,001〜）を返す。
その番号を triboxストアの会員番号と同じように verifying.customer_id に入れる。
ポイントを足すときは contestmanager/store-points.js が、1億以上の番号を wm-id に送る。

環境変数: WM_ID_URL（例 https://wm-id-xxxx.a.run.app）、WM_ID_KEY（共有の鍵）
署名: X-Tribox-Timestamp（UNIX 秒）、X-Tribox-Signature = HMAC-SHA256(鍵, タイムスタンプ + "." + 本文) の16進
"""
import hashlib
import hmac
import json
import os
import time
import urllib.error
import urllib.request

WM_ID_BASE = 100000001


class WmIdError(Exception):
    """問い合わせに失敗した（見つからなかったのとは別）"""


def link(email: str):
    """メールアドレスの tribox SELECT の顧客の番号。いなければ None。問い合わせに失敗したら WmIdError"""
    base_url = os.environ.get("WM_ID_URL", "")
    key = os.environ.get("WM_ID_KEY", "")
    if not base_url or not key:
        raise WmIdError("WM_ID_URL / WM_ID_KEY is not configured")
    body = json.dumps({"email": email}).encode("utf-8")
    ts = str(int(time.time()))
    sig = hmac.new(key.encode("utf-8"), ts.encode("utf-8") + b"." + body, hashlib.sha256).hexdigest()
    req = urllib.request.Request(
        base_url.rstrip("/") + "/id/contest/link",
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "X-Tribox-Timestamp": ts, "X-Tribox-Signature": sig},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            out = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise WmIdError("wm-id link: %d" % e.code)
    except Exception as e:
        raise WmIdError("wm-id link: %s" % e)
    number = out.get("number")
    if not isinstance(number, int) or number < WM_ID_BASE:
        raise WmIdError("wm-id link: no number")
    return number
