import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newToast: Toast = {
      id,
      duration: toast.duration ?? 3000,
      ...toast,
    };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  clearAll: () => {
    set({ toasts: [] });
  },
}));

export function toast(message: string, type: ToastType = 'info', duration?: number): string {
  return useToastStore.getState().addToast({ type, message, duration });
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration?: number) => toast(message, 'error', duration);
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration);
toast.info = (message: string, duration?: number) => toast(message, 'info', duration);

export default toast;
