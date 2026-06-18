package com.binbi.flipclock.clock

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.binbi.flipclock.clock.flip.UnitFlipCard

/**
 * Lays out the HH:MM(:SS) display as one flip card per unit (hour / minute / second), separated by
 * gaps, with the AM/PM indicator stacked to the left of the hour. Per-glyph size is derived from
 * the *available width* (so the clock fills the screen like the reference) using a fixed worst-case
 * glyph count, which keeps the digits a constant size even as the hour card widens/narrows
 * (e.g. 9 -> 10). Height caps the size so landscape never overflows.
 */
@Composable
fun FlipClock(
    state: ClockUiState,
    modifier: Modifier = Modifier,
) {
    BoxWithConstraints(modifier, contentAlignment = Alignment.Center) {
        val theme = state.theme
        val showSeconds = state.showSeconds
        val groupCount = if (showSeconds) 3 else 2
        // Worst-case glyph count for stable per-glyph sizing (hour is sized for 2 digits).
        val maxGlyphs = if (showSeconds) 6 else 4

        val targetClockWidth = maxWidth * 0.88f
        val groupGap = targetClockWidth * 0.022f
        val amPmReserve = if (state.amPm != null) targetClockWidth * 0.07f else 0.dp
        val amPmGap = if (state.amPm != null) maxWidth * 0.012f else 0.dp

        val betweenGroups = groupGap * (groupCount - 1)
        val usableWidth = targetClockWidth - amPmReserve - amPmGap - betweenGroups

        var glyphWidth: Dp = usableWidth / maxGlyphs
        var cardHeight: Dp = glyphWidth * 2.67f
        val maxCardHeight = maxHeight * 0.92f
        if (cardHeight > maxCardHeight) {
            cardHeight = maxCardHeight
            glyphWidth = cardHeight / 2.67f
        }

        // Size the digit off the glyph *width* (the real constraint for 6 digits across), not the
        // card height. The card aspect above is chosen so this tall-metrics font has ~9% vertical
        // margin and never clips at the seam/edges.
        val fontSize = with(LocalDensity.current) { (glyphWidth * 1.64f).toSp() }
        val amPmFontSize = with(LocalDensity.current) { (cardHeight * 0.14f).toSp() }

        Row(verticalAlignment = Alignment.CenterVertically) {
            if (state.amPm != null) {
                Box(
                    modifier = Modifier
                        .width(amPmReserve)
                        .height(cardHeight),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = state.amPm,
                        color = theme.accent,
                        fontSize = amPmFontSize,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(Modifier.width(amPmGap))
            }

            UnitFlipCard(state.hourDigits, theme, glyphWidth, cardHeight, fontSize)
            Spacer(Modifier.width(groupGap))
            UnitFlipCard(state.minuteDigits, theme, glyphWidth, cardHeight, fontSize)
            if (showSeconds) {
                Spacer(Modifier.width(groupGap))
                UnitFlipCard(state.secondDigits, theme, glyphWidth, cardHeight, fontSize)
            }
        }
    }
}
