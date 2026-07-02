package com.binbi.flipclock.clock

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.settings.UserSettings
import com.binbi.flipclock.core.settings.appLocale
import com.binbi.flipclock.core.settings.defaultSignatureFor
import com.binbi.flipclock.core.settings.resolveAppLanguage
import com.binbi.flipclock.core.time.ClockTimeProvider
import com.binbi.flipclock.core.time.TimeFormat
import com.binbi.flipclock.ui.theme.ClockThemePresets
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * Combines the ticking time source with the user's settings into a single [ClockUiState].
 * Contains no Android/Compose dependencies beyond ViewModel, so the time-to-digits mapping
 * stays fully testable.
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
        /** Pure mapping from a moment + settings to render state. Unit-testable. */
        fun buildState(
            now: Instant,
            settings: UserSettings,
            systemZoneId: ZoneId = ZoneId.systemDefault(),
            systemLocale: Locale = Locale.getDefault(),
        ): ClockUiState {
            val resolvedLanguage = resolveAppLanguage(settings.language, systemLocale)
            val locale = appLocale(resolvedLanguage, systemLocale)
            val zoneId = resolveZoneId(settings.timezone, systemZoneId)
            val zonedNow = ZonedDateTime.ofInstant(now, zoneId)
            val hour24 = zonedNow.hour
            val displayHour: Int
            val amPm: String?

            when (settings.timeFormat) {
                TimeFormat.H24 -> {
                    displayHour = hour24
                    amPm = null
                }

                TimeFormat.H12 -> {
                    displayHour = ((hour24 + 11) % 12) + 1
                    amPm = if (hour24 < 12) "AM" else "PM"
                }
            }

            val hourDigits = if (settings.timeFormat == TimeFormat.H12 && displayHour < 10) {
                listOf(displayHour)
            } else {
                listOf(displayHour / 10, displayHour % 10)
            }

            return ClockUiState(
                hourDigits = hourDigits,
                minuteDigits = listOf(zonedNow.minute / 10, zonedNow.minute % 10),
                secondDigits = listOf(zonedNow.second / 10, zonedNow.second % 10),
                showSeconds = settings.showSeconds,
                showSignature = settings.showSignature,
                amPm = amPm,
                dateText = formatDateText(zonedNow, locale, resolvedLanguage.id),
                signature = settings.signature.ifBlank { defaultSignatureFor(resolvedLanguage) },
                dateFontSize = settings.dateFontSize,
                signatureFontSize = settings.signatureFontSize,
                theme = ClockThemePresets.byId(settings.themeId),
            )
        }

        private fun resolveZoneId(timezone: String, systemZoneId: ZoneId): ZoneId =
            if (timezone == "auto") {
                systemZoneId
            } else {
                runCatching { ZoneId.of(timezone) }.getOrDefault(systemZoneId)
            }

        private fun formatDateText(now: ZonedDateTime, locale: Locale, languageId: String): String {
            val pattern = when (languageId) {
                "zh", "ja", "ko" -> "yyyy年M月d日 EEEE"
                else -> "EEEE, MMMM d, yyyy"
            }
            return now.format(DateTimeFormatter.ofPattern(pattern, locale))
        }
    }
}
