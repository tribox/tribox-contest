package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's demo pages.
 */
@Singleton
class DemoController @Inject() extends HomeController {

    def timer = Action {
        Ok(views.html.contesttimerdemo(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

}
