package listeners

import common.ExecutionContexts
import models._
import play.api.libs.json.Json
import play.api.libs.ws.WS
import play.api.Play.current

object Publisher extends ExecutionContexts {
  def sendPushNotification(endpoint: PushEndpoint) = {
    WS.url(endpoint.endpoint).post(Json.obj(
      "registration_id" -> endpoint.userId,
      "data.data" -> "{}"
    ))
  }

  def publish(topic: String, item: InboxItem) = {
    Subscription.getSubscriptions(topic) map { subscriptions =>
      for {
        subscription <- subscriptions ++ Seq("rob_test_3")
      } {
        Feed.addPost(subscription, item)

        PushSubscription.getEndpoint(subscription) map { endpoint =>
          endpoint.foreach(sendPushNotification)
        }
      }
    }
  }
}
