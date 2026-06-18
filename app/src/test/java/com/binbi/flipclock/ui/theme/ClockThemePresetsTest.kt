package com.binbi.flipclock.ui.theme

import androidx.compose.ui.graphics.Color
import org.junit.Assert.assertEquals
import org.junit.Test

class ClockThemePresetsTest {

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
