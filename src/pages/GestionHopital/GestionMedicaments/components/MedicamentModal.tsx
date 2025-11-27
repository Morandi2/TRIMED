import React from 'react';
import { medicamentService } from '../services/MedicamentService';
import { MedicamentFormData, Medicament } from '../types/MedicamentTypes';
import { MedicamentProgressForm } from './MedicamentProgressForm';

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

if (typeof document !== 'undefined' && !document.getElementById('medicament-modal-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'medicament-modal-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface MedicamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicament: Medicament) => void;
  medicament?: Medicament | null;
  tenantId: number;
  mode: 'add' | 'edit';
}

export const MedicamentModal: React.FC<MedicamentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicament,
  tenantId,
  mode
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

  const handleSave = (formData: MedicamentFormData, isModifying: boolean) => {
    try {
      let result;
      if (isModifying && medicament) {
        result = medicamentService.modifierMedicament(medicament.medicament_id, formData);
      } else {
        result = medicamentService.creerMedicament(formData, _tenantId);
      }

      if (result.success && result.data) {
        onSave(result.data);
        onClose();
      } else {
        console.error('Erreurs de validation:', result.errors);
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
        <MedicamentProgressForm
          tenantId={tenantId}
          onSave={handleSave}
          onClose={onClose}
          medicamentId={medicament?.medicament_id}
        />
      </div>
    </div>
  );
};