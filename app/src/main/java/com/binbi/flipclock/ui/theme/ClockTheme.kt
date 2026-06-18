package com.binbi.flipclock.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

/**
 * A complete visual palette for the flip clock. Every color the clock draws comes from here,
 * so a theme is a single value that can be swapped at runtime. The card face is a subtle
 * vertical gradient ([cardTop] -> [cardBottom]) to give the cards a sense of depth/curvature.
 */
@Immutable
data class ClockTheme(
    val id: String,
    val displayName: String,
    val background: Color,
    val cardTop: Color,
    val cardBottom: Color,
    val cardEdge: Color,
    val cardEdgeShadow: Color,
    val digit: Color,
    /** The dark seam line drawn across the middle of each card. */
    val hinge: Color,
    val hingeShadow: Color,
    /** A faint highlight just below the seam, simulating the lower card's top edge catching light. */
    val bevel: Color,
    val topHighlight: Color,
    val date: Color,
    val signature: Color,
    /** Used for the AM/PM indicator and the settings affordance. */
    val accent: Color,
)
