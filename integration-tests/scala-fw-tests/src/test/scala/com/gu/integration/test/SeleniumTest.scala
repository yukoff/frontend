package com.gu.integration.test

import org.openqa.selenium.WebDriver
import org.scalatest.Matchers
import com.gu.automation.core.WebDriverFeatureSpec
import com.gu.automation.core.WebDriverFactory
import com.gu.integration.test.config.WebdriverInitialiser.augmentWebDriver

abstract class SeleniumTestSuite extends WebDriverFeatureSpec with Matchers {

  override protected def startDriver(testName: String, extraCapabilities: Map[String, String] = Map()): WebDriver = {
    val map = Map[String,String]("browser_version"-> "30.0","os" ->"Windows","os_version" -> "7", "resolution" -> "1280x1024"
    		,"browserstack.debug"->"true")
    augmentWebDriver(super.startDriver(testName, map))
  }
}