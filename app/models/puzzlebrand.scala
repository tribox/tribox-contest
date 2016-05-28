package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class PuzzleBrand(category_id: Pk[Long] = NotAssigned, category_name: String) {
  def addPuzzleBrand { }
}

object PuzzleBrand {
  val data = {
    get[anorm.Pk[Long]]("category_id") ~ get[String]("category_name") map {
      case category_id ~ category_name => PuzzleBrand(category_id, category_name)
    }
  }

  def getAll: List[PuzzleBrand] = {
    DB.withConnection { implicit c =>
      val result = SQL(
          "SELECT `category_id`, `category_name` " + 
          "FROM `dtb_category` " +
          "WHERE `parent_category_id` = 3 " +
          "ORDER BY `category_name` ASC"
      ).as(PuzzleBrand.data *)
      return result
    }
  }
}
