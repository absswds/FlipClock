package com.binbi.flipclock.clock.flip

import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import com.binbi.flipclock.ui.theme.ClockDigitFontFamily
import com.binbi.flipclock.ui.theme.ClockDigitFontWeight
import com.binbi.flipclock.ui.theme.ClockTheme

/**
 * One flipping digit. No card frame of its own — it draws the digit on the theme's card gradient,
 * so flush siblings inside a [UnitFlipCard] merge into one continuous face.
 *
 * At rest it is a *single* full-height glyph (impossible to duplicate). Only while a flip is in
 * progress does it split into the classic panels:
 *  - static top shows the new digit, static bottom keeps the old digit for the whole flip;
 *  - the old top flap falls 0→90° (hinged at the middle), then the new bottom flap drops 90→180°
 *    onto the old bottom, and at 180° we hand back to the single resting face.
 * The content swap is invisible because each flap is edge-on at 90°. Only a glyph whose [digit]
 * changes animates, so 30 -> 31 flips just the ones place.
 */
@Composable
fun FlipGlyph(
    digit: Int,
    theme: ClockTheme,
    width: Dp,
    height: Dp,
    fontSize: TextUnit,
    modifier: Modifier = Modifier,
) {
    var shown by remember { mutableIntStateOf(digit) }
    var previous by remember { mutableIntStateOf(digit) }
    val rotation = remember { Animatable(180f) }

    LaunchedEffect(digit) {
        if (digit != shown) {
            previous = shown
            shown = digit
            rotation.snapTo(0f)
            rotation.animateTo(180f, animationSpec = FlipAnimationSpec.flip)
        }
    }

    val r = rotation.value
    val newDigit = shown
    val oldDigit = previous

    Box(modifier.size(width, height)) {
        if (r >= 180f) {
            // Resting: one clean glyph spanning the whole card.
            DigitFace(newDigit, width, height, fontSize, theme)
        } else {
            // Static halves behind the moving flap.
            Half(top = true, width, height, Modifier.align(Alignment.TopCenter)) {
                DigitFace(newDigit, width, height, fontSize, theme)
            }
            Half(top = false, width, height, Modifier.align(Alignment.BottomCenter)) {
                // Stays on the old digit for the whole flip; the falling new flap brings the new
                // value, and at 180° we hand off to the single resting face.
                DigitFace(oldDigit, width, height, fontSize, theme)
            }

            if (r < 90f) {
                // Old top flap, hinged at the card middle, falling toward us.
                Half(
                    top = true,
                    width,
                    height,
                    Modifier
                        .align(Alignment.TopCenter)
                        .graphicsLayer {
                            rotationX = -r
                            cameraDistance = 12f * density
                            transformOrigin = TransformOrigin(0.5f, 1f)
                        },
                ) {
                    Box(Modifier.size(width, height)) {
                        DigitFace(oldDigit, width, height, fontSize, theme)
                        // Specular sheen while flat, then shadow as it turns edge-on.
                        Box(
                            Modifier
                                .size(width, height)
                                .background(Color.White.copy(alpha = FlipCardShadow.computeFlapHighlightAlpha(r))),
                        )
                        Box(
                            Modifier
                                .size(width, height)
                                .background(Color.Black.copy(alpha = FlipCardShadow.computeTopFlapShadowAlpha(r))),
                        )
                    }
                }
            } else {
                // New bottom flap, hinged at the card middle, dropping into place.
                Half(
                    top = false,
                    width,
                    height,
                    Modifier
                        .align(Alignment.BottomCenter)
                        .graphicsLayer {
                            rotationX = -(180f - r)
                            cameraDistance = 12f * density
                            transformOrigin = TransformOrigin(0.5f, 0f)
                        },
                ) {
                    Box(Modifier.size(width, height)) {
                        DigitFace(newDigit, width, height, fontSize, theme)
                        Box(
                            Modifier
                                .size(width, height)
                                .background(Color.Black.copy(alpha = FlipCardShadow.computeBottomFlapShadowAlpha(r))),
                        )
                    }
                }
            }
        }
    }
}

/**
 * Renders [content] (which must be a single full-card-height element) but occupies only the top or
 * bottom half of the card, clipping to that half. The content is *measured at the full card height*
 * via fixed constraints — so the glyph it contains stays full size and is shown bisected at the
 * exact card middle, instead of being centered inside the half (which would duplicate it).
 */
@Composable
private fun Half(
    top: Boolean,
    width: Dp,
    height: Dp,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Layout(content = content, modifier = modifier.clipToBounds()) { measurables, _ ->
        val wPx = width.roundToPx()
        val hPx = height.roundToPx()
        val halfPx = hPx / 2
        val placeable = measurables.first().measure(Constraints.fixed(wPx, hPx))
        layout(wPx, halfPx) {
            // Top half: show rows 0..half. Bottom half: shift the full glyph up so rows half..h show.
            placeable.place(0, if (top) 0 else -halfPx)
        }
    }
}

/** A full-card-height face: the gradient card with one centered glyph. Never split. */
@Composable
private fun DigitFace(
    digit: Int,
    width: Dp,
    height: Dp,
    fontSize: TextUnit,
    theme: ClockTheme,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier
            .size(width, height)
            .background(
                Brush.verticalGradient(
                    0f to theme.cardTop,
                    0.48f to theme.cardTop,
                    0.52f to theme.cardBottom,
                    1f to theme.cardBottom,
                ),
            ),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = digit.toString(),
            color = theme.digit,
            fontSize = fontSize,
            fontWeight = ClockDigitFontWeight,
            fontFamily = ClockDigitFontFamily,
            textAlign = TextAlign.Center,
            modifier = Modifier.graphicsLayer(scaleX = 1.18f),
            style = TextStyle(
                platformStyle = PlatformTextStyle(includeFontPadding = false),
                lineHeightStyle = LineHeightStyle(
                    alignment = LineHeightStyle.Alignment.Center,
                    trim = LineHeightStyle.Trim.Both,
                ),
                shadow = Shadow(
                    color = Color.Black.copy(alpha = 0.22f),
                    offset = Offset(0f, 2.5f),
                    blurRadius = 3f,
                ),
            ),
        )
    }
}
