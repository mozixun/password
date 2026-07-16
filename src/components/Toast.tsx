import { create } from 'zustand';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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

const typeConfig: Record<ToastType, { icon: React.ReactNode; bgColor: string; borderColor: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle size={20} />,
    bgColor: 'bg-vault-success/10',
    borderColor: 'border-vault-success/20',
    iconColor: 'text-vault-success',
  },
  error: {
    icon: <AlertCircle size={20} />,
    bgColor: 'bg-vault-error/10',
    borderColor: 'border-vault-error/20',
    iconColor: 'text-vault-error',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bgColor: 'bg-vault-warn/10',
    borderColor: 'border-vault-warn/20',
    iconColor: 'text-vault-warn',
  },
  info: {
    icon: <Info size={20} />,
    bgColor: 'bg-vault-accent/10',
    borderColor: 'border-vault-accent/20',
    iconColor: 'text-vault-accent',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setVisibleToasts(toasts);
  }, [toasts]);

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {visibleToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = typeConfig[toast.type];
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(onClose, 200);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto transition-all duration-200',
        config.bgColor,
        config.borderColor,
        isLeaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
      )}
      role="alert"
    >
      <span className={cn('shrink-0 mt-0.5', config.iconColor)}>{config.icon}</span>
      <span className="flex-1 text-sm text-vault-text break-words">{toast.message}</span>
      <button
        onClick={handleClose}
        className="shrink-0 p-0.5 rounded text-vault-text-muted hover:text-vault-text transition-colors"
        aria-label="关闭通知"
      >
        <X size={16} />
      </button>
    </div>
  );
}
