package com.binbi.flipclock.core.settings

import com.binbi.flipclock.core.time.TimeFormat

/** All user-configurable preferences, with sensible defaults matching the reference look. */
data class UserSettings(
    val timeFormat: TimeFormat = TimeFormat.H24,
    val showSeconds: Boolean = true,
    val showSignature: Boolean = true,
    val signature: String = "",
    val themeId: String = "paper_desk",
    val language: String = "auto",
    val timezone: String = "auto",
    val dateFontSize: Int = 28,
    val signatureFontSize: Int = 16,
)
