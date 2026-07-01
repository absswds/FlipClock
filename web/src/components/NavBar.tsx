import type { Page } from '../main';

interface NavBarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  accent: string;
  digit: string;
  background: string;
}

const items: { page: Page; icon: string; label: string }[] = [
  { page: 'clock', icon: '🕐', label: '时钟' },
  { page: 'timer', icon: '⏱', label: '计时' },
  { page: 'stopwatch', icon: '⏲', label: '秒表' },
  { page: 'countdown', icon: '📅', label: '倒数' },
  { page: 'focus', icon: '🍅', label: '专注' },
  { page: 'settings', icon: '⚙', label: '设置' },
];

export default function NavBar({ current, onNavigate, accent, digit, background }: NavBarProps) {
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
        <button
          key={page}
          onClick={() => onNavigate(page)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '4px 8px',
            background: 'transparent',
            border: 'none',
            color: current === page ? accent : digit,
            opacity: current === page ? 1 : 0.5,
            cursor: 'pointer',
            fontSize: 'clamp(9px, 1.1vw, 11px)',
            transition: 'opacity 0.2s',
          }}
        >
          <span style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
