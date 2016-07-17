package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's ranking pages.
 */
@Singleton
class RankingController @Inject() extends HomeController {

    def rankingdefault = Action {
        Ok(views.html.rankingdefault(getFirebaseappContest))
    }
    def ranking(sid: String) = Action {
        Ok(views.html.ranking(sid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappWca))
    }

    def rankingpuzzledefault = Action {
        Ok(views.html.rankingpuzzledefault(getFirebaseappContest))
    }
    def rankingpuzzle(sid: String) = Action {
        Ok(views.html.rankingpuzzle(sid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }
    def rankingpuzzleall(sid: String) = Action {
        Ok(views.html.rankingpuzzleall(sid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

}
