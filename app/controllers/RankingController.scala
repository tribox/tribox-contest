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

    def ranking(sid: String) = Action {
        val products = Product.getAll
        Ok(views.html.ranking(sid, products, getContestName, getContestDescription, getContestUrl, getFirebaseappContest))
    }

}
