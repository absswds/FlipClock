package com.binbi.flipclock

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.binbi.flipclock.clock.ClockScreen
import com.binbi.flipclock.clock.ClockViewModel
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.time.ClockTimeProvider
import com.binbi.flipclock.settings.SettingsScreen
import com.binbi.flipclock.settings.SettingsViewModel

/**
 * App root. Hand-rolled DI (no framework for v1): a single [SettingsRepository] feeds both
 * view-models. Two destinations — the clock and settings — switched by a simple saved boolean.
 */
@Composable
fun FlipClockApp() {
    val context = LocalContext.current.applicationContext
    val repository = remember { SettingsRepository(context) }

    val clockViewModel: ClockViewModel = viewModel(
        factory = viewModelFactory {
            initializer { ClockViewModel(ClockTimeProvider(), repository) }
        },
    )
    val settingsViewModel: SettingsViewModel = viewModel(
        factory = viewModelFactory {
            initializer { SettingsViewModel(repository) }
        },
    )

    var showSettings by rememberSaveable { mutableStateOf(false) }

    val uiState by clockViewModel.uiState.collectAsState()

    if (showSettings) {
        SettingsScreen(
            viewModel = settingsViewModel,
            onBack = { showSettings = false },
        )
    } else {
        val state = uiState
        if (state == null) {
            // First frame before the time flow emits — just paint the backdrop, no flash.
            Box(Modifier.fillMaxSize().background(Color.Black))
        } else {
            ClockScreen(
                state = state,
                onSettingsClick = { showSettings = true },
            )
        }
    }
}
