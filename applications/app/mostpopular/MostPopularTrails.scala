package mostpopular

import common.{ExecutionContexts, Edition}
import conf.LiveContentApi
import model.Content

import scala.concurrent.Future

object MostPopularTrails extends ExecutionContexts {
  def get(entries: Seq[MostPopularEntry], edition: Edition): Future[List[Content]] = {
    LiveContentApi.search(edition)
      .ids(entries.map(_.id.stripPrefix("/")).mkString(","))
      .response
      .map(response => response.results.map(Content(_)))
  }
}
