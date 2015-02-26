package models

import play.api.libs.json._

object InboxItem {
  implicit val jsonWrites = new Writes[InboxItem] {
    override def writes(o: InboxItem): JsValue = o match {
      case reply: CommentReply =>
        CommentReply.jsonWrites.writes(reply)

      case newArticle: NewArticle =>
        NewArticle.jsonWrites.writes(newArticle)
    }
  }
}

sealed trait InboxItem

object CommentReply {
  implicit val jsonWrites = Json.writes[CommentReply].collectTransform({
    case obj: JsObject => obj + ("type" -> JsString("discussion-reply"))
  })
}

case class CommentReply(
  userId: String,
  displayName: String,
  avatar: String,
  discussionKey: String,
  post: String
) extends InboxItem

object NewArticle {
  implicit val jsonWrites = Json.writes[NewArticle].collectTransform({
    case obj: JsObject => obj + ("type" -> JsString("new-article"))
  })
}

case class NewArticle(
  id: String,
  headline: String,
  thumbnail: String
) extends InboxItem
