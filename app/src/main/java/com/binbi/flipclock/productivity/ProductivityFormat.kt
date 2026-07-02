package com.binbi.flipclock.productivity

import kotlin.math.max

fun formatDuration(millis: Long, showHours: Boolean = true): String {
    val totalSeconds = max(0L, millis) / 1_000L
    val hours = totalSeconds / 3_600L
    val minutes = (totalSeconds % 3_600L) / 60L
    val seconds = totalSeconds % 60L
    return if (showHours || hours > 0L) {
        "%02d:%02d:%02d".format(hours, minutes, seconds)
    } else {
        "%02d:%02d".format(minutes, seconds)
    }
}
