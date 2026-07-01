import { useState, useRef, useEffect, useCallback } from 'react';
import type { Page } from '../main';

interface NavBarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  accent: string;
  digit: string;
  background: string;
  autoHide?: boolean;
}

const items: { page: Page; label: string }[] = [
  { page: 'clock', label: '时钟' },
  { page: 'timer', label: '计时' },
  { page: 'stopwatch', label: '秒表' },
  { page: 'countdown', label: '倒数' },
  { page: 'focus', label: '专注' },
  { page: 'settings', label: '设置' },
];

const TRIGGER_HEIGHT = 40;

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

  useEffect(() => {
    setVisible(!autoHide);
  }, [autoHide, current]);

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  }, []);

  const hideSoon = useCallback(() => {
    if (!autoHide) return;
    timerRef.current = setTimeout(() => setVisible(false), 250);
  }, [autoHide]);

  const cancelHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const bar = (
    <div
      ref={navRef}
      onMouseEnter={autoHide ? cancelHide : undefined}
      onMouseLeave={autoHide ? hideSoon : undefined}
      onTouchStart={autoHide ? cancelHide : undefined}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(2px, 2vw, 16px)',
        padding: '4px 0 max(4px, env(safe-area-inset-bottom))',
        background: `${background}EE`,
        borderTop: `1px solid ${digit}11`,
        zIndex: 100,
        transition: autoHide ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        transform: autoHide && !visible ? 'translateY(100%)' : 'translateY(0)',
      }}
    >
      {items.map(({ page, label }) => (
        <button
          key={page}
          onClick={() => {
            if (autoHide) show();
            onNavigate(page);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: current === page ? accent : digit,
            opacity: current === page ? 1 : 0.45,
            cursor: 'pointer',
            fontSize: 'clamp(10px, 1.2vw, 13px)',
            fontWeight: current === page ? 600 : 400,
            padding: '2px 6px',
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  if (!autoHide) return bar;

  return (
    <>
      {/* Invisible trigger zone at screen bottom */}
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
      {bar}
    </>
  );
}
