import json
import mysql.connector
import os
import re
import secrets
import subprocess
import time
import urllib.request

from flask import Flask, make_response, redirect, render_template, request, send_from_directory

from src.models.verifying import Verifying
from src.models.customer import Customer


app = Flask(
    __name__,
    static_folder="./public",
    static_url_path="/assets",
)

# Jinja2 の directive を以下のように変更する。
#   {{ ... }} ==> [[ ... ]]
#   {% ... %} ==> [% ... %]
#   {# ... #} ==> [# ... #]
# 理由は AngularJS のディレクティブとコンフリクトしてしまうため。
# https://www.subarunari.com/entry/2017/09/30/003944
jinja_options = app.jinja_options.copy()
jinja_options.update({
    "variable_start_string": "[[",
    "variable_end_string": "]]",
    "block_start_string": "[%",
    "block_end_string": "%]",
    "comment_start_string": "[#",
    "comment_end_string": "#]",
})
app.jinja_options = jinja_options


# 定数 from 環境変数
SITE_NAME = "tribox Contest"
CONTEST_NAME = os.environ.get("CONTEST_NAME", default="tribox Contest")
CONTEST_DESCRIPTION = os.environ.get("CONTEST_DESCRIPTION", default="Welcome to tribox Contest!")
CONTEST_URL = os.environ.get("CONTEST_URL", default="https://contest.tribox.com/")
CONTEST_PATH = os.environ.get("CONTEST_PATH", default="/path/to/app")
FIREBASEAPP_CONTEST = os.environ.get("FIREBASEAPP_CONTEST", default="")
FIREBASEAPP_CONTEST_APIKEY = os.environ.get("FIREBASEAPP_CONTEST_APIKEY", default="")
FIREBASEAPP_CONTEST_SENDERID = os.environ.get("FIREBASEAPP_CONTEST_SENDERID", default="")
FIREBASEAPP_WCA = os.environ.get("FIREBASEAPP_WCA", default="")
FIREBASEAPP_WCA_APIKEY = os.environ.get("FIREBASEAPP_WCA_APIKEY", default="")
FIREBASEAPP_WCA_SENDERID = os.environ.get("FIREBASEAPP_WCA_SENDERID", default="")
ADMIN_API_TOKEN = os.environ.get("ADMIN_API_TOKEN", default="")
GOOGLE_VERIFICATION = os.environ.get("GOOGLE_VERIFICATION", default="")


########################################
# MySQL接続設定
########################################

# contest
def get_contest_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("MYSQL_HOST"),
        user=os.environ.get("MYSQL_USER"),
        password=os.environ.get("MYSQL_PASSWORD"),
        database=os.environ.get("MYSQL_DATABASE"),
    )

# store
def get_store_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("MYSQL_STORE_HOST"),
        user=os.environ.get("MYSQL_STORE_USER"),
        password=os.environ.get("MYSQL_STORE_PASSWORD"),
        database=os.environ.get("MYSQL_STORE_DATABASE"),
    )


########################################
# Home
########################################
@app.route("/")
def index():
    event = request.args.get("e", default="")
    return render_template(
        "index.html",
        contest_name=CONTEST_NAME,
        contest_description=CONTEST_DESCRIPTION,
        contest_url=CONTEST_URL,
        page_url=request.url,
        event=event,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        google_verification=GOOGLE_VERIFICATION,
    )


########################################
# About / Regulations
########################################
@app.route("/about")
def about():
    return render_template(
        "about.html",
        contest_name=CONTEST_NAME,
        contest_description=CONTEST_DESCRIPTION,
        contest_url=CONTEST_URL,
        page_url=request.url,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
    )


@app.route("/regulations")
def regulations():
    return render_template(
        "regulations.html",
        contest_name=CONTEST_NAME,
        contest_description=CONTEST_DESCRIPTION,
        contest_url=CONTEST_URL,
        page_url=request.url,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
    )

# ロード完了前のヘッダーメニューが指す /contest/default, /ranking/default の
# リダイレクト先 (最新コンテストと現在のシーズン) を Firebase REST から取得する。
_default_ids_cache = {"expiresAt": 0.0, "lastContest": "", "sid": ""}

def get_default_redirect_ids():
    now = time.time()
    if now < _default_ids_cache["expiresAt"]:
        return _default_ids_cache
    base_url = "https://" + FIREBASEAPP_CONTEST + ".firebaseio.com"
    with urllib.request.urlopen(base_url + "/inProgress.json", timeout=3) as res:
        in_progress = json.load(res)
    with urllib.request.urlopen(
        base_url + "/contests/" + in_progress["contest"] + ".json", timeout=3
    ) as res:
        contest = json.load(res)
    _default_ids_cache["lastContest"] = in_progress["lastContest"][1:]
    # 第1節の間は現シーズンのランキングが空なので直前のシーズンを指す
    year = int(contest["year"])
    season = int(contest["season"])
    number = int(in_progress["contest"][6:])
    if number == 1:
        sid = f"{year}1" if season == 2 else f"{year - 1}2"
    else:
        sid = f"{year}{season}"
    _default_ids_cache["sid"] = sid
    _default_ids_cache["expiresAt"] = now + 60
    return _default_ids_cache

@app.route("/contest/default")
def contestdefault():
    try:
        return redirect("/contest/" + get_default_redirect_ids()["lastContest"])
    except Exception:
        return contest("default")

@app.route("/contest/<cid>")
def contest(cid):
    return render_template(
        "contest.html",
        cid=cid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/contest/<cid>/<eid>")
def contestchoose(cid, eid):
    return render_template(
        "contestchoose.html",
        cid=cid,
        eid=eid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/contest/<cid>/<eid>/form")
def contestform(cid, eid):
    return render_template(
        "contestform.html",
        cid=cid,
        eid=eid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/contest/<cid>/<eid>/timer")
def contesttimer(cid, eid):
    return render_template(
        "contesttimer.html",
        cid=cid,
        eid=eid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

CONFIRM_EVENT_CATEGORY = {
    "222": 101,
    "333": 103,
    "333bf": 103,
    "333oh": 103,
    "333fm": 103,
    "444": 107,
    "555": 108,
    "666": 525,
    "777": 524,
    "minx": 526,
    "pyram": 527,
    "skewb": 528,
    "sq1": 113,
    "clock": 544,
}

CONFIRM_CUBES_SQL = """
    SELECT `product_id`, `name`, `category_id`, `parent_category_id` FROM (
      SELECT `product_id`, `name`, C1.`category_id` as category_id, C1.`category_name` as category_name, C2.`category_id` as parent_category_id, C2.`category_name` as parent_category_name, `main_image`, EXPT.`except_store` AS except_flg
       FROM (
        SELECT P.`product_id`, `category_id`, `name`, `main_image`
        FROM `dtb_product_categories` PC
        INNER JOIN (
          SELECT `product_id`, `name`, `main_image`
          FROM `dtb_products`
          WHERE (`status` = 1 OR (`status` = 2 AND `maker_id` = 39)) AND `del_flg` = 0
        ) P
        ON PC.`product_id` = P.`product_id`
      ) PPC
      LEFT OUTER JOIN
      `dtb_category` C1
      ON PPC.`category_id` = C1.`category_id`
      LEFT OUTER JOIN
      `dtb_category` C2
      ON C1.`parent_category_id` = C2.`category_id`
      LEFT OUTER JOIN
      `stickers_puzzles_except` EXPT
      ON PPC.`product_id` = EXPT.`puzzle_id`
    ) PAC
    WHERE PAC.`parent_category_id` IN (1, 3) AND (`except_flg` IS NULL OR `except_flg` = 0) AND `category_id` NOT IN (421, 428)
    ORDER BY `name` ASC
"""

CONFIRM_BRANDS_SQL = """
    SELECT `category_id`, `category_name`
    FROM `dtb_category`
    WHERE `parent_category_id` = 3
    ORDER BY `category_name` ASC
"""

def build_confirm_puzzles(cube_rows, brand_rows, eid):
    """カテゴリ・ブランドの行を商品ごとにまとめ、種目に対応するキューブをブランド別に分類する"""
    puzzles = []

    def flush(product_id, name, category_id, brand_id):
        if category_id == -1:
            return
        if category_id in (104, 105):
            category_id = 103
        if brand_id == -1:
            brand_id = 475
        puzzles.append({"productId": product_id, "name": name, "categoryId": category_id, "brandId": brand_id})

    prev_id = -1
    name = ""
    category_id = -1
    brand_id = -1
    for row_product_id, row_name, row_category_id, row_parent_category_id in cube_rows:
        if prev_id != -1 and prev_id != row_product_id:
            flush(prev_id, name, category_id, brand_id)
            category_id = -1
            brand_id = -1
        if row_parent_category_id == 1:
            category_id = row_category_id
        elif row_parent_category_id == 3:
            brand_id = row_category_id
        name = row_name
        prev_id = row_product_id
    if prev_id != -1:
        flush(prev_id, name, category_id, brand_id)

    target_category = CONFIRM_EVENT_CATEGORY.get(eid, 103)
    brands_puzzles = {}
    for puzzle in puzzles:
        if puzzle["categoryId"] == target_category:
            brands_puzzles.setdefault(puzzle["brandId"], []).append(puzzle)

    puzzle_brands = [
        {"category_id": category_id, "category_name": category_name}
        for category_id, category_name in brand_rows
    ]
    return brands_puzzles, puzzle_brands

def get_confirm_puzzles(eid):
    """参加確認ページの使用キューブ選択肢を Store DB から取得して返す"""
    with get_store_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(CONFIRM_CUBES_SQL)
            cube_rows = cursor.fetchall()
            cursor.execute(CONFIRM_BRANDS_SQL)
            brand_rows = cursor.fetchall()
    return build_confirm_puzzles(cube_rows, brand_rows, eid)

@app.route("/contest/<cid>/<eid>/confirm")
def contestconfirm(cid, eid):
    brands_puzzles, puzzle_brands = get_confirm_puzzles(eid)
    return render_template(
        "contestconfirm.html",
        brandsPuzzles=brands_puzzles,
        puzzleBrands=puzzle_brands,
        cid=cid,
        eid=eid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/contest/<cid>/<eid>/solution")
def contestsolution(cid, eid):
    return render_template(
        "contestsolution.html",
        cid=cid,
        eid=eid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/contest/result/<cid>/<eid>")
def contestresult(cid, eid):
    return render_template(
        "contestresult.html",
        cid=cid,
        eid=eid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/ranking/<sid>")
def ranking(sid):
    return render_template(
        "ranking.html",
        sid=sid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/ranking/<sid>/puzzle")
def rankingpuzzle(sid):
    return render_template(
        "rankingpuzzle.html",
        sid=sid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/ranking/<sid>/puzzle/all")
def rankingpuzzleall(sid):
    return render_template(
        "rankingpuzzleall.html",
        sid=sid,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/ranking/default")
def rankingdefault():
    try:
        return redirect("/ranking/" + get_default_redirect_ids()["sid"])
    except Exception:
        pass
    return render_template(
        "rankingdefault.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/ranking/default/puzzle")
def rankingpuzzledefault():
    try:
        return redirect("/ranking/" + get_default_redirect_ids()["sid"] + "/puzzle")
    except Exception:
        pass
    return render_template(
        "rankingpuzzledefault.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

########################################
# Release Notes
########################################
@app.route("/release-notes/christmas-2018")
def release_notes_christmas_2018():
    raise NotImplementedError()


########################################
# Auth: Join / Login / Logout / Forgot password / My page / Change email & password
########################################
@app.route("/join")
def join():
    return render_template(
        "join.html",
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/login")
def login():
    return render_template(
        "login.html",
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/logout")
def logout():
    return render_template(
        "logout.html",
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/user/<id>")
def user(id):
    return render_template(
        "user.html",
        id=id,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )

@app.route("/forgot")
def forgot():
    return render_template(
        "forgot.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


########################################
# Helper functions for verification
########################################

def gen_token() -> str:
    """32文字のランダムな英数字トークンを生成"""
    # SecureRandom().alphanumeric.take(32).mkString に相当
    # 32文字の英数字を生成
    return ''.join(secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') for _ in range(32))


def send_email(email: str, token: str):
    """メール送信（PHPスクリプトを呼び出し）"""
    # メールアドレスの正規表現チェック
    email_pattern = r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
    if re.match(email_pattern, email):
        php_script = os.path.join(CONTEST_PATH, "contestmanager", "send-verifyingemail.php")
        subprocess.Popen(
            ["/usr/bin/php", php_script, email, token, CONTEST_URL],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


########################################
# Setting: Setting / First setting
########################################
@app.route("/setting")
def setting():
    return render_template(
        "setting.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )



@app.route("/setting/first")
def setting_first():
    return render_template(
        "settingfirst.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/setting/email")
def setting_email():
    return render_template(
        "settingemail.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/setting/password")
def setting_password():
    return render_template(
        "settingpassword.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/setting/username")
def setting_username():
    return render_template(
        "settingusername.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )


@app.route("/setting/verify", methods=["GET", "POST"])
def setting_verify():
    message = ""
    error_message = ""

    if request.method == "POST":
        email = request.form.get("email", "")
        user_id = request.form.get("userId", "")

        if (email != "") and (user_id != ""):
            # contest DB接続
            with get_contest_db_connection() as contest_conn:
                # 既に認証済みかチェック
                verifying_user_id = Verifying.get_ones_by_user_id(contest_conn, user_id)
                if verifying_user_id:
                    error_message = "このコンテストアカウントはすでに認証済みです。"
                else:
                    # store DB接続
                    with get_store_db_connection() as store_conn:
                        # メールアドレスがストアに存在するかチェック
                        customers = Customer.get_ones_by_email(store_conn, email)
                        if customers:
                            # 入力されたメールアドレスがストアに存在
                            customer_id = customers[0].customer_id

                            # そのメールアドレスが他のアカウントに結びつけられていないかチェック
                            verifying_customer_id = Verifying.get_ones_by_customer_id(contest_conn, customer_id)
                            if verifying_customer_id:
                                error_message = "このストアアカウントはすでに他のコンテストアカウントに結びつけられています。"
                            else:
                                # トークンを生成してメール送信
                                token = gen_token()
                                send_email(email, token)
                                Verifying.insert_verifying(contest_conn, token, user_id, customer_id)
                                message = email + " 宛にメールを送信しました。メール内に書かれているリンクをクリックして認証を完了させてください。しばらく経ってもメールが届かない場合はお問い合わせください。"
                        else:
                            # ストアにメールアドレスが存在しない場合
                            error_message = email + " は存在しないアカウントです。"

    return render_template(
        "verify.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
        message=message,
        errorMessage=error_message,
    )


@app.route("/setting/verify/<token>")
def setting_verifyclick(token: str):
    """メール記載のURLにアクセスすることにより、認証トークンで認証を完了するエンドポイント"""
    message = ""
    error_message = ""
    user_id = ""
    customer_id = -1

    # トークンが32文字の英数字かチェック
    if not re.match(r'^[a-zA-Z0-9]{32}$', token):
        error_message = "無効なURLです。"
    else:
        with get_contest_db_connection() as contest_conn:
            status = Verifying.get_ones_by_token(contest_conn, token)

            if not status:
                error_message = "無効なURLです。"
            else:
                verify_record = status[0]
                record_id = verify_record.id
                user_id = verify_record.user_id
                customer_id = verify_record.customer_id

                Verifying.mark_verify(contest_conn, record_id)
                message = "認証が完了しました。"

    return render_template(
        "verifyclick.html",
        userId=user_id,
        customerId=customer_id,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
        message=message,
        errorMessage=error_message,
    )


@app.route("/setting/unverify", methods=["GET", "POST"])
def setting_unverify():
    user_id = ""
    customer_id = -1

    if request.method == "POST":
        user_id = request.form.get("userId", "")
        customer_id_str = request.form.get("customerId", "-1")
        try:
            customer_id = int(customer_id_str)
        except ValueError:
            customer_id = -1

        if (user_id != "") and (customer_id != -1):
            with get_contest_db_connection() as contest_conn:
                Verifying.mark_unverify(contest_conn, user_id, customer_id)

    return render_template(
        "unverify.html",
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
        userId=user_id,
        customerId=customer_id,
    )



########################################
# Demo timer
########################################
@app.route("/demo/timer")
def demo_timer():
    return render_template(
        "contesttimerdemo.html",
        id=id,
        contest_description=CONTEST_DESCRIPTION,
        contest_name=CONTEST_NAME,
        contest_url=CONTEST_URL,
        firebaseapp_contest=FIREBASEAPP_CONTEST,
        firebaseapp_contest_apikey=FIREBASEAPP_CONTEST_APIKEY,
        firebaseapp_contest_senderid=FIREBASEAPP_CONTEST_SENDERID,
        firebaseapp_wca=FIREBASEAPP_WCA,
        firebaseapp_wca_apikey=FIREBASEAPP_WCA_APIKEY,
        firebaseapp_wca_senderid=FIREBASEAPP_WCA_SENDERID,
    )



########################################
# Dynamic JavaScripts
########################################
@app.route("/js/products.js")
def products_js():
    # ローカル開発などで Store DB に接続できない場合は、静的ファイルにフォールバックする。
    # src/javascripts/products.js を配置しておくとそれを配信する (gitignore 対象)。
    if not os.environ.get("MYSQL_STORE_HOST"):
        return send_from_directory(
            os.path.join(app.root_path, "javascripts"), "products.js"
        )

    # Store DB から商品情報を取得
    # TODO: これはとりあえずの実装なのでDBへのコネクションはコネクションプールを使うなどしたい
    with get_store_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT `product_id`, `name`" \
                " FROM `dtb_products`" \
                " WHERE `del_flg` != 1" \
                " ORDER BY `product_id` ASC"
            )
            products = cursor.fetchall()

    # 動的javascriptのテンプレート読み込み
    rendered_js = render_template("javascripts/products.js", products=products)

    # Content-Typeを "application/javascript" としてレスポンス作成＆返却
    # Cache-Controlヘッダ: 1時間のキャッシュを許可
    response = make_response(rendered_js)
    response.headers["Content-Type"] = "application/javascript; charset=utf-8"
    response.headers["Cache-Control"] = "public, max-age=3600"

    return response


########################################
# SSL auth file
########################################
@app.route("/.well-known/pki-validation/fileauth.txt")
def fileauth():
    return app.send_static_file("fileauth.txt")


if __name__ == "__main__":
    app.run()
