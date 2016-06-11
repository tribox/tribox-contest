package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Verifying(id: Int, user_id: String, customer_type: Int, customer_id: Int) {
}

object Verifying {
    val data = {
        get[Int]("id") ~ get[String]("user_id") ~ get[Int]("customer_type") ~ get[Int]("customer_id") map {
            case id ~ user_id ~ customer_type ~ customer_id => Verifying(id, user_id, customer_type, customer_id)
        }
    }

    // テーブル全体
    def getAll: List[Verifying] = {
        DB.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM contest_verifying
                ORDER BY id ASC
            """).as(Verifying.data *)
            return result
        }
    }

    // コンテストユーザIDに一致する（認証済み）レコードを検索
    def getOnesByUserId(userId: String): List[Verifying] = {
        DB.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM contest_verifying
                WHERE user_id = {userId} AND verified_at IS NOT NULL
                ORDER BY id ASC
            """).on('userId -> userId).as(Verifying.data *)
            return result
        }
    }

    // ストアユーザIDに一致する（認証済み）レコードを検索
    def getOnesByCustomerId(customerId: Int): List[Verifying] = {
        DB.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM contest_verifying
                WHERE customer_id = {customerId} AND verified_at IS NOT NULL
                ORDER BY id ASC
            """).on('customerId -> customerId).as(Verifying.data *)
            return result
        }
    }

    // 新規レコードを挿入
    def insertVerifying(token: String, userId: String, customerId: Int) {
        DB.withConnection { implicit c =>
            val id: Int = SQL("INSERT INTO contest_verifying (token, user_id, customer_type, customer_id) values ({token}, {user_id}, 0, {customer_id})").
                on('token -> token, 'user_id -> userId, 'customer_id -> customerId).executeUpdate()
        }
    }
}
