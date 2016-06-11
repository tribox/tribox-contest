package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

import scala.util.Random
import java.security.SecureRandom

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
        Ok(views.html.setting(getContestName, getContestUrl, getFirebaseappContest))
    }

    def settingfirst = Action {
        Ok(views.html.settingfirst(getContestName, getContestUrl, getFirebaseappContest))
    }

    def settingemail = Action {
        Ok(views.html.settingemail(getContestName, getContestUrl, getFirebaseappContest))
    }

    def settingpassword = Action {
        Ok(views.html.settingpassword(getContestName, getContestUrl, getFirebaseappContest))
    }

    // トークンを生成
    def genToken: String = {
        //val e = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890"
        //var res = ""
        //for (i <- 0 until 32) {
        //    Random.nextInt(62)
        //}
        return new Random(new SecureRandom()).alphanumeric.take(32).mkString
    }

    def verify = Action { request =>
        //val body = request.body
        //println(body)

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
                        errorMessage = "このアカウントはすでに認証済みです。"
                    } else {
                        val token = genToken
                        Verifying.insertVerifying(token, userId, customerId)
                        message = email + " 宛にメールを送信しました。メール内に書かれているリンクをクリックして認証を完了させてください。"
                    }
                } else {
                    // ストアにメールアドレスが存在しない場合もプライバシー保護のため、
                    // 実際にメールは送らないが、「メール送りました」を出す
                    message = email + " 宛にメールを送信しました。メール内に書かれているリンクをクリックして認証を完了させてください。"
                }
            }
        }

        Ok(views.html.verify(getContestName, getContestUrl, getFirebaseappContest, message, errorMessage))
    }

    def unverify = Action { request =>
        //val body = request.body
        //println(body)

        val customers = Customer.getAll
        val verifyings = Verifying.getAll
        Ok(views.html.unverify(getContestName, getContestUrl, getFirebaseappContest))
    }

    def verifyclick(token: String) = Action {
        Ok(views.html.verifyclick(token, getContestName, getContestUrl, getFirebaseappContest))
    }
}
