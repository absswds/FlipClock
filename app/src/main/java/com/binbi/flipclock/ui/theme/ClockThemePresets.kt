package com.binbi.flipclock.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * The v1 preset palettes. ClassicBlack is tuned against the reference iPad video:
 * pure-black stage, dense charcoal cards, bright white digits, and readable quiet metadata.
 */
object ClockThemePresets {

    val ClassicBlack = ClockTheme(
        id = "classic_black",
        displayName = "经典黑",
        background = Color(0xFF000000),
        cardTop = Color(0xFF3D3D40),
        cardBottom = Color(0xFF3D3D40),
        cardEdge = Color(0xFF47474A),
        cardEdgeShadow = Color(0x44000000),
        digit = Color(0xFFFFFFFF),
        hinge = Color(0xFF080809),
        hingeShadow = Color(0x66000000),
        bevel = Color(0x22FFFFFF),
        topHighlight = Color(0x0FFFFFFF),
        date = Color(0xFFC4C4CA),
        signature = Color(0xFFA6A6AC),
        accent = Color(0xFFFFFFFF),
    )

    val PureBlack = ClockTheme(
        id = "pure_black",
        displayName = "纯黑夜间",
        background = Color(0xFF000000),
        cardTop = Color(0xFF151517),
        cardBottom = Color(0xFF070708),
        cardEdge = Color(0xFF25252A),
        cardEdgeShadow = Color(0x88000000),
        digit = Color(0xFFDADAE0),
        hinge = Color(0xFF000000),
        hingeShadow = Color(0xAA000000),
        bevel = Color(0x18FFFFFF),
        topHighlight = Color(0x12FFFFFF),
        date = Color(0xFF76767D),
        signature = Color(0xFF5A5A60),
        accent = Color(0xFFDADAE0),
    )

    val RetroGreen = ClockTheme(
        id = "retro_green",
        displayName = "复古绿",
        background = Color(0xFF05140C),
        cardTop = Color(0xFF123322),
        cardBottom = Color(0xFF0A2016),
        cardEdge = Color(0xFF205A3C),
        cardEdgeShadow = Color(0x77000000),
        digit = Color(0xFF7CFFB0),
        hinge = Color(0xFF03100A),
        hingeShadow = Color(0x99000000),
        bevel = Color(0x3329FF8F),
        topHighlight = Color(0x1629FF8F),
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
        cardEdge = Color(0xFF4B3120),
        cardEdgeShadow = Color(0x77000000),
        digit = Color(0xFFFFD9A0),
        hinge = Color(0xFF0E0803),
        hingeShadow = Color(0x99000000),
        bevel = Color(0x33FFC773),
        topHighlight = Color(0x16FFC773),
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
        cardEdge = Color(0xFF3B4554),
        cardEdgeShadow = Color(0x77000000),
        digit = Color(0xFFE6ECF5),
        hinge = Color(0xFF080A0E),
        hingeShadow = Color(0x99000000),
        bevel = Color(0x22DCE6FF),
        topHighlight = Color(0x12DCE6FF),
        date = Color(0xFF8893A4),
        signature = Color(0xFF626C7A),
        accent = Color(0xFFE6ECF5),
    )

    /** Default first, used by the theme picker order. */
    val all: List<ClockTheme> = listOf(ClassicBlack, PureBlack, RetroGreen, WarmAmber, Slate)

    fun byId(id: String): ClockTheme = all.firstOrNull { it.id == id } ?: ClassicBlack
}
