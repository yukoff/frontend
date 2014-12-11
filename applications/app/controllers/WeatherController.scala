package controllers

import common.editions.{Au, Us, Uk}
import common.{Edition, ExecutionContexts}
import conf.Configuration
import play.api.libs.json.{Json, JsValue}
import play.api.libs.ws.WS
import play.api.mvc.{RequestHeader, Action, Controller}

import scala.concurrent.Future

object WeatherController extends Controller with ExecutionContexts {
  import play.api.Play.current

  val LocationHeader: String = "X-GU-GeoCity"

  val London: CityId = CityId("328328")
  val NewYork: CityId = CityId("349727")
  val Sydney: CityId = CityId("22889")

  sealed trait ApiError { val message: String }
  object KeyNotSet extends ApiError { val message: String = "Weather API Key not set" }
  object CityNotFound extends ApiError { val message: String = "City not found"}

  case class City(name: String) extends AnyVal
  case class CityId(id: String) extends AnyVal

  case class WeatherUrl(url: String) extends AnyVal

  val weatherApiKey: Option[String] = Configuration.weather.apiKey

  val weatherCityUrl: String = "http://api.accuweather.com/currentconditions/v1/"
  val weatherSearchUrl: String = "http://api.accuweather.com/locations/v1/cities/search.json"

  private def weatherUrlForCity(city: City): Either[ApiError, WeatherUrl] =
    weatherApiKey match {
      case Some(apiKey) => Right(WeatherUrl(s"$weatherSearchUrl?apikey=$apiKey&q=${city.name}"))
      case None => Left(KeyNotSet)}

  private def weatherUrlForCityId(cityId: CityId): Either[ApiError, WeatherUrl] =
    weatherApiKey match {
      case Some(apiKey) => Right(WeatherUrl(s"$weatherCityUrl${cityId.id}.json?apikey=$apiKey"))
      case None => Left(KeyNotSet)}

  private def getCityIdForCity(city: City): Future[Either[ApiError, CityId]] =
    weatherUrlForCity(city) match {
      case Right(weatherUrl) =>
        for (cityJson <- WS.url(weatherUrl.url).get().map(_.json))
        yield {
          val cities = cityJson.asOpt[List[JsValue]].getOrElse(Nil)
          cities.map(j => (j \ "Key").as[String]).headOption.map(CityId).map(Right(_)).getOrElse(Left(CityNotFound))
        }
      case Left(apiError) => Future.successful(Left(apiError))

    }

  private def getWeatherForCityId(cityId: CityId): Future[Either[ApiError, JsValue]] =
    weatherUrlForCityId(cityId) match {
      case Right(weatherUrl) => WS.url(weatherUrl.url).get().map(_.json).map(Right(_))
      case Left(apiError) => Future.successful(Left(apiError))
    }

  private def getCityIdFromRequestEdition(request: RequestHeader): CityId =
    Edition(request) match {
      case Uk => London
      case Us => NewYork
      case Au => Sydney
    }

  private def getCityIdFromRequest(request: RequestHeader): Future[CityId] = {
    lazy val cityIdFromRequestEdition: CityId = getCityIdFromRequestEdition(request)
    request.headers.get(LocationHeader) match {
      case Some(city) =>
        getCityIdForCity(City(city)).map {
          case Right(cityId) => cityId
          case Left(apiError) => cityIdFromRequestEdition
        }
      case None => Future.successful(cityIdFromRequestEdition)
    }
  }

  def forCity(name: String) = Action.async { implicit request =>
    getCityIdForCity(City(name)).flatMap {
      case Right(cityId) => getWeatherForCityId(cityId).map {
        case Right(json) => Ok(json)
        case Left(apiError) => NotFound(Json.toJson(apiError.message))
      }
      case Left(apiError) => Future.successful(NotFound(Json.toJson(apiError.message)))
    }
  }

  def forRequest() = Action.async { implicit request =>
    getCityIdFromRequest(request).flatMap { cityId =>
      getWeatherForCityId(cityId).map {
        case Right(json) => Ok(json)
        case Left(apiError) => NotFound(Json.toJson(apiError.message))}}}

}
