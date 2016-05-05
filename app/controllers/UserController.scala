package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's user pages.
 */
@Singleton
class UserController @Inject() extends Controller {

  /**
   * User pages
   */
  def user(id: String) = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.user(id, contestName, contestUrl, firebaseappContest))
  }

}
