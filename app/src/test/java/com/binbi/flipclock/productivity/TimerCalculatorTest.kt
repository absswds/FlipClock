package com.binbi.flipclock.productivity

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TimerCalculatorTest {

    @Test
    fun runningTimerUsesWallClockElapsedTime() {
        val state = TimerCalculator.start(durationMillis = 60_000L, nowMillis = 10_000L)

        val tick = TimerCalculator.tick(state, nowMillis = 25_500L)

        assertEquals(44_500L, tick.remainingMillis)
        assertTrue(tick.isRunning)
        assertFalse(tick.isComplete)
    }

    @Test
    fun pausedTimerFreezesRemainingTimeUntilResumed() {
        val running = TimerCalculator.start(durationMillis = 60_000L, nowMillis = 0L)
        val paused = TimerCalculator.pause(running, nowMillis = 20_000L)
        val resumed = TimerCalculator.resume(paused, nowMillis = 50_000L)

        val tick = TimerCalculator.tick(resumed, nowMillis = 55_000L)

        assertEquals(35_000L, tick.remainingMillis)
        assertTrue(tick.isRunning)
    }

    @Test
    fun timerCompletesAtZeroWithoutGoingNegative() {
        val state = TimerCalculator.start(durationMillis = 10_000L, nowMillis = 100L)

        val tick = TimerCalculator.tick(state, nowMillis = 20_000L)

        assertEquals(0L, tick.remainingMillis)
        assertFalse(tick.isRunning)
        assertTrue(tick.isComplete)
    }
}
