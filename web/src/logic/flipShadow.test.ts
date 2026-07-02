import { describe, it, expect } from 'vitest';
import {
  computeTopFlapShadowAlpha,
  computeBottomFlapShadowAlpha,
  computeFlapHighlightAlpha,
  computeCardEdgeShadowAlpha,
  MAX_SHADOW,
  MAX_HIGHLIGHT,
  MAX_CARD_EDGE_SHADOW,
} from './flipShadow';

describe('computeTopFlapShadowAlpha', () => {
  it('returns 0 at 0° (flat, no shadow)', () => {
    expect(computeTopFlapShadowAlpha(0)).toBe(0);
  });

  it('returns MAX_SHADOW at 90° (edge-on, darkest)', () => {
    expect(computeTopFlapShadowAlpha(90)).toBeCloseTo(MAX_SHADOW, 4);
  });

  it('interpolates linearly', () => {
    expect(computeTopFlapShadowAlpha(45)).toBeCloseTo(MAX_SHADOW / 2, 4);
  });

  it('clamps below 0°', () => {
    expect(computeTopFlapShadowAlpha(-10)).toBe(0);
  });

  it('clamps above 90°', () => {
    expect(computeTopFlapShadowAlpha(120)).toBe(MAX_SHADOW);
  });
});

describe('computeBottomFlapShadowAlpha', () => {
  it('returns MAX_SHADOW at 90° (edge-on, darkest)', () => {
    expect(computeBottomFlapShadowAlpha(90)).toBeCloseTo(MAX_SHADOW, 4);
  });

  it('returns 0 at 180° (flat, no shadow)', () => {
    expect(computeBottomFlapShadowAlpha(180)).toBe(0);
  });

  it('interpolates linearly from 90 to 180', () => {
    expect(computeBottomFlapShadowAlpha(135)).toBeCloseTo(MAX_SHADOW / 2, 4);
  });

  it('clamps below 90°', () => {
    expect(computeBottomFlapShadowAlpha(45)).toBe(MAX_SHADOW);
  });

  it('clamps above 180°', () => {
    expect(computeBottomFlapShadowAlpha(200)).toBe(0);
  });
});

describe('computeFlapHighlightAlpha', () => {
  it('returns MAX_HIGHLIGHT at 0° (flat, brightest sheen)', () => {
    expect(computeFlapHighlightAlpha(0)).toBeCloseTo(MAX_HIGHLIGHT, 4);
  });

  it('returns 0 at 90° (edge-on, no sheen)', () => {
    expect(computeFlapHighlightAlpha(90)).toBe(0);
  });

  it('interpolates linearly', () => {
    expect(computeFlapHighlightAlpha(45)).toBeCloseTo(MAX_HIGHLIGHT / 2, 4);
  });
});

describe('computeCardEdgeShadowAlpha', () => {
  it('returns 0 at center', () => {
    expect(computeCardEdgeShadowAlpha(0.5, 0.5)).toBe(0);
  });

  it('returns max at horizontal extreme', () => {
    expect(computeCardEdgeShadowAlpha(0, 0.5)).toBeCloseTo(MAX_CARD_EDGE_SHADOW, 4);
    expect(computeCardEdgeShadowAlpha(1, 0.5)).toBeCloseTo(MAX_CARD_EDGE_SHADOW, 4);
  });

  it('returns softer value at vertical extreme', () => {
    const v = computeCardEdgeShadowAlpha(0.5, 0);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(MAX_CARD_EDGE_SHADOW);
  });
});
