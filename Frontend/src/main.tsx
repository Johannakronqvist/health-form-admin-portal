import { StrictMode } from 'react';
import './styles/global.css';
import { Root } from './Root.tsx';
import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
);
