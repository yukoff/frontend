package discussion

import common.{Logging, ExecutionContexts}
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.WS

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.Play.current

object DiscussionApi extends ExecutionContexts with Logging {
  val Endpoint = Configuration.discussion.url

  def getContext(id: Long): Future[CommentContext] = {
    val url = s"$Endpoint/discussion-api/comment/$id/context"

    log.info(s"Requesting $url")

    WS.url(url).get() map { response =>
      Json.fromJson[CommentContext](Json.parse(response.body)).get
    }
  }

  def getComment(id: Long): Future[Comment] = {
    val url = s"$Endpoint/discussion-api/comment/$id"

    log.info(s"Requesting $url")

    WS.url(url).get() map { response =>
      Json.fromJson[CommentAndStatus](Json.parse(response.body)).get.comment
    }
  }
}

