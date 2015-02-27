package models

import common.HTML
import org.joda.time.DateTime
import play.api.libs.json.Json

object PushPost {
  implicit val jsonWrites = Json.writes[PushPost]

  def fromInboxItem(inboxItem: InboxItem): PushPost = inboxItem match {
    case CommentReply(_, displayName, avatar, url, post, _) =>
      PushPost(Some(avatar), url, displayName, HTML.noHtml(post))

    case NewArticle(id, headline, thumbnail, trail) =>
      PushPost(Some(thumbnail), id, headline, trail)
  }
}

case class PushPost(
  image: Option[String],
  url: String,
  title: String,
  body: String
)

object PushPostWrapper {
  implicit val jsonWrites = Json.writes[PushPostWrapper]

  def fromFeedItem(feedItem: FeedItem) = PushPostWrapper(
    feedItem.addedAt,
    PushPost.fromInboxItem(feedItem.message),
    feedItem.read
  )
}

case class PushPostWrapper(
  addedAt: DateTime,
  message: PushPost,
  read: Boolean
)
