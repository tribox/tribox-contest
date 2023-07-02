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
        Process(s"/usr/bin/node $arg") !
    }

    def banUser = Action { request =>
        val targetUsername: String = request.getQueryString("u").getOrElse("")
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else if (!targetUsername.matches("""^[a-zA-Z0-9_]{1,15}$""")) {
            BadRequest("Bad Request (username)")
        } else {
            execNodeScript(s"$getPlayAppPath/contestmanager/ban-user.js --username=$targetUsername")
            Ok(s"ユーザー ($targetUsername) をBANしました。\n\n※このタブを閉じてください。")
        }
    }

    def unbanUser = Action { request =>
        val targetUsername: String = request.getQueryString("u").getOrElse("")
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else if (!targetUsername.matches("""^[a-zA-Z0-9_]{1,15}$""")) {
            BadRequest("Bad Request (username)")
        } else {
            execNodeScript(s"$getPlayAppPath/contestmanager/ban-user.js --unban --username=$targetUsername")
            Ok(s"ユーザー ($targetUsername) のBANを解除しました。\n\n※このタブを閉じてください。")
        }
    }

    def deleteResult = Action { request =>
        val targetContest: String = request.getQueryString("c").getOrElse("")
        val targetEvent: String = request.getQueryString("e").getOrElse("")
        val targetUsername: String = request.getQueryString("u").getOrElse("")
        if (!request.queryString.contains("token") || !getAdminApiToken.equals(request.getQueryString("token").getOrElse(""))) {
            Forbidden("Forbidden")
        } else if (!targetContest.matches("""^[0-9]{4}(1|2)[0-9]{2}$""")) {
            BadRequest("Bad Request (contest)")
        } else if (!targetEvent.matches("""^[a-zA-Z0-9]{1,15}$""")) {
            BadRequest("Bad Request (event)")
        } else if (!targetUsername.matches("""^[a-zA-Z0-9_]{1,15}$""")) {
            BadRequest("Bad Request (username)")
        } else {
            execNodeScript(s"$getPlayAppPath/contestmanager/delete-record.js --contest=$targetContest --event=$targetEvent --username=$targetUsername")
            execNodeScript(s"$getPlayAppPath/contestmanager/collect-results.js --contest=$targetContest --check --checkfmc")
            Ok(s"コンテスト ($targetContest) 種目 ($targetEvent) ユーザー ($targetUsername) の記録が削除されました。削除メールが送信されました。\n\n※このタブを閉じてください。")
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
            Ok(s"コンテスト結果ページ ($targetContest) が公開されました！\n\n※このタブを閉じてください。")
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
            Ok(s"コンテスト結果ページ ($targetContest) が非公開になりました。\n\n※このタブを閉じてください。")
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
            Ok(s"コンテスト ($targetContest) の優勝者をツイートしました。\n\n※このタブを閉じてください。")
        }
    }

}
