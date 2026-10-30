import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root')!;
const initialData = (typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__ : null) || {};

const app = (
  <StrictMode>
    <BrowserRouter>
      <App
        initialDevelopments={initialData.developments}
        currentDevelopment={initialData.currentDevelopment}
      />
    </BrowserRouter>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

