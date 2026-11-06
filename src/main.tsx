import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="p-6 font-sans text-ink">EduNova Sahayaka</div>
  </StrictMode>,
);
