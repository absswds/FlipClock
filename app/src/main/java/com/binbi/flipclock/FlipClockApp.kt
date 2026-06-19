package com.binbi.flipclock

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.binbi.flipclock.clock.ClockScreen
import com.binbi.flipclock.clock.ClockViewModel
import com.binbi.flipclock.core.settings.SettingsRepository
import com.binbi.flipclock.core.time.ClockTimeProvider
import com.binbi.flipclock.productivity.CountdownScreen
import com.binbi.flipclock.productivity.CountdownViewModel
import com.binbi.flipclock.productivity.PomodoroScreen
import com.binbi.flipclock.productivity.PomodoroViewModel
import com.binbi.flipclock.productivity.ProductivityRepository
import com.binbi.flipclock.productivity.StopwatchScreen
import com.binbi.flipclock.productivity.StopwatchViewModel
import com.binbi.flipclock.productivity.TimerScreen
import com.binbi.flipclock.productivity.TimerViewModel
import com.binbi.flipclock.settings.SettingsScreen
import com.binbi.flipclock.settings.SettingsViewModel

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

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        when (destination) {
            AppDestination.Clock -> {
                val state = uiState
                if (state == null) {
                    Box(Modifier.fillMaxSize().background(Color.Black))
                } else {
                    ClockScreen(
                        state = state,
                        onSettingsClick = { destination = AppDestination.Settings },
                    )
                }
            }
            AppDestination.Timer -> TimerScreen(timerViewModel)
            AppDestination.Stopwatch -> StopwatchScreen(stopwatchViewModel)
            AppDestination.Countdown -> CountdownScreen(countdownViewModel)
            AppDestination.Pomodoro -> PomodoroScreen(pomodoroViewModel)
            AppDestination.Settings -> SettingsScreen(
                viewModel = settingsViewModel,
                onBack = { destination = AppDestination.Clock },
            )
        }

        AppModeBar(
            selected = destination,
            onSelect = { destination = it },
            modifier = Modifier.align(Alignment.BottomCenter),
        )
    }
}

private enum class AppDestination(val label: String) {
    Clock("Clock"),
    Timer("Timer"),
    Stopwatch("Stopwatch"),
    Countdown("Countdown"),
    Pomodoro("Focus"),
    Settings("Settings"),
}

@Composable
private fun AppModeBar(
    selected: AppDestination,
    onSelect: (AppDestination) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .systemBarsPadding()
            .padding(horizontal = 10.dp, vertical = 10.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xCC111114))
            .padding(horizontal = 4.dp, vertical = 4.dp),
    ) {
        AppDestination.values().forEach { destination ->
            val active = destination == selected
            TextButton(
                onClick = { onSelect(destination) },
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(if (active) Color(0xFF2C2C30) else Color.Transparent),
            ) {
                Text(
                    text = destination.label,
                    color = if (active) Color.White else Color(0xFF9B9BA0),
                    fontSize = 11.sp,
                )
            }
        }
    }
}
