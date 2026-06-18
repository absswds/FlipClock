package com.binbi.flipclock.clock.flip

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.requiredSize
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
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.Animatable
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import com.binbi.flipclock.ui.theme.ClockDigitFontFamily
import com.binbi.flipclock.ui.theme.ClockDigitFontWeight
import com.binbi.flipclock.ui.theme.ClockTheme

/**
 * One self-contained flipping digit. It has *no card frame of its own* — it just draws the digit
 * on the theme's card gradient, split into a top and a bottom half. Placed flush next to its
 * siblings inside a [UnitFlipCard], the identical gradients merge into one continuous card face.
 *
 * The 3D flip is the classic two-flap trick driven by a single 0->180° `rotationX` sweep:
 *  - 0..90°: the old digit's *top* flap falls down around the hinge, uncovering the new top.
 *  - 90..180°: the new digit's *bottom* flap drops in around the hinge, covering the old bottom.
 * The content swap is invisible because it happens while each flap is edge-on at 90°.
 *
 * Only a glyph whose [digit] actually changes animates, so e.g. 30 -> 31 flips just the ones place.
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
    val halfHeight = height / 2

    Box(modifier.size(width, height)) {
        // ---- TOP half ----
        Box(Modifier.align(Alignment.TopCenter).size(width, halfHeight)) {
            // Revealed (new) top, sitting behind the falling flap.
            DigitHalf(newDigit, top = true, width, height, fontSize, theme)

            if (r < 90f) {
                // The old top flap, hinged at the bottom (the card's middle), falling toward us.
                Box(
                    Modifier
                        .size(width, halfHeight)
                        .graphicsLayer {
                            rotationX = -r
                            cameraDistance = 12f * density
                            transformOrigin = TransformOrigin(0.5f, 1f)
                        },
                ) {
                    DigitHalf(oldDigit, top = true, width, height, fontSize, theme)
                    // Specular sheen while flat-facing, then shadow as it turns edge-on.
                    Box(
                        Modifier
                            .size(width, halfHeight)
                            .background(Color.White.copy(alpha = FlipCardShadow.computeFlapHighlightAlpha(r))),
                    )
                    Box(
                        Modifier
                            .size(width, halfHeight)
                            .background(Color.Black.copy(alpha = FlipCardShadow.computeTopFlapShadowAlpha(r))),
                    )
                }
            }
        }

        // ---- BOTTOM half ----
        Box(Modifier.align(Alignment.BottomCenter).size(width, halfHeight)) {
            // Static bottom: old until the crossover, then the new digit.
            DigitHalf(if (r < 90f) oldDigit else newDigit, top = false, width, height, fontSize, theme)

            if (r >= 90f) {
                // The new bottom flap, hinged at the top (the card's middle), dropping into place.
                Box(
                    Modifier
                        .size(width, halfHeight)
                        .graphicsLayer {
                            rotationX = -(180f - r)
                            cameraDistance = 12f * density
                            transformOrigin = TransformOrigin(0.5f, 0f)
                        },
                ) {
                    DigitHalf(newDigit, top = false, width, height, fontSize, theme)
                    Box(
                        Modifier
                            .size(width, halfHeight)
                            .background(Color.Black.copy(alpha = FlipCardShadow.computeBottomFlapShadowAlpha(r))),
                    )
                }
            }
        }
    }
}

/**
 * One half (top or bottom) of a digit. The inner box is the *full* card height carrying the full
 * gradient and a vertically centered glyph; the outer box clips it to half height. Because both
 * halves derive from the same full-height construction, the gradient and the glyph line up exactly
 * across the hinge seam.
 */
@Composable
private fun DigitHalf(
    digit: Int,
    top: Boolean,
    width: Dp,
    height: Dp,
    fontSize: TextUnit,
    theme: ClockTheme,
) {
    Box(
        Modifier
            .size(width, height / 2)
            .clipToBounds(),
    ) {
        // requiredSize (not size) forces the *full* card height so the glyph spans the whole card
        // and we clip to a single half — otherwise the parent's half-height constraint coerces
        // this box down and the digit ends up centered (and duplicated) within each half.
        Box(
            Modifier
                .requiredSize(width, height)
                .align(if (top) Alignment.TopCenter else Alignment.BottomCenter)
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
        }
    }
}
