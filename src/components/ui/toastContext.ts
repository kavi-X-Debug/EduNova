import { createContext, useContext } from 'react';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';
export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** ms; 0 = persistent. Default 5000. */
  duration?: number;
}
export interface ToastApi {
  show: (opts: ToastOptions) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
