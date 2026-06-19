package com.binbi.flipclock.productivity

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.Clock
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

data class TimerUiState(
    val timer: TimerState = TimerState(durationMillis = 5 * 60_000L),
    val defaultMillis: Long = 5 * 60_000L,
    val showCompletionAlert: Boolean = false,
)

class TimerViewModel(
    private val repository: ProductivityRepository,
    private val clock: Clock = Clock.systemDefaultZone(),
) : ViewModel() {

    private val _uiState = MutableStateFlow(TimerUiState())
    val uiState: StateFlow<TimerUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.settings.collect { settings ->
                _uiState.value = _uiState.value.let { current ->
                    val shouldReplaceTimer = !current.timer.isRunning && current.timer.remainingMillis == current.defaultMillis
                    current.copy(
                        defaultMillis = settings.timerDefaultMillis,
                        timer = if (shouldReplaceTimer) {
                            TimerCalculator.reset(settings.timerDefaultMillis)
                        } else {
                            current.timer
                        },
                    )
                }
            }
        }
        viewModelScope.launch { runTicker() }
    }

    fun setDurationMinutes(minutes: Int) {
        val duration = minutes.coerceAtLeast(1) * 60_000L
        _uiState.value = _uiState.value.copy(
            timer = TimerCalculator.reset(duration),
            defaultMillis = duration,
            showCompletionAlert = false,
        )
        viewModelScope.launch { repository.setTimerDefaultMillis(duration) }
    }

    fun startOrResume() {
        val now = clock.millis()
        _uiState.value = _uiState.value.let { current ->
            val nextTimer = if (current.timer.remainingMillis == current.timer.durationMillis) {
                TimerCalculator.start(current.timer.durationMillis, now)
            } else {
                TimerCalculator.resume(current.timer, now)
            }
            current.copy(timer = nextTimer, showCompletionAlert = false)
        }
    }

    fun pause() {
        _uiState.value = _uiState.value.let { it.copy(timer = TimerCalculator.pause(it.timer, clock.millis())) }
    }

    fun reset() {
        _uiState.value = _uiState.value.let {
            it.copy(timer = TimerCalculator.reset(it.defaultMillis), showCompletionAlert = false)
        }
    }

    fun dismissAlert() {
        _uiState.value = _uiState.value.copy(showCompletionAlert = false)
    }

    private suspend fun runTicker() {
        while (true) {
            delay(250L)
            val current = _uiState.value
            if (current.timer.isRunning) {
                val ticked = TimerCalculator.tick(current.timer, clock.millis())
                _uiState.value = current.copy(
                    timer = ticked,
                    showCompletionAlert = ticked.isComplete || current.showCompletionAlert,
                )
            }
        }
    }
}

data class StopwatchUiState(
    val stopwatch: StopwatchState = StopwatchState(),
)

class StopwatchViewModel(
    private val clock: Clock = Clock.systemDefaultZone(),
) : ViewModel() {

    private val _uiState = MutableStateFlow(StopwatchUiState())
    val uiState: StateFlow<StopwatchUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch { runTicker() }
    }

    fun startOrPause() {
        val now = clock.millis()
        _uiState.value = _uiState.value.let { current ->
            val next = if (current.stopwatch.isRunning) {
                StopwatchCalculator.pause(current.stopwatch, now)
            } else {
                StopwatchCalculator.start(current.stopwatch, now)
            }
            current.copy(stopwatch = next)
        }
    }

    fun lap() {
        _uiState.value = _uiState.value.let {
            it.copy(stopwatch = StopwatchCalculator.lap(it.stopwatch, clock.millis()))
        }
    }

    fun reset() {
        _uiState.value = StopwatchUiState(StopwatchCalculator.reset())
    }

    private suspend fun runTicker() {
        while (true) {
            delay(100L)
            val current = _uiState.value
            if (current.stopwatch.isRunning) {
                _uiState.value = current.copy(
                    stopwatch = StopwatchCalculator.tick(current.stopwatch, clock.millis()),
                )
            }
        }
    }
}

data class CountdownUiState(
    val targets: List<CountdownTarget> = emptyList(),
    val selectedTarget: CountdownTarget? = null,
    val remaining: CountdownRemaining = CountdownRemaining(0, 0, 0, 0, false),
    val titleDraft: String = "",
    val dateDraft: String = "",
)

class CountdownViewModel(
    private val repository: ProductivityRepository,
    private val clock: Clock = Clock.systemDefaultZone(),
) : ViewModel() {

    private var settings = ProductivitySettings()
    private val _uiState = MutableStateFlow(CountdownUiState())
    val uiState: StateFlow<CountdownUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.settings.collect {
                settings = it
                rebuild()
            }
        }
        viewModelScope.launch {
            while (true) {
                delay(1_000L)
                rebuild()
            }
        }
    }

    fun setTitleDraft(value: String) {
        _uiState.value = _uiState.value.copy(titleDraft = value.take(30))
    }

    fun setDateDraft(value: String) {
        _uiState.value = _uiState.value.copy(dateDraft = value.take(10))
    }

    fun addDraftTarget() {
        val title = _uiState.value.titleDraft.ifBlank { "Custom Event" }
        val date = runCatching { LocalDate.parse(_uiState.value.dateDraft) }.getOrNull() ?: return
        val target = CountdownTarget(
            id = "custom_${UUID.randomUUID()}",
            title = title,
            date = date,
            isPreset = false,
        )
        viewModelScope.launch { repository.saveCountdownTarget(target) }
        _uiState.value = _uiState.value.copy(titleDraft = "", dateDraft = "")
    }

    fun selectTarget(id: String) {
        viewModelScope.launch { repository.selectCountdownTarget(id) }
    }

    private fun rebuild() {
        val now = LocalDateTime.now(clock)
        val allTargets = (CountdownPresets.forYear(now.year) + CountdownPresets.forYear(now.year + 1) + settings.countdownTargets)
            .distinctBy { it.id }
            .sortedBy { it.date }
        val selected = allTargets.firstOrNull { it.id == settings.selectedCountdownId }
            ?: allTargets.firstOrNull { !it.date.atStartOfDay().isBefore(now) }
            ?: allTargets.firstOrNull()
        val remaining = selected?.let { CountdownCalculator.remaining(now, it.date.atStartOfDay()) }
            ?: CountdownRemaining(0, 0, 0, 0, false)
        _uiState.value = _uiState.value.copy(
            targets = allTargets,
            selectedTarget = selected,
            remaining = remaining,
        )
    }
}

data class PomodoroUiState(
    val state: PomodoroState = PomodoroEngine.initial(PomodoroSettings()),
    val settings: PomodoroSettings = PomodoroSettings(),
)

class PomodoroViewModel(
    private val repository: ProductivityRepository,
    private val clock: Clock = Clock.systemDefaultZone(),
) : ViewModel() {

    private val _uiState = MutableStateFlow(PomodoroUiState())
    val uiState: StateFlow<PomodoroUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.settings.collect { settings ->
                _uiState.value = _uiState.value.let { current ->
                    if (!current.state.timer.isRunning) {
                        PomodoroUiState(PomodoroEngine.initial(settings.pomodoroSettings), settings.pomodoroSettings)
                    } else {
                        current.copy(settings = settings.pomodoroSettings)
                    }
                }
            }
        }
        viewModelScope.launch { runTicker() }
    }

    fun startOrPause() {
        val now = clock.millis()
        _uiState.value = _uiState.value.let { current ->
            val timer = if (current.state.timer.isRunning) {
                TimerCalculator.pause(current.state.timer, now)
            } else {
                TimerCalculator.resume(current.state.timer, now)
            }
            current.copy(state = current.state.copy(timer = timer, showCompletionAlert = false))
        }
    }

    fun skip() {
        _uiState.value = _uiState.value.let {
            it.copy(state = PomodoroEngine.completeCurrent(it.state, it.settings))
        }
    }

    fun reset() {
        _uiState.value = _uiState.value.let {
            it.copy(state = PomodoroEngine.reset(it.settings))
        }
    }

    fun dismissAlert() {
        _uiState.value = _uiState.value.let {
            it.copy(state = it.state.copy(showCompletionAlert = false))
        }
    }

    fun setSettings(settings: PomodoroSettings) {
        viewModelScope.launch { repository.setPomodoroSettings(settings) }
    }

    private suspend fun runTicker() {
        while (true) {
            delay(250L)
            val current = _uiState.value
            if (current.state.timer.isRunning) {
                val ticked = TimerCalculator.tick(current.state.timer, clock.millis())
                val nextState = if (ticked.isComplete) {
                    PomodoroEngine.completeCurrent(current.state.copy(timer = ticked), current.settings)
                } else {
                    current.state.copy(timer = ticked)
                }
                _uiState.value = current.copy(state = nextState)
            }
        }
    }
}
