package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page and auth pages.
 */
@Singleton
class HomeController @Inject() (cc: ControllerComponents, configuration: Configuration) extends AbstractController(cc) {
    def getContestName(): String = {
        return configuration.underlying.getString("contest.name")
    }
    def getContestDescription(): String = {
        return configuration.underlying.getString("contest.description")
    }
    def getContestUrl(): String = {
        return configuration.underlying.getString("contest.url")
    }
    def getFirebaseappContest(): String = {
        return configuration.underlying.getString("firebaseapp.contest")
    }
    def getFirebaseappContestApikey(): String = {
        return configuration.underlying.getString("firebaseapp.contestapikey")
    }
    def getFirebaseappContestMessagingsenderid(): String = {
        return configuration.underlying.getString("firebaseapp.contestmessagingsenderid")
    }
    def getFirebaseappWca(): String = {
        return configuration.underlying.getString("firebaseapp.wca")
    }
    def getPlayAppPath(): String = {
        return configuration.underlying.getString("contest.playpath")
    }
    def getAdminApiToken(): String = {
        return configuration.underlying.getString("admin.api.token")
    }
    def getGoogleVerification(): String = {
        return configuration.underlying.getString("google.verification")
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
