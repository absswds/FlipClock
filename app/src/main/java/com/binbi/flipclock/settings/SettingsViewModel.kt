package com.binbi.flipclock.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.binbi.flipclock.core.settings.AppLanguage
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.settings.UserSettings
import com.binbi.flipclock.core.time.TimeFormat
import com.binbi.flipclock.ui.theme.ClockTheme
import com.binbi.flipclock.ui.theme.ClockThemePresets
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.TimeZone

class SettingsViewModel(
    private val repository: SettingsRepository,
) : ViewModel() {

    val settings: StateFlow<UserSettings> =
        repository.settings.stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5_000),
            UserSettings(),
        )

    val themes: List<ClockTheme> = ClockThemePresets.all
    val languages: List<AppLanguage> = AppLanguage.selectable
    val detectedTimezone: String = TimeZone.getDefault().id
    val commonTimezones: List<String> = listOf(
        "auto",
        detectedTimezone,
        "Asia/Hong_Kong",
        "Asia/Shanghai",
        "Asia/Tokyo",
        "America/New_York",
        "Europe/London",
        "Europe/Paris",
        "UTC",
    ).distinct()

    fun setTimeFormat(format: TimeFormat) = viewModelScope.launch { repository.setTimeFormat(format) }
    fun setShowSeconds(show: Boolean) = viewModelScope.launch { repository.setShowSeconds(show) }
    fun setShowSignature(show: Boolean) = viewModelScope.launch { repository.setShowSignature(show) }
    fun setSignature(text: String) = viewModelScope.launch { repository.setSignature(text.trimStart()) }
    fun setTheme(id: String) = viewModelScope.launch { repository.setThemeId(id) }
    fun setLanguage(language: String) = viewModelScope.launch { repository.setLanguage(language) }
    fun setTimezone(timezone: String) = viewModelScope.launch { repository.setTimezone(timezone) }
    fun setDateFontSize(size: Int) = viewModelScope.launch { repository.setDateFontSize(size) }
    fun setSignatureFontSize(size: Int) = viewModelScope.launch { repository.setSignatureFontSize(size) }
}
