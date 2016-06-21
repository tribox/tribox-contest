package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

/*case class WcaPersons(id: String, name: String, countryId: String, countryName: String, countryIso2: String) {
}*/
case class WcaPersons(id: String, name: String) {
}

/*object WcaPersons {
    val data = {
        get[String]("id") ~ get[String]("name") ~ get[String]("countryId") ~ get[String]("countryName") ~ get[String]("countryIso2") map {
            case id ~ name ~ countryId ~ countryName ~ countryIso2 => WcaPersons(id, name, countryId, countryName, countryIso2)
        }
    }*/
object WcaPersons {
    val data = {
        get[String]("id") ~ get[String]("name") map {
            case id ~ name => WcaPersons(id, name)
        }
    }

    // テーブル全体
    def getAll: List[WcaPersons] = {
        DB.withConnection("wca") { implicit c =>
            val result = SQL("""
                SELECT id, name
                FROM Persons
                ORDER BY id ASC
            """).as(WcaPersons.data *)
            return result
        }
    }
    /*def getAll: List[WcaPersons] = {
        DB.withConnection("wca") { implicit c =>
            val result = SQL("""
                SELECT id, name, countryId, countryName, countryIso2
                FROM wca_persons
                ORDER BY id ASC
            """).as(WcaPersons.data *)
            return result
        }
    }*/
}
