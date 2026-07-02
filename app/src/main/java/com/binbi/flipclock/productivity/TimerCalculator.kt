package com.binbi.flipclock.productivity

import kotlin.math.max

object TimerCalculator {

    fun start(durationMillis: Long, nowMillis: Long): TimerState {
        val safeDuration = durationMillis.coerceAtLeast(1_000L)
        return TimerState(
            durationMillis = safeDuration,
            remainingMillis = safeDuration,
            isRunning = true,
            startedAtMillis = nowMillis,
            isComplete = false,
        )
    }

    fun start(state: TimerState, nowMillis: Long): TimerState =
        state.copy(isRunning = true, startedAtMillis = nowMillis, isComplete = false)

    fun pause(state: TimerState, nowMillis: Long): TimerState {
        val ticked = tick(state, nowMillis)
        return ticked.copy(isRunning = false, startedAtMillis = null)
    }

    fun resume(state: TimerState, nowMillis: Long): TimerState {
        if (state.remainingMillis <= 0L) return state.copy(isRunning = false, isComplete = true)
        return state.copy(isRunning = true, startedAtMillis = nowMillis, isComplete = false)
    }

    fun reset(durationMillis: Long): TimerState {
        val safeDuration = durationMillis.coerceAtLeast(1_000L)
        return TimerState(durationMillis = safeDuration, remainingMillis = safeDuration)
    }

    fun tick(state: TimerState, nowMillis: Long): TimerState {
        if (!state.isRunning) return state
        val startedAt = state.startedAtMillis ?: return state
        val remaining = max(0L, state.remainingMillis - (nowMillis - startedAt).coerceAtLeast(0L))
        return state.copy(
            remainingMillis = remaining,
            isRunning = remaining > 0L,
            startedAtMillis = if (remaining > 0L) nowMillis else null,
            isComplete = remaining == 0L,
        )
    }
}
