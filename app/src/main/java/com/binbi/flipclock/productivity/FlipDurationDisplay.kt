package com.binbi.flipclock.productivity

import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.binbi.flipclock.clock.flip.UnitFlipCard
import com.binbi.flipclock.ui.theme.ClockTheme
import com.binbi.flipclock.ui.theme.ClockThemePresets

sealed interface FlipTextPart {
    data class Digits(val digits: List<Int>) : FlipTextPart
    data class Separator(val text: String) : FlipTextPart
}

const val DefaultFlipDurationHeightDp = 240f
const val LargeFlipDurationHeightDp = 240f
const val CompactFlipDurationHeightDp = 180f

object StageFlipHeights {
    const val primary = 364f
    const val primaryCompact = 307f
    const val secondary = 340f
    const val secondaryCompact = 280f
}

data class FlipDurationLayout(
    val glyphWidth: Float,
    val cardHeight: Float,
    val fontSize: Float,
    val separatorWidth: Float,
    val separatorFontSize: Float,
)

fun splitFlipText(text: String): List<FlipTextPart> {
    if (text.isEmpty()) return emptyList()

    val parts = mutableListOf<FlipTextPart>()
    var index = 0
    while (index < text.length) {
        val start = index
        val digitRun = text[index].isDigit()
        while (index < text.length && text[index].isDigit() == digitRun) {
            index++
        }
        val chunk = text.substring(start, index)
        parts += if (digitRun) {
            FlipTextPart.Digits(chunk.map { it.digitToInt() })
        } else {
            FlipTextPart.Separator(chunk)
        }
    }
    return parts
}

fun calculateFlipDurationLayout(
    digitCount: Int,
    separatorCount: Int,
    maxWidth: Float,
    maxHeight: Float,
    scaleFactor: Float = 1f,
): FlipDurationLayout {
    val safeDigitCount = digitCount.coerceAtLeast(1)
    val separatorWeight = 0.12f
    val weightedGlyphs = safeDigitCount + separatorCount * separatorWeight
    val targetWidth = maxWidth * 0.98f
    val aspectRatio = 1.78f * scaleFactor
    var glyphWidth = targetWidth / weightedGlyphs
    var cardHeight = glyphWidth * aspectRatio
    val maxCardHeight = maxHeight * 0.92f
    if (cardHeight > maxCardHeight) {
        cardHeight = maxCardHeight
        glyphWidth = cardHeight / aspectRatio
    }

    return FlipDurationLayout(
        glyphWidth = glyphWidth,
        cardHeight = cardHeight,
        fontSize = glyphWidth * 1.52f * scaleFactor,
        separatorWidth = glyphWidth * separatorWeight,
        separatorFontSize = cardHeight * 0.42f,
    )
}

@Composable
fun FlipDurationDisplay(
    text: String,
    theme: ClockTheme = ClockThemePresets.ClassicBlack,
    modifier: Modifier = Modifier,
    height: Dp = DefaultFlipDurationHeightDp.dp,
    scaleFactor: Float = 1f,
) {
    val parts = remember(text) { splitFlipText(text) }
    val digitCount = parts.sumOf { part ->
        when (part) {
            is FlipTextPart.Digits -> part.digits.size
            is FlipTextPart.Separator -> 0
        }
    }.coerceAtLeast(1)
    val separatorCount = parts.count { it is FlipTextPart.Separator }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .height(height),
        contentAlignment = Alignment.Center,
    ) {
        val layout = calculateFlipDurationLayout(
            digitCount = digitCount,
            separatorCount = separatorCount,
            maxWidth = maxWidth.value,
            maxHeight = maxHeight.value,
            scaleFactor = scaleFactor,
        )
        val glyphWidth = layout.glyphWidth.dp
        val cardHeight = layout.cardHeight.dp
        val separatorWidth = layout.separatorWidth.dp
        val fontSize = with(LocalDensity.current) { layout.fontSize.dp.toSp() }
        val separatorFontSize = with(LocalDensity.current) { layout.separatorFontSize.dp.toSp() }

        Row(verticalAlignment = Alignment.CenterVertically) {
            parts.forEach { part ->
                when (part) {
                    is FlipTextPart.Digits -> UnitFlipCard(
                        digits = part.digits,
                        theme = theme,
                        glyphWidth = glyphWidth,
                        cardHeight = cardHeight,
                        fontSize = fontSize,
                    )

                    is FlipTextPart.Separator -> Text(
                        text = part.text,
                        color = theme.digit,
                        fontSize = separatorFontSize,
                        fontWeight = FontWeight.Black,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.width(separatorWidth),
                    )
                }
            }
        }
    }
}
