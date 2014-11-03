package form

import play.api.i18n.Messages
import play.api.data.Forms._
import model.Countries

trait AddressMapping extends Mappings{

  private val AddressLinePattern = """[^\w\s'#,./-]""".r
  private val idAddressLine = textField verifying (
    Messages("error.address"),
    { value => value.isEmpty || AddressLinePattern.findFirstIn(value).isEmpty }
  )

  val idAddress = mapping(
    ("line1", optional(idAddressLine)),
    ("line2", optional(idAddressLine)),
    ("line3", optional(idAddressLine)),
    ("line4", optional(idAddressLine)),
    ("postcode", optional(textField)),
    ("country", optional(idCountry))
  )(AddressFormData.apply)(AddressFormData.unapply) verifying(
    "error.postcode",
    { address => address.isValidPostcodeOrZipcode
    }
  )
}

case class AddressFormData(
  address1: Option[String],
  address2: Option[String],
  address3: Option[String],
  address4: Option[String],
  postcode: Option[String],
  country: Option[String]
){
  import Countries.{UK, US}

  lazy val isValidPostcodeOrZipcode: Boolean = country match{
    case Some(UK) =>  isValidUkPostcode.isDefined
    case Some(US) =>  isValidUsZipcode.isDefined
    case _ => true
  }

  private val ZipcodePattern = """^\d{5}(?:[-\s]\d{4})?$""".r
  private lazy val isValidUsZipcode = postcode.filter( x => x.isEmpty || ZipcodePattern.findFirstIn(x).isDefined )

  private val PostcodePattern = """^(GIR 0AA)|((([A-Z-[QVX]][0-9][0-9]?)|(([A-Z-[QVX]][A-Z-[IJZ]][0-9][0-9]?)|(([A-Z-[QVX]][0-9][A-HJKSTUW])|([A-Z-[QVX]][A-Z-[IJZ]][0-9][ABEHMNPRVWXY])))) [0-9][A-Z-[CIKMOV]]{2})$""".r
  private lazy val isValidUkPostcode = postcode.filter( x => x.isEmpty || PostcodePattern.findFirstIn(x).isDefined )
}