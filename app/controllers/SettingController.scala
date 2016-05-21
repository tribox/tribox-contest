package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's setting pages.
 */
@Singleton
class SettingController @Inject() extends Controller {

  /**
   * Setting: Setting / First setting / Other settings
   */
  def setting = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.setting(contestName, contestUrl, firebaseappContest))
  }

  def settingfirst = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.settingfirst(contestName, contestUrl, firebaseappContest))
  }

  def settingemail = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.settingemail(contestName, contestUrl, firebaseappContest))
  }

  def settingpassword = Action {
    val contestName = Play.application.configuration.getString("contest.name").getOrElse("tribox Contest")
    val contestUrl = Play.application.configuration.getString("contest.url").getOrElse("https://contest.tribox.com/")
    val firebaseappContest = Play.application.configuration.getString("firebaseapp.contest").getOrElse("tribox-contest")
    Ok(views.html.settingpassword(contestName, contestUrl, firebaseappContest))
  }
}
