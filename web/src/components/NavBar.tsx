import { useState, useRef, useEffect, useCallback } from 'react';
import type { Page } from '../main';

interface NavBarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  accent: string;
  digit: string;
  background: string;
  /** If true, navbar auto-hides and only appears on hover/tap near bottom of screen */
  autoHide?: boolean;
}

const items: { page: Page; icon: string; label: string }[] = [
  { page: 'clock', icon: '🕐', label: '时钟' },
  { page: 'timer', icon: '⏱', label: '计时' },
  { page: 'stopwatch', icon: '⏲', label: '秒表' },
  { page: 'countdown', icon: '📅', label: '倒数' },
  { page: 'focus', icon: '🍅', label: '专注' },
  { page: 'settings', icon: '⚙', label: '设置' },
];

const TRIGGER_HEIGHT = 48;

export default function NavBar({
  current,
  onNavigate,
  accent,
  digit,
  background,
  autoHide = false,
}: NavBarProps) {
  const [visible, setVisible] = useState(!autoHide);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const navRef = useRef<HTMLDivElement>(null);

  // When switching pages, reset visibility
  useEffect(() => {
    setVisible(!autoHide);
  }, [autoHide, current]);

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  }, []);

  const hideSoon = useCallback(() => {
    if (!autoHide) return;
    timerRef.current = setTimeout(() => setVisible(false), 800);
  }, [autoHide]);

  const cancelHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!autoHide) {
    // Always visible mode (non-clock pages)
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '6px 0 max(6px, env(safe-area-inset-bottom))',
          background: `${background}EE`,
          borderTop: `1px solid ${digit}11`,
          zIndex: 100,
        }}
      >
        {items.map(({ page, icon, label }) => (
          <NavBtn
            key={page}
            icon={icon}
            label={label}
            active={current === page}
            accent={accent}
            digit={digit}
            onClick={() => onNavigate(page)}
          />
        ))}
      </div>
    );
  }

  // Auto-hide mode (clock page): trigger zone + sliding navbar
  return (
    <>
      {/* Invisible trigger zone — always present at screen bottom */}
      <div
        onMouseEnter={show}
        onTouchStart={show}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TRIGGER_HEIGHT,
          zIndex: 99,
        }}
      />

      {/* Navbar — slides up on hover, slides down after delay */}
      <div
        ref={navRef}
        onMouseEnter={cancelHide}
        onMouseLeave={hideSoon}
        onTouchStart={cancelHide}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '6px 0 max(6px, env(safe-area-inset-bottom))',
          background: `${background}EE`,
          borderTop: `1px solid ${digit}11`,
          zIndex: 100,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {items.map(({ page, icon, label }) => (
          <NavBtn
            key={page}
            icon={icon}
            label={label}
            active={current === page}
            accent={accent}
            digit={digit}
            onClick={() => {
              show();
              onNavigate(page);
            }}
          />
        ))}
      </div>
    </>
  );
}

function NavBtn({
  icon,
  label,
  active,
  accent,
  digit,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  accent: string;
  digit: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: '4px 8px',
        background: 'transparent',
        border: 'none',
        color: active ? accent : digit,
        opacity: active ? 1 : 0.5,
        cursor: 'pointer',
        fontSize: 'clamp(9px, 1.1vw, 11px)',
        transition: 'opacity 0.2s',
      }}
    >
      <span style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
