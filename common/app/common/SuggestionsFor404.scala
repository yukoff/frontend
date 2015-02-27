package common


import conf.LiveContentApi
import conf.LiveContentApi._
import model.Content

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

trait SuggestionsFor404 extends ExecutionContexts {
  def suggestionsFor404(path: String): List[Content] = {
    val future: Future[List[Content]] = getResponse(LiveContentApi.search.q(path)) map {
      _.results map (Content(_))
    }

    Await.result(future, Duration.Inf)
  }
}
