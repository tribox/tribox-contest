package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

import scala.util.Random
import java.security.SecureRandom

import java.io.File
import scala.sys.process._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's setting pages.
 */
@Singleton
class SettingController @Inject() extends HomeController {

    /**
     * Setting: Setting / First setting / Other settings
     */
    def setting = Action {
        Ok(views.html.setting(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def settingfirst = Action {
        Ok(views.html.settingfirst(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def settingemail = Action {
        Ok(views.html.settingemail(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def settingpassword = Action {
        Ok(views.html.settingpassword(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def settingusername = Action {
        Ok(views.html.settingusername(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    // トークンを生成
    def genToken: String = {
        return new Random(new SecureRandom()).alphanumeric.take(32).mkString
    }

    // メール送信
    def sendEmail(email: String, token: String) = {
        // Play mailer pluging が謎で、実行できないので、
        // PHP を外部コマンドで呼び出してメール送信する。
        // email はストアの顧客DBに存在するもの、token と domain はユーザ入力に依存しないものなので、
        // インジェクション攻撃は無いと思うが、一応正規表現で厳密ではないけどチェックする。
        // http://qiita.com/sakuro/items/1eaa307609ceaaf51123
        if (email.matches("""^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$""")) {
            Process("/usr/bin/php " + getPlayAppPath + "/contestmanager/send-verifyingemail.php " + email + " " + token + " " + getContestUrl) run
        }
    }

    def verify = Action { request =>
        var message = ""
        var errorMessage = ""

        val email = {
            request.body.asFormUrlEncoded match {
                case Some(_) => request.body.asFormUrlEncoded.get("email")(0)
                case None    => ""
            }
        }
        val userId = {
            request.body.asFormUrlEncoded match {
                case Some(_) => request.body.asFormUrlEncoded.get("userId")(0)
                case None    => ""
            }
        }

        if (email != "" && userId != "") {
            //println("contest: userId=" + userId)
            val verifyingUserId = Verifying.getOnesByUserId(userId)
            if (!(verifyingUserId.isEmpty)) {
                errorMessage = "このアカウントはすでに認証済みです。"
            } else {
                val customers = Customer.getOnesByEmail(email)
                if (!(customers.isEmpty)) {
                    // 入力されたメールアドレスがストアに存在
                    val customerId = customers.head.customer_id
                    //println("store: customerId="+ customerId + " email=" + email)

                    val verifyingCustomerId = Verifying.getOnesByCustomerId(customerId)
                    if (!(verifyingCustomerId.isEmpty)) {
                        errorMessage = "このストアアカウントはすでに他のアカウントに結びつけられています。"
                    } else {
                        val token = genToken
                        sendEmail(email, token)
                        Verifying.insertVerifying(token, userId, customerId)
                        message = email + " 宛にメールを送信しました。メール内に書かれているリンクをクリックして認証を完了させてください。しばらく経ってもメールが届かない場合はお問い合わせください。"
                    }
                } else {
                    // ストアにメールアドレスが存在しない場合
                    errorMessage = email + " は存在しないアカウントです。"
                }
            }
        }

        Ok(views.html.verify(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, message, errorMessage))
    }

    def unverify = Action { request =>
        val userId = {
            request.body.asFormUrlEncoded match {
                case Some(_) => request.body.asFormUrlEncoded.get("userId")(0)
                case None    => ""
            }
        }
        val customerId = {
            request.body.asFormUrlEncoded match {
                case Some(_) => request.body.asFormUrlEncoded.get("customerId")(0).toInt
                case None    => -1
            }
        }
        Verifying.makeUnverify(userId, customerId)

        Ok(views.html.unverify(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, userId, customerId))
    }

    def verifyclick(token: String) = Action {
        val status = Verifying.getOnesByToken(token)
        //println(status)

        var message = ""
        var errorMessage = ""
        var userId = ""
        var customerId = -1

        if (status.isEmpty) {
            errorMessage = "無効なURLです。"
        } else {
            val id = status.head.id
            userId = status.head.user_id
            customerId = status.head.customer_id
            //println(id)
            Verifying.makeVerify(id)
            message = "認証が完了しました。"
        }

        Ok(views.html.verifyclick(userId, customerId, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, message, errorMessage))
    }

}
