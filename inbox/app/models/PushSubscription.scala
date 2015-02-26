package models

import com.amazonaws.services.dynamodbv2.model._
import play.api.libs.json.Json

import scala.collection.JavaConversions._
import scala.collection.JavaConverters._
import scala.concurrent.Future
import awswrappers.dynamodb._
import scala.concurrent.ExecutionContext.Implicits.global

object PushEndpoint {
  implicit val jsonFormat = Json.format[PushEndpoint]
}

case class PushEndpoint(
  endpoint: String,
  userId: String
)

object PushSubscription {
  val TableName = "inbox-push-subscriptions"

  def subscribe(endpoint: String, userId: String, topic: String) = {
    client.updateItemFuture(new UpdateItemRequest()
      .withTableName(TableName)
      .withKey(Map("topic" -> new AttributeValue().withS(topic)))
      .withAttributeUpdates(Map[String, AttributeValueUpdate](
        "subscriptions" -> new AttributeValueUpdate()
          .withAction(AttributeAction.ADD)
          .withValue(new AttributeValue().withS(Json.stringify(Json.toJson(PushEndpoint(endpoint, userId)))))
      ))
    )
  }

  def unsubscribe(endpoint: String, userId: String, topic: String) = {
    client.updateItemFuture(new UpdateItemRequest()
      .withTableName(TableName)
      .withKey(Map("topic" -> new AttributeValue().withS(topic)))
      .withAttributeUpdates(Map[String, AttributeValueUpdate](
        "subscriptions" -> new AttributeValueUpdate()
          .withAction(AttributeAction.DELETE)
          .withValue(new AttributeValue().withS(Json.stringify(Json.toJson(PushEndpoint(endpoint, userId)))))
      ))
    )
  }

  def getSubscriptions(topic: String): Future[Seq[PushEndpoint]] = {
    client.getItemFuture(new GetItemRequest()
      .withTableName(TableName)
      .withKey(Map("topic" -> new AttributeValue().withS(topic)))) map { response =>
      Option(response.getItem) map { item =>
        item.asScala.get("subscriptions").get.getSS.toSeq map { s =>
          Json.fromJson[PushEndpoint](Json.parse(s)).get
        }
      } getOrElse Seq.empty
    }
  }
}
