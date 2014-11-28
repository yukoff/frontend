package controllers

import com.gu.facia.client.models.CollectionConfig
import common.{Edition, ExecutionContexts}
import layout.{CollectionEssentials, FaciaContainer}
import model.Cached
import mostpopular.{MostPopularEntry, MostPopularTrails, MostPopularApi}
import play.api.libs.json.{Json, JsNull}
import play.api.mvc.{AnyContent, Request, Action, Controller}
import services.CollectionConfigWithId
import slices.MostPopular
import views.html.fragments.containers.facia_cards.container

import scala.concurrent.Future

object MostPopularInTagResponse {
  implicit val jsonFormat = Json.format[MostPopularInTagResponse]
}

case class MostPopularInTagResponse(
  availablePeriods: Seq[String],
  period: String,
  body: String
)

object MostPopularInTag extends Controller with ExecutionContexts {
  /** When a browser first asks for most popular, it doesn't know what levels of granularity we have. Provide them in
    * this order.
    */
  val OrderOfPreference = Seq(
    "daily",
    "weekly",
    "monthly",
    "yearly"
  )

  private def makeContainer(
    period: String,
    mostPopular: mostpopular.MostPopular,
    entries: Seq[MostPopularEntry]
  )(implicit request: Request[AnyContent]) = MostPopularTrails.get(entries, Edition(request)) map { trails =>
    Cached(60)(Ok(Json.toJson(MostPopularInTagResponse(
      OrderOfPreference.filter(mostPopular.availablePeriods.contains),
      period,
      container(FaciaContainer.fromConfig(
        0,
        MostPopular,
        CollectionConfigWithId(
          "most-popular",
          CollectionConfig.emptyConfig
        ),
        CollectionEssentials.fromTrails(trails),
        None,
        None
      )).toString()
    ))))
  }

  def emptyResponse = Future.successful(Cached(60)(Ok(Json.toJson(JsNull))))

  def render(tagId: String) = Action.async { implicit request =>
    (for {
      mostPopular <- MostPopularApi.getMostPopular(tagId)
      period <- OrderOfPreference.find(mostPopular.availablePeriods.contains)
      listToShow <- mostPopular.byTimePeriod.get(period)
    } yield makeContainer(period, mostPopular, listToShow)) getOrElse emptyResponse
  }

  def renderPeriod(tagId: String, period: String) = Action.async { implicit request =>
    (for {
      mostPopular <- MostPopularApi.getMostPopular(tagId)
      listToShow <- mostPopular.byTimePeriod.get(period)
    } yield makeContainer(period, mostPopular, listToShow)) getOrElse emptyResponse
  }
}
