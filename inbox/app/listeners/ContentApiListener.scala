package listeners

import akka.actor.Actor
import akka.actor.Actor.Receive
import conf.LiveContentApi
import listeners.ContentApiListener.Initialise
import com.gu.util.liveblogs.{KeyEvent, Parser}

object ContentApiListener {
  case class Initialise(articlesSeen: Set[String], keyEventsSeen: Map[String, Set[String]])
}

class ContentApiListener extends Actor {
  /** These would actually be stored in a database or something ... */
  var articlesSeen = Set.empty[String]
  var keyEventsSeen = Map.empty[String, Set[String]]

  val PageSize = 20
/*
  LiveContentApi.getResponse(
    LiveContentApi.item("/", "uk").pageSize(PageSize)
  ) map { response =>
    val articlesSeen = response.results.map(_.id)
    val keyEventsSeen = response.results.filter(_.tags.exists(_.id == "tone/minutebyminute")) map { liveBlog =>
      liveBlog.id -> liveBlog.safeFields.get("body") map { body =>
        Parser.parse(body).filter(_.postType == KeyEvent).map(_.id)
      } getOrElse Seq.empty
    }

    self ! Initialise(articlesSeen.toSet, keyEventsSeen)
  }

*/

  override def receive: Receive = {

  }


}
