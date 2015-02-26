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

  def fromAttributeValues(item: Map[String, AttributeValue]) = {
    for {
      endpoint <- item.get("endpoint").flatMap(x => Option(x.getS))
      userId <- item.get("push_user_id").flatMap(x => Option(x.getS))
    } yield PushEndpoint(endpoint, userId)
  }
}

case class PushEndpoint(
  endpoint: String,
  userId: String
)

object PushSubscription {
  val TableName = "inbox-endpoints"

  def setEndpoint(userId: String, pushEndpoint: PushEndpoint) = {
    client.putItemFuture(new PutItemRequest()
      .withTableName(TableName)
      .withItem(Map[String, AttributeValue](
        "user_id" -> new AttributeValue().withS(userId),
        "endpoint" -> new AttributeValue().withS(pushEndpoint.endpoint),
        "push_user_id" -> new AttributeValue().withS(pushEndpoint.userId)
      ))
    )
  }

  def getEndpoint(userId: String): Future[Option[PushEndpoint]] = {
    client.getItemFuture(new GetItemRequest()
      .withTableName(TableName)
      .withKey(Map[String, AttributeValue](
        "user_id" -> new AttributeValue().withS(userId)
      ))
    ) map { response =>
      Option(response.getItem).flatMap(item => PushEndpoint.fromAttributeValues(item.asScala.toMap))
    }
  }
}
