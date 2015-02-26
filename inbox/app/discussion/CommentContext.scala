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
  isoDateTime: String,
  status: String,
  userProfile: UserProfile
)

object CommentAndStatus {
  implicit val jsonReads = Json.reads[CommentAndStatus]
}

case class CommentAndStatus(
  status: String,
  comment: Comment
)

object CommentContext {
  implicit val jsonReads = Json.reads[CommentContext]
}

case class CommentContext(
  commentId: Long,
  commentAncestorId: Long,
  discussionKey: String,
  discussionWebUrl: String,
  page: Int
)
