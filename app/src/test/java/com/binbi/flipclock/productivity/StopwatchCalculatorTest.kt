package com.binbi.flipclock.productivity

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class StopwatchCalculatorTest {

    @Test
    fun runningStopwatchAddsElapsedWallClockTime() {
        val state = StopwatchCalculator.start(StopwatchState(), nowMillis = 1_000L)

        val tick = StopwatchCalculator.tick(state, nowMillis = 12_345L)

        assertEquals(11_345L, tick.elapsedMillis)
        assertTrue(tick.isRunning)
    }

    @Test
    fun pausedStopwatchDoesNotGrow() {
        val running = StopwatchCalculator.start(StopwatchState(), nowMillis = 0L)
        val paused = StopwatchCalculator.pause(running, nowMillis = 2_500L)

        val tick = StopwatchCalculator.tick(paused, nowMillis = 9_000L)

        assertEquals(2_500L, tick.elapsedMillis)
        assertFalse(tick.isRunning)
    }

    @Test
    fun lapsAreRecordedNewestFirst() {
        val running = StopwatchCalculator.start(StopwatchState(), nowMillis = 0L)
        val firstLap = StopwatchCalculator.lap(running, nowMillis = 1_200L)
        val secondLap = StopwatchCalculator.lap(firstLap, nowMillis = 2_000L)

        assertEquals(listOf(2_000L, 1_200L), secondLap.lapsMillis)
    }
}
