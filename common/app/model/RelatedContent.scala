package model

import com.gu.contentapi.client.model.{Content => ApiContent, ItemResponse}

case class RelatedContent( storyPackage: Seq[Content], followingLink: Option[String]) {
  val hasStoryPackage: Boolean = storyPackage.nonEmpty
}

object RelatedContent {
  def apply(parent: Content, item: ItemResponse): RelatedContent = RelatedContent(
    item.storyPackage.map(Content(_)).filterNot(_.id == parent.id), getRelatedJsonUrl(item.relatedContent)
  )

  def getRelatedJsonUrl(relatedContent: List[ApiContent]): Option[String] = {
    relatedContent.headOption.map(data => s"http://localhost:9000/${data.id}.json")
  }

}
