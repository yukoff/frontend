package models

import com.amazonaws.regions.Regions
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
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
  val client: AmazonDynamoDBAsyncClient = new AmazonDynamoDBAsyncClient().withRegion(Regions.getCurrentRegion)

  val TableName = "inbox-feeds"

  def addPost(userId: String, post: InboxItem) = {
    val body = Json.stringify(Json.toJson(post))

    client.putItemFuture(new PutItemRequest()
      .withTableName(TableName)
      .withItem(Map[String, AttributeValue](
        "user_id" -> new AttributeValue().withS(userId),
        "added_at" -> new AttributeValue().withN(System.currentTimeMillis().toString),
        "message" -> new AttributeValue().withS(body),
        "read" -> new AttributeValue().withBOOL(false)
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
