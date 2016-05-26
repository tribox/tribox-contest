package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's contest pages.
 */
@Singleton
class ContestController @Inject() extends Controller {

  /**
   * Contest pages
   */
  def contest(cid: String) = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.contest(cid, contestName, contestUrl, firebaseappContest))
  }

  def choose(cid: String, eid: String) = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.contestchoose(cid, eid, contestName, contestUrl, firebaseappContest))
  }

  def form(cid: String, eid: String) = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.contestform(cid, eid, contestName, contestUrl, firebaseappContest))
  }

  def timer(cid: String, eid: String) = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.timer(cid, eid, contestName, contestUrl, firebaseappContest))
  }

  def confirm(cid: String, eid: String) = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.contestconfirm(cid, eid, contestName, contestUrl, firebaseappContest))
  }
}
