package model

import common.{NavItem, Edition}
import dfp.DfpAgent
import play.api.libs.json.{JsString, JsValue}

case class FaciaPage(id: String,
                     seoData: SeoData,
                     frontProperties: FrontProperties,
                     collections: List[(Config, Collection)]) extends MetaData with AdSuffixHandlingForFronts {

  override lazy val description: Option[String] = seoData.description
  override lazy val section: String = seoData.navSection
  lazy val navSection: String = section
  override lazy val analyticsName: String = s"GFE:${seoData.webTitle.capitalize}"
  override lazy val webTitle: String = seoData.webTitle
  override lazy val title: Option[String] = seoData.title

  override lazy val isFront = true

  override lazy val metaData: Map[String, JsValue] = super.metaData ++ faciaPageMetaData
  lazy val faciaPageMetaData: Map[String, JsValue] = Map(
    "keywords" -> JsString(webTitle.capitalize),
    "contentType" -> JsString(contentType)
  )

  val isNetworkFront: Boolean = Edition.all.exists(edition => id.toLowerCase.endsWith(edition.id.toLowerCase))

  override lazy val contentType: String = if (isNetworkFront) GuardianContentTypes.NetworkFront else GuardianContentTypes.Section

  override def isSponsored = DfpAgent.isSponsored(id)
  override def hasMultipleSponsors = false // Todo: need to think about this
  override def isAdvertisementFeature = DfpAgent.isAdvertisementFeature(id)
  override def hasMultipleFeatureAdvertisers = false // Todo: need to think about this
  override def sponsor = DfpAgent.getSponsor(id)
  override def hasPageSkin(edition: Edition) = DfpAgent.isPageSkinned(adUnitSuffix, edition)

  def allItems = collections.map(_._2).flatMap(_.items).distinct

  override def openGraph: Map[String, String] = super.openGraph ++Map(
    "og:image" -> "http://static.guim.co.uk/icons/social/og/gu-logo-fallback.png") ++
    optionalMapEntry("og:description", description)  ++
    optionalMapEntry("og:image", frontProperties.imageUrl)


  override def cards: List[(String, String)] = super.cards ++
    List("twitter:card" -> "summary")

  override def customSignPosting: Option[NavItem] = FaciaSignpostingOverrides(id)

  private def optionalMapEntry(key:String, o: Option[String]): Map[String, String] =
    o.map(value => Map(key -> value)).getOrElse(Map())
}

object FaciaPage {
  def defaultFaciaPage: FaciaPage = FaciaPage("", SeoData.empty, FrontProperties.empty, Nil)
}