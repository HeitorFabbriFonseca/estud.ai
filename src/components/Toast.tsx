import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const variantStyles = {
  success: {
    accent: 'bg-emerald-500',
    icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  error: {
    accent: 'bg-rose-500',
    icon: <XCircle className="h-5 w-5 text-rose-500" />,
    bg: 'bg-rose-50 border-rose-200 text-rose-900',
  },
  warning: {
    accent: 'bg-amber-500',
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  info: {
    accent: 'bg-sky-500',
    icon: <AlertCircle className="h-5 w-5 text-sky-500" />,
    bg: 'bg-sky-50 border-sky-200 text-sky-900',
  },
};

const ToastComponent = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const variant = variantStyles[toast.type] ?? variantStyles.info;

  return (
    <div
      className={`relative flex min-w-[320px] max-w-md animate-in slide-in-from-top-5 items-start gap-3 overflow-hidden rounded-2xl border px-5 py-4 shadow-xl shadow-slate-900/10 ${variant.bg}`}
      role="alert"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${variant.accent}`} />
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white">
        {variant.icon}
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
        <span className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">
          EstudAI
        </span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 transition hover:text-slate-600"
        aria-label="Fechar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ToastComponent;

