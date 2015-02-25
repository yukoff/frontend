import play.api.libs.json.{JsValue, Writes}

package object models {
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
