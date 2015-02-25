import com.amazonaws.regions.Regions
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import play.api.libs.json.{JsValue, Writes}

package object models {
  val client: AmazonDynamoDBAsyncClient = new AmazonDynamoDBAsyncClient().withRegion(Regions.EU_WEST_1)

  implicit class RichJsonWrites[A](jsonWrites: Writes[A]) {
    def collectTransform(pf: PartialFunction[JsValue, JsValue]) = jsonWrites transform { x =>
      if (pf.isDefinedAt(x)) {
        pf(x)
      } else {
        x
      }
    }
  }
}
