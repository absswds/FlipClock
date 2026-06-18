package com.binbi.flipclock.clock

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * The full standby screen: date pinned near the top, the flip clock filling the centre, and the
 * signature below it, all on the theme's backdrop. [burnInOffset] nudges the whole content a few
 * dp (anti burn-in). Settings are reached by a **long-press anywhere** (keeping the face clean —
 * no persistent button to collide with the signature).
 *
 * Pure UI: it knows nothing about windows, sensors, or standby — those are wired by the caller.
 */
@Composable
fun ClockScreen(
    state: ClockUiState,
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier,
    burnInOffset: Pair<Dp, Dp> = 0.dp to 0.dp,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(state.theme.background)
            .pointerInput(Unit) {
                detectTapGestures(onLongPress = { onSettingsClick() })
            },
    ) {
        BoxWithConstraints(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding()
                .offset(x = burnInOffset.first, y = burnInOffset.second)
                .padding(horizontal = 24.dp, vertical = 22.dp),
        ) {
            val topInset = maxHeight * 0.18f
            val dateToClockGap = maxHeight * 0.055f
            val clockHeight = maxHeight * 0.40f
            val clockToSignatureGap = maxHeight * 0.055f

            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Top,
            ) {
                Spacer(Modifier.height(topInset))
                Text(
                    text = state.dateText,
                    color = state.theme.date,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.3.sp,
                    textAlign = TextAlign.Center,
                )

                Spacer(Modifier.height(dateToClockGap))

                FlipClock(
                    state = state,
                    modifier = Modifier
                        .height(clockHeight)
                        .fillMaxWidth(),
                )

                Spacer(Modifier.height(clockToSignatureGap))

                if (state.signature.isNotBlank()) {
                    Text(
                        text = state.signature,
                        color = state.theme.signature,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        letterSpacing = 0.1.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}
