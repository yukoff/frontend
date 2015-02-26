package listeners

import akka.actor.Actor
import common.{ExecutionContexts, Logging}
import conf.LiveContentApi
import com.gu.util.liveblogs.{KeyEvent, Parser}
import scala.concurrent.duration._

object ContentApiListener {
  case class Initialise(articlesSeen: Set[String], keyEventsSeen: Map[String, Set[String]])

  case class Update(articlesSeen: Set[String], keyEventsSeen: Map[String, Set[String]])

  case class UpdateError(error: Throwable)
}

class ContentApiListener extends Actor with Logging with ExecutionContexts {
  import ContentApiListener._

  /** These would actually be stored in a database or something ... */
  val PageSize = 20

  def getArticleIdsAndKeyEvents = LiveContentApi.getResponse(
    LiveContentApi.item("/", "uk").pageSize(PageSize)
  ) map { response =>
    val articlesSeen = response.results.map(_.id)
    val keyEventsSeen = (response.results.filter(_.tags.exists(_.id == "tone/minutebyminute")) map { liveBlog =>
      liveBlog.id -> (liveBlog.safeFields.get("body") map { body: String =>
        Parser.parse(body).filter(_.postType == KeyEvent).map(_.id).toSet
      } getOrElse Set.empty)
    }).toMap

    (articlesSeen.toSet, keyEventsSeen)
  }

  getArticleIdsAndKeyEvents map { case (articlesSeen, keyEventsSeen) =>
    self ! Initialise(articlesSeen, keyEventsSeen)
  }


  override def receive: Receive = {
    case Initialise(articlesSeen, keyEventsSeen) => context.become(withState(articlesSeen, keyEventsSeen))
  }

  def withState(articlesSeen: Set[String], keyEventsSeen: Map[String, Set[String]]): Receive = {
    context.system.scheduler.scheduleOnce(10.seconds) {
      log.info("Updating state from Content API")

      getArticleIdsAndKeyEvents map { case (articlesSeen, keyEventsSeen) =>
        self ! Update(articlesSeen, keyEventsSeen)
      }
    }

    {
      case Update(newArticlesSeen, newKeyEventsSeen) =>
        val articleNotifications = newArticlesSeen -- articlesSeen

        // TODO send these
        if (articleNotifications.nonEmpty) {
          log.info(s"New articles: $articleNotifications")
        }

        // TODO also diff the key events and send notifications for those


        context.become(withState(newArticlesSeen, newKeyEventsSeen))

      case UpdateError(error) =>
        log.error("Error updating state from Content API", error)
        context.become(withState(articlesSeen, keyEventsSeen))
    }
  }
}
