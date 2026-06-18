package com.binbi.flipclock.core.settings

import com.binbi.flipclock.core.time.TimeFormat

/** All user-configurable preferences, with sensible defaults matching the reference look. */
data class UserSettings(
    val timeFormat: TimeFormat = TimeFormat.H24,
    val showSeconds: Boolean = true,
    val signature: String = "Stay hungry, Stay foolish",
    val themeId: String = "classic_black",
)
