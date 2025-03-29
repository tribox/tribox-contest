package models

import javax.inject._
import scala.language.postfixOps
import anorm._
import anorm.SqlParser._
import play.api.db._

case class Verifying(id: Int, user_id: String, customer_type: Int, customer_id: Int) {
}

class VerifyingRepository @Inject() (dbapi: DBApi) {
    private val db = dbapi.database("default")

    val data = {
        get[Int]("id") ~ get[String]("user_id") ~ get[Int]("customer_type") ~ get[Int]("customer_id") map {
            case id ~ user_id ~ customer_type ~ customer_id => Verifying(id, user_id, customer_type, customer_id)
        }
    }

    // テーブル全体
    def getAll: List[Verifying] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM verifying
                ORDER BY id ASC
            """).as(data *)
            return result
        }
    }

    // コンテストユーザIDに一致する（認証済み）レコードを検索
    def getOnesByUserId(userId: String): List[Verifying] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM verifying
                WHERE user_id = {userId} AND verified_at IS NOT NULL AND unverified_at IS NULL
                ORDER BY id ASC
            """).on('userId -> userId).as(data *)
            return result
        }
    }

    // ストアユーザIDに一致する（認証済み）レコードを検索
    def getOnesByCustomerId(customerId: Int): List[Verifying] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM verifying
                WHERE customer_id = {customerId} AND verified_at IS NOT NULL AND unverified_at IS NULL
                ORDER BY id ASC
            """).on('customerId -> customerId).as(data *)
            return result
        }
    }

    // トークンに一致するレコードを検索（認証済みでも良い、ただし認証解除は含まない）
    def getOnesByToken(token: String): List[Verifying] = {
        db.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, customer_type, customer_id
                FROM verifying
                WHERE token = {token} AND unverified_at IS NULL
                ORDER BY id ASC
            """).on('token -> token).as(data *)
            return result
        }
    }

    // 新規レコードを挿入
    def insertVerifying(token: String, userId: String, customerId: Int) {
        db.withConnection { implicit c =>
            val _id: Int = SQL("INSERT INTO verifying (token, user_id, customer_type, customer_id) values ({token}, {user_id}, 0, {customer_id})").
                on('token -> token, 'user_id -> userId, 'customer_id -> customerId).executeUpdate()
        }
    }

    // 指定したレコードを認証済みとしてマークする
    def makeVerify(id: Int) {
        db.withConnection { implicit c =>
            val _id: Int = SQL("UPDATE verifying SET verified_at = NOW() WHERE id = {id}").
                on('id -> id).executeUpdate()
        }
    }

    // 指定したレコードを認証解除する
    def makeUnverify(userId: String, customerId: Int) {
        db.withConnection { implicit c =>
            val _id: Int = SQL("UPDATE verifying SET unverified_at = NOW() WHERE user_Id = {user_id} AND customer_id = {customer_id} AND verified_at IS NOT NULL AND unverified_at IS NULL").
                on('user_id -> userId, 'customer_id -> customerId).executeUpdate()
        }
    }
}
