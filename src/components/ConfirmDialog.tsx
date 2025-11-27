import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: 'red' | 'blue' | 'green';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonColor = 'red',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const buttonColors = {
    red: 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700',
    blue: 'from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700',
    green: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/80 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20">
              <AlertTriangle className="h-6 w-6 text-rose-200" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Confirmação</p>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-2xl border border-white/10 p-2 text-white/60 transition hover:border-white/30 hover:text-white"
            aria-label="Fechar diálogo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-white/80">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onCancel}
              className="rounded-2xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-2xl bg-gradient-to-r px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition ${buttonColors[confirmButtonColor]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

