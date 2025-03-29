package models

import javax.inject._
import scala.language.postfixOps
import anorm._
import anorm.SqlParser._
import play.api.db._

case class Product(product_id: Int, product_name: String) {
}

class ProductRepository @Inject() (dbapi: DBApi) {
    private val db = dbapi.database("store")

    val data = {
        get[Int]("product_id") ~ get[String]("product_name") map {
            case product_id ~ product_name => Product(product_id, product_name)
        }
    }

    def getAll: List[Product] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT `product_id`, `name` AS `product_name`
                FROM `dtb_products`
                WHERE `del_flg` != 1
                ORDER BY `product_id` ASC
            """).as(data *)
            return result
        }
    }
}
