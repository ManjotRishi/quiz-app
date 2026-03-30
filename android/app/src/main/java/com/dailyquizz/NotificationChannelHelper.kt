package com.dailyquizz

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.media.AudioAttributes
import android.media.AudioAttributes.USAGE_NOTIFICATION
import android.media.RingtoneManager
import android.net.Uri

const val QUIZ_NOTIFICATION_CHANNEL_ID = "quiz_channel_heads_up_v6"

fun createQuizNotificationChannel(context: Context) {
  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
    return
  }

  val channel = NotificationChannel(
    QUIZ_NOTIFICATION_CHANNEL_ID,
    "Quiz Updates",
    NotificationManager.IMPORTANCE_HIGH
  ).apply {
    description = "Daily quiz notifications"
    setLockscreenVisibility(Notification.VISIBILITY_PUBLIC)
    enableLights(true)
    enableVibration(true)
    vibrationPattern = longArrayOf(0, 500, 250, 500)
    setShowBadge(true)
    val soundUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    val audioAttributes = AudioAttributes.Builder()
      .setUsage(USAGE_NOTIFICATION)
      .build()
    setSound(soundUri, audioAttributes)
  }

  val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
  manager.createNotificationChannel(channel)
}
