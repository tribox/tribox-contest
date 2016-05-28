package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page and auth pages.
 */
@Singleton
class HomeController @Inject() extends Controller {
    def getContestName(): String = {
        return Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    }
    def getContestUrl(): String = {
        return Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    }
    def getFirebaseappContest(): String = {
        return Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    }

    /**
     * Home
     */
    def index = Action {
        Ok(views.html.index(getContestName, getContestUrl, getFirebaseappContest))
    }

    /**
     * Auth: Join / Login / Logout / Forgot password
     */
    def join = Action {
        Ok(views.html.join(getContestName, getContestUrl, getFirebaseappContest))
    }

    def login = Action {
        Ok(views.html.login(getContestName, getContestUrl, getFirebaseappContest))
    }

    def logout = Action {
        Ok(views.html.logout(getContestName, getContestUrl, getFirebaseappContest))
    }

    def forgot = Action {
        Ok(views.html.forgot(getContestName, getContestUrl, getFirebaseappContest))
    }

    /**
     * Timer for practice
     */
    def timer = Action {
        Ok(views.html.timer("", "", getContestName, getContestUrl, getFirebaseappContest))
    }
}
