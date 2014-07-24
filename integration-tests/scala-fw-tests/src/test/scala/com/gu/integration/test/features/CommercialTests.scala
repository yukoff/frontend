package com.gu.integration.test.features

import org.openqa.selenium.WebDriver
import com.gu.integration.test.SeleniumTestSuite
import com.gu.integration.test.tags.ReadyForProd
import org.openqa.selenium.JavascriptExecutor

class CommercialTests extends SeleniumTestSuite {
  
  feature("Commercial") { 
    scenarioWeb("checking ad slots are properly displayed on a specific article page", ReadyForProd) { implicit driver: WebDriver =>
      val articlePage = ArticleSteps().goToArticle("/politics/2014/jul/01/michael-gove-lord-harris")
      driver.asInstanceOf[JavascriptExecutor].executeScript("window.scrollBy(0,10000)", "");
      ArticleSteps().checkThatTopBannerAdIsDisplayedProperly(articlePage)
      ArticleSteps().checkThatAdToTheRightIsDisplayedProperly(articlePage)
      ArticleSteps().checkThatInlineAdIsDisplayedProperly(articlePage)
      
      //The below step will NOT work on SauceLabs/Browserstack due to the servers being outside of UK
      //However it will work when running locally
      //ArticleSteps().checkThatBottomMerchandisingAdIsDisplayedProperly(articlePage)
    }
  }
}