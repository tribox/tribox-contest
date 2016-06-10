package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class PuzzleCategory(category_id: Int, category_name: String) {
    def addPuzzleCategory { }
}

object PuzzleCategory {
    val data = {
        get[Int]("category_id") ~ get[String]("category_name") map {
            case category_id ~ category_name => PuzzleCategory(category_id, category_name)
        }
    }

    def getAll: List[PuzzleCategory] = {
        DB.withConnection("store") { implicit c =>
            val result = SQL("""
                SELECT `category_id`, `category_name`
                FROM `dtb_category`
                WHERE `parent_category_id` = 1 AND `category_id` NOT IN (421, 428)
                ORDER BY `rank` DESC
            """).as(PuzzleCategory.data *)
            return result
        }
    }
}
