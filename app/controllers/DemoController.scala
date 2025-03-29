package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's demo pages.
 */
@Singleton
class DemoController @Inject() (cc: ControllerComponents, configuration: Configuration) extends HomeController(cc, configuration) {

    def timer = Action {
        Ok(views.html.contesttimerdemo(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

}
