package com.binbi.flipclock.productivity

enum class TimerSegment {
    HOURS,
    MINUTES,
    SECONDS,
}

data class TimerEditState(
    val hours: Int,
    val minutes: Int,
    val seconds: Int,
) {
    fun adjust(segment: TimerSegment, delta: Int): TimerEditState =
        when (segment) {
            TimerSegment.HOURS -> copy(hours = (hours + delta).wrap(100))
            TimerSegment.MINUTES -> copy(minutes = (minutes + delta).wrap(60))
            TimerSegment.SECONDS -> copy(seconds = (seconds + delta).wrap(60))
        }

    fun toMillis(): Long = ((hours * 3600L) + (minutes * 60L) + seconds) * 1000L
}

private fun Int.wrap(modulus: Int): Int {
    val remainder = this % modulus
    return if (remainder >= 0) remainder else remainder + modulus
}
