import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useToastStore, type Toast, type ToastType } from './toastStore';

const typeConfig: Record<ToastType, { icon: React.ReactNode; bgColor: string; borderColor: string; iconColor: string; barColor: string }> = {
  success: {
    icon: <CheckCircle size={20} />,
    bgColor: 'bg-vault-success/10',
    borderColor: 'border-vault-success/20',
    iconColor: 'text-vault-success',
    barColor: 'bg-vault-success',
  },
  error: {
    icon: <AlertCircle size={20} />,
    bgColor: 'bg-vault-error/10',
    borderColor: 'border-vault-error/20',
    iconColor: 'text-vault-error',
    barColor: 'bg-vault-error',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bgColor: 'bg-vault-warn/10',
    borderColor: 'border-vault-warn/20',
    iconColor: 'text-vault-warn',
    barColor: 'bg-vault-warn',
  },
  info: {
    icon: <Info size={20} />,
    bgColor: 'bg-vault-accent/10',
    borderColor: 'border-vault-accent/20',
    iconColor: 'text-vault-accent',
    barColor: 'bg-vault-accent',
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
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(onClose, 200);
      }, toast.duration);

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
        setProgress(remaining);
        if (remaining > 0) {
          rafRef.current = requestAnimationFrame(updateProgress);
        }
      };
      rafRef.current = requestAnimationFrame(updateProgress);

      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(rafRef.current);
      };
    }
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    cancelAnimationFrame(rafRef.current);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm pointer-events-auto transition-all duration-200 overflow-hidden',
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
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10">
          <div
            className={cn('h-full transition-none', config.barColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
