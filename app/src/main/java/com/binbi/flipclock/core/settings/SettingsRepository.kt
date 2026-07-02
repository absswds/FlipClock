package com.binbi.flipclock.core.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
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
        val language = stringPreferencesKey("language")
        val timezone = stringPreferencesKey("timezone")
        val dateFontSize = intPreferencesKey("date_font_size")
        val signatureFontSize = intPreferencesKey("signature_font_size")
    }

    val settings: Flow<UserSettings> = appContext.dataStore.data.map { prefs ->
        UserSettings(
            timeFormat = prefs[Keys.timeFormat]
                ?.let { runCatching { TimeFormat.valueOf(it) }.getOrNull() }
                ?: TimeFormat.H24,
            showSeconds = prefs[Keys.showSeconds] ?: true,
            signature = migrateSignature(prefs[Keys.signature]),
            themeId = migrateThemeId(prefs[Keys.themeId]),
            language = prefs[Keys.language] ?: "auto",
            timezone = prefs[Keys.timezone] ?: "auto",
            dateFontSize = prefs[Keys.dateFontSize] ?: 28,
            signatureFontSize = prefs[Keys.signatureFontSize] ?: 16,
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

    suspend fun setLanguage(language: String) {
        appContext.dataStore.edit { it[Keys.language] = language }
    }

    suspend fun setTimezone(timezone: String) {
        appContext.dataStore.edit { it[Keys.timezone] = timezone }
    }

    suspend fun setDateFontSize(size: Int) {
        appContext.dataStore.edit { it[Keys.dateFontSize] = size }
    }

    suspend fun setSignatureFontSize(size: Int) {
        appContext.dataStore.edit { it[Keys.signatureFontSize] = size }
    }

    private fun migrateSignature(signature: String?): String =
        when (signature?.trim()) {
            null,
            "",
            "Stay hungry, Stay foolish",
            "翻页时钟",
            "Flip Clock" -> ""
            else -> signature
        }

    private fun migrateThemeId(themeId: String?): String =
        when (themeId) {
            "paper_desk",
            "classic_black",
            "pure_black" -> themeId
            else -> "paper_desk"
        }
}
