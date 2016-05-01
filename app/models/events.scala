package models

import anorm._
import anorm.SqlParser._
import play.api.db._
import play.api.Play.current

case class Event(id: Pk[Long] = NotAssigned, tag: String, name: String) {
  def addEvent {
    DB.withConnection { implicit c =>
      val id: Int = SQL("insert into events (tag, name) values ({tag}, {name})").
        on('tag -> this.tag, 'name -> this.name).executeUpdate()
    }
  }
}

object Event {
  val data = {
    get[anorm.Pk[Long]]("id") ~ get[String]("tag") ~ get[String]("name") map {
      case id ~ tag ~ name => Event(id, tag, name)
    }
  }

  def getAll: List[Event] = {
    DB.withConnection { implicit c =>
      val result = SQL("Select * from events").as(Event.data *)
      return result
    }
  }
}
