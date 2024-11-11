import mysql.connector
import os

from flask import Flask, make_response, render_template, request


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
# TODO

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
    raise NotImplementedError()


########################################
# Setting: Setting / First setting
########################################
@app.route("/setting")
def setting():
    raise NotImplementedError()


@app.route("/setting/first")
def setting_first():
    raise NotImplementedError()


@app.route("/setting/email")
def setting_email():
    raise NotImplementedError()


@app.route("/setting/password")
def setting_password():
    raise NotImplementedError()


@app.route("/setting/username")
def setting_username():
    raise NotImplementedError()


@app.route("/setting/verify")
def setting_verify():
    raise NotImplementedError()


@app.route("/setting/unverify")
def setting_unverify():
    raise NotImplementedError()


########################################
# Demo timer
########################################
@app.route("/demo/timer")
def demo_timer():
    raise NotImplementedError()


########################################
# Dynamic JavaScripts
########################################
@app.route("/js/products.js")
def products_js():
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
