import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClockScreen from './ClockScreen';
import type { ClockUiState } from '../logic/buildState';

class ResizeObserverStub {
  observe() {}
  disconnect() {}
  unobserve() {}
}

globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;

function makeState(themeId: string): ClockUiState {
  return {
    hourDigits: [1, 9],
    minuteDigits: [2, 2],
    secondDigits: [4, 5],
    showSeconds: true,
    showSignature: true,
    amPm: null,
    dateText: 'Tuesday, December 28, 2021',
    signature: 'Whoever is happy will make others happy too.',
    dateFontSize: 34,
    signatureFontSize: 22,
    theme: {
      id: themeId,
      displayName: 'Theme',
      displayNameEn: 'Theme',
      displayNameJa: 'Theme',
      background: '#ffffff',
      cardTop: '#f8f3ea',
      cardBottom: '#ece3d4',
      cardEdge: '#d7c9b6',
      cardEdgeShadow: 'rgba(0,0,0,0.12)',
      digit: '#26231f',
      hinge: '#8b7b67',
      hingeShadow: 'rgba(0,0,0,0.08)',
      bevel: 'rgba(255,255,255,0.7)',
      topHighlight: 'rgba(255,255,255,0.6)',
      date: '#7c6f61',
      signature: '#8c7c68',
      accent: '#7b5a35',
    },
  };
}

describe('ClockScreen', () => {
  it('uses the paper desk layout accents for the paper desk theme', () => {
    const { container } = render(
      <ClockScreen state={makeState('paper_desk')} onLongPress={vi.fn()} />,
    );

    expect(container.querySelector('.paper-clock-screen')).not.toBeNull();
    expect(container.querySelector('.paper-date-rail')).not.toBeNull();
    expect(container.querySelector('.paper-signature-chip')).not.toBeNull();
  });

  it('keeps the classic centered signature layout for non-paper themes', () => {
    const { container } = render(
      <ClockScreen state={makeState('classic_black')} onLongPress={vi.fn()} />,
    );

    expect(container.querySelector('.paper-clock-screen')).toBeNull();
    expect(screen.getByText('Whoever is happy will make others happy too.')).toBeTruthy();
  });

  it('uses custom date and signature font sizes', () => {
    render(
      <ClockScreen state={makeState('classic_black')} onLongPress={vi.fn()} />,
    );

    expect(screen.getByText('Tuesday, December 28, 2021').getAttribute('style')).toContain('font-size: 34px');
    expect(screen.getByText('Whoever is happy will make others happy too.').getAttribute('style')).toContain('font-size: 22px');
  });
});
