package com.binbi.flipclock.clock

import com.binbi.flipclock.core.settings.UserSettings
import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDateTime

class ClockViewModelTest {

    @Test
    fun buildState_formatsDateLikeReferenceChineseLayout() {
        val state = ClockViewModel.buildState(
            now = LocalDateTime.of(2022, 8, 25, 22, 12, 45),
            settings = UserSettings(),
        )

        assertEquals("2022年8月25日 星期四", state.dateText)
    }
}
