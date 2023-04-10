package io.airbyte.notification

import com.sendgrid.Request
import com.sendgrid.Response
import io.micronaut.context.annotation.Requires
import io.micronaut.email.Email
import io.micronaut.email.EmailException
import io.micronaut.email.EmailSender
import jakarta.inject.Named
import jakarta.inject.Singleton
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import org.slf4j.LoggerFactory
import java.io.IOException
import java.net.http.HttpClient
import java.net.http.HttpResponse

interface NotificationSender<T> {
    fun sendNotification(config: T, subject: String, message: String)
    fun notificationType(): NotificationType

    companion object {
        fun isSuccessfulHttpResponse(httpStatusCode: Int): Boolean {
            return httpStatusCode / 100 == 2
        }
    }
}

@Singleton
@Requires(property = "airbyte.notification.webhook.url")
class WebhookNotificationSender(@Named("webhookHttpClient") private val okHttpClient: OkHttpClient) : NotificationSender<WebhookConfig> {

    companion object {
        private val log = LoggerFactory.getLogger(WebhookNotificationSender::class.java)
    }

    override fun sendNotification(config: WebhookConfig, subject: String, message: String) {
        val requestBody: RequestBody = """{"text": "$message"}""".toRequestBody("application/json".toMediaType())

        val request: okhttp3.Request = okhttp3.Request.Builder()
                .url(config.webhookUrl)
                .post(requestBody)
                .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (response.isSuccessful) {
                log.info("Successful notification (${response.code}): {${response.body}")
            } else {
                throw IOException("Failed to  notification (${response.code}): ${response.body}")
            }
        }
    }

    override fun notificationType(): NotificationType {
        return NotificationType.webhook
    }

}

@Singleton
@Requires(property = "airbyte.notification.sendgrid.apikey")
class SendGridEmailNotificationSender(private val sendGridEmailSender: EmailSender<Request, Response>) : NotificationSender<SendGridEmailConfig> {

    override fun sendNotification(config: SendGridEmailConfig, subject: String, message: String) {
        try {
            sendGridEmailSender
                    .send(Email.builder()
                            .from(config.from)
                            .to(config.to)
                            .subject(subject)
                            .body(message)
                    )
        } catch (e: EmailException) {
            throw IOException("Failed to deliver send grid notification to: (${config.to}) with message $message", e)
        }
    }

    override fun notificationType(): NotificationType {
        return NotificationType.email
    }
}
