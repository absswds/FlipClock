import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Page } from '../logic/page';
import type { Lang } from '../logic/i18n';
import { t } from '../logic/i18n';

interface NavBarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  themeId: string;
  accent: string;
  digit: string;
  background: string;
  autoHide?: boolean;
  lang: Lang;
}

const pageKeys = ['clock', 'timer', 'stopwatch', 'countdown', 'focus', 'settings'] as const;

export default function NavBar({
  current,
  onNavigate,
  themeId,
  accent,
  digit,
  background,
  autoHide = false,
  lang,
}: NavBarProps) {
  const [visible, setVisible] = useState(!autoHide);
  const isPaperDesk = themeId === 'paper_desk';

  const items = useMemo(
    () => pageKeys.map((k) => ({ page: k as Page, label: t(lang, k) })),
    [lang],
  );
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveringRef = useRef(false);

  // Reset on page switch
  useEffect(() => {
    setVisible(!autoHide);
  }, [autoHide, current]);

  const startIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    if (!autoHide) return;
    idleRef.current = setTimeout(() => {
      if (!hoveringRef.current) setVisible(false);
    }, 1000);
  }, [autoHide]);

  const show = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    setVisible(true);
  }, []);

  // Mouse-idle: any movement shows navbar, 1s stillness hides it
  useEffect(() => {
    if (!autoHide) return;

    const onMove = () => {
      show();
      startIdle();
    };

    const onTouch = () => {
      show();
      // Longer timeout for touch
      if (idleRef.current) clearTimeout(idleRef.current);
      idleRef.current = setTimeout(() => {
        if (!hoveringRef.current) setVisible(false);
      }, 2000);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('touchstart', onTouch, { passive: true });

    // Initial idle countdown
    startIdle();

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchstart', onTouch);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [autoHide, show, startIdle]);

  // Don't hide while mouse is directly on the navbar
  const onBarEnter = useCallback(() => {
    hoveringRef.current = true;
    if (idleRef.current) clearTimeout(idleRef.current);
    setVisible(true);
  }, []);

  const onBarLeave = useCallback(() => {
    hoveringRef.current = false;
    startIdle();
  }, [startIdle]);

  useEffect(() => {
    return () => {
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, []);

  const bar = (
    <div
      onMouseEnter={autoHide ? onBarEnter : undefined}
      onMouseLeave={autoHide ? onBarLeave : undefined}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(2px, 2vw, 16px)',
        padding: '6px clamp(10px, 2vw, 18px) max(6px, env(safe-area-inset-bottom))',
        background: isPaperDesk
          ? 'color-mix(in srgb, var(--surface, #f8f3ea) 88%, rgba(255,255,255,0.35))'
          : `${background}EE`,
        borderTop: `1px solid ${isPaperDesk ? 'var(--surface-edge, #d7c9b6)' : `${digit}11`}`,
        boxShadow: isPaperDesk ? '0 -12px 30px rgba(92, 70, 40, 0.08)' : 'none',
        backdropFilter: isPaperDesk ? 'blur(12px)' : 'none',
        zIndex: 100,
        transition: autoHide ? 'transform 0.25s ease' : 'none',
        transform: autoHide && !visible ? 'translateY(100%)' : 'translateY(0)',
      }}
    >
      {items.map(({ page, label }) => (
        <button
          key={page}
          className="nav-button"
          onClick={() => {
            show();
            onNavigate(page);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: current === page ? accent : digit,
            opacity: current === page ? 1 : isPaperDesk ? 0.6 : 0.45,
            cursor: 'pointer',
            fontSize: 'clamp(10px, 1.2vw, 13px)',
            fontWeight: current === page ? 600 : 400,
            padding: '3px 7px',
            transition: 'opacity 0.2s, color 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return bar;
}
