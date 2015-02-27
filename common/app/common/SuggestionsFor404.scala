package common


import conf.LiveContentApi
import conf.LiveContentApi._
import model.Content

import scala.concurrent.Future

trait SuggestionsFor404 extends ExecutionContexts {
  def suggestionsFor404(path: String): Future[Seq[Content]] = {
    getResponse(LiveContentApi.search.q(path)) map {
      _.results map (Content(_))
    }
  }
}
