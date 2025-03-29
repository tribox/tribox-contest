package controllers

import javax.inject._
import models._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's dynamic javascripts.
 */
@Singleton
class DynamicJsController @Inject() (cc: ControllerComponents, productService: ProductRepository) extends AbstractController(cc) {

    /**
     * Products
     */
    def products = Action {
        val products = productService.getAll
        Ok(views.js.products.render(products)).as("text/javascript utf-8")
    }

}
