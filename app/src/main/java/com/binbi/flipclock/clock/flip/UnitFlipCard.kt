package com.binbi.flipclock.clock.flip

import androidx.compose.foundation.border
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
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
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
    val shape = RoundedCornerShape(cardHeight * 0.075f)
    Box(
        modifier
            .clip(shape)
            .border(1.dp, theme.cardEdge, shape)
            .drawWithContent {
                drawContent()
                val sideShade = theme.cardEdgeShadow.copy(
                    alpha = FlipCardShadow.computeCardEdgeShadowAlpha(0f, 0.5f),
                )
                val verticalShade = theme.cardEdgeShadow.copy(
                    alpha = FlipCardShadow.computeCardEdgeShadowAlpha(0.5f, 0f),
                )
                drawRect(
                    brush = Brush.horizontalGradient(
                        0f to sideShade,
                        0.12f to Color.Transparent,
                        0.88f to Color.Transparent,
                        1f to sideShade,
                    ),
                )
                drawRect(
                    brush = Brush.verticalGradient(
                        0f to verticalShade,
                        0.16f to Color.Transparent,
                        0.84f to Color.Transparent,
                        1f to verticalShade,
                    ),
                )
            },
    ) {
        // The Row alone determines the card's size (sum of its glyph widths).
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

        // Overlay matched to the card's *actual* size (matchParentSize doesn't grow the card),
        // so the seam spans exactly the unit's width — not the whole screen.
        Box(Modifier.matchParentSize()) {
            Box(
                Modifier
                    .align(Alignment.Center)
                    .offset(y = (-2).dp)
                    .fillMaxWidth()
                    .height(5.dp)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, theme.hingeShadow),
                        ),
                    ),
            )
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
            Box(
                Modifier
                    .align(Alignment.TopCenter)
                    .fillMaxWidth()
                    .height(cardHeight * 0.14f)
                    .background(Brush.verticalGradient(listOf(theme.topHighlight, Color.Transparent))),
            )
        }
    }
}
