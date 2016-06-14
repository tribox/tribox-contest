package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class CompetedHistory(id: Int, user_id: String, contest_id: String, event_id: String) {
}

object CompetedHistory {
    val data = {
        get[Int]("id") ~ get[String]("user_id") ~ get[String]("contest_id") ~ get[String]("event_id") map {
            case id ~ user_id ~ contest_id ~ event_id => CompetedHistory(id, user_id, contest_id, event_id)
        }
    }

    // テーブル全体
    def getAll: List[CompetedHistory] = {
        DB.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, contest_id, event_id
                FROM competed_history
                ORDER BY id ASC
            """).as(CompetedHistory.data *)
            return result
        }
    }

    // ユーザIDに一致するレコードを検索
    def getOnesByUserId(userId: String): List[CompetedHistory] = {
        DB.withConnection { implicit c =>
            val result = SQL("""
                SELECT id, user_id, contest_id, event_id
                FROM competed_history
                WHERE user_id = {userId} AND has_competed = 1
                ORDER BY id ASC
            """).on('userId -> userId).as(CompetedHistory.data *)
            return result
        }
    }

}
