import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure light mode is strictly applied on initialization
document.documentElement.classList.remove('dark');
document.body.classList.remove('dark');
try {
  localStorage.setItem('pathai_theme', 'light');
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
