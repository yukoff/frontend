package controllers

import common.ExecutionContexts
import models.{FeedItem, Feed}
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

object GetPostsResponse {
  implicit val jsonWrites = Json.writes[GetPostsResponse]
}

case class GetPostsResponse(messages: Seq[FeedItem])

object InboxController extends Controller with ExecutionContexts {
  /** Obviously totally insecure and rubbish but this is a hack day yo */
  def getPosts(userId: String) = Action.async {
    Feed.getPosts(userId) map { posts =>
      Ok(Json.toJson(GetPostsResponse(posts)))
    }
  }

  def setRead(userId: String, addedAt: Long) = Action.async {
    Feed.setRead(userId, addedAt) map { _ =>
      // todo something less rubbish
      Ok("done")
    }
  }

  // todo add subscription endpoints
}
