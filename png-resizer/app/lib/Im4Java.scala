package lib

import java.io.{ByteArrayInputStream, ByteArrayOutputStream}

import org.im4java.core.{Info, ConvertCmd, IMOperation}
import org.im4java.process.Pipe

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.blocking

object Im4Java {
  def apply(operation: IMOperation)(imageBytes: Array[Byte]): Array[Byte] = {
    val cmd = new ConvertCmd(false)

    val pipeIn = new Pipe(new ByteArrayInputStream(imageBytes), null)
    cmd.setInputProvider(pipeIn)

    val baos = new ByteArrayOutputStream
    val s2b = new Pipe(null, baos)
    cmd.setOutputConsumer(s2b)

    blocking {
      cmd.run(operation)
    }

    baos.flush()
    baos.toByteArray
  }

  sealed class Format(val name: String, val quality: Int)
  case object PNG extends Format("png", 0)
  case object WebP extends Format("webp", 80)

  def resizeBufferedImage(width: Int, format: Format)(imageBytes: Array[Byte]) = Future {
    val operation = new IMOperation

    operation.addImage("-")
    operation.resize(width)
    operation.sharpen(1.0)
    operation.quality(format.quality)
    operation.addImage(s"${format.name}:-")

    apply(operation)(imageBytes)
  }

  def getWidth(imageBytes: Array[Byte]) = Future {
    val imageInfo = new Info("png:-", new ByteArrayInputStream(imageBytes),true)
    (imageInfo.getImageWidth, imageInfo.getImageHeight)
  }

}
