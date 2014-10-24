package services

import common.{ Logging, ExecutionContexts }
import conf.AdminConfiguration
import org.joda.time.DateTime
import play.api.libs.json.{ JsObject, JsValue, Json }
import play.api.libs.ws.WS
import scala.concurrent.Future

case class UrlCrawlError(pageUrl: String, last_crawled: DateTime, first_detected: DateTime, responseCode: Int)

object GoogleWMTAPI extends ExecutionContexts with Logging {
  def apply(): Future[List[UrlCrawlError]] = {
    val site = "http://www.theguardian.com/"
    val platforms = List("mobile", "web")
    val wmtApiUrl = "https://www.googleapis.com/webmasters/v3/sites/http://www.theguardian.com/urlCrawlErrorsSamples"
    val futureResponses: Future[List[String]] = Future.sequence( platforms map { platform =>
      WS.url(s"$wmtApiUrl?category=notFound&platform={$platform}&key=${AdminConfiguration.googleWMTApiKey}").get() map { _.body } }
    )

    futureResponses map { responses =>
      responses flatMap { body =>
        val json: JsValue = Json.parse(body)
        val samples: List[JsValue] = (json \ "urlCrawlErrorSample").as[JsObject].values.toList

        log.info(s"Loaded ${samples.size} crawl errors")

        samples map { sample =>
          val pageUrl: String = (sample \ "pageUrl").as[String]
          val lastCrawledDate: DateTime = (sample \ "last_crawled").as[DateTime]
          val firstDetectedDate: DateTime = (sample \ "first_detected").as[DateTime]
          val responseCode: Int = (sample \ "responseCode").as[Int]
          UrlCrawlError(pageUrl, lastCrawledDate, firstDetectedDate, responseCode)
        }
      }
    }
  }
}
