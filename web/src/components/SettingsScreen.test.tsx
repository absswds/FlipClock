import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SettingsScreen from './SettingsScreen';
import type { UserSettings } from '../logic/buildState';

function makeSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    timeFormat: 'H24',
    showSeconds: true,
    signature: '',
    themeId: 'paper_desk',
    themeCustomized: false,
    language: 'en',
    timezone: 'Asia/Hong_Kong',
    ...overrides,
  };
}

describe('SettingsScreen', () => {
  it('uses each theme palette for theme button labels so dark themes stay readable', () => {
    render(
      <SettingsScreen
        settings={makeSettings()}
        onClose={vi.fn()}
        onSetTimeFormat={vi.fn()}
        onSetShowSeconds={vi.fn()}
        onSetSignature={vi.fn()}
        onSetThemeId={vi.fn()}
        onSetLanguage={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Classic Black' }).getAttribute('style')).toContain('color: rgb(255, 255, 255)');
    expect(screen.getByRole('button', { name: 'Pure Black' }).getAttribute('style')).toContain('color: rgb(218, 218, 224)');
  });
});
