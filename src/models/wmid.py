"""
wm-id（tribox SELECT のアカウントの窓口。Cloud Run のサービス）とのやり取り。

連携のとき、メールアドレスの tribox SELECT の顧客がいれば、wm-id が番号（100,000,001〜）を返す。
その番号を triboxストアの会員番号と同じように verifying.customer_id に入れる。
ポイントを足すときは contestmanager/store-points.js が、1億より大きい番号を wm-id に送る。

環境変数: WM_ID_URL（例 https://wm-id-xxxx.asia-northeast1.run.app）、WM_ID_KEY（共有の鍵）
署名: X-Tribox-Timestamp（UNIX 秒）、X-Tribox-Signature = HMAC-SHA256(key, タイムスタンプ + "." + 本文) の16進
"""
import hashlib
import hmac
import http.client
import json
import os
import time
import urllib.error
import urllib.request
from typing import Optional


WM_ID_BASE = 100000001


class WmIdError(Exception):
    pass


def link(email: str) -> Optional[int]:
    """
    メールアドレスの tribox SELECT の顧客の番号。いなければ None。
    問い合わせに失敗したときは WmIdError。
    """
    base_url = os.environ.get("WM_ID_URL", "")
    key = os.environ.get("WM_ID_KEY", "")
    if not base_url.startswith("https://") or key == "":
        raise WmIdError("wm-id is not configured")

    body = json.dumps({"email": email}).encode("utf-8")
    ts = str(int(time.time()))
    sig = hmac.new(key.encode("utf-8"), ts.encode("utf-8") + b"." + body, hashlib.sha256).hexdigest()
    req = urllib.request.Request(
        base_url.rstrip("/") + "/id/contest/link",
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Tribox-Timestamp": ts,
            "X-Tribox-Signature": sig,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            out = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise WmIdError("wm-id link: " + str(e.code)) from e
    except (OSError, http.client.HTTPException, ValueError) as e:
        raise WmIdError("wm-id link: " + type(e).__name__) from e

    number = out.get("number") if isinstance(out, dict) else None
    if not isinstance(number, int) or isinstance(number, bool) or number < WM_ID_BASE:
        raise WmIdError("wm-id link: invalid number")
    return number
