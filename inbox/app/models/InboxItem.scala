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

  implicit val jsonReads = new Reads[InboxItem] {
    override def reads(json: JsValue): JsResult[InboxItem] = json match {
      case jsObj: JsObject =>
        jsObj \ "type" match {
          case JsString(typ) => typ match {
            case "discussion-reply" =>
              CommentReply.jsonReads.reads(json)

            case "new-article" =>
              NewArticle.jsonReads.reads(json)

            case s =>
              JsError(s"Bad type: $s")
          }

          case _ => JsError("No type")
        }

      case _ =>
        JsError("Not object")
    }
  }
}

sealed trait InboxItem

object CommentReply {
  implicit val jsonReads = Json.reads[CommentReply]

  implicit val jsonWrites = Json.writes[CommentReply].collectTransform({
    case obj: JsObject => obj + ("type" -> JsString("discussion-reply"))
  })
}

case class CommentReply(
  userId: String,
  displayName: String,
  avatar: String,
  discussionKey: String,
  post: String,
  commentId: String
) extends InboxItem

object NewArticle {
  implicit val jsonReads = Json.reads[NewArticle]

  implicit val jsonWrites = Json.writes[NewArticle].collectTransform({
    case obj: JsObject => obj + ("type" -> JsString("new-article"))
  })
}

case class NewArticle(
  id: String,
  headline: String,
  thumbnail: String,
  pic: String
) extends InboxItem
