package test

import org.scalatest.{Matchers, FlatSpec, DoNotDiscover}
import play.api.test.FakeRequest
import play.api.test.Helpers._

@DoNotDiscover class PreviewControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "PreviewController" should "redirect a composer ID to the correct URL" in {
    val Some(result) = route(FakeRequest("GET", "/preview/internal/548ec2b1e4b0a271100e61f3"))
    status(result) should be (302)
    header("Location", result).get should be ("/uk-news/2014/dec/15/four-boys-arrested-man-stabbed-to-death-edmonton-london")
  }

}
