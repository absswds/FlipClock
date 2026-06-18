package com.binbi.flipclock.clock

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding()
                .offset(x = burnInOffset.first, y = burnInOffset.second)
                .padding(horizontal = 20.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top,
        ) {
            Text(
                text = state.dateText,
                color = state.theme.date,
                fontSize = 17.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.5.sp,
                textAlign = TextAlign.Center,
            )

            FlipClock(
                state = state,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
            )

            if (state.signature.isNotBlank()) {
                Text(
                    text = state.signature,
                    color = state.theme.signature,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Normal,
                    letterSpacing = 0.3.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
