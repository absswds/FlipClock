package com.binbi.flipclock.clock

import androidx.compose.foundation.layout.Arrangement
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
import com.binbi.flipclock.clock.flip.FlipDigit
import com.binbi.flipclock.ui.theme.ClockTheme

/**
 * Lays out the full HH:MM(:SS) display. Card size is derived from the *available width* so the
 * clock fills the screen the way the reference does, then capped by the available height so it
 * never overflows in landscape. Hour/minute/second are visually separated by larger gaps; the
 * two digits inside a group sit close together. The AM/PM indicator stacks to the left of the hour.
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
        val cardCount = if (showSeconds) 6 else 4 // worst case, for stable sizing

        // Horizontal rhythm as fractions of available width.
        val groupGap = maxWidth * 0.040f
        val innerGap = maxWidth * 0.014f
        val amPmReserve = if (state.amPm != null) maxWidth * 0.085f else 0.dp

        val betweenGroups = groupGap * (groupCount - 1)
        val withinGroups = innerGap * groupCount // ~one inner gap per group
        val usableWidth = maxWidth * 0.96f - amPmReserve - betweenGroups - withinGroups

        var cardWidth: Dp = usableWidth / cardCount
        var cardHeight: Dp = cardWidth * 1.46f
        // Cap by height so tall/landscape layouts stay on-screen.
        val maxCardHeight = maxHeight * 0.92f
        if (cardHeight > maxCardHeight) {
            cardHeight = maxCardHeight
            cardWidth = cardHeight / 1.46f
        }

        val fontSize = with(LocalDensity.current) { (cardHeight * 0.62f).toSp() }
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
                Spacer(Modifier.width(innerGap))
            }

            DigitGroup(state.hourDigits, theme, cardWidth, cardHeight, fontSize, innerGap)
            Spacer(Modifier.width(groupGap))
            DigitGroup(state.minuteDigits, theme, cardWidth, cardHeight, fontSize, innerGap)
            if (showSeconds) {
                Spacer(Modifier.width(groupGap))
                DigitGroup(state.secondDigits, theme, cardWidth, cardHeight, fontSize, innerGap)
            }
        }
    }
}

@Composable
private fun DigitGroup(
    digits: List<Int>,
    theme: ClockTheme,
    cardWidth: Dp,
    cardHeight: Dp,
    fontSize: androidx.compose.ui.unit.TextUnit,
    innerGap: Dp,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(innerGap)) {
        digits.forEach { digit ->
            FlipDigit(
                digit = digit,
                theme = theme,
                cardWidth = cardWidth,
                cardHeight = cardHeight,
                fontSize = fontSize,
            )
        }
    }
}
