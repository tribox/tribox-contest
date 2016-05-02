package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject() extends Controller {

  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index = Action {
    val firebaseapp = Play.application.configuration.getString("contest.firebaseapp").getOrElse("tribox-contest")
    val events = Event.getAll
    Ok(views.html.index(firebaseapp, events))
  }

  def login = Action {
    val firebaseapp = Play.application.configuration.getString("contest.firebaseapp").getOrElse("tribox-contest")
    Ok(views.html.login(firebaseapp))
  }

  def logout = Action {
    val firebaseapp = Play.application.configuration.getString("contest.firebaseapp").getOrElse("tribox-contest")
    Ok(views.html.logout(firebaseapp))
  }

  def join = Action {
    val firebaseapp = Play.application.configuration.getString("contest.firebaseapp").getOrElse("tribox-contest")
    Ok(views.html.join(firebaseapp))
  }

}
