package controllers

import javax.inject._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's hello page.
 */
@Singleton
class HelloController @Inject() extends Controller {

  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def hello = Action {
    Ok(views.html.hello("Hello world"))
  }

  def hello1 = Action {
    Ok("Hello world")
  }

  def hello2 = Action { request =>
    Ok("Got request [" + request + "]")
  }

  def hello3 = Action { implicit request =>
    Ok("Got request [" + request + "]")
  }

  def hello4 = Action(parse.json) { implicit request =>
    Ok("Got request [" + request + "]")
  }

  def hello5 = Action {
    //NotFound
    //NotFound("<h1>Page not found</h1>")
    //BadRequest(views.html.form(formWithErrors))
    //InternalServerError("Oops")
    Status(488)("Strange response type")
  }

}
