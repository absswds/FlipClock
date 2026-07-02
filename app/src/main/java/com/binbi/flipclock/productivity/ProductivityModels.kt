package com.binbi.flipclock.productivity

import java.time.LocalDate

data class TimerState(
    val durationMillis: Long,
    val remainingMillis: Long = durationMillis,
    val isRunning: Boolean = false,
    val startedAtMillis: Long? = null,
    val isComplete: Boolean = false,
)

data class StopwatchState(
    val elapsedMillis: Long = 0L,
    val isRunning: Boolean = false,
    val startedAtMillis: Long? = null,
    val lapsMillis: List<Long> = emptyList(),
)

data class CountdownTarget(
    val id: String,
    val title: String,
    val date: LocalDate,
    val isPreset: Boolean = false,
)

data class CountdownRemaining(
    val days: Long,
    val hours: Long,
    val minutes: Long,
    val seconds: Long,
    val isFuture: Boolean,
)

data class PomodoroSettings(
    val focusMinutes: Int = 25,
    val shortBreakMinutes: Int = 5,
    val longBreakMinutes: Int = 15,
)

enum class PomodoroMode {
    FOCUS,
    SHORT_BREAK,
    LONG_BREAK,
}

data class PomodoroState(
    val mode: PomodoroMode = PomodoroMode.FOCUS,
    val completedFocusSessions: Int = 0,
    val timer: TimerState = TimerState(durationMillis = 25 * 60_000L),
    val showCompletionAlert: Boolean = false,
)

data class ProductivitySettings(
    val timerDefaultMillis: Long = 5 * 60_000L,
    val countdownTargets: List<CountdownTarget> = emptyList(),
    val selectedCountdownId: String? = null,
    val hiddenPresetKeys: Set<String> = emptySet(),
    val pomodoroSettings: PomodoroSettings = PomodoroSettings(),
)
