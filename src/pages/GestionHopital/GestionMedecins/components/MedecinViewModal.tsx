import React from 'react';
import { Medecin, medecinService } from '../services/MedecinService';

interface MedecinViewModalProps {
  medecin: Medecin | null;
  onClose: () => void;
  hopitalNom: string;
  onPrint: (medecin: Medecin) => void;
}

export const MedecinViewModal: React.FC<MedecinViewModalProps> = ({
  medecin,
  onClose,
  hopitalNom,
  onPrint
}) => {
  if (!medecin) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 animate-slideUp z-[100000] mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 truncate flex-1 mr-4">
            Détails du médecin
          </h3>
          <button
            onClick={() => onPrint(medecin)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>
        
        <div className="overflow-y-auto bg-white dark:bg-gray-800" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="p-6">

          <div className="space-y-6">
            {/* En-tête avec photo et nom */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 h-16 w-16">
                {medecin.photo ? (
                  <img 
                    src={medecin.photo} 
                    alt={`Dr. ${medecin.prenom} ${medecin.nom}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-xl font-medium text-blue-600 dark:text-blue-400">
                      {medecin.prenom.charAt(0)}{medecin.nom.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {medecin.prenom} {medecin.nom}
                </h3>
                <p className="text-sm text-gray-600">
                  {medecinService.obtenirNomSpecialite(medecin.specialite_principale_id)}
                </p>
                <p className="text-sm text-gray-500">
                  {hopitalNom}
                </p>
              </div>
            </div>

            {/* Informations personnelles */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Informations personnelles</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Sexe</label>
                  <p className="text-sm text-gray-900">
                    {medecin.sexe === 'M' ? 'Masculin' : medecin.sexe === 'F' ? 'Féminin' : 'Autre'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Âge</label>
                  <p className="text-sm text-gray-900">
                    {calculateAge(medecin.date_naissance)} ans ({formatDate(medecin.date_naissance)})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Numéro d'identification</label>
                  <p className="text-sm text-gray-900">
                    {medecin.numero_identification || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Matricule professionnel</label>
                  <p className="text-sm text-gray-900">
                    {medecin.numero_matricule_professionnel || 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Téléphone</label>
                  <p className="text-sm text-gray-900">
                    {medecin.telephone || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email professionnel</label>
                  <p className="text-sm text-gray-900">
                    {medecin.email_professionnel || 'Non spécifié'}
                  </p>
                </div>
              </div>
            </div>

            {/* Spécialités */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">Spécialités</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Spécialité principale</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {medecinService.obtenirNomSpecialite(medecin.specialite_principale_id)}
                  </p>
                </div>
                {medecin.specialites_secondaires && medecin.specialites_secondaires.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Spécialités secondaires</label>
                    <div className="flex flex-wrap gap-2">
                      {medecin.specialites_secondaires.map(specialiteId => (
                        <span
                          key={specialiteId}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {medecinService.obtenirNomSpecialite(specialiteId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations système */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">Informations système</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Créé le</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(medecin.cree_le)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Modifié le</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(medecin.modifie_le)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};