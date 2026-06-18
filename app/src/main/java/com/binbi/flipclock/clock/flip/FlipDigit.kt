package com.binbi.flipclock.clock.flip

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.material3.Text
import com.binbi.flipclock.ui.theme.ClockDigitFontFamily
import com.binbi.flipclock.ui.theme.ClockDigitFontWeight
import com.binbi.flipclock.ui.theme.ClockTheme

/**
 * A single flip-clock card at rest: a rounded card with a subtle vertical gradient,
 * a large centered digit, and a thin hinge seam across the middle (with a faint bevel
 * highlight just below it). This is the *static* card — the 3D flip animation is layered
 * on in a later phase; the resting appearance here is what the animation settles to.
 *
 * Font padding is disabled and the line height trimmed so the glyph sits optically centered,
 * which is exactly what keeps the seam crossing the digit's true middle.
 */
@Composable
fun FlipDigit(
    digit: Int,
    theme: ClockTheme,
    cardWidth: Dp,
    cardHeight: Dp,
    fontSize: TextUnit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .size(cardWidth, cardHeight)
            .clip(RoundedCornerShape(cardHeight * 0.11f))
            .background(Brush.verticalGradient(listOf(theme.cardTop, theme.cardBottom))),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = digit.toString(),
            color = theme.digit,
            fontSize = fontSize,
            fontWeight = ClockDigitFontWeight,
            fontFamily = ClockDigitFontFamily,
            textAlign = TextAlign.Center,
            style = TextStyle(
                platformStyle = PlatformTextStyle(includeFontPadding = false),
                lineHeightStyle = LineHeightStyle(
                    alignment = LineHeightStyle.Alignment.Center,
                    trim = LineHeightStyle.Trim.Both,
                ),
            ),
        )

        // Hinge seam across the exact vertical middle.
        Box(
            Modifier
                .align(Alignment.Center)
                .fillMaxWidth()
                .height(2.dp)
                .background(theme.hinge),
        )
        // Faint bevel just under the seam — the lower half's top edge catching light.
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
