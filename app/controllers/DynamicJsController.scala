package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._
import play.api.Play.current

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's dynamic javascripts.
 */
@Singleton
class DynamicJsController @Inject() extends Controller {

    /**
     * Products
     */
    def products = Action {
        val products = Product.getAll
        Ok(views.js.products.render(products)).as("text/javascript utf-8")
    }

    /**
     * WCA Persons
     */
    def wcapersons = Action {
        val wcaPersons = WcaPersons.getAll
        println(wcaPersons)
        val products = Product.getAll
        Ok(views.js.products.render(products)).as("text/javascript utf-8")
    }

}
