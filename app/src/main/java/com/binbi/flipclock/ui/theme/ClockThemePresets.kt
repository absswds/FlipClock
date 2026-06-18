package com.binbi.flipclock.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * The v1 preset palettes. [ClassicBlack] is the default and the one tuned 1:1 against the
 * reference screenshot (pure-black backdrop, charcoal cards, near-white rounded digits).
 * The others are intentionally restrained variations on the same high-contrast formula.
 */
object ClockThemePresets {

    val ClassicBlack = ClockTheme(
        id = "classic_black",
        displayName = "经典黑",
        background = Color(0xFF000000),
        cardTop = Color(0xFF2C2C2F),
        cardBottom = Color(0xFF171719),
        digit = Color(0xFFF5F5F7),
        hinge = Color(0xFF0A0A0B),
        bevel = Color(0x22FFFFFF),
        date = Color(0xFF9A9AA0),
        signature = Color(0xFF6E6E73),
        accent = Color(0xFFF5F5F7),
    )

    val PureBlack = ClockTheme(
        id = "pure_black",
        displayName = "纯黑夜间",
        background = Color(0xFF000000),
        cardTop = Color(0xFF121214),
        cardBottom = Color(0xFF050506),
        digit = Color(0xFFCFCFD4),
        hinge = Color(0xFF000000),
        bevel = Color(0x18FFFFFF),
        date = Color(0xFF6B6B70),
        signature = Color(0xFF4E4E52),
        accent = Color(0xFFCFCFD4),
    )

    val RetroGreen = ClockTheme(
        id = "retro_green",
        displayName = "复古绿",
        background = Color(0xFF05140C),
        cardTop = Color(0xFF123322),
        cardBottom = Color(0xFF0A2016),
        digit = Color(0xFF7CFFB0),
        hinge = Color(0xFF03100A),
        bevel = Color(0x3329FF8F),
        date = Color(0xFF4F9E76),
        signature = Color(0xFF3C7259),
        accent = Color(0xFF7CFFB0),
    )

    val WarmAmber = ClockTheme(
        id = "warm_amber",
        displayName = "暖琥珀",
        background = Color(0xFF120B04),
        cardTop = Color(0xFF332113),
        cardBottom = Color(0xFF1F140A),
        digit = Color(0xFFFFD9A0),
        hinge = Color(0xFF0E0803),
        bevel = Color(0x33FFC773),
        date = Color(0xFFB08855),
        signature = Color(0xFF836643),
        accent = Color(0xFFFFD9A0),
    )

    val Slate = ClockTheme(
        id = "slate",
        displayName = "石板灰",
        background = Color(0xFF0C0F14),
        cardTop = Color(0xFF2A313C),
        cardBottom = Color(0xFF1A1F27),
        digit = Color(0xFFE6ECF5),
        hinge = Color(0xFF080A0E),
        bevel = Color(0x22DCE6FF),
        date = Color(0xFF8893A4),
        signature = Color(0xFF626C7A),
        accent = Color(0xFFE6ECF5),
    )

    /** Default first — used by the theme picker order. */
    val all: List<ClockTheme> = listOf(ClassicBlack, PureBlack, RetroGreen, WarmAmber, Slate)

    fun byId(id: String): ClockTheme = all.firstOrNull { it.id == id } ?: ClassicBlack
}
