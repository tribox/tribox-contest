package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Verifying(id: Int, user_id: String, customer_type: Int, customer_id: Int) {
    def addVerifying {
        DB.withConnection { implicit c =>
            val id: Int = SQL("INSERT INTO contest_verifying (user_id, customer_type, customer_id) values ({user_id}, {customer_type}, {customer_id})").
                on('userId -> this.user_id, 'customer_type -> this.customer_type, 'customer_id -> this.customer_id).executeUpdate()
        }
    }
}

object Verifying {
    val data = {
        get[Int]("id") ~ get[String]("user_id") ~ get[Int]("customer_type") ~ get[Int]("customer_id") map {
            case id ~ user_id ~ customer_type ~ customer_id => Verifying(id, user_id, customer_type, customer_id)
        }
    }

    def getAll: List[Verifying] = {
        DB.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM contest_verifying
            """).as(Verifying.data *)
            return result
        }
    }
}
