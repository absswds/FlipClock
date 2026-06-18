package com.binbi.flipclock.clock.flip

import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.keyframes

/**
 * Timing and intensity constants for the flip animation. The whole flip is one 0->180°
 * sweep of `rotationX`, split at 90° into the top flap falling (0->90°) and the bottom flap
 * dropping in (90->180°), with a tiny overshoot at the end so the card "settles" like a real
 * mechanical flap instead of stopping dead.
 */
object FlipAnimationSpec {

    /**
     * A single flip: 0° (resting on old) -> 180° (settled on new). The curve is shaped purely by
     * keyframe placement (no per-frame easing API, which has shifted between Compose versions):
     * the top flap covers 0->90° quickly, the bottom flap eases into 90->180°, then a tiny
     * overshoot past flat settles back to 180°.
     */
    val flip: AnimationSpec<Float> = keyframes {
        durationMillis = 620
        0f at 0
        // Top flap falls to the hinge.
        90f at 190
        // Bottom flap drops most of the way in.
        165f at 380
        178f at 480
        // Slight overshoot past flat...
        182f at 545
        // ...then settle.
        180f at 620
    }

    /** Darkest the moving flap gets (as it turns edge-on). */
    const val MAX_SHADOW = 0.68f

    /** Brightest the freshly revealed face gets as the flap lifts off it. */
    const val MAX_HIGHLIGHT = 0.16f

    /** Darkest fixed card edges get; used to give the resting face a physical rim. */
    const val MAX_CARD_EDGE_SHADOW = 0.18f
}
