package com.binbi.flipclock

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.binbi.flipclock.clock.ClockScreen
import com.binbi.flipclock.clock.ClockViewModel
import com.binbi.flipclock.core.settings.labelFor
import com.binbi.flipclock.core.settings.resolveAppLanguage
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.time.ClockTimeProvider
import com.binbi.flipclock.productivity.CountdownScreen
import com.binbi.flipclock.productivity.PomodoroScreen
import com.binbi.flipclock.productivity.ProductivityRepository
import com.binbi.flipclock.productivity.StopwatchScreen
import com.binbi.flipclock.productivity.TimerScreen
import com.binbi.flipclock.productivity.CountdownViewModel
import com.binbi.flipclock.productivity.PomodoroViewModel
import com.binbi.flipclock.productivity.StopwatchViewModel
import com.binbi.flipclock.productivity.TimerViewModel
import com.binbi.flipclock.settings.SettingsScreen
import com.binbi.flipclock.settings.SettingsViewModel
import com.binbi.flipclock.ui.theme.ClockThemePresets

@Composable
fun FlipClockApp() {
    val context = LocalContext.current.applicationContext
    val repository = remember { SettingsRepository(context) }
    val productivityRepository = remember { ProductivityRepository(context) }

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
    val timerViewModel: TimerViewModel = viewModel(
        factory = viewModelFactory {
            initializer { TimerViewModel(productivityRepository) }
        },
    )
    val stopwatchViewModel: StopwatchViewModel = viewModel(
        factory = viewModelFactory {
            initializer { StopwatchViewModel() }
        },
    )
    val countdownViewModel: CountdownViewModel = viewModel(
        factory = viewModelFactory {
            initializer { CountdownViewModel(productivityRepository) }
        },
    )
    val pomodoroViewModel: PomodoroViewModel = viewModel(
        factory = viewModelFactory {
            initializer { PomodoroViewModel(productivityRepository) }
        },
    )

    var destination by rememberSaveable { mutableStateOf(AppDestination.Clock) }
    val uiState by clockViewModel.uiState.collectAsState()
    val settings by settingsViewModel.settings.collectAsState()
    val language = resolveAppLanguage(settings.language)
    val theme = ClockThemePresets.byId(settings.themeId)

    Box(Modifier.fillMaxSize().background(theme.background)) {
        when (destination) {
            AppDestination.Clock -> {
                val state = uiState
                if (state == null) {
                    Box(Modifier.fillMaxSize().background(theme.background))
                } else {
                    ClockScreen(
                        state = state,
                        onSettingsClick = { destination = AppDestination.Settings },
                    )
                }
            }

            AppDestination.Timer -> TimerScreen(timerViewModel, theme, language)
            AppDestination.Stopwatch -> StopwatchScreen(stopwatchViewModel, theme, language)
            AppDestination.Countdown -> CountdownScreen(countdownViewModel, theme, language)
            AppDestination.Pomodoro -> PomodoroScreen(pomodoroViewModel, theme, language)
            AppDestination.Settings -> SettingsScreen(
                viewModel = settingsViewModel,
                onBack = { destination = AppDestination.Clock },
            )
        }

        AppModeBar(
            selected = destination,
            onSelect = { destination = it },
            theme = theme,
            languageId = language.id,
            modifier = Modifier.align(Alignment.BottomCenter),
        )
    }
}

private enum class AppDestination(val key: String) {
    Clock("clock"),
    Timer("timer"),
    Stopwatch("stopwatch"),
    Countdown("countdown"),
    Pomodoro("focus"),
    Settings("settings"),
}

@Composable
private fun AppModeBar(
    selected: AppDestination,
    onSelect: (AppDestination) -> Unit,
    theme: com.binbi.flipclock.ui.theme.ClockTheme,
    languageId: String,
    modifier: Modifier = Modifier,
) {
    val isLight = theme.background.luminance() > 0.5f
    val baseBackground = if (isLight) Color(0xE8FFFFFF) else Color(0xCC111114)
    val activeBackground = if (isLight) theme.accent.copy(alpha = 0.16f) else Color(0xFF2C2C30)
    val activeText = if (isLight) Color(0xFF2D241B) else Color.White
    val inactiveText = if (isLight) theme.signature else Color(0xFF9B9BA0)

    Row(
        modifier = modifier
            .systemBarsPadding()
            .padding(horizontal = 10.dp, vertical = 10.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(baseBackground)
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 4.dp, vertical = 4.dp),
    ) {
        AppDestination.entries.forEach { destination ->
            val active = destination == selected
            TextButton(
                onClick = { onSelect(destination) },
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (active) activeBackground else Color.Transparent),
            ) {
                Text(
                    text = labelFor(resolveAppLanguage(languageId), destination.key),
                    color = if (active) activeText else inactiveText,
                    fontSize = 11.sp,
                )
            }
        }
    }
}
