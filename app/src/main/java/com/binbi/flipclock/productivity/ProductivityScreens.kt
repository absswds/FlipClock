package com.binbi.flipclock.productivity

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
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
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
    ToolSurface(labelFor(language, "timer"), theme, modifier) { compact, colors ->
        CompletionBanner(
            visible = state.showCompletionAlert,
            text = labelFor(language, "timer_complete"),
            colors = colors,
            onDismiss = viewModel::dismissAlert,
        )
        BigTime(formatDuration(state.timer.remainingMillis, showHours = false), theme, compact)
        QuickDurations(theme, compact, onSelect = viewModel::setDurationMinutes)
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

@Composable
fun StopwatchScreen(
    viewModel: StopwatchViewModel,
    theme: ClockTheme,
    language: AppLanguage,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsState()
    ToolSurface(labelFor(language, "stopwatch"), theme, modifier) { compact, colors ->
        BigTime(formatDuration(state.stopwatch.elapsedMillis, showHours = false), theme, compact)
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
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                state.stopwatch.lapsMillis.take(6).forEachIndexed { index, lap ->
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
    ToolSurface(labelFor(language, "countdown"), theme, modifier) { compact, colors ->
        Text(
            text = state.selectedTarget?.title ?: labelFor(language, "no_target"),
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
        FlipDurationDisplay("${state.remaining.days}", theme = theme, height = LargeFlipDurationHeightDp.dp)
        Text(labelFor(language, "days"), color = colors.textSecondary, fontSize = 18.sp)
        Spacer(Modifier.height(10.dp))
        FlipDurationDisplay(
            text = "%02d:%02d:%02d".format(
                state.remaining.hours,
                state.remaining.minutes,
                state.remaining.seconds,
            ),
            theme = theme,
            height = CompactFlipDurationHeightDp.dp,
        )
        Spacer(Modifier.height(18.dp))
        TargetScroller(state.targets, state.selectedTarget?.id, language, colors, viewModel::selectTarget)
        Spacer(Modifier.height(18.dp))
        AddTargetRow(state, viewModel, theme, language, colors, compact)
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
    ToolSurface(labelFor(language, "focus"), theme, modifier) { compact, colors ->
        CompletionBanner(
            visible = state.showCompletionAlert,
            text = labelFor(language, "focus_ready"),
            colors = colors,
            onDismiss = viewModel::dismissAlert,
        )
        Text(pomodoroLabel(state.mode, language), color = colors.textPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("${state.completedFocusSessions} ${labelFor(language, "focus")}", color = colors.textSecondary, fontSize = 15.sp)
        Spacer(Modifier.height(18.dp))
        BigTime(formatDuration(state.timer.remainingMillis, showHours = false), theme, compact)
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
    }
}

@Composable
private fun ToolSurface(
    title: String,
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
                .verticalScroll(rememberScrollState())
                .padding(bottom = if (compact) 84.dp else 96.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(title, color = colors.textSecondary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(if (compact) 14.dp else 18.dp))
            content(compact, colors)
        }
    }
}

@Composable
private fun BigTime(text: String, theme: ClockTheme, compact: Boolean) {
    FlipDurationDisplay(text, theme = theme, height = if (compact) 200.dp else DefaultFlipDurationHeightDp.dp)
    Spacer(Modifier.height(if (compact) 18.dp else 22.dp))
}

@Composable
private fun QuickDurations(theme: ClockTheme, compact: Boolean, onSelect: (Int) -> Unit) {
    val colors = toolColors(theme)
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        listOf(1, 5, 10, 25).forEach { minutes ->
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
private fun TargetScroller(
    targets: List<CountdownTarget>,
    selectedId: String?,
    language: AppLanguage,
    colors: ToolColors,
    onSelect: (String) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        targets.forEach { target ->
            val selected = target.id == selectedId
            val title = localizedCountdownTitle(target, language)
            TextButton(
                onClick = { onSelect(target.id) },
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (selected) colors.accent.copy(alpha = 0.16f) else colors.panel)
                    .border(1.dp, if (selected) colors.accent else colors.border, RoundedCornerShape(8.dp)),
            ) {
                Text(title, color = if (selected) colors.textPrimary else colors.textSecondary)
            }
        }
    }
}

@Composable
private fun AddTargetRow(
    state: CountdownUiState,
    viewModel: CountdownViewModel,
    theme: ClockTheme,
    language: AppLanguage,
    colors: ToolColors,
    compact: Boolean,
) {
    val inputColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = colors.accent,
        unfocusedBorderColor = colors.border,
        focusedTextColor = colors.textPrimary,
        unfocusedTextColor = colors.textPrimary,
        focusedLabelColor = colors.accent,
        unfocusedLabelColor = colors.textSecondary,
        cursorColor = colors.accent,
    )
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(
            value = state.titleDraft,
            onValueChange = viewModel::setTitleDraft,
            label = { Text(labelFor(language, "title")) },
            singleLine = true,
            colors = inputColors,
        )
        if (compact) {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.End) {
                OutlinedTextField(
                    value = state.dateDraft,
                    onValueChange = viewModel::setDateDraft,
                    label = { Text("yyyy-MM-dd") },
                    singleLine = true,
                    colors = inputColors,
                    modifier = Modifier.fillMaxWidth(),
                )
                IconButton(
                    onClick = viewModel::addDraftTarget,
                    modifier = Modifier
                        .size(54.dp)
                        .clip(RoundedCornerShape(27.dp))
                        .background(colors.accent),
                ) {
                    Icon(Icons.Filled.Add, contentDescription = labelFor(language, "add"), tint = colors.accentText)
                }
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = state.dateDraft,
                    onValueChange = viewModel::setDateDraft,
                    label = { Text("yyyy-MM-dd") },
                    singleLine = true,
                    colors = inputColors,
                    modifier = Modifier.weight(1f),
                )
                IconButton(
                    onClick = viewModel::addDraftTarget,
                    modifier = Modifier
                        .size(54.dp)
                        .clip(RoundedCornerShape(27.dp))
                        .background(colors.accent),
                ) {
                    Icon(Icons.Filled.Add, contentDescription = labelFor(language, "add"), tint = colors.accentText)
                }
            }
        }
    }
}

private fun localizedCountdownTitle(target: CountdownTarget, language: AppLanguage): String =
    if (!target.isPreset) {
        target.title
    } else {
        when {
            target.id.startsWith("new_year_") -> "new_year"
            target.id.startsWith("spring_festival_") -> "spring_festival"
            target.id.startsWith("christmas_") -> "christmas"
            target.id.startsWith("new_year_eve_") -> "new_year_eve"
            else -> target.title
        }.let { presetKey ->
            when (presetKey) {
                "new_year" -> when (language) {
                    AppLanguage.ZH -> "元旦"
                    AppLanguage.JA -> "元日"
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
                    AppLanguage.KO -> "연말"
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
