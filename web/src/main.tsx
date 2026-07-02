import { createRoot } from 'react-dom/client';
import Root from './Root.tsx';
import './styles/clock.css';

createRoot(document.getElementById('root')!).render(<Root />);
