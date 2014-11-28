package mostpopular

import services.S3
import play.api.libs.json.Json

import scala.util.Try

object MostPopularApi extends S3 {
  override lazy val bucket = "aws-frontend-most-popular"

  def getMostPopular(tagId: String) = get(s"$tagId.json") flatMap { jsonString =>
    Try {
      val json = Json.fromJson[MostPopular](Json.parse(jsonString)).get
      json
    }.toOption
  }
}
