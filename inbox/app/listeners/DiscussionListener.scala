package listeners

import com.amazonaws.regions.Regions
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import common.{Logging, Message, JsonQueueWorker, JsonMessageQueue}
import conf.Configuration
import discussion.DiscussionApi
import models.CommentReply
import play.api.libs.json.Json
import util.Futures

import scala.concurrent.Future
import scala.concurrent.duration._

object DiscussionNotification {
  implicit val jsonReads = Json.reads[DiscussionNotification]
}

case class DiscussionNotification(
  comment_id: Long,
  body: String
)

object DiscussionNotificationWrapper {
  implicit val jsonReads = Json.reads[DiscussionNotificationWrapper]
}

case class DiscussionNotificationWrapper(
  Message: String
)

object DiscussionListener extends JsonQueueWorker[DiscussionNotificationWrapper] with Logging {
  override val queue: JsonMessageQueue[DiscussionNotificationWrapper] = JsonMessageQueue[DiscussionNotificationWrapper](
    new AmazonSQSAsyncClient().withRegion(Regions.EU_WEST_1),
    Configuration.inbox.discussionQueue.getOrElse("")
  )

  override def process(message: Message[DiscussionNotificationWrapper]): Future[Unit] = {
    try {
      Json.fromJson[DiscussionNotification](Json.parse(message.get.Message)).get
    } catch {
      case error: Throwable =>
        log.error("Error reading json for " + message.get.Message, error)
    }

    val notification = Json.fromJson[DiscussionNotification](Json.parse(message.get.Message))

    val id = notification.get.comment_id

    log.info(s"Processing comment $id")

    for {
      comment <- DiscussionApi.getComment(id)
      context <- DiscussionApi.getContext(id)
      _ <- Publisher.publish(s"discussion:replies:${context.commentAncestorId}", CommentReply(
        comment.userProfile.userId,
        comment.userProfile.displayName,
        comment.userProfile.avatar,
        context.discussionKey,
        comment.body
      ))
      _ <- Futures.waitFor(2.seconds)
    } yield {
      log.info(s"Successfully sent messages for comment $id by ${comment.userProfile.displayName}")
      ()
    }
  }
}
