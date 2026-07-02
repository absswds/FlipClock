package com.binbi.flipclock.productivity

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class PomodoroEngineTest {

    @Test
    fun focusCompletesIntoShortBreakBeforeFourthSession() {
        val settings = PomodoroSettings(focusMinutes = 25, shortBreakMinutes = 5, longBreakMinutes = 15)
        val state = PomodoroState(mode = PomodoroMode.FOCUS, completedFocusSessions = 2)

        val next = PomodoroEngine.completeCurrent(state, settings)

        assertEquals(PomodoroMode.SHORT_BREAK, next.mode)
        assertEquals(3, next.completedFocusSessions)
        assertEquals(5 * 60_000L, next.timer.durationMillis)
        assertTrue(next.showCompletionAlert)
    }

    @Test
    fun fourthFocusCompletesIntoLongBreak() {
        val settings = PomodoroSettings(focusMinutes = 25, shortBreakMinutes = 5, longBreakMinutes = 15)
        val state = PomodoroState(mode = PomodoroMode.FOCUS, completedFocusSessions = 3)

        val next = PomodoroEngine.completeCurrent(state, settings)

        assertEquals(PomodoroMode.LONG_BREAK, next.mode)
        assertEquals(4, next.completedFocusSessions)
        assertEquals(15 * 60_000L, next.timer.durationMillis)
    }

    @Test
    fun breakCompletesBackIntoFocus() {
        val settings = PomodoroSettings(focusMinutes = 25, shortBreakMinutes = 5, longBreakMinutes = 15)
        val state = PomodoroState(mode = PomodoroMode.SHORT_BREAK, completedFocusSessions = 1)

        val next = PomodoroEngine.completeCurrent(state, settings)

        assertEquals(PomodoroMode.FOCUS, next.mode)
        assertEquals(1, next.completedFocusSessions)
        assertEquals(25 * 60_000L, next.timer.durationMillis)
    }
}
