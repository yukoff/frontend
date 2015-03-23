package model.diagnostics.quizzes

import java.text.SimpleDateFormat

import common.ExecutionContexts
import conf.Configuration
import org.json4s.native.JsonMethods._
import org.json4s.{DefaultFormats, Extraction}
import play.api.Logger
import shade.memcached.{Memcached, Configuration => MemcachedConf}

import scala.concurrent.duration.Duration

trait JsonImplicits {
  implicit val formats = new DefaultFormats {
    override def dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
  } ++ org.json4s.ext.JodaTimeSerializers.all
}

object Quizzes extends ExecutionContexts with JsonImplicits {
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), memcachedExecutionContext)

  def updateMultiChoiceQuiz(json: String) = {
    val quizUpdate = parse(json).extract[MultiChoiceQuizUpdate]
    val newStats = aggregateMultiChoiceResults(quizUpdate)

    for {
      stat <- newStats
    } yield {
      memcached.set[MultiChoiceQuizAggregate](quizUpdate.quizId, stat, Duration.Undefined)
    }
  }

  private def aggregateMultiChoiceResults(quizUpdate: MultiChoiceQuizUpdate) = {
    val loadedResults = memcached.get[MultiChoiceQuizAggregate](quizUpdate.quizId).recover {
      case e: Exception =>
        Logger.error(e.getMessage)
        None
    }
    loadedResults.map{ loaded =>
      val (newAggregatedResponses, newTime) = loaded match {
        case Some(loadedResult) =>
          (incrementMultiChoiceAggregatedCounts(quizUpdate.questions, loadedResult), loadedResult.timeSeconds + quizUpdate.timeSeconds)
        case None =>
          (initialMultiChoiceAggregatedCounts(quizUpdate.questions), quizUpdate.timeSeconds)
      }
      MultiChoiceQuizAggregate(quizUpdate.quizId, newAggregatedResponses, newTime)
    }
  }

  private def initialMultiChoiceAggregatedCounts(questions: List[MultiChoiceQuizResponse]) = {
    questions.map{ question =>
      if (question.isCorrect) {
        MultiChoiceAggregatedResponse(question.questionNum, 1L, 0L)
      } else {
        MultiChoiceAggregatedResponse(question.questionNum, 0L, 1L)
      }
    }
  }
  
  private def incrementMultiChoiceAggregatedCounts(newResponses: List[MultiChoiceQuizResponse], loadedResult: MultiChoiceQuizAggregate) = {
    newResponses.flatMap { newResponse =>
      loadedResult.responses.collect {
        case oldResponse if oldResponse.questionNum == newResponse.questionNum =>
          if (newResponse.isCorrect) {
            MultiChoiceAggregatedResponse(oldResponse.questionNum, oldResponse.correctCount + 1, oldResponse.incorrectCount)
          } else {
            MultiChoiceAggregatedResponse(oldResponse.questionNum, oldResponse.correctCount, oldResponse.incorrectCount + 1)
          }
        case oldResult => oldResult
      }
    }
  }

}

case class MultiChoiceQuizUpdate (
  quizId: String,
  questions: List[MultiChoiceQuizResponse],
  timeSeconds: Long) extends JsonImplicits
{
  def toJson = Extraction.decompose(this)
}

case class MultiChoiceQuizResponse(questionNum: Int, isCorrect: Boolean)

case class MultiChoiceQuizAggregate (
  quizId: String,
  responses: List[MultiChoiceAggregatedResponse],
  timeSeconds: Long) extends JsonImplicits
{
  def toJson = Extraction.decompose(this)
}

case class MultiChoiceAggregatedResponse(questionNum: Int, correctCount: Long, incorrectCount: Long)
