package com.binbi.flipclock.productivity

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDate

private val Context.productivityDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "productivity_settings",
)

class ProductivityRepository(context: Context) {

    private val appContext = context.applicationContext

    private object Keys {
        val timerDefaultMillis = longPreferencesKey("timer_default_millis")
        val countdownTargets = stringPreferencesKey("countdown_targets")
        val selectedCountdownId = stringPreferencesKey("selected_countdown_id")
        val hiddenPresetKeys = stringPreferencesKey("hidden_preset_keys")
        val pomodoroFocusMinutes = intPreferencesKey("pomodoro_focus_minutes")
        val pomodoroShortBreakMinutes = intPreferencesKey("pomodoro_short_break_minutes")
        val pomodoroLongBreakMinutes = intPreferencesKey("pomodoro_long_break_minutes")
    }

    val settings: Flow<ProductivitySettings> = appContext.productivityDataStore.data.map { prefs ->
        val pomodoro = PomodoroSettings(
            focusMinutes = prefs[Keys.pomodoroFocusMinutes] ?: 25,
            shortBreakMinutes = prefs[Keys.pomodoroShortBreakMinutes] ?: 5,
            longBreakMinutes = prefs[Keys.pomodoroLongBreakMinutes] ?: 15,
        )
        ProductivitySettings(
            timerDefaultMillis = prefs[Keys.timerDefaultMillis] ?: 5 * 60_000L,
            countdownTargets = decodeTargets(prefs[Keys.countdownTargets].orEmpty()),
            selectedCountdownId = prefs[Keys.selectedCountdownId],
            hiddenPresetKeys = (prefs[Keys.hiddenPresetKeys].orEmpty())
                .split(",").filter { it.isNotBlank() }.toSet(),
            pomodoroSettings = pomodoro,
        )
    }

    suspend fun setTimerDefaultMillis(millis: Long) {
        appContext.productivityDataStore.edit { it[Keys.timerDefaultMillis] = millis.coerceAtLeast(1_000L) }
    }

    suspend fun saveCountdownTarget(target: CountdownTarget) {
        appContext.productivityDataStore.edit { prefs ->
            val current = decodeTargets(prefs[Keys.countdownTargets].orEmpty())
                .filterNot { it.id == target.id }
            val next = current + target.copy(isPreset = false)
            prefs[Keys.countdownTargets] = encodeTargets(next)
            prefs[Keys.selectedCountdownId] = target.id
        }
    }

    suspend fun selectCountdownTarget(id: String) {
        appContext.productivityDataStore.edit { it[Keys.selectedCountdownId] = id }
    }

    suspend fun deleteCountdownTarget(id: String) {
        appContext.productivityDataStore.edit { prefs ->
            val current = decodeTargets(prefs[Keys.countdownTargets].orEmpty())
                .filterNot { it.id == id }
            prefs[Keys.countdownTargets] = encodeTargets(current)
            if (prefs[Keys.selectedCountdownId] == id) {
                prefs[Keys.selectedCountdownId] = ""
            }
        }
    }

    suspend fun hidePreset(key: String) {
        appContext.productivityDataStore.edit { prefs ->
            val current = (prefs[Keys.hiddenPresetKeys].orEmpty())
                .split(",").filter { it.isNotBlank() }.toMutableSet()
            current.add(key)
            prefs[Keys.hiddenPresetKeys] = current.joinToString(",")
        }
    }

    suspend fun setPomodoroSettings(settings: PomodoroSettings) {
        appContext.productivityDataStore.edit {
            it[Keys.pomodoroFocusMinutes] = settings.focusMinutes.coerceAtLeast(1)
            it[Keys.pomodoroShortBreakMinutes] = settings.shortBreakMinutes.coerceAtLeast(1)
            it[Keys.pomodoroLongBreakMinutes] = settings.longBreakMinutes.coerceAtLeast(1)
        }
    }

    private fun encodeTargets(targets: List<CountdownTarget>): String =
        targets.joinToString(";") { target ->
            listOf(
                clean(target.id),
                clean(target.title),
                target.date.toString(),
            ).joinToString("|")
        }

    private fun decodeTargets(raw: String): List<CountdownTarget> {
        if (raw.isBlank()) return emptyList()
        return raw.split(";").mapNotNull { item ->
            val parts = item.split("|")
            if (parts.size != 3) return@mapNotNull null
            runCatching {
                CountdownTarget(
                    id = parts[0],
                    title = parts[1],
                    date = LocalDate.parse(parts[2]),
                    isPreset = false,
                )
            }.getOrNull()
        }
    }

    private fun clean(value: String): String =
        value.replace("|", " ").replace(";", " ").trim()
}
