package com.binbi.flipclock.productivity

object StopwatchCalculator {

    fun start(state: StopwatchState, nowMillis: Long): StopwatchState {
        if (state.isRunning) return state
        return state.copy(isRunning = true, startedAtMillis = nowMillis)
    }

    fun pause(state: StopwatchState, nowMillis: Long): StopwatchState {
        val ticked = tick(state, nowMillis)
        return ticked.copy(isRunning = false, startedAtMillis = null)
    }

    fun reset(): StopwatchState = StopwatchState()

    fun lap(state: StopwatchState, nowMillis: Long): StopwatchState {
        val ticked = tick(state, nowMillis)
        return ticked.copy(lapsMillis = listOf(ticked.elapsedMillis) + ticked.lapsMillis)
    }

    fun tick(state: StopwatchState, nowMillis: Long): StopwatchState {
        if (!state.isRunning) return state
        val startedAt = state.startedAtMillis ?: return state
        val elapsed = state.elapsedMillis + (nowMillis - startedAt).coerceAtLeast(0L)
        return state.copy(elapsedMillis = elapsed, startedAtMillis = nowMillis)
    }
}
