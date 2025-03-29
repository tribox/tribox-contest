package models

import anorm._
import anorm.SqlParser._
import play.api.db._

case class Puzzle(productId: Int, name: String, categoryId: Int, brandId: Int) {
}
