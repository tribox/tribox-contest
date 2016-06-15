package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Puzzle(productId: Int, name: String, categoryId: Int, brandId: Int) {
}
