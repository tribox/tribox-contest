package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Cube(product_id: Int, name: String, category_id: Int, parent_category_id: Int) {
    def addCube { }
}

object Cube {
    val data = {
        get[Int]("product_id") ~ get[String]("name") ~ get[Int]("category_id") ~ get[Int]("parent_category_id") map {
            case product_id ~ name ~ category_id ~ parent_category_id => Cube(product_id, name, category_id, parent_category_id)
        }
    }

    def getAll: List[Cube] = {
        DB.withConnection("store") { implicit c =>
            val result = SQL("""
                SELECT `product_id`, `name`, `category_id`, `parent_category_id` FROM (
                  SELECT `product_id`, `name`, C1.`category_id` as category_id, C1.`category_name` as category_name, C2.`category_id` as parent_category_id, C2.`category_name` as parent_category_name, `main_image`, EXPT.`except_store` AS except_flg
                   FROM (
                    SELECT P.`product_id`, `category_id`, `name`, `main_image`
                    FROM `dtb_product_categories` PC
                    INNER JOIN (
                      SELECT `product_id`, `name`, `main_image`
                      FROM `dtb_products`
                      WHERE (`status` = 1 OR (`status` = 2 AND `maker_id` = 39)) AND `del_flg` = 0
                    ) P
                    ON PC.`product_id` = P.`product_id`
                  ) PPC
                  LEFT OUTER JOIN
                  `dtb_category` C1
                  ON PPC.`category_id` = C1.`category_id`
                  LEFT OUTER JOIN
                  `dtb_category` C2
                  ON C1.`parent_category_id` = C2.`category_id`
                  LEFT OUTER JOIN
                  `stickers_puzzles_except` EXPT
                  ON PPC.`product_id` = EXPT.`puzzle_id`
                ) PAC
                WHERE PAC.`parent_category_id` IN (1, 3) AND (`except_flg` IS NULL OR `except_flg` = 0) AND `category_id` NOT IN (421, 428)
                ORDER BY `name` ASC
            """).as(Cube.data *)
            return result
        }
    }
}
