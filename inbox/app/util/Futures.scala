package util

import common.ExecutionContexts

import scala.concurrent.{Future, Promise}
import scala.concurrent.duration.FiniteDuration
import play.libs.Akka.system

object Futures extends ExecutionContexts {
  def waitFor(time: FiniteDuration): Future[Unit] = {
    val p = Promise[Unit]()

    system.scheduler.scheduleOnce(time) {
      p.success(())
    }

    p.future
  }
}
