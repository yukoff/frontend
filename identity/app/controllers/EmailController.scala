package controllers

import com.google.inject.{Inject, Singleton}
import services.{IdentityRequest, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.{TrackingData, IdApiClient}
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._
import scala.concurrent.Future
import model.{EmailSubscriptions, IdentityPage}
import play.api.data._
import client.{Auth, Error}
import com.gu.identity.model.{EmailList, User, Subscriber}
import play.filters.csrf._
import scala.util.{Try, Failure, Success}
import client.Response
import actions.AuthRequest
import net.liftweb.json.JsonDSL._


@Singleton
class EmailController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                conf: IdentityConfiguration,
                                api: IdApiClient,
                                idRequestParser: IdRequestParser,
                                idUrlBuilder: IdentityUrlBuilder,
                                authAction: actions.AuthenticatedAction)
  extends Controller with ExecutionContexts with SafeLogging {
  import EmailPrefsData._

  val page = IdentityPage("/email-prefs", "Email preferences", "email-prefs")

  def preferences = CSRFAddToken {
    authAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)
        populateForm(request.user.getId(), request.auth, idRequest.trackingData) map {
          form =>
            checkForm(form)
            val subscribedTo = form.data.filter(_._1.startsWith("emailListSubscriptions")).map(_._2)
            Ok(views.html.profile.emailPrefs(page, form, formActionUrl(idUrlBuilder, idRequest), EmailSubscriptions(subscribedTo)))
        }
    }
  }

  def savePreferences = CSRFCheck {
    authAction.async {
      implicit request =>
        val boundForm = emailPrefsForm.bindFromRequest
        boundForm.fold({
          case formWithErrors: Form[EmailPrefsData] =>
            logger.info(s"Error saving user email preference, ${formWithErrors.errors}")
            val idRequest = idRequestParser(request)
            Future.successful(Ok(views.html.profile.emailPrefs(page, formWithErrors, formActionUrl(idUrlBuilder, idRequest), EmailSubscriptions())))
        }, {
          case prefs: EmailPrefsData =>
            val idRequest = idRequestParser(request)
            updatePrefs(prefs, boundForm, idRequest.trackingData) map {
              form =>
                Ok(views.html.profile.emailPrefs(page, form, formActionUrl(idUrlBuilder, idRequest), EmailSubscriptions()))
            }
        })
    }
  }

  def saveEmailListSubscription = CSRFCheck {
    authAction.async { implicit request =>

    }
  }

  protected def updatePrefs[A](prefs: EmailPrefsData, boundForm: Form[EmailPrefsData], tracking: TrackingData)
                           (implicit request: AuthRequest[A]): Future[Form[EmailPrefsData]] = {
    logger.trace("Updating user email prefs")
    val userId = request.user.id
    val auth = request.auth
    val newStatusFields = ("receiveGnmMarketing" -> prefs.receiveGnmMarketing) ~ ("receive3rdPartyMarketing" -> prefs.receive3rdPartyMarketing)
    val subscriber = Subscriber(prefs.htmlPreference, prefs.emailListSubscriptions.map{ listId => EmailList(listId = listId) })

    val futureStatusFields = api.updateUserStatusFields(userId, auth, tracking, newStatusFields)
    val futureNothing = api.updateUserEmails(userId, subscriber, auth, tracking)
    // Kick off the requests
    val f1 = futureStatusFields
    val f2 = futureNothing

    val form = for {
      statusFields <- f1
      nothing <- f2
    } yield {
      (statusFields, nothing) match {
        case (Right(sf), Right(n)) => emailPrefsForm.fill(
          EmailPrefsData(
            sf.isReceiveGnmMarketing,
            sf.isReceive3rdPartyMarketing,
            subscriber.htmlPreference,
            subscriber.subscriptions.map(_.listId)
          )
        )
        case (eitherStatusFields, eitherNothing) => {
          val errors = eitherStatusFields.left.getOrElse(Nil) ++ eitherNothing.left.getOrElse(Nil)
          // TODO: Add errors to form
          emailPrefsForm.fill(EmailPrefsData(
            prefs.receiveGnmMarketing,
            prefs.receive3rdPartyMarketing,
            subscriber.htmlPreference,
            subscriber.subscriptions.map(_.listId)
          ))
        }
      }
    }

    form
  }

  protected def checkForm(form: Form[EmailPrefsData]){
    if(form.hasErrors) logger.error("Email prefs form has errors: " + form.errors)
    form.value foreach { prefs =>
      val htmlPref = prefs.htmlPreference
      if(!isValidHtmlPreference(htmlPref))
        logger.error("Email prefs form invalid htmlPreference: " + htmlPref)
    }
  }

  protected def populateForm(userId: String, auth: Auth, trackingData: TrackingData): Future[Form[EmailPrefsData]] = {
    val futureUser = api.user(userId, auth)
    val futureSubscriber = api.userEmails(userId, trackingData)

    futureForm(futureUser, futureSubscriber, emailPrefsForm){
      (user, subscriber) =>
        emailPrefsForm.fill(
          EmailPrefsData(
            user.statusFields.isReceiveGnmMarketing,
            user.statusFields.isReceive3rdPartyMarketing,
            subscriber.htmlPreference,
            subscriber.subscriptions.map(_.listId)
          )
        )
    }
  }

  protected def futureForm[S](f1: Future[Response[User]], f2: Future[Response[S]], form: Form[EmailPrefsData])
                             (right: (User, S) => Form[EmailPrefsData]): Future[Form[EmailPrefsData]] = {
    val futures = f1 zip f2
    futures onFailure {case t: Throwable => logger.error("Exception while fetching user and email prefs", t)}
    futures map {
      results =>
        logExceptions {
          results match {
            case (Right(user), Right(s)) => right(user, s)

            case (eitherUser, eitherS) =>
              val errors = eitherUser.left.getOrElse(Nil) ++ eitherS.left.getOrElse(Nil)
              errors.foldLeft(form) {
                case (errForm, Error(message, description, _, context)) =>
                  logger.error(s"Error while fetching user and email prefs: $message")
                  errForm.withError(context.getOrElse(""), description)
              }
          }
        }
    }
  }

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest): String = idUrlBuilder.buildUrl("/email-prefs", idRequest)

  protected def logExceptions[T](f: => T): T = {
    Try(f) match {
      case Success(result) => result

      case Failure(t) =>
        logger.error("Exception while fetching user and email prefs", t)
        throw t
    }
  }
}

case class EmailPrefsData(receiveGnmMarketing: Boolean, receive3rdPartyMarketing: Boolean, htmlPreference: String, emailListSubscriptions: List[String])
object EmailPrefsData {
  protected val validPrefs = Set("HTML", "Text")
  def isValidHtmlPreference(pref: String): Boolean =  validPrefs contains pref

  val emailPrefsForm = Form(
    Forms.mapping(
      "statusFields.receiveGnmMarketing" -> Forms.boolean,
      "statusFields.receive3rdPartyMarketing" -> Forms.boolean,
      "htmlPreference" -> Forms.text().verifying(isValidHtmlPreference _),
      "emailListSubscriptions" -> Forms.list(Forms.text)
    )(EmailPrefsData.apply)(EmailPrefsData.unapply)
  )
}
