package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

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

    def verify = Action { request =>
        val body = request.body
        println(body)

        val email = request.body.asFormUrlEncoded.get("email")(0)
        println(email)

        val customers = Customer.getAll
        val verifyings = Verifying.getAll
        Ok(views.html.verify(getContestName, getContestUrl, getFirebaseappContest))
    }

    def unverify = Action { request =>
        val body = request.body
        println(body)

        val customers = Customer.getAll
        val verifyings = Verifying.getAll
        Ok(views.html.unverify(getContestName, getContestUrl, getFirebaseappContest))
    }

    def verifyclick(token: String) = Action {
        Ok(views.html.verifyclick(token, getContestName, getContestUrl, getFirebaseappContest))
    }
}
