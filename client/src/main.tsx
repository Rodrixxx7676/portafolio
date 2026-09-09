import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { LocaleProvider } from './i18n/LocaleProvider.js';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el nodo #root en index.html.');

createRoot(container).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
);
