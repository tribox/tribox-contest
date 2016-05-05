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

  /**
   * Home
   */
  def index = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    //val events = Event.getAll
    Ok(views.html.index("", contestName, contestUrl, firebaseappContest))
  }

  /**
   * Auth: Join / Login / Logout / Forget password
   */
  def join = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.join("Join", contestName, contestUrl, firebaseappContest))
  }

  def login = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.login("Login", contestName, contestUrl, firebaseappContest))
  }

  def logout = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.logout("Logout", contestName, contestUrl, firebaseappContest))
  }

  def forget = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.forget("Forget Password?", contestName, contestUrl, firebaseappContest))
  }

}
