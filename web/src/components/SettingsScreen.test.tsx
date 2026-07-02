import { fireEvent, render, screen } from '@testing-library/react';
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
    dateFontSize: 28,
    signatureFontSize: 16,
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
        onSetTimezone={vi.fn()}
        onSetDateFontSize={vi.fn()}
        onSetSignatureFontSize={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Classic Black' }).getAttribute('style')).toContain('color: rgb(255, 255, 255)');
    expect(screen.getByRole('button', { name: 'Pure Black' }).getAttribute('style')).toContain('color: rgb(218, 218, 224)');
  });

  it('lets the user switch to another timezone', () => {
    const onSetTimezone = vi.fn();

    render(
      <SettingsScreen
        settings={makeSettings()}
        onClose={vi.fn()}
        onSetTimeFormat={vi.fn()}
        onSetShowSeconds={vi.fn()}
        onSetSignature={vi.fn()}
        onSetThemeId={vi.fn()}
        onSetLanguage={vi.fn()}
        onSetTimezone={onSetTimezone}
        onSetDateFontSize={vi.fn()}
        onSetSignatureFontSize={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Timezone'), {
      target: { value: 'Europe/London' },
    });

    expect(onSetTimezone).toHaveBeenCalledWith('Europe/London');
  });

  it('lets the user adjust date and signature font sizes', () => {
    const onSetDateFontSize = vi.fn();
    const onSetSignatureFontSize = vi.fn();

    render(
      <SettingsScreen
        settings={makeSettings()}
        onClose={vi.fn()}
        onSetTimeFormat={vi.fn()}
        onSetShowSeconds={vi.fn()}
        onSetSignature={vi.fn()}
        onSetThemeId={vi.fn()}
        onSetLanguage={vi.fn()}
        onSetTimezone={vi.fn()}
        onSetDateFontSize={onSetDateFontSize}
        onSetSignatureFontSize={onSetSignatureFontSize}
      />,
    );

    fireEvent.change(screen.getByLabelText('Date font size'), {
      target: { value: '34' },
    });
    fireEvent.change(screen.getByLabelText('Signature font size'), {
      target: { value: '22' },
    });

    expect(onSetDateFontSize).toHaveBeenCalledWith(34);
    expect(onSetSignatureFontSize).toHaveBeenCalledWith(22);
  });
});
