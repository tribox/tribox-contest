import mysql.connector
import os
import re
import secrets
import subprocess

from flask import Flask, make_response, render_template, request, send_from_directory

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

@app.route("/contest/<cid>/<eid>/confirm")
def contestconfirm(cid, eid):
    return render_template(
        "contestconfirm.html",
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
