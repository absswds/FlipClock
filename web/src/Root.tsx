import { StrictMode, useCallback, useState } from 'react';
import App from './App';
import type { Page } from './logic/page';

export default function Root() {
  const [page, setPage] = useState<Page>('clock');

  const navigate = useCallback((p: Page) => setPage(p), []);

  return (
    <StrictMode>
      <App page={page} onNavigate={navigate} />
    </StrictMode>
  );
}
