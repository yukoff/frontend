package discussion

import common.ExecutionContexts
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.WS

import scala.concurrent.Future

object DiscussionApi extends ExecutionContexts {
  val Endpoint = Configuration.discussion.url

  def getContext(id: Long): Future[CommentContext] = {
    val url = s"$Endpoint/discussion-api/comment/$id/context"

    WS.url(url).get() map { response =>
      Json.fromJson[CommentContext](Json.parse(response.body)).get
    }
  }

  def getComment(id: Long): Future[Comment] = {
    val url = s"$Endpoint/discussion-api/comment/$id"

    WS.url(url).get() map { response =>
      Json.fromJson[Comment](Json.parse(response.body)).get
    }
  }
}

