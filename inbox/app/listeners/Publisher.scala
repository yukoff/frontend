package listeners

import common.ExecutionContexts
import models.{Feed, Subscription, InboxItem}

object Publisher extends ExecutionContexts {
  def publish(topic: String, item: InboxItem) = {
    Subscription.getSubscriptions(topic) map { subscriptions =>
      for {
        subscription <- subscriptions
      } {
        Feed.addPost(subscription, item)
      }
    }
  }
}
