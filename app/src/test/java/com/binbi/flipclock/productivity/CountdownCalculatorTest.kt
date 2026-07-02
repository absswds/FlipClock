package com.binbi.flipclock.productivity

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Month

class CountdownCalculatorTest {

    @Test
    fun futureTargetReturnsDaysHoursMinutesSeconds() {
        val now = LocalDateTime.of(2026, 1, 1, 10, 30, 15)
        val target = LocalDateTime.of(2026, 1, 3, 12, 31, 20)

        val remaining = CountdownCalculator.remaining(now, target)

        assertEquals(2, remaining.days)
        assertEquals(2, remaining.hours)
        assertEquals(1, remaining.minutes)
        assertEquals(5, remaining.seconds)
        assertTrue(remaining.isFuture)
    }

    @Test
    fun pastTargetClampsToZero() {
        val now = LocalDateTime.of(2026, 5, 1, 0, 0)
        val target = LocalDateTime.of(2026, 4, 30, 23, 59)

        val remaining = CountdownCalculator.remaining(now, target)

        assertEquals(0, remaining.days)
        assertEquals(0, remaining.hours)
        assertEquals(0, remaining.minutes)
        assertEquals(0, remaining.seconds)
    }

    @Test
    fun presetTargetsUseExplicitFestivalDates() {
        val presets = CountdownPresets.forYear(2026)

        assertEquals(LocalDate.of(2026, Month.JANUARY, 1), presets.first { it.id == "new_year_2026" }.date)
        assertEquals(LocalDate.of(2026, Month.FEBRUARY, 17), presets.first { it.id == "spring_festival_2026" }.date)
        assertEquals(LocalDate.of(2026, Month.DECEMBER, 25), presets.first { it.id == "christmas_2026" }.date)
        assertEquals(LocalDate.of(2026, Month.DECEMBER, 31), presets.first { it.id == "new_year_eve_2026" }.date)
    }
}
