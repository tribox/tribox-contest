package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Customer(customer_id: Int, email: String) {
    def addCustomer { }
}

object Customer {
    val data = {
        get[Int]("customer_id") ~ get[String]("email") map {
            case customer_id ~ email => Customer(customer_id, email)
        }
    }

    // テーブル全体
    def getAll: List[Customer] = {
        DB.withConnection("store") { implicit c =>
            val result = SQL("""
                SELECT customer_id, email
                FROM dtb_customer
                WHERE del_flg = 0
                ORDER BY customer_id ASC
            """).as(Customer.data *)
            return result
        }
    }

    // メールアドレスに一致するレコードを検索
    def getOnesByEmail(email: String): List[Customer] = {
        DB.withConnection("store") { implicit c =>
            val result = SQL("""
                SELECT customer_id, email
                FROM dtb_customer
                WHERE email = {email} AND del_flg = 0
                ORDER BY customer_id ASC
            """).on('email -> email).as(Customer.data *)
            return result
        }
    }
}
