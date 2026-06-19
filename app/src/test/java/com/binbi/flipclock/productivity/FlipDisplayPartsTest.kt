package com.binbi.flipclock.productivity

import org.junit.Assert.assertEquals
import org.junit.Test

class FlipDisplayPartsTest {

    @Test
    fun splitsDurationIntoDigitGroupsAndSeparators() {
        val parts = splitFlipText("01:05:30")

        assertEquals(
            listOf(
                FlipTextPart.Digits(listOf(0, 1)),
                FlipTextPart.Separator(":"),
                FlipTextPart.Digits(listOf(0, 5)),
                FlipTextPart.Separator(":"),
                FlipTextPart.Digits(listOf(3, 0)),
            ),
            parts,
        )
    }

    @Test
    fun groupsLargeDayCountsAsOneFlipNumber() {
        val parts = splitFlipText("128")

        assertEquals(listOf(FlipTextPart.Digits(listOf(1, 2, 8))), parts)
    }

    @Test
    fun usesClockCardAspectForProductivityFlipCards() {
        val layout = calculateFlipDurationLayout(
            digitCount = 2,
            separatorCount = 0,
            maxWidth = 300f,
            maxHeight = 300f,
        )

        assertEquals(1.78f, layout.cardHeight / layout.glyphWidth, 0.001f)
        assertEquals(1.52f, layout.fontSize / layout.glyphWidth, 0.001f)
    }

    @Test
    fun defaultProductivityFlipAreaIsSizedForLargeCards() {
        assertEquals(240f, DefaultFlipDurationHeightDp, 0.001f)
        assertEquals(240f, LargeFlipDurationHeightDp, 0.001f)
        assertEquals(180f, CompactFlipDurationHeightDp, 0.001f)
    }

    @Test
    fun formatsSubHourDurationWithoutHourColumnWhenRequested() {
        assertEquals("05:00", formatDuration(5 * 60_000L, showHours = false))
    }
}
