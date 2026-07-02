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
  const wasHiddenRef = useRef(!autoHide);

  // Track visibility in a ref so show() can tell if navbar was hidden
  useEffect(() => {
    wasHiddenRef.current = !visible;
  }, [visible]);

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
    // When navbar was hidden, block buttons for 400ms so the touch
    // that triggered show() cannot click-through to a button.
    if (wasHiddenRef.current) {
      buttonsBlockedRef.current = true;
      setTimeout(() => {
        buttonsBlockedRef.current = false;
      }, 400);
    }
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
      if (idleRef.current) clearTimeout(idleRef.current);
      idleRef.current = setTimeout(() => {
        if (!hoveringRef.current) setVisible(false);
      }, 2000);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('touchstart', onTouch, { passive: true });

    startIdle();

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchstart', onTouch);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [autoHide, show, startIdle]);

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

  // --- Button gate: prevents the touch that REVEALS the navbar from
  //     also accidentally clicking a button that just appeared. ---
  const buttonsBlockedRef = useRef(false);

  const handleNavClick = useCallback(
    (page: Page) => {
      if (buttonsBlockedRef.current) return;
      if (idleRef.current) clearTimeout(idleRef.current);
      onNavigate(page);
    },
    [onNavigate],
  );


  const bar = (
    <div
      onMouseEnter={autoHide ? onBarEnter : undefined}
      onMouseLeave={autoHide ? onBarLeave : undefined}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(2px, 2vw, 16px)',
        padding: '8px clamp(10px, 2vw, 18px) max(18px, calc(env(safe-area-inset-bottom) + 8px))',
        background: isPaperDesk
          ? 'color-mix(in srgb, var(--surface, #f8f3ea) 88%, rgba(255,255,255,0.35))'
          : `${background}EE`,
        borderTop: `1px solid ${isPaperDesk ? 'var(--surface-edge, #d7c9b6)' : `${digit}11`}`,
        boxShadow: isPaperDesk ? '0 -12px 30px rgba(92, 70, 40, 0.08)' : 'none',
        backdropFilter: isPaperDesk ? 'blur(12px)' : 'none',
        zIndex: 100,
        transition: autoHide ? 'transform 0.28s ease' : 'none',
        transform: autoHide && !visible ? 'translateY(100%)' : 'translateY(0)',
      }}
    >
      {items.map(({ page, label }) => (
        <button
          key={page}
          className="nav-button"
          onClick={() => handleNavClick(page)}
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

  return (
    <>
      {bar}
      {autoHide && !visible && (
        <div
          onClick={show}
          style={{
            position: 'fixed',
            bottom: `max(4px, calc(env(safe-area-inset-bottom) + 2px))`,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 32px',
            zIndex: 101,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 72,
              height: 6,
              borderRadius: 999,
              background: `${accent}DD`,
              boxShadow: `0 0 12px ${accent}66`,
            }}
          />
        </div>
      )}
    </>
  );
}
