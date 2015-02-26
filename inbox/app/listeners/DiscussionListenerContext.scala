package listeners

import play.api.{Application, GlobalSettings}

trait DiscussionListenerContext extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    DiscussionListener.start()
  }

  override def onStop(app: Application): Unit = {
    DiscussionListener.stop()
  }
}
