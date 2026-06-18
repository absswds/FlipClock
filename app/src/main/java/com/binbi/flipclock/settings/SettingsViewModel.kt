package com.binbi.flipclock.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.settings.UserSettings
import com.binbi.flipclock.core.time.TimeFormat
import com.binbi.flipclock.ui.theme.ClockTheme
import com.binbi.flipclock.ui.theme.ClockThemePresets
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

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

    fun setTimeFormat(format: TimeFormat) = viewModelScope.launch { repository.setTimeFormat(format) }
    fun setShowSeconds(show: Boolean) = viewModelScope.launch { repository.setShowSeconds(show) }
    fun setSignature(text: String) = viewModelScope.launch { repository.setSignature(text) }
    fun setTheme(id: String) = viewModelScope.launch { repository.setThemeId(id) }
}
