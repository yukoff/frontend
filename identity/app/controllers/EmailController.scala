package controllers

import com.google.inject.{Inject, Singleton}
import services.{IdentityRequest, IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import conf.IdentityConfiguration
import idapiclient.{TrackingData, IdApiClient}
import common.ExecutionContexts
import utils.SafeLogging
import play.api.mvc._
import scala.concurrent.Future
import model.IdentityPage
import play.api.data._
import client.{Auth, Error}
import net.liftweb.json.JsonDSL._
import com.gu.identity.model.{EmailList, User, Subscriber}
import play.filters.csrf._
import scala.util.{Try, Failure, Success}
import client.Response
import actions.AuthRequest


@Singleton
class EmailController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                conf: IdentityConfiguration,
                                api: IdApiClient,
                                idRequestParser: IdRequestParser,
                                idUrlBuilder: IdentityUrlBuilder,
                                authAction: actions.AuthenticatedAction)
  extends Controller with ExecutionContexts with SafeLogging {
  import EmailPrefsData._
  import EmailSubscriptionData._

  val page = IdentityPage("/email-prefs", "Email preferences", "email-prefs")

  def preferences = CSRFAddToken {
    authAction.async {
      implicit request =>
        val idRequest = idRequestParser(request)

        populateForm(request.user.getId(), request.auth, idRequest.trackingData) map {
          form =>
            checkForm(form)
            val template = views.html.profile.emailPrefs(page, form, emailPrefsFormAction(idRequest), emailSubscriptionFormAction(idRequest))
            Ok(template)
        }
    }
  }

  def savePreferences = CSRFCheck {
    authAction.async {
      implicit request =>
        val boundForm = emailPrefsForm.bindFromRequest
        val idRequest = idRequestParser(request)
        boundForm.fold({
          case formWithErrors: Form[EmailPrefsData] =>
            logger.info(s"Error saving user email preference, ${formWithErrors.errors}")
            Future.successful(Ok(views.html.profile.emailPrefs(page, formWithErrors, emailPrefsFormAction(idRequest), emailSubscriptionFormAction(idRequest))))
        }, {
          case prefs: EmailPrefsData =>
            updatePrefs(prefs, boundForm, idRequest.trackingData) map {
              form =>
                Ok(views.html.profile.emailPrefs(page, form, emailPrefsFormAction(idRequest), emailSubscriptionFormAction(idRequest)))
            }
        })
    }
  }

  def saveEmailSubscription = CSRFCheck {
    authAction.async {
      implicit request =>
        val boundForm = emailSubscriptionForm.bindFromRequest
        val idRequest = idRequestParser(request)
        boundForm.fold({
          case formWithErrors: Form[EmailSubscriptionData] =>
            Future.successful(Ok("broket"))
        }, {
          case emailSubscriptionData: EmailSubscriptionData =>
            updateEmailSubscription(emailSubscriptionData, boundForm, idRequest.trackingData)
            Future.successful(Ok("done"))
        })
    }
  }

  protected def updatePrefs[A](prefs: EmailPrefsData, boundForm: Form[EmailPrefsData], tracking: TrackingData)
                           (implicit request: AuthRequest[A]): Future[Form[EmailPrefsData]] = {
    logger.trace("Updating user email prefs")
    val userId = request.user.id
    val auth= request.auth
    val newStatusFields = ("receiveGnmMarketing" -> prefs.receiveGnmMarketing) ~ ("receive3rdPartyMarketing" -> prefs.receive3rdPartyMarketing)
    val subscriber = Subscriber(prefs.htmlPreference, Nil)

    val futureUser = api.updateUser(userId, auth, tracking, "statusFields", newStatusFields)
    val futureNothing = api.updateUserEmails(userId, subscriber, auth, tracking)

    futureEmailPrefsForm(futureUser, futureNothing, boundForm){
      case (user, _) =>
        emailPrefsForm.fill(
          EmailPrefsData(
            user.statusFields.isReceiveGnmMarketing,
            user.statusFields.isReceive3rdPartyMarketing,
            prefs.htmlPreference,
            prefs.subscriptions
          )
        )
    }
  }

  protected def updateEmailSubscription[A](emailSubscriptionData: EmailSubscriptionData, boundForm: Form[EmailSubscriptionData], tracking: TrackingData)
  (implicit request: AuthRequest[A]): Future[Form[EmailSubscriptionData]] = {
    val userId = request.user.id
    val auth = request.auth
    val listId = emailSubscriptionData.listId
    api.updateUserEmailSubscription(userId, EmailList(listId), auth, tracking) map { result =>
      logExceptions{
        result match {
          case Right(subs) => println(subs); subs
          case Left(subs) => println(subs); subs
        }
      }
    }

    Future.successful(emailSubscriptionForm.fill(EmailSubscriptionData(listId)))
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
    println(futureSubscriber)
    futureSubscriber.map(println(_))
    futureEmailPrefsForm(futureUser, futureSubscriber, emailPrefsForm){
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

  protected def futureEmailPrefsForm[S](f1: Future[Response[User]], f2: Future[Response[S]], form: Form[EmailPrefsData])
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

  protected def futureEmailSubscriptionForm[S](f1: Future[Response[User]], f2: Future[Response[S]], form: Form[EmailSubscriptionData])
                             (right: (User, S) => Form[EmailSubscriptionData]): Future[Form[EmailSubscriptionData]] = {
    val futures = f1 zip f2
    futures onFailure {case t: Throwable => logger.error("Exception while fetching user and email subscription", t)}
    futures map {
      results =>
        logExceptions {
          results match {
            case (Right(user), Right(s)) => right(user, s)

            case (eitherUser, eitherS) =>
              val errors = eitherUser.left.getOrElse(Nil) ++ eitherS.left.getOrElse(Nil)
              errors.foldLeft(form) {
                case (errForm, Error(message, description, _, context)) =>
                  logger.error(s"Error while fetching user and email subscription: $message")
                  errForm.withError(context.getOrElse(""), description)
              }
          }
        }
    }
  }

  protected def formActionUrl(idUrlBuilder: IdentityUrlBuilder, idRequest: IdentityRequest, url: String): String = idUrlBuilder.buildUrl(url, idRequest)
  protected def emailPrefsFormAction(idRequest: IdentityRequest) = formActionUrl(idUrlBuilder, idRequest, "/email-prefs")
  protected def emailSubscriptionFormAction(idRequest: IdentityRequest) = formActionUrl(idUrlBuilder, idRequest, "/email-subscription")

  protected def logExceptions[T](f: => T): T = {
    Try(f) match {
      case Success(result) => result

      case Failure(t) =>
        logger.error("Exception while fetching user and email prefs", t)
        throw t
    }
  }
}

case class EmailPrefsData(receiveGnmMarketing: Boolean, receive3rdPartyMarketing: Boolean, htmlPreference: String, subscriptions: List[String])
object EmailPrefsData {
  protected val validPrefs = Set("HTML", "Text")
  def isValidHtmlPreference(pref: String): Boolean =  validPrefs contains pref

  val emailPrefsForm = Form(
    Forms.mapping(
      "statusFields.receiveGnmMarketing" -> Forms.boolean,
      "statusFields.receive3rdPartyMarketing" -> Forms.boolean,
      "htmlPreference" -> Forms.text().verifying(isValidHtmlPreference _),
      "subscriptions" -> Forms.list(Forms.text)
    )(EmailPrefsData.apply)(EmailPrefsData.unapply)
  )
}

case class EmailSubscriptionData(listId: String)
object EmailSubscriptionData {
  val emailSubscriptionForm = Form(
    Forms.mapping(
      "listId"-> Forms.text
    )(EmailSubscriptionData.apply)(EmailSubscriptionData.unapply)
  );
}