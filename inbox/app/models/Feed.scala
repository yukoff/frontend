package models

import com.amazonaws.services.dynamodbv2.model._
import common.ExecutionContexts
import org.joda.time.DateTime
import play.api.libs.json.{JsValue, Json}
import awswrappers.dynamodb._
import scala.collection.JavaConversions._
import scala.collection.JavaConverters._
import scala.concurrent.Future
import scala.util.Try

object FeedItem {
  implicit val jsonWrites = Json.writes[FeedItem]

  def fromAttributeValues(item: Map[String, AttributeValue]) = {
    Try {
      FeedItem(
        new DateTime(item("added_at").getN.toLong),
        Json.parse(item("message").getS),
        item("read").getBOOL
      )
    }
  }
}

case class FeedItem(
  addedAt: DateTime,
  message: JsValue,
  read: Boolean
)

object Feed extends ExecutionContexts {
  val TableName = "inbox-feeds"

  private def key(userId: String, addedAt: Long) = Map[String, AttributeValue](
    "user_id" -> new AttributeValue().withS(userId),
    "added_at" -> new AttributeValue().withN(addedAt.toString)
  )

  def addPost(userId: String, post: InboxItem) = {
    val body = Json.stringify(Json.toJson(post))

    client.putItemFuture(new PutItemRequest()
      .withTableName(TableName)
      .withItem(key(userId, System.currentTimeMillis()) ++ Map[String, AttributeValue](
        "message" -> new AttributeValue().withS(body),
        "read" -> new AttributeValue().withBOOL(false)
      ))
    )
  }

  def setRead(userId: String, addedAt: Long) = {
    client.updateItemFuture(new UpdateItemRequest()
      .withTableName(TableName)
      .withKey(key(userId, addedAt))
      .withAttributeUpdates(Map[String, AttributeValueUpdate](
        "read" -> new AttributeValueUpdate()
          .withAction(AttributeAction.PUT)
          .withValue(new AttributeValue().withBOOL(true))
      ))
    )
  }

  def getPosts(userId: String): Future[Seq[FeedItem]] = {
    client.queryFuture(new QueryRequest()
      .withTableName(TableName)
      .withAttributesToGet("added_at", "message", "read")
      .withKeyConditions(Map[String, Condition](
        "user_id" -> new Condition()
          .withComparisonOperator(ComparisonOperator.EQ)
          .withAttributeValueList(new AttributeValue().withS(userId))
      ))
    ) map { queryResult =>
      queryResult.getItems.toIndexedSeq.toSeq flatMap { item =>
        FeedItem.fromAttributeValues(item.asScala.toMap).toOption
      }
    }
  }
}
