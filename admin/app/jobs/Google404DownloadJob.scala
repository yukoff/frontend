package jobs

import common.Logging
import services.GoogleWMTAPI
import scala.concurrent.Await
import scala.concurrent.duration._

object Google404DownloadJob extends Logging {
  def run() {
    log.info("Loading 404 samples from Google to S3.")
    val samples = Await.result(GoogleWMTAPI(), 1.minute)
    log.info("Saving %d new 404 samples" format samples.size)
    log.info("TBC: Where to put these log entries?!")
  }
}
