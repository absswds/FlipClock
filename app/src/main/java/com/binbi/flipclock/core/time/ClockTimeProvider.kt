package com.binbi.flipclock.core.time

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.time.Clock
import java.time.LocalDateTime

/**
 * Emits the current [LocalDateTime] once per second, re-aligning to the next whole-second
 * boundary every cycle so the clock never drifts over long standby sessions.
 *
 * The [clock] is injectable so the time source can be faked in unit tests.
 */
class ClockTimeProvider(private val clock: Clock = Clock.systemDefaultZone()) {

    fun timeFlow(): Flow<LocalDateTime> = flow {
        while (true) {
            emit(LocalDateTime.now(clock))
            val millisToNextSecond = 1000L - (clock.millis() % 1000L)
            delay(millisToNextSecond)
        }
    }
}
