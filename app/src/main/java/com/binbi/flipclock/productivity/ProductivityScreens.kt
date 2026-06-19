package com.binbi.flipclock.productivity

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.time.format.DateTimeFormatter

private val Stage = Color(0xFF000000)
private val Panel = Color(0xFF17171A)
private val PanelBorder = Color(0xFF333338)
private val TextPrimary = Color(0xFFF4F4F5)
private val TextSecondary = Color(0xFF9A9AA0)
private val Accent = Color(0xFFFFFFFF)

@Composable
fun TimerScreen(viewModel: TimerViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsState()
    ToolSurface("Timer", modifier) {
        CompletionBanner(
            visible = state.showCompletionAlert,
            text = "Timer complete",
            onDismiss = viewModel::dismissAlert,
        )
        BigTime(formatDuration(state.timer.remainingMillis, showHours = false))
        QuickDurations(onSelect = viewModel::setDurationMinutes)
        ControlRow {
            PrimaryControl(
                icon = if (state.timer.isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                text = if (state.timer.isRunning) "Pause" else "Start",
                onClick = { if (state.timer.isRunning) viewModel.pause() else viewModel.startOrResume() },
            )
            SecondaryIcon(Icons.Filled.Refresh, "Reset", viewModel::reset)
        }
    }
}

@Composable
fun StopwatchScreen(viewModel: StopwatchViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsState()
    ToolSurface("Stopwatch", modifier) {
        BigTime(formatDuration(state.stopwatch.elapsedMillis, showHours = false))
        ControlRow {
            PrimaryControl(
                icon = if (state.stopwatch.isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                text = if (state.stopwatch.isRunning) "Pause" else "Start",
                onClick = viewModel::startOrPause,
            )
            SecondaryIcon(Icons.Filled.Flag, "Lap", viewModel::lap)
            SecondaryIcon(Icons.Filled.Refresh, "Reset", viewModel::reset)
        }
        if (state.stopwatch.lapsMillis.isNotEmpty()) {
            Spacer(Modifier.height(18.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                state.stopwatch.lapsMillis.take(6).forEachIndexed { index, lap ->
                    Text(
                        text = "Lap ${state.stopwatch.lapsMillis.size - index}   ${formatDuration(lap)}",
                        color = TextSecondary,
                        fontSize = 16.sp,
                    )
                }
            }
        }
    }
}

@Composable
fun CountdownScreen(viewModel: CountdownViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsState()
    ToolSurface("Countdown", modifier) {
        Text(
            text = state.selectedTarget?.title ?: "No target",
            color = TextPrimary,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(10.dp))
        Text(
            text = state.selectedTarget?.date?.format(DateTimeFormatter.ISO_DATE).orEmpty(),
            color = TextSecondary,
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(18.dp))
        FlipDurationDisplay("${state.remaining.days}", height = LargeFlipDurationHeightDp.dp)
        Text("days", color = TextSecondary, fontSize = 18.sp)
        Spacer(Modifier.height(10.dp))
        FlipDurationDisplay(
            text = "%02d:%02d:%02d".format(
                state.remaining.hours,
                state.remaining.minutes,
                state.remaining.seconds,
            ),
            height = CompactFlipDurationHeightDp.dp,
        )
        Spacer(Modifier.height(18.dp))
        TargetScroller(state.targets, state.selectedTarget?.id, viewModel::selectTarget)
        Spacer(Modifier.height(18.dp))
        AddTargetRow(state, viewModel)
    }
}

@Composable
fun PomodoroScreen(viewModel: PomodoroViewModel, modifier: Modifier = Modifier) {
    val ui by viewModel.uiState.collectAsState()
    val state = ui.state
    ToolSurface("Pomodoro", modifier) {
        CompletionBanner(
            visible = state.showCompletionAlert,
            text = "${pomodoroLabel(state.mode)} ready",
            onDismiss = viewModel::dismissAlert,
        )
        Text(pomodoroLabel(state.mode), color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("${state.completedFocusSessions} focus sessions", color = TextSecondary, fontSize = 15.sp)
        Spacer(Modifier.height(18.dp))
        BigTime(formatDuration(state.timer.remainingMillis, showHours = false))
        ControlRow {
            PrimaryControl(
                icon = if (state.timer.isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                text = if (state.timer.isRunning) "Pause" else "Start",
                onClick = viewModel::startOrPause,
            )
            SecondaryIcon(Icons.Filled.SkipNext, "Skip", viewModel::skip)
            SecondaryIcon(Icons.Filled.Refresh, "Reset", viewModel::reset)
        }
    }
}

@Composable
private fun ToolSurface(title: String, modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Stage)
            .systemBarsPadding()
            .padding(horizontal = 18.dp, vertical = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 72.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(title, color = TextSecondary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(18.dp))
            content()
        }
    }
}

@Composable
private fun BigTime(text: String) {
    FlipDurationDisplay(text)
    Spacer(Modifier.height(22.dp))
}

@Composable
private fun QuickDurations(onSelect: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        listOf(1, 5, 10, 25).forEach { minutes ->
            OutlinedButton(onClick = { onSelect(minutes) }) {
                Text("${minutes}m")
            }
        }
    }
    Spacer(Modifier.height(20.dp))
}

@Composable
private fun ControlRow(content: @Composable () -> Unit) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        content = { content() },
    )
}

@Composable
private fun PrimaryControl(icon: androidx.compose.ui.graphics.vector.ImageVector, text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = Accent, contentColor = Color.Black),
    ) {
        Icon(icon, contentDescription = text)
        Spacer(Modifier.width(8.dp))
        Text(text)
    }
}

@Composable
private fun SecondaryIcon(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, onClick: () -> Unit) {
    IconButton(
        onClick = onClick,
        modifier = Modifier
            .size(50.dp)
            .clip(RoundedCornerShape(25.dp))
            .border(1.dp, PanelBorder, RoundedCornerShape(25.dp))
            .background(Panel),
    ) {
        Icon(icon, contentDescription = label, tint = TextPrimary)
    }
}

@Composable
private fun CompletionBanner(visible: Boolean, text: String, onDismiss: () -> Unit) {
    if (!visible) return
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF25252A))
            .border(1.dp, Color(0xFF575760), RoundedCornerShape(8.dp))
            .clickable(onClick = onDismiss)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text, color = TextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
    }
    Spacer(Modifier.height(16.dp))
}

@Composable
private fun TargetScroller(targets: List<CountdownTarget>, selectedId: String?, onSelect: (String) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        targets.forEach { target ->
            val selected = target.id == selectedId
            TextButton(
                onClick = { onSelect(target.id) },
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (selected) Color(0xFF2D2D32) else Panel)
                    .border(1.dp, if (selected) Accent else PanelBorder, RoundedCornerShape(8.dp)),
            ) {
                Text(target.title, color = if (selected) TextPrimary else TextSecondary)
            }
        }
    }
}

@Composable
private fun AddTargetRow(state: CountdownUiState, viewModel: CountdownViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(
            value = state.titleDraft,
            onValueChange = viewModel::setTitleDraft,
            label = { Text("Title") },
            singleLine = true,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = state.dateDraft,
                onValueChange = viewModel::setDateDraft,
                label = { Text("yyyy-MM-dd") },
                singleLine = true,
                modifier = Modifier.weight(1f),
            )
            IconButton(
                onClick = viewModel::addDraftTarget,
                modifier = Modifier
                    .size(54.dp)
                    .clip(RoundedCornerShape(27.dp))
                    .background(Accent),
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Add", tint = Color.Black)
            }
        }
    }
}

private fun pomodoroLabel(mode: PomodoroMode): String =
    when (mode) {
        PomodoroMode.FOCUS -> "Focus"
        PomodoroMode.SHORT_BREAK -> "Short Break"
        PomodoroMode.LONG_BREAK -> "Long Break"
    }
