package model.diagnostics.quizzes

import java.text.SimpleDateFormat

import common.ExecutionContexts
import conf.Configuration
import org.json4s.native.JsonMethods._
import play.api.Logger
import shade.memcached.{Configuration => MemcachedConf, Codec, Memcached}
import org.json4s.{DefaultFormats, Extraction}

import scala.concurrent.Future
import scala.concurrent.duration.Duration

trait JsonImplicits {
  implicit val formats = new DefaultFormats {
    override def dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
  } ++ org.json4s.ext.JodaTimeSerializers.all
}

object Quizzes extends ExecutionContexts with JsonImplicits {
  lazy val host = Configuration.memcached.host.head
  lazy val memcached = Memcached(MemcachedConf(host), memcachedExecutionContext)

  def update(json: String) = {
    val quizUpdate = parse(json).extract[QuizUpdate]
    val oldStats = aggregatedResults(quizUpdate.quizId)

    for {
      stat <- oldStats
    } yield {
      val newResults = quizUpdate.questions.flatMap{ question =>
        if (stat.results.nonEmpty) {
          stat.results.collect{
            case oldResult if oldResult.questionNum == question.number && oldResult.answerNum == question.response =>
              AggregatedResponse(oldResult.questionNum, oldResult.answerNum, oldResult.answerCount + 1)
            case oldResult => oldResult
          }
        } else {
          // if this is the first time we've ever seen results for this quiz, we need to know the full picture
          // of the possible responses so we can compile the aggregate properly. Currently the only way to find that
          // out is if the json in the update from the browser supplies it all the time.
          List(AggregatedResponse(question.number, question.response, 1L))  // this is insufficient!
        }
      }
      val newAggregate = stat.copy(results = newResults)
      // todo: Duration.Undefined??
      memcached.set[QuizAggregate](quizUpdate.quizId, newAggregate, Duration.Undefined)
    }
  }

  def aggregatedResults(quizId: String): Future[QuizAggregate] = {
    memcached.get[QuizAggregate](quizId).recover {
      case e: Exception =>
        Logger.error(e.getMessage)
        None
    }
  }.map(_.getOrElse(QuizAggregate(quizId, Nil, 0)))
}

case class QuizUpdate (
  quizId: String,
  questions: List[QuizQuestion],
  timeSeconds: Long) extends JsonImplicits
{
  def toJson = Extraction.decompose(this)
}

case class QuizQuestion(number: Int, response: Int)

case class QuizAggregate (
  quizId: String,
  results: List[AggregatedResponse],
  timeSeconds: Long) extends JsonImplicits
{
  def toJson = Extraction.decompose(this)
}

case class AggregatedResponse(questionNum: Int, answerNum: Int, answerCount: Long)
