/**
 * Pure functions that turn a flip's rotation angle into overlay alphas — exact port of
 * FlipCardShadow.kt. Angle convention: the flip sweeps 0° (resting on old) -> 180° (settled on new),
 * crossing edge-on at 90°.
 */

export const MAX_SHADOW = 0.68;
export const MAX_HIGHLIGHT = 0.16;
export const MAX_CARD_EDGE_SHADOW = 0.18;

/**
 * The falling top flap (active for 0°..90°) darkens as it turns away from the light,
 * reaching max right as it goes edge-on at 90°.
 */
export function computeTopFlapShadowAlpha(
  rotationDeg: number,
  max: number = MAX_SHADOW,
): number {
  const r = Math.max(0, Math.min(90, rotationDeg));
  return (r / 90) * max;
}

/**
 * The incoming bottom flap (active for 90°..180°) starts dark (edge-on at 90°) and brightens
 * to zero shadow as it lands flat at 180°.
 */
export function computeBottomFlapShadowAlpha(
  rotationDeg: number,
  max: number = MAX_SHADOW,
): number {
  const r = Math.max(90, Math.min(180, rotationDeg));
  return ((180 - r) / 90) * max;
}

/**
 * A specular sheen on the falling top flap: brightest while it lies flat facing the viewer
 * (0°) and gone by the time it turns edge-on (90°).
 */
export function computeFlapHighlightAlpha(
  rotationDeg: number,
  max: number = MAX_HIGHLIGHT,
): number {
  const r = Math.max(0, Math.min(90, rotationDeg));
  return (1 - r / 90) * max;
}

/**
 * Resting card edge shade. Horizontal edges carry full weight, while top/bottom edges are
 * softer so the face still reads clean and bright under the digit.
 */
export function computeCardEdgeShadowAlpha(
  horizontalProgress: number,
  verticalProgress: number,
  max: number = MAX_CARD_EDGE_SHADOW,
): number {
  const x = Math.max(0, Math.min(1, horizontalProgress));
  const y = Math.max(0, Math.min(1, verticalProgress));
  const horizontalEdge = 1 - (1 - Math.abs(x - 0.5) * 2);
  const verticalEdge = (1 - (1 - Math.abs(y - 0.5) * 2)) * 0.55;
  return max * Math.max(horizontalEdge, verticalEdge);
}
