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
    def getContestDescription(): String = {
        return Play.application.configuration.getString("contest.description").getOrElse("")
    }
    def getContestUrl(): String = {
        return Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    }
    def getFirebaseappContest(): String = {
        return Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    }
    def getFirebaseappWca(): String = {
        return Play.application.configuration.getString("firebaseapp.wca").getOrElse("")
    }
    def getPlayAppPath(): String = {
        return Play.application.configuration.getString("contest.playpath").getOrElse("/path/to/playapp")
    }

    /**
     * Home
     */
    def index = Action {
        Ok(views.html.index(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    /**
     * About / Regulations
     */
    def about = Action {
        Ok(views.html.about(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }
    def regulations = Action {
        Ok(views.html.regulations(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    /**
     * Auth
     */
    def join = Action {
        Ok(views.html.join(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def login = Action {
        Ok(views.html.login(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def logout = Action {
        Ok(views.html.logout(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    def forgot = Action {
        Ok(views.html.forgot(getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

    /**
     * Timer for practice
     */
    /*def timer = Action {
        Ok(views.html.contesttimer("", "", getContestName, getContestUrl, getFirebaseappContest))
    }*/
}
