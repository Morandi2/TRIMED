 
import React from 'react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl'
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Désactiver le scroll du body quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Réactiver le scroll du body quand le modal est fermé
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn">
      {/* Overlay avec z-index élevé */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={handleBackdropClick}
      ></div>
      
      {/* Modal container avec z-index plus élevé */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 animate-slideUp z-[10000]`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 truncate flex-1 mr-4">
            {title}
          </h3>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        
        {/* Container avec scroll interne */}
        <div className="overflow-y-auto bg-white dark:bg-gray-800" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reste du code pour PatientDetailModal...
export const PatientDetailModal: React.FC<PatientModalProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patient,
  isOpen,
  onClose,
  patientComplet
}) => {
  if (!isOpen || !patientComplet) return null;

  const getSexeText = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      default: return sexe;
    }
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <PatientModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du Patient"
      size="xl"
    >
      <div className="space-y-6">
        {/* Informations Personnelles */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 text-lg">Informations Personnelles</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">ID Patient:</span>
              <p className="font-mono font-medium text-gray-800 dark:text-white/90">#{patientComplet.patient.patient_id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Nom complet:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.prenom} {patientComplet.patient.nom}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Email:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.email || 'Non renseigné'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Téléphone:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.telephone || 'Non renseigné'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Sexe:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{getSexeText(patientComplet.patient.sexe)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Âge:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{calculateAge(patientComplet.patient.date_naissance)} ans</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Date naissance:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">
                {new Date(patientComplet.patient.date_naissance).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Groupe sanguin:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.groupe_sanguin || 'Non renseigné'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">Numéro dossier:</span>
              <p className="font-mono font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.numero_dossier_medical}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 dark:text-gray-400">NIF/CIN:</span>
              <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.numero_identification_nationale || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        {/* Sections restantes... */}
        {patientComplet.adresse && (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 text-lg">Adresse</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400">Pays:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.pays}</p>
              </div>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400">Département:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.departement}</p>
              </div>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400">Ville:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.ville}</p>
              </div>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-400">Code Postal:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.code_postal}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-700 dark:text-gray-400">Adresse:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {patientComplet.adresse.adresse_ligne1}
                  {patientComplet.adresse.adresse_ligne2 && `, ${patientComplet.adresse.adresse_ligne2}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reste du code pour les autres sections... */}
      </div>
    </PatientModal>
  );
};