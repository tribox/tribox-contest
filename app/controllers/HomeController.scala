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
    def getFirebaseappContestApikey(): String = {
        return Play.application.configuration.getString("firebaseapp.contestapikey").getOrElse("")
    }
    def getFirebaseappContestMessagingsenderid(): String = {
        return Play.application.configuration.getString("firebaseapp.contestmessagingsenderid").getOrElse("")
    }
    def getFirebaseappWca(): String = {
        return Play.application.configuration.getString("firebaseapp.wca").getOrElse("")
    }
    def getPlayAppPath(): String = {
        return Play.application.configuration.getString("contest.playpath").getOrElse("/path/to/playapp")
    }
    def getGoogleVerification(): String = {
        return Play.application.configuration.getString("google.verification").getOrElse("")
    }

    /**
     * Home
     */
    def index = Action { request =>
        var event = "";
        if(request.queryString.contains("e")) event = request.queryString("e")(0);
        Ok(views.html.index(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid, getGoogleVerification, request.uri, event))
    }

    /**
     * About / Regulations
     */
    def about = Action {
        Ok(views.html.about(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }
    def regulations = Action {
        Ok(views.html.regulations(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    /**
     * Release Notes
     */
    def christmas2018 = Action {
        Ok(views.html.christmas2018(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    /**
     * Auth
     */
    def join = Action {
        Ok(views.html.join(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def login = Action {
        Ok(views.html.login(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def logout = Action {
        Ok(views.html.logout(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    def forgot = Action {
        Ok(views.html.forgot(getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

    /**
     * Timer for practice
     */
    /*def timer = Action {
        Ok(views.html.contesttimer("", "", getContestName, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }*/
}
