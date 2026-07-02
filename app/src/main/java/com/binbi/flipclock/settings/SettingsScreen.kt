package com.binbi.flipclock.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.binbi.flipclock.core.settings.AppLanguage
import com.binbi.flipclock.core.settings.defaultSignatureFor
import com.binbi.flipclock.core.settings.labelFor
import com.binbi.flipclock.core.settings.resolveAppLanguage
import com.binbi.flipclock.core.time.TimeFormat
import com.binbi.flipclock.ui.theme.ClockTheme
import com.binbi.flipclock.ui.theme.ClockThemePresets

private const val MAX_SIGNATURE_LEN = 60

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val settings by viewModel.settings.collectAsState()
    val language = resolveAppLanguage(settings.language)
    val theme = ClockThemePresets.byId(settings.themeId)
    val textPrimary = if (theme.background.luminance() > 0.5f) Color(0xFF2D241B) else Color(0xFFF4F4F5)
    val textSecondary = if (theme.background.luminance() > 0.5f) theme.date else theme.signature
    val panelColor = if (theme.background.luminance() > 0.5f) theme.cardTop else Color(0xCC17171A)
    val borderColor = if (theme.background.luminance() > 0.5f) theme.cardEdge else Color(0xFF333338)
    val inputColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = theme.accent,
        focusedLabelColor = theme.accent,
        focusedTextColor = textPrimary,
        unfocusedTextColor = textPrimary,
        unfocusedBorderColor = borderColor,
        unfocusedLabelColor = textSecondary,
        cursorColor = theme.accent,
        focusedPlaceholderColor = textSecondary,
        unfocusedPlaceholderColor = textSecondary,
        focusedSupportingTextColor = textSecondary,
        unfocusedSupportingTextColor = textSecondary,
    )

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(theme.background)
            .systemBarsPadding(),
    ) {
        val compact = maxWidth < 420.dp

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = if (compact) 16.dp else 24.dp, vertical = 16.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = labelFor(language, "back"),
                        tint = textPrimary,
                    )
                }
                Spacer(Modifier.width(4.dp))
                Text(
                    labelFor(language, "settings"),
                    color = textPrimary,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                )
            }

            Spacer(Modifier.height(20.dp))

            SectionLabel(labelFor(language, "theme"), textSecondary)
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                viewModel.themes.forEach { swatch ->
                    ThemeSwatch(
                        theme = swatch,
                        selected = swatch.id == settings.themeId,
                        label = labelFor(language, swatch.id),
                        selectedOutline = theme.accent,
                        labelColor = textSecondary,
                        onClick = { viewModel.setTheme(swatch.id) },
                    )
                }
            }

            Spacer(Modifier.height(22.dp))

            SectionLabel(labelFor(language, "time_format"), textSecondary)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SoftChip(
                    label = "24",
                    selected = settings.timeFormat == TimeFormat.H24,
                    accent = theme.accent,
                    panelColor = panelColor,
                    borderColor = borderColor,
                    textPrimary = textPrimary,
                    textSecondary = textSecondary,
                    onClick = { viewModel.setTimeFormat(TimeFormat.H24) },
                )
                SoftChip(
                    label = "12",
                    selected = settings.timeFormat == TimeFormat.H12,
                    accent = theme.accent,
                    panelColor = panelColor,
                    borderColor = borderColor,
                    textPrimary = textPrimary,
                    textSecondary = textSecondary,
                    onClick = { viewModel.setTimeFormat(TimeFormat.H12) },
                )
            }

            Spacer(Modifier.height(22.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(labelFor(language, "show_seconds"), color = textPrimary, fontSize = 16.sp)
                Switch(
                    checked = settings.showSeconds,
                    onCheckedChange = { viewModel.setShowSeconds(it) },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = theme.background,
                        checkedTrackColor = theme.accent,
                        uncheckedThumbColor = textPrimary,
                        uncheckedTrackColor = borderColor,
                    ),
                )
            }

            Spacer(Modifier.height(22.dp))

            SectionLabel(labelFor(language, "signature"), textSecondary)
            OutlinedTextField(
                value = settings.signature,
                onValueChange = { if (it.length <= MAX_SIGNATURE_LEN) viewModel.setSignature(it) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text(labelFor(language, "signature_placeholder")) },
                supportingText = {
                    Text(
                        "${defaultSignatureFor(language)} · ${settings.signature.length} / $MAX_SIGNATURE_LEN",
                    )
                },
                colors = inputColors,
            )

            Spacer(Modifier.height(22.dp))

            SectionLabel(labelFor(language, "font_size"), textSecondary)
            FontSizeSlider(
                label = labelFor(language, "date_font_size"),
                value = settings.dateFontSize,
                range = 14f..40f,
                accent = theme.accent,
                textPrimary = textPrimary,
                onChange = viewModel::setDateFontSize,
            )
            Spacer(Modifier.height(12.dp))
            FontSizeSlider(
                label = labelFor(language, "signature_font_size"),
                value = settings.signatureFontSize,
                range = 10f..28f,
                accent = theme.accent,
                textPrimary = textPrimary,
                onChange = viewModel::setSignatureFontSize,
            )

            Spacer(Modifier.height(22.dp))

            SectionLabel(labelFor(language, "language"), textSecondary)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                viewModel.languages.forEach { option ->
                    SoftChip(
                        label = option.nativeLabel,
                        selected = settings.language == option.id,
                        accent = theme.accent,
                        panelColor = panelColor,
                        borderColor = borderColor,
                        textPrimary = textPrimary,
                        textSecondary = textSecondary,
                        onClick = { viewModel.setLanguage(option.id) },
                    )
                }
            }

            Spacer(Modifier.height(22.dp))

            SectionLabel(labelFor(language, "timezone"), textSecondary)
            OutlinedTextField(
                value = settings.timezone.takeIf { it != "auto" }.orEmpty(),
                onValueChange = { viewModel.setTimezone(it.ifBlank { "auto" }) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text(viewModel.detectedTimezone) },
                supportingText = {
                    Text("${labelFor(language, "detected")} ${viewModel.detectedTimezone}")
                },
                colors = inputColors,
            )
            Spacer(Modifier.height(10.dp))
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                viewModel.commonTimezones.forEach { zoneId ->
                    val chipLabel = if (zoneId == "auto") labelFor(language, "auto") else zoneId
                    SoftChip(
                        label = chipLabel,
                        selected = settings.timezone == zoneId,
                        accent = theme.accent,
                        panelColor = panelColor,
                        borderColor = borderColor,
                        textPrimary = textPrimary,
                        textSecondary = textSecondary,
                        onClick = { viewModel.setTimezone(zoneId) },
                    )
                }
            }

            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun SectionLabel(text: String, color: Color) {
    Text(
        text = text,
        color = color,
        fontSize = 13.sp,
        fontWeight = FontWeight.Medium,
        modifier = Modifier.padding(bottom = 10.dp),
    )
}

@Composable
private fun SoftChip(
    label: String,
    selected: Boolean,
    accent: Color,
    panelColor: Color,
    borderColor: Color,
    textPrimary: Color,
    textSecondary: Color,
    onClick: () -> Unit,
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label) },
        colors = FilterChipDefaults.filterChipColors(
            containerColor = panelColor,
            labelColor = textSecondary,
            selectedContainerColor = accent.copy(alpha = 0.16f),
            selectedLabelColor = textPrimary,
        ),
        border = FilterChipDefaults.filterChipBorder(
            enabled = true,
            selected = selected,
            borderColor = borderColor,
            selectedBorderColor = accent,
        ),
    )
}

@Composable
private fun FontSizeSlider(
    label: String,
    value: Int,
    range: ClosedFloatingPointRange<Float>,
    accent: Color,
    textPrimary: Color,
    onChange: (Int) -> Unit,
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(label, color = textPrimary, fontSize = 15.sp)
            Text("${value}sp", color = textPrimary, fontSize = 14.sp)
        }
        Slider(
            value = value.toFloat(),
            onValueChange = { onChange(it.toInt()) },
            valueRange = range,
            steps = (range.endInclusive - range.start).toInt() - 1,
            colors = SliderDefaults.colors(
                thumbColor = accent,
                activeTrackColor = accent,
            ),
        )
    }
}

@Composable
private fun ThemeSwatch(
    theme: ClockTheme,
    selected: Boolean,
    label: String,
    selectedOutline: Color,
    labelColor: Color,
    onClick: () -> Unit,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(width = 68.dp, height = 88.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(theme.background)
                .border(
                    width = if (selected) 2.dp else 1.dp,
                    color = if (selected) selectedOutline else theme.cardEdge,
                    shape = RoundedCornerShape(12.dp),
                )
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                modifier = Modifier
                    .size(width = 40.dp, height = 54.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Brush.verticalGradient(listOf(theme.cardTop, theme.cardBottom)))
                    .border(1.dp, theme.cardEdge, RoundedCornerShape(6.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Text("8", color = theme.digit, fontSize = 24.sp, fontWeight = FontWeight.Black)
                Box(
                    Modifier
                        .align(Alignment.Center)
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(theme.hinge),
                )
            }
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = label,
            color = labelColor,
            fontSize = 11.sp,
        )
    }
}
