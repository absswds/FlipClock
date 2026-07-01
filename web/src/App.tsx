import { useMemo } from 'react';
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
import type { Page } from './main';

interface AppProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export default function App({ page, onNavigate }: AppProps) {
  const now = useTime();
  const { settings, setTimeFormat, setShowSeconds, setSignature, setThemeId, setLanguage } =
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
            onSetSignature={setSignature}
            onSetThemeId={setThemeId}
            onSetLanguage={setLanguage}
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

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: theme.background,
        position: 'relative',
        transition: 'background 0.4s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {renderPage()}
      </div>

      <NavBar
        current={page}
        onNavigate={onNavigate}
        accent={theme.accent}
        digit={theme.digit}
        background={theme.background}
        autoHide={page === 'clock'}
        lang={lang}
      />
    </div>
  );
}
