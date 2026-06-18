package com.binbi.flipclock.core.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.binbi.flipclock.core.time.TimeFormat
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_settings")

/** DataStore-backed persistence for [UserSettings]. */
class SettingsRepository(context: Context) {

    private val appContext = context.applicationContext

    private object Keys {
        val timeFormat = stringPreferencesKey("time_format")
        val showSeconds = booleanPreferencesKey("show_seconds")
        val signature = stringPreferencesKey("signature")
        val themeId = stringPreferencesKey("theme_id")
    }

    val settings: Flow<UserSettings> = appContext.dataStore.data.map { prefs ->
        UserSettings(
            timeFormat = prefs[Keys.timeFormat]
                ?.let { runCatching { TimeFormat.valueOf(it) }.getOrNull() }
                ?: TimeFormat.H24,
            showSeconds = prefs[Keys.showSeconds] ?: true,
            signature = prefs[Keys.signature] ?: "Stay hungry, Stay foolish",
            themeId = prefs[Keys.themeId] ?: "classic_black",
        )
    }

    suspend fun setTimeFormat(format: TimeFormat) {
        appContext.dataStore.edit { it[Keys.timeFormat] = format.name }
    }

    suspend fun setShowSeconds(show: Boolean) {
        appContext.dataStore.edit { it[Keys.showSeconds] = show }
    }

    suspend fun setSignature(text: String) {
        appContext.dataStore.edit { it[Keys.signature] = text }
    }

    suspend fun setThemeId(id: String) {
        appContext.dataStore.edit { it[Keys.themeId] = id }
    }
}
