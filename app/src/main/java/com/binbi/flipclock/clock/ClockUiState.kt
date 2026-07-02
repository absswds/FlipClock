package com.binbi.flipclock.clock

import androidx.compose.runtime.Immutable
import com.binbi.flipclock.ui.theme.ClockTheme

/**
 * Everything the clock screen needs to render one frame. Pure data — produced by
 * [ClockViewModel], consumed by the composables. Digits are pre-split so the UI never
 * does arithmetic.
 *
 * Hours have no leading zero in 12-hour mode (so 5 PM is a single card, matching the
 * reference); minutes and seconds are always two digits.
 */
@Immutable
data class ClockUiState(
    val hourDigits: List<Int>,
    val minuteDigits: List<Int>,
    val secondDigits: List<Int>,
    val showSeconds: Boolean,
    val amPm: String?,
    val dateText: String,
    val signature: String,
    val dateFontSize: Int,
    val signatureFontSize: Int,
    val theme: ClockTheme,
)
