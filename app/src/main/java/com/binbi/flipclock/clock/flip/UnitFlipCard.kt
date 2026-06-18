package com.binbi.flipclock.clock.flip

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import com.binbi.flipclock.ui.theme.ClockTheme

/**
 * One time unit (hour, minute, or second) rendered as a *single* rounded card: its digits sit
 * flush so their shared gradient reads as one continuous face, with one hinge seam drawn straight
 * across the whole card. Each digit still flips independently inside it.
 */
@Composable
fun UnitFlipCard(
    digits: List<Int>,
    theme: ClockTheme,
    glyphWidth: Dp,
    cardHeight: Dp,
    fontSize: TextUnit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.clip(RoundedCornerShape(cardHeight * 0.11f))) {
        Row {
            digits.forEach { d ->
                FlipGlyph(
                    digit = d,
                    theme = theme,
                    width = glyphWidth,
                    height = cardHeight,
                    fontSize = fontSize,
                )
            }
        }

        // One continuous hinge seam across the whole unit, plus a faint bevel below it.
        Box(
            Modifier
                .align(Alignment.Center)
                .fillMaxWidth()
                .height(2.dp)
                .background(theme.hinge),
        )
        Box(
            Modifier
                .align(Alignment.Center)
                .offset(y = 1.5.dp)
                .fillMaxWidth()
                .height(1.dp)
                .background(theme.bevel),
        )
    }
}
