package com.binbi.flipclock.productivity

object PomodoroEngine {

    fun initial(settings: PomodoroSettings): PomodoroState =
        PomodoroState(timer = TimerState(durationMillis = minutesToMillis(settings.focusMinutes)))

    fun completeCurrent(state: PomodoroState, settings: PomodoroSettings): PomodoroState {
        val completedFocus = if (state.mode == PomodoroMode.FOCUS) {
            state.completedFocusSessions + 1
        } else {
            state.completedFocusSessions
        }
        val nextMode = when (state.mode) {
            PomodoroMode.FOCUS -> if (completedFocus % 4 == 0) PomodoroMode.LONG_BREAK else PomodoroMode.SHORT_BREAK
            PomodoroMode.SHORT_BREAK,
            PomodoroMode.LONG_BREAK -> PomodoroMode.FOCUS
        }
        return PomodoroState(
            mode = nextMode,
            completedFocusSessions = completedFocus,
            timer = TimerState(durationMillis = durationFor(nextMode, settings)),
            showCompletionAlert = true,
        )
    }

    fun reset(settings: PomodoroSettings): PomodoroState = initial(settings)

    fun durationFor(mode: PomodoroMode, settings: PomodoroSettings): Long =
        when (mode) {
            PomodoroMode.FOCUS -> minutesToMillis(settings.focusMinutes)
            PomodoroMode.SHORT_BREAK -> minutesToMillis(settings.shortBreakMinutes)
            PomodoroMode.LONG_BREAK -> minutesToMillis(settings.longBreakMinutes)
        }

    private fun minutesToMillis(minutes: Int): Long = minutes.coerceAtLeast(1) * 60_000L
}
