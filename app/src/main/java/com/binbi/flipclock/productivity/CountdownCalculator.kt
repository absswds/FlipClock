package com.binbi.flipclock.productivity

import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Month

object CountdownCalculator {

    fun remaining(now: LocalDateTime, target: LocalDateTime): CountdownRemaining {
        val seconds = Duration.between(now, target).seconds.coerceAtLeast(0L)
        val days = seconds / 86_400L
        val afterDays = seconds % 86_400L
        val hours = afterDays / 3_600L
        val afterHours = afterDays % 3_600L
        val minutes = afterHours / 60L
        val finalSeconds = afterHours % 60L
        return CountdownRemaining(
            days = days,
            hours = hours,
            minutes = minutes,
            seconds = finalSeconds,
            isFuture = seconds > 0L,
        )
    }
}

object CountdownPresets {
    private val springFestivalDates = mapOf(
        2026 to LocalDate.of(2026, Month.FEBRUARY, 17),
        2027 to LocalDate.of(2027, Month.FEBRUARY, 6),
        2028 to LocalDate.of(2028, Month.JANUARY, 26),
        2029 to LocalDate.of(2029, Month.FEBRUARY, 13),
        2030 to LocalDate.of(2030, Month.FEBRUARY, 3),
    )

    fun forYear(year: Int): List<CountdownTarget> = listOf(
        CountdownTarget("new_year_$year", "New Year", LocalDate.of(year, Month.JANUARY, 1), isPreset = true),
        CountdownTarget(
            "spring_festival_$year",
            "Spring Festival",
            springFestivalDates[year] ?: LocalDate.of(year, Month.FEBRUARY, 1),
            isPreset = true,
        ),
        CountdownTarget("christmas_$year", "Christmas", LocalDate.of(year, Month.DECEMBER, 25), isPreset = true),
        CountdownTarget("new_year_eve_$year", "New Year Eve", LocalDate.of(year, Month.DECEMBER, 31), isPreset = true),
    )
}
