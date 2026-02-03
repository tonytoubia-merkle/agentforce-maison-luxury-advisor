import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ActivityToastContainer } from './ActivityToast';
import type { CaptureNotification } from '@/types/agent';

interface ToastWithId extends CaptureNotification {
  id: string;
}

interface ActivityToastContextValue {
  showToast: (notification: CaptureNotification) => void;
  showToasts: (notifications: CaptureNotification[]) => void;
}

const ActivityToastContext = createContext<ActivityToastContextValue | null>(null);

const TOAST_DURATION = 4000;

export const ActivityToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastWithId[]>([]);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((notification: CaptureNotification) => {
    const id = `toast-${++toastIdRef.current}`;
    setToasts((prev) => [...prev, { ...notification, id }]);

    setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION);
  }, [dismissToast]);

  const showToasts = useCallback((notifications: CaptureNotification[]) => {
    notifications.forEach((n, i) => {
      // Stagger toasts slightly
      setTimeout(() => showToast(n), i * 200);
    });
  }, [showToast]);

  return (
    <ActivityToastContext.Provider value={{ showToast, showToasts }}>
      {children}
      <ActivityToastContainer notifications={toasts} onDismiss={dismissToast} />
    </ActivityToastContext.Provider>
  );
};

export const useActivityToast = (): ActivityToastContextValue => {
  const context = useContext(ActivityToastContext);
  if (!context) {
    throw new Error('useActivityToast must be used within ActivityToastProvider');
  }
  return context;
};
