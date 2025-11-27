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
    container: 'border-emerald-400/40 from-emerald-500/20 via-emerald-400/10 to-emerald-500/5 text-emerald-50',
    accent: 'bg-emerald-400/70',
    icon: <CheckCircle className="h-5 w-5 text-emerald-200" />,
  },
  error: {
    container: 'border-rose-400/40 from-rose-500/25 via-rose-400/10 to-rose-500/5 text-rose-100',
    accent: 'bg-rose-400/70',
    icon: <XCircle className="h-5 w-5 text-rose-200" />,
  },
  warning: {
    container: 'border-amber-400/40 from-amber-400/25 via-amber-300/10 to-amber-400/5 text-amber-50',
    accent: 'bg-amber-300/70',
    icon: <AlertCircle className="h-5 w-5 text-amber-100" />,
  },
  info: {
    container: 'border-sky-400/40 from-sky-500/20 via-sky-400/10 to-sky-500/5 text-sky-50',
    accent: 'bg-sky-400/70',
    icon: <AlertCircle className="h-5 w-5 text-sky-100" />,
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
      className={`relative flex min-w-[320px] max-w-md animate-in slide-in-from-top-5 items-start gap-3 overflow-hidden rounded-2xl border bg-gradient-to-r px-5 py-4 shadow-2xl shadow-black/40 backdrop-blur-2xl ${variant.container}`}
      role="alert"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${variant.accent}`} />
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
        {variant.icon}
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
        <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/50">
          EstudAI
        </span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/60 transition hover:text-white"
        aria-label="Fechar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ToastComponent;

