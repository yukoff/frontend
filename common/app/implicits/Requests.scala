package implicits

import conf.Switches
import play.api.http.MediaRange
import play.api.mvc.RequestHeader

trait Requests {

  private val imgixTestSections: Seq[String] = Seq("/uk/money", "/au/money", "/uk/money", "/money")

  implicit class RichRequestHeader(r: RequestHeader) {

    def getParameter(name: String): Option[String] = r.queryString.get(name).flatMap(_.headOption)

    def getParameters(name: String): Seq[String] = r.queryString.getOrElse(name, Nil)

    def getIntParameter(name: String): Option[Int] = getParameter(name).map(_.toInt)

    def getBooleanParameter(name: String): Option[Boolean] = getParameter(name).map(_.toBoolean)

    lazy val isJson: Boolean = r.getQueryString("callback").isDefined || r.path.endsWith(".json")

    lazy val isRss: Boolean = r.path.endsWith("/rss")

    lazy val isWebp: Boolean = {
      val requestedContentType = r.acceptedTypes.sorted(MediaRange.ordering)
      val imageMimeType = requestedContentType.find(media => media.accepts("image/jpeg")|| media.accepts("image/webp"))
      imageMimeType.exists(_.mediaSubType == "webp")
    }

    lazy val hasParameters: Boolean = r.queryString.nonEmpty

    lazy val isHealthcheck: Boolean = r.headers.keys.exists(_ equalsIgnoreCase  "X-Gu-Management-Healthcheck")

    def isInImgixTest: Boolean = Switches.ImgixSwitch.isSwitchedOn && (imgixTestSections.exists(r.path.startsWith) || getParameter("inImgixTest").nonEmpty)

    // see http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/TerminologyandKeyConcepts.html#x-forwarded-proto
    lazy val isSecure: Boolean = r.headers.get("X-Forwarded-Proto").exists(_.equalsIgnoreCase("https"))

    //This is a header reliably set by jQuery for AJAX requests used in facia-tool
    lazy val isXmlHttpRequest: Boolean = r.headers.get("X-Requested-With").exists(_ == "XMLHttpRequest")
  }
}

object Requests extends Requests
