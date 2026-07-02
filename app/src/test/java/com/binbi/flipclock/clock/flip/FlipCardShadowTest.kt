package com.binbi.flipclock.clock.flip

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Pure-function checks for the flip overlay alphas — no Compose, no device needed.
 */
class FlipCardShadowTest {

    private val max = FlipAnimationSpec.MAX_SHADOW
    private val eps = 1e-4f

    @Test
    fun topFlapShadow_growsFromZeroToMaxAcrossFirstHalf() {
        assertEquals(0f, FlipCardShadow.computeTopFlapShadowAlpha(0f), eps)
        assertEquals(max / 2f, FlipCardShadow.computeTopFlapShadowAlpha(45f), eps)
        assertEquals(max, FlipCardShadow.computeTopFlapShadowAlpha(90f), eps)
    }

    @Test
    fun topFlapShadow_clampsForAnglesPastCrossover() {
        assertEquals(max, FlipCardShadow.computeTopFlapShadowAlpha(150f), eps)
    }

    @Test
    fun bottomFlapShadow_fadesFromMaxToZeroAcrossSecondHalf() {
        assertEquals(max, FlipCardShadow.computeBottomFlapShadowAlpha(90f), eps)
        assertEquals(max / 2f, FlipCardShadow.computeBottomFlapShadowAlpha(135f), eps)
        assertEquals(0f, FlipCardShadow.computeBottomFlapShadowAlpha(180f), eps)
    }

    @Test
    fun bottomFlapShadow_clampsBeforeCrossover() {
        assertEquals(max, FlipCardShadow.computeBottomFlapShadowAlpha(0f), eps)
    }

    @Test
    fun flapHighlight_strongestFlat_goneEdgeOn() {
        assertEquals(FlipAnimationSpec.MAX_HIGHLIGHT, FlipCardShadow.computeFlapHighlightAlpha(0f), eps)
        assertEquals(0f, FlipCardShadow.computeFlapHighlightAlpha(90f), eps)
    }

    @Test
    fun cardEdgeShadow_keepsCenterCleanAndDarkensEdges() {
        assertEquals(0f, FlipCardShadow.computeCardEdgeShadowAlpha(0.5f, 0.5f), eps)
        assertEquals(FlipAnimationSpec.MAX_CARD_EDGE_SHADOW, FlipCardShadow.computeCardEdgeShadowAlpha(0f, 0.5f), eps)
        assertEquals(FlipAnimationSpec.MAX_CARD_EDGE_SHADOW, FlipCardShadow.computeCardEdgeShadowAlpha(1f, 0.5f), eps)
        assertEquals(FlipAnimationSpec.MAX_CARD_EDGE_SHADOW * 0.55f, FlipCardShadow.computeCardEdgeShadowAlpha(0.5f, 0f), eps)
    }

    @Test
    fun allAlphas_stayWithinUnitRange() {
        var deg = 0f
        while (deg <= 180f) {
            assertTrue(FlipCardShadow.computeTopFlapShadowAlpha(deg) in 0f..1f)
            assertTrue(FlipCardShadow.computeBottomFlapShadowAlpha(deg) in 0f..1f)
            assertTrue(FlipCardShadow.computeFlapHighlightAlpha(deg) in 0f..1f)
            assertTrue(FlipCardShadow.computeCardEdgeShadowAlpha(deg / 180f, 0.5f) in 0f..1f)
            deg += 5f
        }
    }
}
