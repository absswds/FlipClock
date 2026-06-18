package com.binbi.flipclock.clock

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.settings.UserSettings
import com.binbi.flipclock.core.time.ClockTimeProvider
import com.binbi.flipclock.core.time.TimeFormat
import com.binbi.flipclock.ui.theme.ClockThemePresets
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * Combines the ticking time source with the user's settings into a single [ClockUiState].
 * Contains no Android/Compose dependencies beyond ViewModel, so the time→digits mapping
 * (the testable part) stays pure.
 */
class ClockViewModel(
    timeProvider: ClockTimeProvider,
    settingsRepository: SettingsRepository,
) : ViewModel() {

    val uiState: StateFlow<ClockUiState?> =
        combine(timeProvider.timeFlow(), settingsRepository.settings) { now, settings ->
            buildState(now, settings)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    companion object {
        private val dateFormatter: DateTimeFormatter =
            DateTimeFormatter.ofPattern("yyyy年M月d日 EEEE", Locale.CHINA)

        /** Pure mapping from a moment + settings to render state. Unit-testable. */
        fun buildState(now: LocalDateTime, settings: UserSettings): ClockUiState {
            val hour24 = now.hour
            val displayHour: Int
            val amPm: String?
            when (settings.timeFormat) {
                TimeFormat.H24 -> {
                    displayHour = hour24
                    amPm = null
                }
                TimeFormat.H12 -> {
                    displayHour = ((hour24 + 11) % 12) + 1 // 0->12, 13->1, 23->11
                    amPm = if (hour24 < 12) "AM" else "PM"
                }
            }

            val hourDigits = if (settings.timeFormat == TimeFormat.H12 && displayHour < 10) {
                listOf(displayHour) // no leading zero, e.g. "5"
            } else {
                listOf(displayHour / 10, displayHour % 10)
            }

            return ClockUiState(
                hourDigits = hourDigits,
                minuteDigits = listOf(now.minute / 10, now.minute % 10),
                secondDigits = listOf(now.second / 10, now.second % 10),
                showSeconds = settings.showSeconds,
                amPm = amPm,
                dateText = now.format(dateFormatter),
                signature = settings.signature,
                theme = ClockThemePresets.byId(settings.themeId),
            )
        }
    }
}
