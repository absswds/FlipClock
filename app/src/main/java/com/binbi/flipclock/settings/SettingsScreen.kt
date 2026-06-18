package com.binbi.flipclock.settings

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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.binbi.flipclock.core.time.TimeFormat
import com.binbi.flipclock.ui.theme.ClockTheme

private val ScreenBg = Color(0xFF0E0E10)
private val CardBg = Color(0xFF1B1B1E)
private val TextPrimary = Color(0xFFF2F2F4)
private val TextSecondary = Color(0xFF9A9AA0)
private const val MAX_SIGNATURE_LEN = 60

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val settings by viewModel.settings.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ScreenBg)
            .systemBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回", tint = TextPrimary)
            }
            Spacer(Modifier.width(4.dp))
            Text("设置", color = TextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(Modifier.height(20.dp))

        SectionLabel("时间格式")
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            FormatChip(
                label = "24 小时制",
                selected = settings.timeFormat == TimeFormat.H24,
                onClick = { viewModel.setTimeFormat(TimeFormat.H24) },
            )
            FormatChip(
                label = "12 小时制",
                selected = settings.timeFormat == TimeFormat.H12,
                onClick = { viewModel.setTimeFormat(TimeFormat.H12) },
            )
        }

        Spacer(Modifier.height(20.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("显示秒", color = TextPrimary, fontSize = 16.sp)
            Switch(
                checked = settings.showSeconds,
                onCheckedChange = { viewModel.setShowSeconds(it) },
            )
        }

        Spacer(Modifier.height(20.dp))

        SectionLabel("签名文字")
        OutlinedTextField(
            value = settings.signature,
            onValueChange = { if (it.length <= MAX_SIGNATURE_LEN) viewModel.setSignature(it) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            supportingText = {
                Text("${settings.signature.length} / $MAX_SIGNATURE_LEN", color = TextSecondary)
            },
        )

        Spacer(Modifier.height(20.dp))

        SectionLabel("主题")
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            viewModel.themes.forEach { theme ->
                ThemeSwatch(
                    theme = theme,
                    selected = theme.id == settings.themeId,
                    onClick = { viewModel.setTheme(theme.id) },
                )
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        color = TextSecondary,
        fontSize = 13.sp,
        fontWeight = FontWeight.Medium,
        modifier = Modifier.padding(bottom = 10.dp),
    )
}

@Composable
private fun FormatChip(label: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label) },
        colors = FilterChipDefaults.filterChipColors(
            containerColor = CardBg,
            labelColor = TextSecondary,
            selectedContainerColor = Color(0xFF3A3A40),
            selectedLabelColor = TextPrimary,
        ),
    )
}

@Composable
private fun ThemeSwatch(theme: ClockTheme, selected: Boolean, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(width = 58.dp, height = 78.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(theme.background)
                .border(
                    width = if (selected) 2.dp else 1.dp,
                    color = if (selected) theme.accent else Color(0xFF303036),
                    shape = RoundedCornerShape(10.dp),
                )
                .clickable(onClick = onClick),
            contentAlignment = Alignment.Center,
        ) {
            // Mini flip-card preview.
            Box(
                modifier = Modifier
                    .size(width = 34.dp, height = 46.dp)
                    .clip(RoundedCornerShape(5.dp))
                    .background(Brush.verticalGradient(listOf(theme.cardTop, theme.cardBottom))),
                contentAlignment = Alignment.Center,
            ) {
                Text("8", color = theme.digit, fontSize = 22.sp, fontWeight = FontWeight.Black)
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
            text = theme.displayName,
            color = if (selected) TextPrimary else TextSecondary,
            fontSize = 11.sp,
        )
    }
}
