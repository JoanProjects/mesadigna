import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmText = 'Confirmar', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary mb-6">{message}</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={onConfirm}>{confirmText}</Button>
          </div>
        </div>
      </div>
    </>
  );
}
