package common

import common.editions._
import model.MetaData
import org.scalatest.{OptionValues, Matchers, FlatSpec}

class NavigationTest extends FlatSpec with Matchers with OptionValues {
  "topLevelItem" should "return culture for games" in {
    Navigation.topLevelItem(Uk.briefNav, new MetaData {
      override def id: String = "technology/games"
      override def section: String = "technology"
      override def analyticsName: String = ???
      override def webTitle: String = ???
    }).value.name.title shouldEqual "culture"
  }
  "UK brief nav 'world'" should "contain 'cities'" in {
    Uk.briefNav.filter(_.name.title == "world").flatMap {
      _.links.filter(_.title == "cities")
    }.isEmpty shouldEqual false
  }
  "US brief nav 'world'" should "not contain 'cities'" in {
    Us.briefNav.filter(_.name.title == "world").flatMap {
      _.links.filter(_.title == "cities")
    }.isEmpty shouldEqual true
  }
  "AU brief nav 'world'" should "not contain 'cities'" in {
    Au.briefNav.filter(_.name.title == "world").flatMap {
      _.links.filter(_.title == "cities")
    }.isEmpty shouldEqual true
  }
  "UK full nav" should "contain 'membership'" in {
    Uk.navigation.filter(_.name.title == "membership").isEmpty shouldEqual false
  }
  "US full nav" should "not contain 'membership'" in {
    Us.navigation.filter(_.name.title == "membership").isEmpty shouldEqual true
  }
  "AU full nav" should "not contain 'membership'" in {
    Au.navigation.filter(_.name.title == "membership").isEmpty shouldEqual true
  }
  "UK full nav" should "not contain 'education' or 'media'" in {
    Uk.navigation.filter(n => n.name.title == "education" || n.name.title == "media").isEmpty shouldEqual true
  }
}
