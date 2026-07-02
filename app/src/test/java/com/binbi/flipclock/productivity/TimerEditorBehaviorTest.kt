package com.binbi.flipclock.productivity

import org.junit.Assert.assertEquals
import org.junit.Test

class TimerEditorBehaviorTest {

    @Test
    fun incrementsHourByOneWithinBounds() {
        val editor = TimerEditState(hours = 1, minutes = 5, seconds = 9)

        val next = editor.adjust(segment = TimerSegment.HOURS, delta = 1)

        assertEquals(TimerEditState(hours = 2, minutes = 5, seconds = 9), next)
    }

    @Test
    fun wrapsMinutesWhenSwipingBelowZero() {
        val editor = TimerEditState(hours = 0, minutes = 0, seconds = 0)

        val next = editor.adjust(segment = TimerSegment.MINUTES, delta = -1)

        assertEquals(TimerEditState(hours = 0, minutes = 59, seconds = 0), next)
    }

    @Test
    fun convertsEditStateToMillisForStartAction() {
        val editor = TimerEditState(hours = 1, minutes = 2, seconds = 3)

        assertEquals(3_723_000L, editor.toMillis())
    }
}
