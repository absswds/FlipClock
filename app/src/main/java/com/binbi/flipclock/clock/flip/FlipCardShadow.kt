package com.binbi.flipclock.clock.flip

/**
 * Pure functions that turn a flip's rotation angle into overlay alphas — kept free of any
 * Compose types so they can be unit-tested with plain JUnit. The composables read these and
 * paint a black (shadow) or white (highlight) scrim over the relevant card face.
 *
 * Angle convention: the flip sweeps 0° (resting on the old digit) -> 180° (settled on the new),
 * crossing edge-on at 90°.
 */
object FlipCardShadow {

    /**
     * The falling top flap (active for 0°..90°) darkens as it turns away from the light,
     * reaching [max] right as it goes edge-on at 90°.
     */
    fun computeTopFlapShadowAlpha(rotationDeg: Float, max: Float = FlipAnimationSpec.MAX_SHADOW): Float {
        val r = rotationDeg.coerceIn(0f, 90f)
        return (r / 90f) * max
    }

    /**
     * The incoming bottom flap (active for 90°..180°) starts dark (edge-on at 90°) and brightens
     * to zero shadow as it lands flat at 180°.
     */
    fun computeBottomFlapShadowAlpha(rotationDeg: Float, max: Float = FlipAnimationSpec.MAX_SHADOW): Float {
        val r = rotationDeg.coerceIn(90f, 180f)
        return ((180f - r) / 90f) * max
    }

    /**
     * A specular sheen on the falling top flap: brightest while it lies flat facing the viewer
     * (0°) and gone by the time it turns edge-on (90°).
     */
    fun computeFlapHighlightAlpha(rotationDeg: Float, max: Float = FlipAnimationSpec.MAX_HIGHLIGHT): Float {
        val r = rotationDeg.coerceIn(0f, 90f)
        return (1f - r / 90f) * max
    }
}
