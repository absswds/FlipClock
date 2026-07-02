import { useMemo, useRef, useCallback, type CSSProperties } from 'react';
import { useTime } from './hooks/useTime';
import { useSettings } from './hooks/useSettings';
import { useTimer } from './hooks/useTimer';
import { useStopwatch } from './hooks/useStopwatch';
import { useCountdown } from './hooks/useCountdown';
import { usePomodoro } from './hooks/usePomodoro';
import { buildState } from './logic/buildState';
import { resolveLang } from './logic/i18n';
import ClockScreen from './components/ClockScreen';
import SettingsScreen from './components/SettingsScreen';
import TimerScreen from './components/TimerScreen';
import StopwatchScreen from './components/StopwatchScreen';
import CountdownScreen from './components/CountdownScreen';
import PomodoroScreen from './components/PomodoroScreen';
import NavBar from './components/NavBar';
import type { Page } from './logic/page';

interface AppProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export default function App({ page, onNavigate }: AppProps) {
  const now = useTime();
  const {
    settings,
    setTimeFormat,
    setShowSeconds,
    setShowSignature,
    setSignature,
    setThemeId,
    setLanguage,
    setTimezone,
    setDateFontSize,
    setSignatureFontSize,
  } =
    useSettings();
  const timer = useTimer();
  const stopwatch = useStopwatch();
  const countdown = useCountdown();
  const pomodoro = usePomodoro();

  const clockState = useMemo(() => buildState(now, settings), [now, settings]);
  const theme = clockState.theme;
  const lang = resolveLang(settings.language);

  const renderPage = () => {
    switch (page) {
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onClose={() => onNavigate('clock')}
            onSetTimeFormat={setTimeFormat}
            onSetShowSeconds={setShowSeconds}
            onSetShowSignature={setShowSignature}
            onSetSignature={setSignature}
            onSetThemeId={setThemeId}
            onSetLanguage={setLanguage}
            onSetTimezone={setTimezone}
            onSetDateFontSize={setDateFontSize}
            onSetSignatureFontSize={setSignatureFontSize}
          />
        );
      case 'timer':
        return (
          <TimerScreen
            theme={theme}
            state={timer.state}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={timer.reset}
            lang={lang}
          />
        );
      case 'stopwatch':
        return (
          <StopwatchScreen
            theme={theme}
            state={stopwatch.state}
            onStart={stopwatch.start}
            onPause={stopwatch.pause}
            onReset={stopwatch.reset}
            onLap={stopwatch.lap}
            lang={lang}
          />
        );
      case 'countdown':
        return (
          <CountdownScreen
            theme={theme}
            target={countdown.target}
            remaining={countdown.remaining}
            presets={countdown.presets}
            onSetTarget={countdown.setTarget}
            onDeleteTarget={countdown.deleteTarget}
            lang={lang}
          />
        );
      case 'focus':
        return (
          <PomodoroScreen
            theme={theme}
            state={pomodoro.state}
            onStart={pomodoro.start}
            onPause={pomodoro.pause}
            onReset={pomodoro.reset}
            onDismissAlert={pomodoro.dismissAlert}
            onUpdateSettings={pomodoro.updateSettings}
            lang={lang}
          />
        );
      case 'clock':
      default:
        return (
          <ClockScreen
            state={clockState}
            onLongPress={() => onNavigate('settings')}
          />
        );
    }
  };

  // Swipe navigation for mobile/tablet — only fires on deliberate horizontal swipes
  const pageOrder: Page[] = ['clock', 'timer', 'stopwatch', 'countdown', 'focus', 'settings'];
  const pointerRef = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - pointerRef.current.x;
      const dy = e.clientY - pointerRef.current.y;
      const threshold = 120;
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 2) {
        const idx = pageOrder.indexOf(page);
        if (dx < 0 && idx < pageOrder.length - 1) {
          onNavigate(pageOrder[idx + 1]);
        } else if (dx > 0 && idx > 0) {
          onNavigate(pageOrder[idx - 1]);
        }
      }
    },
    [page, onNavigate],
  );

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        '--accent': theme.accent,
        '--digit': theme.digit,
        '--surface': theme.cardTop,
        '--surface-edge': theme.cardEdge,
        width: '100vw',
        height: '100vh',
        background: theme.background,
        position: 'relative',
        transition: 'background 0.4s',
        display: 'flex',
        flexDirection: 'column',
      } as CSSProperties}
    >
      <div className="ambient-glow" aria-hidden="true" />
      <div key={page} className="page-surface" style={{ flex: 1, overflow: 'hidden', position: 'relative', paddingBottom: 120 }}>
        {renderPage()}
      </div>

      <NavBar
        current={page}
        onNavigate={onNavigate}
        themeId={theme.id}
        accent={theme.accent}
        digit={theme.digit}
        background={theme.background}
        autoHide={true}
        lang={lang}
      />
    </div>
  );
}
