package controllers

import common.ExecutionContexts
import listeners.Publisher
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
      posts.filter(!_.read) foreach { post =>
        Feed.setRead(userId, post.addedAt.getMillis)
      }

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

  val Comments = Seq(
    """
      |<p>This is serious.</p>
      |
      |<p>Obviously more stringent controls would only raise the price of this important party drug, and also the profits of the manufacturers.</p>
    """.stripMargin,
    """
      |<p>If it did not benefit poorer people and countries they would not be interested in it, the world as we know it,
      |the rich looking after the rich business as usual.</p>
    """.stripMargin,
    """
      |<p>Apart from the obvious (price rises) exactly why would China want to do such a thing?</p>
    """.stripMargin,
    """
      |<p>The spirit of punk lives on. Got something to say? Jjust pick up some instruments and have a bash.</p>
      |
      |<p>That made my day.</p>
    """.stripMargin,
    """
      |<p>This is pretty much the plot of Ex-Drummer. Hopefully it will end better for them.</p>
    """.stripMargin
  )

  def sendComment() = Action {

    Publisher.publish("topic", CommentReply(
      "12996508",
      scala.util.Random.shuffle(Seq(
        "Neilav",
        "Cantlin",
        "Andy",
        "John",
        "Mary"
      )).head,
      "http://static.guim.co.uk/sys-images/Guardian/Pix/site_furniture/2010/09/01/no-user-image.gif",
      "",
      scala.util.Random.shuffle(Comments).head,
      "214"
    ))

    Ok("Sent")
  }

  val Headlines = Seq(
    "Ed Miliband promises to slash tuition fees",
    "Madonna suffered whiplash after fall",
    "How David Cameron could win the general election but not the keys to No 10",
    "The homophobia in cucumber is so scary because it taps into a grim reality",
    "Google backtracks on porn ban in blogger"
  )

  def sendStory() = Action {
    Publisher.publish("topic", NewArticle(
      "/politics/2015/feb/27/election-2015-tories-largest-party-but-cameron-may-not-have-the-numbers-to-stay-pm",
      scala.util.Random.shuffle(Headlines).head,
      "",
      ""
    ))

    Ok("Sent")
  }
}
