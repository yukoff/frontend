package com.gu.discussion.test

import com.gu.automation.core.{WebDriverFactory, GivenWhenThen, WebDriverFeatureSpec}
import com.gu.discussion.step.CommentSteps
import org.openqa.selenium.support.ui.{WebDriverWait, ExpectedConditions}
import org.openqa.selenium.{WebElement, By, WebDriver}
import org.scalatest.Tag
import com.gu.automation.support.{Browser, Config, CookieManager}
import java.util.concurrent.TimeUnit.SECONDS

class CommentTests extends WebDriverFeatureSpec with GivenWhenThen {

  info("Set of Discussion tests to validate commenting on the NGW website")

  feature("As a signed in registered user I can contribute to a discussion") {

    scenarioWeb("Add a new top level comment to an article", Tag("WIP")) {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAnArticleWithComments()
      }.then {
        _.iCanPostANewComment()
      }
    }

    scenarioWeb("Reply to a top level comment", Tag("WIP")) {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAnArticleWithComments()
      }.then {
        _.iCanPostANewReply()
      }
    }

    scenarioWeb("Report a comment") {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanReportAComment()
        //NOTE:  Cannot easily test the endpoint as there is no API but we could use the moderation Tool if necessary
      }
    }

    scenarioWeb("View a users discussion posts") {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iAmSignedInAsStaff()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanViewUserCommentHistory()
      }
    }

    scenarioWeb("Search a users discussion posts") {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iViewAUsersCommentHistory()
      }.then {
        _.iCanSearchUserComments()
      }
    }

    scenarioWeb("Recommend a users comment") {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iAmAGuestUser()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanRecommendAComment()
      }
    }

    scenarioWeb("Navigate through comment pages") {
      implicit driver: WebDriver =>
      given {
        CommentSteps().iAmAGuestUser()
      }.when {
        _.iViewAllComments()
      }.then {
        _.iCanNavigateCommentPages()
      }
    }

    /*
    //Need to wait until Code environment is fixed to allow Picks
    scenarioWeb("Pick a comment to be Featured") {
    implicit driver: WebDriver =>
      given {
        CommentSteps().iAmSignedInAsAMember()
      }.when {
        _.iCanPostANewComment()
        .iAmSignedInAsStaff()
      }.then {
        //Change this to a method to pick a comment here
        _.iViewAllComments()
      }
    }*/

  }

//  override protected def startDriver(testName: String) = {
//    implicit val driver = super.startDriver(testName)
//    driver.manage().timeouts().implicitlyWait(10, SECONDS)
//    CookieManager.addCookie("gu.test", "true")
//    hideNextGenFeedbackBar(driver)
//    driver
//  }

//    override def startDriver(testName: String, targetBrowser: Browser, extraCapabilities: Map[String, String] = Map()): WebDriver = {
//      WebDriverFactory.newInstance(getClass().getSimpleName() + "." + testName, targetBrowser, extraCapabilities)

    override protected def startDriver(testName: String, targetBrowser: Browser, extraCapabilities: Map[String, String] = Map()): WebDriver = {
      implicit val driver = WebDriverFactory.newInstance(getClass().getSimpleName() + "." + testName, targetBrowser, extraCapabilities)
      driver.manage().timeouts().implicitlyWait(10, SECONDS)
      CookieManager.addCookie("gu.test", "true")
      hideNextGenFeedbackBar(driver)
      driver
    }



      def hideNextGenFeedbackBar(driver: WebDriver) {
    driver.get(Config().getTestBaseUrl)
    val wait = new WebDriverWait(driver, 2)
    try {
      val closeButton = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.className("site-message__close-btn")))
      closeButton.click
    }catch {
      case toe: org.openqa.selenium.TimeoutException =>
        logger.info("Feedback bar not found")
    }
  }
}