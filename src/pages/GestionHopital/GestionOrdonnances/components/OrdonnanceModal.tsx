import React from 'react';
import { ordonnanceService, OrdonnanceFormData, Ordonnance } from '../services/OrdonnanceService';
import { OrdonnanceProgressForm } from './OrdonnanceProgressForm';

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('ordonnance-modal-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'ordonnance-modal-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface OrdonnanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ordonnance: Ordonnance) => Promise<void>;
  ordonnanceId?: number;
  tenantId: number;
}

export const OrdonnanceModal: React.FC<OrdonnanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ordonnanceId,
  tenantId
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSave = async (formData: OrdonnanceFormData, isModifying: boolean) => {
    try {
      let result;
      if (isModifying && ordonnanceId) {
        result = await ordonnanceService.modifierOrdonnance(ordonnanceId, formData);
        if (result.success) {
          const updatedOrdonnance = await ordonnanceService.obtenirOrdonnance(ordonnanceId);
          if (updatedOrdonnance) {
            onSave(updatedOrdonnance);
          }
          onClose();
        } else {
          console.error('Erreurs de validation:', result.errors);
        }
      } else {
        const creationResult = await ordonnanceService.creerOrdonnance(formData, tenantId);
        if (creationResult.success && creationResult.data) {
          onSave(creationResult.data);
          onClose();
        } else {
          console.error('Erreurs de validation:', creationResult.errors);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 animate-slideUp z-[100000]"
      >
        <OrdonnanceProgressForm
          tenantId={tenantId}
          onSave={handleSave}
          onClose={onClose}
          ordonnanceId={ordonnanceId}
        />
      </div>
    </div>
  );
};