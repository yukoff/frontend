package controllers

import common.ExecutionContexts
import models._
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

object GetPostsResponse {
  implicit val jsonWrites = Json.writes[GetPostsResponse]
}

case class GetPostsResponse(messages: Seq[PushPostWrapper])

object GetPostsCountResponse {
  implicit val jsonWrites = Json.writes[GetPostsCountResponse]
}

case class GetPostsCountResponse(count: Int)

object InboxController extends Controller with ExecutionContexts {
  /** Obviously totally insecure and rubbish but this is a hack day yo */
  def getPosts(userId: String) = Action.async {
    Feed.getPosts(userId) map { posts =>
      Ok(Json.toJson(GetPostsResponse(posts.map(PushPostWrapper.fromFeedItem))))
    }
  }

  def renderPosts(userId: String) = Action.async {
    Feed.getPosts(userId) map { posts =>
      Ok(views.html.feedBody(posts.filter(!_.read)))
    }
  }

  def getPostsCount(userId: String) = Action.async {
    Feed.getPosts(userId) map { posts =>
      Ok(Json.toJson(GetPostsCountResponse(posts.count(!_.read))))
    }
  }

  def setRead(userId: String, addedAt: Long) = Action.async {
    Feed.setRead(userId, addedAt) map { _ =>
      // todo something less rubbish
      Ok("done")
    }
  }

  // todo add subscription endpoints
  def subscribe(userId: String, topic: String) = Action.async {
    Subscription.subscribe(userId, topic) map { _ =>
      Ok("Done")
    }
  }

  def unsubscribe(userId: String, topic: String) = Action.async {
    Subscription.unsubscribe(userId, topic) map { _ =>
      Ok("Done")
    }
  }

  def setPushEndpoint(userId: String) = Action.async(parse.json[PushEndpoint]) { request =>
    PushSubscription.setEndpoint(userId, request.body) map { _ =>
      Ok("Done")
    }
  }
}
