package controllers

import common.{ExecutionContexts, Edition}
import conf.LiveContentApi
import model.NoCache
import play.api.mvc.{Action, Controller}

object PreviewController extends Controller with ExecutionContexts {

  def previewById(code: String) = Action.async { request =>
    LiveContentApi.item(s"/internal-code/composer/$code", Edition(request)).response.map{ item =>
      NoCache(
        item.content.map(_.id).map(id => Found(s"/$id"))
          // TODO - the next step is to make the "NotFound" part of this more intelligent.
          // if NotFound then it is likely that the content has not yet made it's way into the content api
          // in that case drop an appropriate holding page with a "waiting" message and a timed refresh till it appears
          // or timeout after a number of tries before a 404
          .getOrElse(NotFound)
      )
    }
  }
}
