package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

import scala.sys.process._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's admin api endpoints.
 */
@Singleton
class AdminApiController @Inject() extends HomeController {

    // Nodeスクリプト実行用メソッド
    def execNodeScript(arg: String) = {
        Process(s"/usr/bin/node $arg") run
    }

    def banUser = Action { request =>
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else {
            Ok("Not Implemented Yet")
        }
    }

    def unbanUser = Action { request =>
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else {
            Ok("Not Implemented Yet")
        }
    }

    def deleteResult = Action { request =>
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else {
            Ok("Not Implemented Yet")
        }
    }

    def publishContest = Action { request =>
        val targetContest: String = request.getQueryString("c").getOrElse("")
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else if (!targetContest.matches("""^[0-9]{4}(1|2)[0-9]{2}$""")) {
            BadRequest("Bad Request")
        } else {
            execNodeScript(s"$getPlayAppPath/contestmanager/publish-result.js --contest=$targetContest")
            Ok(s"コンテスト結果ページ ($targetContest) が公開されました！\n\n※このタブは閉じてください。")
        }
    }

    def unpublishContest = Action { request =>
        val targetContest: String = request.getQueryString("c").getOrElse("")
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else if (!targetContest.matches("""^[0-9]{4}(1|2)[0-9]{2}$""")) {
            BadRequest("Bad Request")
        } else {
            execNodeScript(s"$getPlayAppPath/contestmanager/publish-result.js --unpublish --contest=$targetContest")
            Ok(s"コンテスト結果ページ ($targetContest) が非公開になりました。\n\n※このタブは閉じてください。")
        }
    }

    def tweetContest = Action { request =>
        val targetContest: String = request.getQueryString("c").getOrElse("")
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else if (!targetContest.matches("""^[0-9]{4}(1|2)[0-9]{2}$""")) {
            BadRequest("Bad Request")
        } else {
            execNodeScript(s"$getPlayAppPath/contestmanager/collect-results.js --contest=$targetContest --check --checkfmc --tweet")
            Ok(s"コンテスト ($targetContest) の優勝者をツイートしました。\n\n※このタブは閉じてください。")
        }
    }

}
