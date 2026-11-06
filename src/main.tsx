import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { bindLocaleStore, initI18n } from '@/i18n';
import { useUiStore } from '@/store';
import { ToastProvider } from '@/components/ui';
import '@/styles/index.css';

initI18n();
bindLocaleStore(useUiStore);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <div className="p-6 font-sans text-ink">EduNova Sahayaka</div>
    </ToastProvider>
  </StrictMode>,
);
