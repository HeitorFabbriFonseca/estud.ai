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
    red: 'bg-rose-500 hover:bg-rose-600',
    blue: 'bg-primary hover:bg-primary/90',
    green: 'bg-emerald-500 hover:bg-emerald-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/10">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Confirmação</p>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Fechar diálogo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-slate-600">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition ${buttonColors[confirmButtonColor]}`}
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

