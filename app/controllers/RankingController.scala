package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's ranking pages.
 */
@Singleton
class RankingController @Inject() (cc: ControllerComponents, configuration: Configuration) extends HomeController(cc, configuration) {

    def rankingdefault = Action {
        Ok(views.html.rankingdefault(getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }
    def ranking(sid: String) = Action {
        Ok(views.html.ranking(sid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid, getFirebaseappWca))
    }

    def rankingpuzzledefault = Action {
        Ok(views.html.rankingpuzzledefault(getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }
    def rankingpuzzle(sid: String) = Action {
        Ok(views.html.rankingpuzzle(sid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }
    def rankingpuzzleall(sid: String) = Action {
        Ok(views.html.rankingpuzzleall(sid, getContestName, getContestDescription, getContestUrl, getFirebaseappContest, getFirebaseappContestApikey, getFirebaseappContestMessagingsenderid))
    }

}
