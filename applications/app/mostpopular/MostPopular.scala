package mostpopular

import play.api.libs.json.Json

object MostPopularEntry {
  implicit val jsonFormat = Json.format[MostPopularEntry]
}

case class MostPopularEntry(id: String, views: Int)

object MostPopular {
  implicit val jsonFormat = Json.format[MostPopular]
}

case class MostPopular(
  tagId: String,
  byTimePeriod: Map[String, Seq[MostPopularEntry]]
) {
  val availablePeriods = byTimePeriod.keySet
}
