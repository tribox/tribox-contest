package models

import javax.inject._
import scala.language.postfixOps
import anorm._
import anorm.SqlParser._
import play.api.db._

case class PuzzleBrand(category_id: Int, category_name: String) {
}

class PuzzleBrandRepository @Inject() (dbapi: DBApi) {
    private val db = dbapi.database("store")

    val data = {
        get[Int]("category_id") ~ get[String]("category_name") map {
            case category_id ~ category_name => PuzzleBrand(category_id, category_name)
        }
    }

    def getAll: List[PuzzleBrand] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT `category_id`, `category_name`
                FROM `dtb_category`
                WHERE `parent_category_id` = 3
                ORDER BY `category_name` ASC
            """).as(data *)
            return result
        }
    }
}
