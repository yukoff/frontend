package controllers.admin

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import awswrappers.dynamodb._
import com.amazonaws.services.dynamodbv2.model._
import common.ExecutionContexts
import org.joda.time.{ DateTime }
import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.util.Try
import play.api.mvc.{Action, Controller}
import common.{ExecutionContexts, JsonComponent}
import play.api.libs.json._

import scalaz.std.list._
import scalaz.std.anyVal._
import scalaz.std.map._
import scalaz.std.tuple._
import scalaz.syntax.traverse._
import conf.Configuration
import play.api.libs.json.JsObject
import play.api.libs.json.JsString
import play.api.libs.json.JsNumber

case class PerformanceBenchmark(timestamp: Int, benchmarkName: String, benchmarkData: JsValue) {
  lazy val json: JsObject = JsObject(Seq(
    "timestamp" -> JsNumber(timestamp),
    "benchmarkName" -> JsString(benchmarkName),
    "benchmarkData" -> benchmarkData
  ))
}

object PerformanceBenchmarkController extends Controller with ExecutionContexts {
  private val TableName = "perf"
  private val dynamoDbClient = new AmazonDynamoDBAsyncClient()
  dynamoDbClient.setRegion(Region.getRegion(Regions.EU_WEST_1))

  def index = Action { implicit request =>
    Ok(views.html.performanceBenchmarks(Configuration.environment.stage))
  }

  def get30days(): Future[Seq[PerformanceBenchmark]] = {
    val ts = (DateTime.now().minusDays(30).getMillis / 1000).toString
    dynamoDbClient.scanFuture(new ScanRequest()
      .withTableName(TableName)
      .withScanFilter(Map[String, Condition](
      "timestamp" -> new Condition()
        .withComparisonOperator(ComparisonOperator.GE)
        .withAttributeValueList(new AttributeValue().withN(ts))
    ))
    ) map { response =>
      response.getItems map { item =>
        PerformanceBenchmark(
          item.get("timestamp").getN.toInt,
          item.get("benchmark_name").getS,
          Json.parse(item.get("benchmark_data").getS)
        )
      }
    }
  }

  def jsonData = Action.async { implicit request =>
    get30days map { benchmarks =>
      JsonComponent.forJsValue(Json.toJson(benchmarks.map(_.json)))
    }
  }

}
