package com.binbi.flipclock.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Theme presets shared across Android and Web. The Android app now keeps the same public
 * theme surface as the Web version: Paper Desk, Classic Black, and Pure Black.
 */
object ClockThemePresets {

    val PaperDesk = ClockTheme(
        id = "paper_desk",
        displayName = "Paper Desk",
        background = Color(0xFFF4ECDF),
        cardTop = Color(0xFFF8F3EA),
        cardBottom = Color(0xFFECE3D4),
        cardEdge = Color(0xFFD7C9B6),
        cardEdgeShadow = Color(0x1F574026),
        digit = Color(0xFF26231F),
        hinge = Color(0x3D56422A),
        hingeShadow = Color(0x235E4B30),
        bevel = Color(0xBDFFFFFF),
        topHighlight = Color(0x9EFFFFFF),
        date = Color(0xFF7C6F61),
        signature = Color(0xFF8C7C68),
        accent = Color(0xFF7B5A35),
    )

    val ClassicBlack = ClockTheme(
        id = "classic_black",
        displayName = "Classic Black",
        background = Color(0xFF000000),
        cardTop = Color(0xFF3F3F3F),
        cardBottom = Color(0xFF3F3F3F),
        cardEdge = Color(0xFF3F3F3F),
        cardEdgeShadow = Color.Transparent,
        digit = Color(0xFFFFFFFF),
        hinge = Color(0xFF080809),
        hingeShadow = Color.Transparent,
        bevel = Color.Transparent,
        topHighlight = Color.Transparent,
        date = Color(0xFFC4C4CA),
        signature = Color(0xFFA6A6AC),
        accent = Color(0xFFFFFFFF),
    )

    val PureBlack = ClockTheme(
        id = "pure_black",
        displayName = "Pure Black",
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

    val all: List<ClockTheme> = listOf(PaperDesk, ClassicBlack, PureBlack)

    fun byId(id: String): ClockTheme =
        when (id) {
            "paper_desk" -> PaperDesk
            "classic_black" -> ClassicBlack
            "pure_black" -> PureBlack
            else -> PaperDesk
        }
}
