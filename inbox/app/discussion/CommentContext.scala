package discussion

import org.joda.time.DateTime
import play.api.libs.json.Json

object UserProfile {
  implicit val jsonReads = Json.reads[UserProfile]
}

case class UserProfile(
  userId: String,
  displayName: String,
  avatar: String
)

object Comment {
  implicit val jsonReads = Json.reads[Comment]
}

case class Comment(
  id: Long,
  body: String,
  isoDateTime: DateTime,
  status: String,
  userProfile: UserProfile
)

object CommentContext {
  implicit val jsonReads = Json.reads[CommentContext]
}

case class CommentContext(
  commentId: Long,
  ancestorId: Long,
  discussionKey: String
)
