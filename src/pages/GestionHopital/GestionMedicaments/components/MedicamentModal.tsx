import React, { useState } from 'react';
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
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

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

  const handleSave = async (formData: MedicamentFormData, isModifying: boolean): Promise<void> => {
    try {
      let result;
      if (isModifying && medicament) {
        result = await medicamentService.modifierMedicament(medicament.medicament_id, formData, tenantId);
      } else {
        result = await medicamentService.creerMedicament(formData, tenantId);
      }

      if (result.success && result.data) {
        onSave(result.data);
        
        // Afiche modal siksè SANS femen modal prensipal la
        setSuccessModal({
          isOpen: true,
          title: isModifying ? 'Modification réussie' : 'Création réussie',
          message: isModifying 
            ? 'Le médicament a été modifié avec succès.' 
            : 'Le médicament a été créé avec succès.',
          type: 'success'
        });
        
        // Pa femen modal prensipal la isit - sèlman lè itilizatè klike OK
      } else {
        setSuccessModal({
          isOpen: true,
          title: 'Erreur',
          message: result.errors?.join(', ') || 'Une erreur est survenue',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Une erreur est survenue lors de l\'opération.',
        type: 'error'
      });
    }
  };

  const handleSuccessClose = () => {
    setSuccessModal(prev => ({ ...prev, isOpen: false }));
    onClose(); // Femen modal prensipal la sèlman lè itilizatè klike OK
  };

  if (!isOpen) return null;

  return (
    <>
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

      {/* Modal de succès/erreur */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center animate-fadeIn">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleSuccessClose}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full mr-3 ${
                  successModal.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {successModal.type === 'success' ? (
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{successModal.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{successModal.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={handleSuccessClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { MedicamentProgressForm };
