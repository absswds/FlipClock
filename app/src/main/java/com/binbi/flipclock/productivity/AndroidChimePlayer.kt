package com.binbi.flipclock.productivity

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import kotlin.math.PI
import kotlin.math.sin

/** Android AudioTrack-based chime implementation. */
object AndroidChimePlayer : ChimePlayer {

    override fun play() {
        try {
            val sampleRate = 44100
            val durationS = 0.5
            val numSamples = (sampleRate * durationS).toInt()
            val buffer = ShortArray(numSamples)

            // Two-tone chime: A5 → C#6 with fade envelope
            for (i in 0 until numSamples) {
                val t = i.toDouble() / sampleRate
                val freq = if (t < 0.22) 880.0 else 1100.0
                val envelope = sin(PI * (t / durationS)).toFloat()
                val sample = (sin(2.0 * PI * freq * t) * envelope * 12000).toInt().toShort()
                buffer[i] = sample
            }

            val audioTrack = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setSampleRate(sampleRate)
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(numSamples * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()
            } else {
                @Suppress("DEPRECATION")
                AudioTrack(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build(),
                    AudioFormat.Builder()
                        .setSampleRate(sampleRate)
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build(),
                    numSamples * 2,
                    AudioTrack.MODE_STATIC,
                    AudioManager.AUDIO_SESSION_ID_GENERATE,
                )
            }

            audioTrack.write(buffer, 0, numSamples)
            audioTrack.play()

            // Release after playback
            Thread {
                Thread.sleep((durationS * 1000).toLong() + 200)
                audioTrack.release()
            }.start()
        } catch (_: Exception) {
            // Audio not available on this device
        }
    }
}
