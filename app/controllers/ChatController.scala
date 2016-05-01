package controllers

import javax.inject._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's chat page.
 */
@Singleton
class ChatController @Inject() extends Controller {

  def chat = Action {
    Ok(views.html.chat("amber-torch-2630"))
  }

}
