import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { bindLocaleStore, initI18n } from '@/i18n';
import { useUiStore } from '@/store';
import { ToastProvider } from '@/components/ui';
import { router } from '@/app/routes';
import '@/styles/index.css';

initI18n();
bindLocaleStore(useUiStore);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
);
