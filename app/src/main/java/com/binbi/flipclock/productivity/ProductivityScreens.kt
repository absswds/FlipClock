package com.binbi.flipclock.productivity

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.binbi.flipclock.clock.flip.UnitFlipCard
import com.binbi.flipclock.core.settings.AppLanguage
import com.binbi.flipclock.core.settings.labelFor
import com.binbi.flipclock.ui.theme.ClockTheme
import java.time.format.DateTimeFormatter

@Composable
fun TimerScreen(
    viewModel: TimerViewModel,
    theme: ClockTheme,
    language: AppLanguage,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    val showEditor = !state.timer.isRunning && !state.timer.isComplete && state.timer.remainingMillis == state.timer.durationMillis

    ToolSurface(theme = theme, modifier = modifier) { compact, colors ->
        CompletionBanner(
            visible = state.showCompletionAlert,
            text = labelFor(language, "timer_complete"),
            colors = colors,
            onDismiss = viewModel::dismissAlert,
        )

        if (showEditor) {
            StageArea(compact) {
                EditableTimerPicker(
                    editor = state.editor,
                    theme = theme,
                    compact = compact,
                    onAdjust = viewModel::adjustEditor,
                )
            }
            Spacer(Modifier.height(18.dp))
            QuickDurations(theme, compact, onSelect = viewModel::setDurationMinutes)
            ControlRow(compact) {
                PrimaryControl(
                    icon = Icons.Filled.PlayArrow,
                    text = labelFor(language, "start"),
                    colors = colors,
                    onClick = viewModel::startOrResume,
                )
                SecondaryIcon(Icons.Filled.Refresh, labelFor(language, "reset"), colors, viewModel::reset)
            }
        } else {
            PrimaryTime(
                text = formatDuration(
                    state.timer.remainingMillis,
                    showHours = state.timer.remainingMillis >= 3_600_000L || state.timer.durationMillis >= 3_600_000L,
                ),
                theme = theme,
                compact = compact,
            )
            ControlRow(compact) {
                PrimaryControl(
                    icon = if (state.timer.isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                    text = if (state.timer.isRunning) labelFor(language, "pause") else labelFor(language, "start"),
                    colors = colors,
                    onClick = { if (state.timer.isRunning) viewModel.pause() else viewModel.startOrResume() },
                )
                SecondaryIcon(Icons.Filled.Refresh, labelFor(language, "reset"), colors, viewModel::reset)
            }
        }
    }
}

@Composable
fun StopwatchScreen(
    viewModel: StopwatchViewModel,
    theme: ClockTheme,
    language: AppLanguage,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    ToolSurface(theme = theme, modifier = modifier) { compact, colors ->
        PrimaryTime(
            text = formatDuration(state.stopwatch.elapsedMillis, showHours = state.stopwatch.elapsedMillis >= 3_600_000L),
            theme = theme,
            compact = compact,
        )
        ControlRow(compact) {
            PrimaryControl(
                icon = if (state.stopwatch.isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                text = if (state.stopwatch.isRunning) labelFor(language, "pause") else labelFor(language, "start"),
                colors = colors,
                onClick = viewModel::startOrPause,
            )
            SecondaryIcon(Icons.Filled.Flag, labelFor(language, "lap"), colors, viewModel::lap)
            SecondaryIcon(Icons.Filled.Refresh, labelFor(language, "reset"), colors, viewModel::reset)
        }
        if (state.stopwatch.lapsMillis.isNotEmpty()) {
            Spacer(Modifier.height(18.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 320.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(colors.panel)
                    .border(1.dp, colors.border, RoundedCornerShape(8.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                state.stopwatch.lapsMillis.takeLast(6).reversed().forEachIndexed { index, lap ->
                    Text(
                        text = "${labelFor(language, "lap")} ${state.stopwatch.lapsMillis.size - index}   ${formatDuration(lap)}",
                        color = colors.textSecondary,
                        fontSize = 16.sp,
                    )
                }
            }
        }
    }
}

@Composable
fun CountdownScreen(
    viewModel: CountdownViewModel,
    theme: ClockTheme,
    language: AppLanguage,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    var showCreatePanel by remember { mutableStateOf(false) }
    var targetToDelete by remember { mutableStateOf<String?>(null) }

    if (targetToDelete != null) {
        val deleteId = targetToDelete!!
        val deleteTitle = state.targets.firstOrNull { it.id == deleteId }?.let {
            localizedCountdownTitle(it, language)
        } ?: ""
        AlertDialog(
            onDismissRequest = { targetToDelete = null },
            title = {
                Text(
                    when (language) {
                        AppLanguage.ZH -> "确认删除"
                        AppLanguage.JA -> "削除の確認"
                        AppLanguage.KO -> "삭제 확인"
                        else -> "Confirm Delete"
                    }
                )
            },
            text = { Text(deleteTitle) },
            confirmButton = {
                TextButton(onClick = { viewModel.deleteTarget(deleteId); targetToDelete = null }) {
                    Text(
                        when (language) {
                            AppLanguage.ZH -> "删除"
                            AppLanguage.JA -> "削除"
                            AppLanguage.KO -> "삭제"
                            else -> "Delete"
                        },
                        color = Color(0xFFE53935),
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { targetToDelete = null }) {
                    Text(
                        when (language) {
                            AppLanguage.ZH -> "取消"
                            AppLanguage.JA -> "キャンセル"
                            AppLanguage.KO -> "취소"
                            else -> "Cancel"
                        }
                    )
                }
            },
        )
    }

    ToolSurface(theme = theme, modifier = modifier) { compact, colors ->
        Spacer(Modifier.height(if (compact) 24.dp else 40.dp))
        Text(
            text = state.selectedTarget?.let { localizedCountdownTitle(it, language) }
                ?: labelFor(language, "no_target"),
            color = colors.textPrimary,
            fontSize = if (compact) 22.sp else 26.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = state.selectedTarget?.date?.format(DateTimeFormatter.ISO_DATE).orEmpty(),
            color = colors.textSecondary,
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(18.dp))
        CountdownStage(state = state, theme = theme, colors = colors, compact = compact, language = language)
        Spacer(Modifier.height(18.dp))
        TargetScroller(
            targets = state.targets,
            selectedId = state.selectedTarget?.id,
            language = language,
            colors = colors,
            onSelect = viewModel::selectTarget,
            showCreatePanel = showCreatePanel,
            onToggleCreatePanel = { showCreatePanel = !showCreatePanel },
            onDeleteRequest = { targetToDelete = it },
        )
        if (showCreatePanel) {
            Spacer(Modifier.height(18.dp))
            CountdownCreatePanel(state, viewModel, language, colors, compact)
        }
    }
}

@Composable
fun PomodoroScreen(
    viewModel: PomodoroViewModel,
    theme: ClockTheme,
    language: AppLanguage,
    modifier: Modifier = Modifier,
) {
    val ui by viewModel.uiState.collectAsState()
    val state = ui.state
    ToolSurface(theme = theme, modifier = modifier) { compact, colors ->
        CompletionBanner(
            visible = state.showCompletionAlert,
            text = labelFor(language, "focus_ready"),
            colors = colors,
            onDismiss = viewModel::dismissAlert,
        )
        Text(
            text = pomodoroLabel(state.mode, language),
            color = colors.textPrimary,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "${state.completedFocusSessions} ${labelFor(language, "focus")}",
            color = colors.textSecondary,
            fontSize = 15.sp,
        )
        Spacer(Modifier.height(18.dp))
        PrimaryTime(formatDuration(state.timer.remainingMillis, showHours = false), theme, compact)
        ControlRow(compact) {
            PrimaryControl(
                icon = if (state.timer.isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                text = if (state.timer.isRunning) labelFor(language, "pause") else labelFor(language, "start"),
                colors = colors,
                onClick = viewModel::startOrPause,
            )
            SecondaryIcon(Icons.Filled.SkipNext, labelFor(language, "skip"), colors, viewModel::skip)
            SecondaryIcon(Icons.Filled.Refresh, labelFor(language, "reset"), colors, viewModel::reset)
        }
        if (!state.timer.isRunning && state.mode == PomodoroMode.FOCUS) {
            Spacer(Modifier.height(18.dp))
            QuickFocusDurations(theme, compact, colors, viewModel::setSettings, viewModel::reset)
        }
    }
}

@Composable
private fun ToolSurface(
    theme: ClockTheme,
    modifier: Modifier = Modifier,
    content: @Composable (Boolean, ToolColors) -> Unit,
) {
    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(theme.background)
            .systemBarsPadding()
            .padding(horizontal = 16.dp, vertical = 16.dp),
        contentAlignment = Alignment.Center,
    ) {
        val compact = maxWidth < 380.dp || maxHeight < 760.dp
        val colors = toolColors(theme)

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 540.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = if (compact) 84.dp else 96.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            content(compact, colors)
        }
    }
}

@Composable
private fun PrimaryTime(text: String, theme: ClockTheme, compact: Boolean) {
    StageArea(compact) {
        FlipDurationDisplay(
            text = text,
            theme = theme,
            height = if (compact) StageFlipHeights.primaryCompact.dp else StageFlipHeights.primary.dp,
        )
    }
    Spacer(Modifier.height(if (compact) 18.dp else 22.dp))
}

@Composable
private fun StageArea(
    compact: Boolean,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(if (compact) 390.dp else 468.dp),
        contentAlignment = Alignment.Center,
    ) {
        content()
    }
}

@Composable
private fun QuickDurations(theme: ClockTheme, compact: Boolean, onSelect: (Int) -> Unit) {
    val colors = toolColors(theme)
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        listOf(1, 3, 5, 10, 30).forEach { minutes ->
            OutlinedButton(
                onClick = { onSelect(minutes) },
                border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
            ) {
                Text("${minutes}m", color = colors.textPrimary, fontSize = if (compact) 12.sp else 14.sp)
            }
        }
    }
    Spacer(Modifier.height(20.dp))
}

@Composable
private fun QuickFocusDurations(
    theme: ClockTheme,
    compact: Boolean,
    colors: ToolColors,
    onUpdateSettings: (PomodoroSettings) -> Unit,
    onReset: () -> Unit,
) {
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        listOf(15, 25, 30, 45, 60).forEach { minutes ->
            OutlinedButton(
                onClick = {
                    onUpdateSettings(PomodoroSettings(focusMinutes = minutes, shortBreakMinutes = 5, longBreakMinutes = 15))
                    onReset()
                },
                border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
            ) {
                Text("${minutes}m", color = colors.textPrimary, fontSize = if (compact) 12.sp else 14.sp)
            }
        }
    }
}

@Composable
private fun ControlRow(compact: Boolean, content: @Composable () -> Unit) {
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(if (compact) 10.dp else 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        content = { content() },
    )
}

@Composable
private fun PrimaryControl(icon: ImageVector, text: String, colors: ToolColors, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(containerColor = colors.accent, contentColor = colors.accentText),
    ) {
        Icon(icon, contentDescription = text)
        Spacer(Modifier.width(8.dp))
        Text(text)
    }
}

@Composable
private fun SecondaryIcon(icon: ImageVector, label: String, colors: ToolColors, onClick: () -> Unit) {
    IconButton(
        onClick = onClick,
        modifier = Modifier
            .size(50.dp)
            .clip(RoundedCornerShape(25.dp))
            .border(1.dp, colors.border, RoundedCornerShape(25.dp))
            .background(colors.panel),
    ) {
        Icon(icon, contentDescription = label, tint = colors.textPrimary)
    }
}

@Composable
private fun CompletionBanner(visible: Boolean, text: String, colors: ToolColors, onDismiss: () -> Unit) {
    if (!visible) return
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(colors.panel)
            .border(1.dp, colors.border, RoundedCornerShape(8.dp))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(text, color = colors.textPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
    }
    Spacer(Modifier.height(16.dp))
}

@Composable
private fun EditableTimerPicker(
    editor: TimerEditState,
    theme: ClockTheme,
    compact: Boolean,
    onAdjust: (TimerSegment, Int) -> Unit,
) {
    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .height(if (compact) 338.dp else 416.dp),
        contentAlignment = Alignment.Center,
    ) {
        val layout = calculateFlipDurationLayout(
            digitCount = 6,
            separatorCount = 2,
            maxWidth = maxWidth.value,
            maxHeight = maxHeight.value,
        )
        val glyphWidth = layout.glyphWidth.dp
        val cardHeight = layout.cardHeight.dp
        val separatorWidth = layout.separatorWidth.dp
        val fontSize = with(LocalDensity.current) { layout.fontSize.dp.toSp() }
        val separatorFontSize = with(LocalDensity.current) { layout.separatorFontSize.dp.toSp() }

        Row(verticalAlignment = Alignment.CenterVertically) {
            EditableUnitCard(
                digits = pad2(editor.hours),
                segment = TimerSegment.HOURS,
                theme = theme,
                glyphWidth = glyphWidth,
                cardHeight = cardHeight,
                fontSize = fontSize,
                onAdjust = onAdjust,
            )
            SeparatorGlyph(":", theme, separatorWidth, separatorFontSize)
            EditableUnitCard(
                digits = pad2(editor.minutes),
                segment = TimerSegment.MINUTES,
                theme = theme,
                glyphWidth = glyphWidth,
                cardHeight = cardHeight,
                fontSize = fontSize,
                onAdjust = onAdjust,
            )
            SeparatorGlyph(":", theme, separatorWidth, separatorFontSize)
            EditableUnitCard(
                digits = pad2(editor.seconds),
                segment = TimerSegment.SECONDS,
                theme = theme,
                glyphWidth = glyphWidth,
                cardHeight = cardHeight,
                fontSize = fontSize,
                onAdjust = onAdjust,
            )
        }
    }
}

@Composable
private fun EditableUnitCard(
    digits: List<Int>,
    segment: TimerSegment,
    theme: ClockTheme,
    glyphWidth: Dp,
    cardHeight: Dp,
    fontSize: TextUnit,
    onAdjust: (TimerSegment, Int) -> Unit,
) {
    val density = LocalDensity.current
    val swipeThreshold = with(density) { 24.dp.toPx() }
    var heightPx by remember(segment) { mutableIntStateOf(1) }

    Box(
        modifier = Modifier
            .onSizeChanged { heightPx = it.height.coerceAtLeast(1) }
            .pointerInput(segment) {
                detectTapGestures { offset ->
                    onAdjust(segment, if (offset.y < heightPx / 2f) 1 else -1)
                }
            }
            .pointerInput(segment) {
                var totalDrag = 0f
                detectVerticalDragGestures(
                    onDragEnd = {
                        when {
                            totalDrag <= -swipeThreshold -> onAdjust(segment, 1)
                            totalDrag >= swipeThreshold -> onAdjust(segment, -1)
                        }
                        totalDrag = 0f
                    },
                    onDragCancel = { totalDrag = 0f },
                ) { change, dragAmount ->
                    change.consume()
                    totalDrag += dragAmount
                }
            }
            .defaultMinSize(minWidth = cardHeight * 0.9f),
    ) {
        UnitFlipCard(
            digits = digits,
            theme = theme,
            glyphWidth = glyphWidth,
            cardHeight = cardHeight,
            fontSize = fontSize,
        )
    }
}

@Composable
private fun SeparatorGlyph(
    text: String,
    theme: ClockTheme,
    width: Dp,
    fontSize: TextUnit,
) {
    Text(
        text = text,
        color = theme.digit,
        fontSize = fontSize,
        fontWeight = FontWeight.Black,
        textAlign = TextAlign.Center,
        modifier = Modifier.width(width),
    )
}

@Composable
private fun CountdownStage(
    state: CountdownUiState,
    theme: ClockTheme,
    colors: ToolColors,
    compact: Boolean,
    language: AppLanguage,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = state.remaining.days.toString(),
            color = colors.textPrimary,
            fontSize = if (compact) 62.sp else 82.sp,
            fontWeight = FontWeight.Black,
        )
        Text(
            text = labelFor(language, "days"),
            color = colors.textSecondary,
            fontSize = 16.sp,
        )
        Spacer(Modifier.height(12.dp))
        StageArea(compact = compact) {
            FlipDurationDisplay(
                text = "%02d:%02d:%02d".format(
                    state.remaining.hours,
                    state.remaining.minutes,
                    state.remaining.seconds,
                ),
                theme = theme,
                height = if (compact) StageFlipHeights.secondaryCompact.dp else StageFlipHeights.secondary.dp,
                scaleFactor = 1.2f,
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun TargetScroller(
    targets: List<CountdownTarget>,
    selectedId: String?,
    language: AppLanguage,
    colors: ToolColors,
    onSelect: (String) -> Unit,
    showCreatePanel: Boolean,
    onToggleCreatePanel: () -> Unit,
    onDeleteRequest: (String) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        targets.forEach { target ->
            val selected = target.id == selectedId
            val title = localizedCountdownTitle(target, language)
            Box {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (selected) colors.accent.copy(alpha = 0.16f) else colors.panel)
                        .border(1.dp, if (selected) colors.accent else colors.border, RoundedCornerShape(8.dp))
                        .combinedClickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            onClick = { onSelect(target.id) },
                            onLongClick = { onDeleteRequest(target.id) },
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                ) {
                    Text(title, color = if (selected) colors.textPrimary else colors.textSecondary)
                }
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = 2.dp, y = (-2).dp)
                        .size(20.dp)
                        .background(colors.panel, RoundedCornerShape(50))
                        .clickable { onDeleteRequest(target.id) },
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Filled.Close,
                        contentDescription = "Delete",
                        tint = colors.textSecondary,
                        modifier = Modifier.size(12.dp),
                    )
                }
            }
        }

        OutlinedButton(
            onClick = onToggleCreatePanel,
            border = BorderStroke(1.dp, if (showCreatePanel) colors.accent else colors.border),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = if (showCreatePanel) colors.accent else colors.textSecondary,
            ),
        ) {
            Text("+", fontSize = 14.sp)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CountdownCreatePanel(
    state: CountdownUiState,
    viewModel: CountdownViewModel,
    language: AppLanguage,
    colors: ToolColors,
    compact: Boolean,
) {
    var showDatePicker by remember { mutableStateOf(false) }
    val datePickerState = rememberDatePickerState()
    val inputColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = colors.accent,
        unfocusedBorderColor = colors.border,
        focusedTextColor = colors.textPrimary,
        unfocusedTextColor = colors.textPrimary,
        focusedLabelColor = colors.accent,
        unfocusedLabelColor = colors.textSecondary,
        cursorColor = colors.accent,
        disabledTextColor = colors.textPrimary,
        disabledBorderColor = colors.border,
        disabledLabelColor = colors.textSecondary,
    )

    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val date = java.time.Instant.ofEpochMilli(millis)
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate()
                        viewModel.setDateDraft(date.toString())
                    }
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text(
                    when (language) {
                        AppLanguage.ZH -> "取消"
                        AppLanguage.JA -> "キャンセル"
                        AppLanguage.KO -> "취소"
                        else -> "Cancel"
                    }
                ) }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(colors.panel)
            .border(1.dp, colors.border, RoundedCornerShape(10.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(
            text = labelFor(language, "add"),
            color = colors.textPrimary,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
        )
        OutlinedTextField(
            value = state.titleDraft,
            onValueChange = viewModel::setTitleDraft,
            label = { Text(labelFor(language, "title")) },
            singleLine = true,
            colors = inputColors,
            modifier = Modifier.fillMaxWidth(),
        )
        if (compact) {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showDatePicker = true },
                ) {
                    OutlinedTextField(
                        value = state.dateDraft,
                        onValueChange = {},
                        enabled = false,
                        label = { Text(labelFor(language, "date_hint")) },
                        singleLine = true,
                        colors = inputColors,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                Button(
                    onClick = viewModel::addDraftTarget,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.accent,
                        contentColor = colors.accentText,
                    ),
                    modifier = Modifier.align(Alignment.End),
                ) {
                    Icon(Icons.Filled.Add, contentDescription = labelFor(language, "add"))
                    Spacer(Modifier.width(6.dp))
                    Text(labelFor(language, "add"))
                }
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { showDatePicker = true },
                ) {
                    OutlinedTextField(
                        value = state.dateDraft,
                        onValueChange = {},
                        enabled = false,
                        label = { Text(labelFor(language, "date_hint")) },
                        singleLine = true,
                        colors = inputColors,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                Button(
                    onClick = viewModel::addDraftTarget,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.accent,
                        contentColor = colors.accentText,
                    ),
                ) {
                    Icon(Icons.Filled.Add, contentDescription = labelFor(language, "add"))
                    Spacer(Modifier.width(6.dp))
                    Text(labelFor(language, "add"))
                }
            }
        }
    }
}

private fun pad2(value: Int): List<Int> =
    value.coerceAtLeast(0).toString().padStart(2, '0').takeLast(2).map(Char::digitToInt)

private fun localizedCountdownTitle(target: CountdownTarget, language: AppLanguage): String =
    if (!target.isPreset) {
        target.title
    } else {
        when {
            target.id.startsWith("new_year_eve_") -> "new_year_eve"
            target.id.startsWith("new_year_") -> "new_year"
            target.id.startsWith("spring_festival_") -> "spring_festival"
            target.id.startsWith("christmas_") -> "christmas"
            else -> target.title
        }.let { presetKey ->
            when (presetKey) {
                "new_year" -> when (language) {
                    AppLanguage.ZH -> "元旦"
                    AppLanguage.JA -> "元旦"
                    AppLanguage.KO -> "새해"
                    AppLanguage.FR -> "Nouvel An"
                    AppLanguage.DE -> "Neujahr"
                    AppLanguage.ES -> "Año Nuevo"
                    AppLanguage.PT -> "Ano Novo"
                    AppLanguage.RU -> "Новый год"
                    AppLanguage.AR -> "رأس السنة"
                    else -> "New Year"
                }
                "spring_festival" -> when (language) {
                    AppLanguage.ZH -> "春节"
                    AppLanguage.JA -> "春節"
                    AppLanguage.KO -> "춘절"
                    AppLanguage.FR -> "Nouvel An lunaire"
                    AppLanguage.DE -> "Frühlingsfest"
                    AppLanguage.ES -> "Festival de Primavera"
                    AppLanguage.PT -> "Festival da Primavera"
                    AppLanguage.RU -> "Праздник весны"
                    AppLanguage.AR -> "عيد الربيع"
                    else -> "Spring Festival"
                }
                "christmas" -> when (language) {
                    AppLanguage.ZH -> "圣诞节"
                    AppLanguage.JA -> "クリスマス"
                    AppLanguage.KO -> "크리스마스"
                    AppLanguage.FR -> "Noël"
                    AppLanguage.DE -> "Weihnachten"
                    AppLanguage.ES -> "Navidad"
                    AppLanguage.PT -> "Natal"
                    AppLanguage.RU -> "Рождество"
                    AppLanguage.AR -> "عيد الميلاد"
                    else -> "Christmas"
                }
                "new_year_eve" -> when (language) {
                    AppLanguage.ZH -> "除夕"
                    AppLanguage.JA -> "大晦日"
                    AppLanguage.KO -> "제야"
                    AppLanguage.FR -> "Saint-Sylvestre"
                    AppLanguage.DE -> "Silvester"
                    AppLanguage.ES -> "Nochevieja"
                    AppLanguage.PT -> "Véspera de Ano Novo"
                    AppLanguage.RU -> "Канун Нового года"
                    AppLanguage.AR -> "ليلة رأس السنة"
                    else -> "New Year's Eve"
                }
                else -> target.title
            }
        }
    }

private fun pomodoroLabel(mode: PomodoroMode, language: AppLanguage): String =
    when (mode) {
        PomodoroMode.FOCUS -> labelFor(language, "focus")
        PomodoroMode.SHORT_BREAK -> when (language) {
            AppLanguage.ZH -> "短休息"
            AppLanguage.JA -> "短い休憩"
            AppLanguage.KO -> "짧은 휴식"
            AppLanguage.FR -> "Pause courte"
            AppLanguage.DE -> "Kurze Pause"
            AppLanguage.ES -> "Descanso corto"
            AppLanguage.PT -> "Pausa curta"
            AppLanguage.RU -> "Короткий перерыв"
            AppLanguage.AR -> "استراحة قصيرة"
            else -> "Short Break"
        }
        PomodoroMode.LONG_BREAK -> when (language) {
            AppLanguage.ZH -> "长休息"
            AppLanguage.JA -> "長い休憩"
            AppLanguage.KO -> "긴 휴식"
            AppLanguage.FR -> "Pause longue"
            AppLanguage.DE -> "Lange Pause"
            AppLanguage.ES -> "Descanso largo"
            AppLanguage.PT -> "Pausa longa"
            AppLanguage.RU -> "Длинный перерыв"
            AppLanguage.AR -> "استراحة طويلة"
            else -> "Long Break"
        }
    }

private data class ToolColors(
    val panel: Color,
    val border: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val accent: Color,
    val accentText: Color,
)

private fun toolColors(theme: ClockTheme): ToolColors {
    val isLight = theme.background.luminance() > 0.5f
    return ToolColors(
        panel = if (isLight) theme.cardTop else Color(0xCC17171A),
        border = if (isLight) theme.cardEdge else Color(0xFF333338),
        textPrimary = if (isLight) Color(0xFF2D241B) else Color(0xFFF4F4F5),
        textSecondary = if (isLight) theme.date else theme.signature,
        accent = theme.accent,
        accentText = if (theme.accent.luminance() > 0.55f) Color(0xFF19130D) else Color.White,
    )
}
