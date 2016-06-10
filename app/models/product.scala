package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Product(product_id: Int, product_name: String) {
    def addProduct { }
}

object Product {
    val data = {
        get[Int]("product_id") ~ get[String]("product_name") map {
            case product_id ~ product_name => Product(product_id, product_name)
        }
    }

    def getAll: List[Product] = {
        DB.withConnection("store") { implicit c =>
            val result = SQL("""
                SELECT `product_id`, `name` AS `product_name`
                FROM `dtb_products`
                WHERE `del_flg` != 1
                ORDER BY `product_id` ASC
            """).as(Product.data *)
            return result
        }
    }
}
