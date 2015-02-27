package listeners

import common.{Logging, ExecutionContexts}
import models._
import play.api.libs.json.{JsString, Json}
import play.api.libs.ws.WS
import play.api.Play.current

import scala.util.{Failure, Success}

object Publisher extends ExecutionContexts with Logging {
  def sendPushNotification(endpoint: PushEndpoint) = {
    log.info(endpoint.toString)
    WS.url(endpoint.endpoint).withHeaders(("Authorization", "key=AIzaSyD8fZGjGrC4GDVsE33yv4sCcD7AYpGEZ_o")).post(Json.obj(
      "registration_ids" -> Json.arr(JsString(endpoint.userId))
    )) onComplete {
      case Success(x) => log.info(x.status + " " + x.statusText + "\n" + x.body)
      case Failure(error) => log.error("ERRORZ", error)
    }
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
