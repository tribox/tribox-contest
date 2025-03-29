package models

import javax.inject._
import scala.language.postfixOps
import anorm._
import anorm.SqlParser._
import play.api.db._

case class Customer(customer_id: Int, email: String) {
}

class CustomerRepository @Inject() (dbapi: DBApi) {
    private val db = dbapi.database("store")

    val data = {
        get[Int]("customer_id") ~ get[String]("email") map {
            case customer_id ~ email => Customer(customer_id, email)
        }
    }

    // テーブル全体
    def getAll: List[Customer] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT customer_id, email
                FROM dtb_customer
                WHERE del_flg = 0
                ORDER BY customer_id ASC
            """).as(data *)
            return result
        }
    }

    // メールアドレスに一致するレコードを検索
    def getOnesByEmail(email: String): List[Customer] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT customer_id, email
                FROM dtb_customer
                WHERE email = {email} AND del_flg = 0
                ORDER BY customer_id ASC
            """).on('email -> email).as(data *)
            return result
        }
    }
}
