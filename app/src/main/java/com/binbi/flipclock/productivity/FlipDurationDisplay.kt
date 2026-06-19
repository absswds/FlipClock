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
import com.binbi.flipclock.ui.theme.ClockThemePresets

sealed interface FlipTextPart {
    data class Digits(val digits: List<Int>) : FlipTextPart
    data class Separator(val text: String) : FlipTextPart
}

const val DefaultFlipDurationHeightDp = 240f
const val LargeFlipDurationHeightDp = 240f
const val CompactFlipDurationHeightDp = 180f

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
): FlipDurationLayout {
    val safeDigitCount = digitCount.coerceAtLeast(1)
    val separatorWeight = 0.18f
    val weightedGlyphs = safeDigitCount + separatorCount * separatorWeight
    val targetWidth = maxWidth * 0.96f
    var glyphWidth = targetWidth / weightedGlyphs
    var cardHeight = glyphWidth * 1.78f
    val maxCardHeight = maxHeight * 0.88f
    if (cardHeight > maxCardHeight) {
        cardHeight = maxCardHeight
        glyphWidth = cardHeight / 1.78f
    }

    return FlipDurationLayout(
        glyphWidth = glyphWidth,
        cardHeight = cardHeight,
        fontSize = glyphWidth * 1.52f,
        separatorWidth = glyphWidth * separatorWeight,
        separatorFontSize = cardHeight * 0.42f,
    )
}

@Composable
fun FlipDurationDisplay(
    text: String,
    modifier: Modifier = Modifier,
    height: Dp = DefaultFlipDurationHeightDp.dp,
) {
    val parts = remember(text) { splitFlipText(text) }
    val digitCount = parts.sumOf { part ->
        when (part) {
            is FlipTextPart.Digits -> part.digits.size
            is FlipTextPart.Separator -> 0
        }
    }.coerceAtLeast(1)
    val separatorCount = parts.count { it is FlipTextPart.Separator }
    val theme = ClockThemePresets.ClassicBlack

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
