import { describe, expect, it } from 'vitest';
import { ClassicBlack, PureBlack } from './themes';

describe('theme labels', () => {
  it('keeps localized theme names readable', () => {
    expect(ClassicBlack.displayName).toBe('经典黑');
    expect(ClassicBlack.displayNameJa).toBe('クラシックブラック');
    expect(PureBlack.displayName).toBe('纯黑夜间');
    expect(PureBlack.displayNameJa).toBe('ピュアブラック');
  });
});
