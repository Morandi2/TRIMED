import React, { useEffect } from 'react';
import { BadgeCheck, XCircle, X } from 'lucide-react';

interface NotificationToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  /** 'success' (vert) ou 'error' (rouge) */
  type?: 'success' | 'error';
  /** Durée d'affichage en ms (défaut: 3000) */
  duration?: number;
}

/**
 * Toast notification premium unifiée.
 * S'affiche en haut de l'écran avec auto-dismiss.
 * Design cohérent pour tous les modules.
 */
export const NotificationToast: React.FC<NotificationToastProps> = ({
  isOpen,
  onClose,
  message,
  type = 'success',
  duration = 3000
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100000] animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-3 ${
          isError ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
        }`}
      >
        {isError ? <XCircle className="h-6 w-6 flex-shrink-0" /> : <BadgeCheck className="h-6 w-6 flex-shrink-0" />}
        <span className="font-bold uppercase tracking-tight text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
