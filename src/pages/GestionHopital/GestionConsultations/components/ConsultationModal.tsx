import React from 'react';
import { consultationService, ConsultationFormData, Consultation } from '../services/ConsultationService';
import { ConsultationProgressForm } from './ConsultationProgressForm';

// Ajouter les animations CSS
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

// Injecter les styles
if (typeof document !== 'undefined' && !document.getElementById('consultation-modal-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'consultation-modal-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consultation: Consultation) => void;
  consultationId?: number;
  tenantId: number;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  consultationId,
  tenantId
}) => {
  // Gérer l'échappement et le scroll du body
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
  const handleSave = (formData: ConsultationFormData, isModifying: boolean) => {
    try {
      let result;
      if (isModifying && consultationId) {
        result = consultationService.modifierConsultation(consultationId, formData);
      } else {
        result = consultationService.creerConsultation(formData, _tenantId);
      }

      if (result.success) {
        if (result.data) {
          onSave(result.data);
        } else if (consultationId) {
          const updatedConsultation = consultationService.obtenirConsultation(consultationId);
          if (updatedConsultation) {
            onSave(updatedConsultation);
          }
        }
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
        <ConsultationProgressForm
          tenantId={tenantId}
          onSave={handleSave}
          onClose={onClose}
          consultationId={consultationId}
        />
      </div>
    </div>
  );
};