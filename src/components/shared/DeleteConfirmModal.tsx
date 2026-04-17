import React from 'react';
import { Trash } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Titre de la modal (ex: "Supprimer le patient") */
  title?: string;
  /** Message descriptif (ex: "Êtes-vous sûr de vouloir supprimer ...") */
  message?: string;
  /** Nom de l'entité à supprimer (affiché en gras dans le message) */
  entityName?: string;
  /** ID de l'entité (affiché dans le message) */
  entityId?: number | string;
  /** Texte du bouton de confirmation */
  confirmText?: string;
}

/**
 * Modal de confirmation de suppression unifiée.
 * Design premium cohérent avec le style glassmorphism de l'application.
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmer la suppression',
  message,
  entityName,
  entityId,
  confirmText = 'Supprimer'
}) => {
  if (!isOpen) return null;

  const defaultMessage = entityName
    ? `Êtes-vous sûr de vouloir supprimer ${entityName}${entityId ? ` (ID: #${entityId})` : ''} ? Cette action est irréversible.`
    : 'Êtes-vous sûr de vouloir continuer ? Cette action est irréversible.';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-900/20 mb-6 text-red-600">
          <Trash className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 italic">
          {message || defaultMessage}
        </p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-2xl border border-gray-200 dark:border-gray-700 font-black uppercase text-xs tracking-widest text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase text-xs tracking-widest"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
