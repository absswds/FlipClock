package com.binbi.flipclock.clock

import com.binbi.flipclock.core.settings.UserSettings
import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.util.Locale

class ClockViewModelTest {

    @Test
    fun buildState_formatsDateAndSignatureForChineseDefaults() {
        val state = ClockViewModel.buildState(
            now = Instant.parse("2022-08-25T22:12:45Z"),
            settings = UserSettings(),
            systemZoneId = ZoneId.of("Asia/Shanghai"),
            systemLocale = Locale.CHINA,
        )

        assertEquals("2022年8月26日 星期五", state.dateText)
        assertEquals("翻页时钟", state.signature)
    }

    @Test
    fun buildState_appliesTimezoneOverrideAndLocalizedDefaultSignature() {
        val state = ClockViewModel.buildState(
            now = Instant.parse("2022-08-25T22:12:45Z"),
            settings = UserSettings(
                language = "ja",
                timezone = "Asia/Tokyo",
                signature = "",
            ),
            systemZoneId = ZoneId.of("UTC"),
            systemLocale = Locale.JAPAN,
        )

        assertEquals(listOf(0, 7), state.hourDigits)
        assertEquals("フリップクロック", state.signature)
        assertEquals("2022年8月26日 金曜日", state.dateText)
    }

    @Test
    fun buildState_passesCustomDateAndSignatureFontSizesThrough() {
        val state = ClockViewModel.buildState(
            now = Instant.parse("2022-08-25T22:12:45Z"),
            settings = UserSettings(
                dateFontSize = 34,
                signatureFontSize = 22,
            ),
            systemZoneId = ZoneId.of("Asia/Shanghai"),
            systemLocale = Locale.CHINA,
        )

        assertEquals(34, state.dateFontSize)
        assertEquals(22, state.signatureFontSize)
    }
}
