package com.binbi.flipclock.ui.theme

import androidx.compose.ui.graphics.Color
import org.junit.Assert.assertEquals
import org.junit.Test

class ClockThemePresetsTest {

    @Test
    fun paperDesk_isDefaultFallback() {
        val theme = ClockThemePresets.byId("unknown")

        assertEquals("paper_desk", theme.id)
        assertEquals(Color(0xFFF4ECDF), theme.background)
    }

    @Test
    fun classicBlack_usesSolidNeutralGrayCardFace() {
        val theme = ClockThemePresets.ClassicBlack

        assertEquals(Color(0xFF3F3F3F), theme.cardTop)
        assertEquals(theme.cardTop, theme.cardBottom)
        assertEquals(theme.cardTop, theme.cardEdge)
        assertEquals(Color.Transparent, theme.cardEdgeShadow)
        assertEquals(Color.Transparent, theme.bevel)
        assertEquals(Color.Transparent, theme.topHighlight)
    }
}
