import { StrictMode, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/clock.css';

export type Page = 'clock' | 'settings' | 'timer' | 'stopwatch' | 'countdown' | 'focus';

function Root() {
  const [page, setPage] = useState<Page>('clock');

  const navigate = useCallback((p: Page) => setPage(p), []);

  return (
    <StrictMode>
      <App page={page} onNavigate={navigate} />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
