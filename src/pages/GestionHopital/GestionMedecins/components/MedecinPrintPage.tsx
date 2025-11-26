import React from 'react';
import { Medecin, medecinService } from '../services/MedecinService';

interface MedecinPrintPageProps {
  medecin: Medecin | null;
  hopitalNom: string;
  onClose: () => void;
}

export const MedecinPrintPage: React.FC<MedecinPrintPageProps> = ({
  medecin,
  hopitalNom,
  onClose
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
      {/* Header pour écran seulement */}
      <div className="print:hidden bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Aperçu d'impression - Fiche Médecin</h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Contenu à imprimer */}
      <div className="p-8 max-w-4xl mx-auto text-black overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        {/* En-tête du document */}
        <div className="text-center mb-12 border-b border-gray-300 pb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{hopitalNom}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Fiche Médecin</h2>
          <p className="text-sm text-gray-600">
            Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>

        {/* Photo et informations principales */}
        <div className="flex items-start gap-6 mb-8">
          <div className="flex-shrink-0">
            {medecin.photo ? (
              <img 
                src={medecin.photo} 
                alt={`Dr. ${medecin.prenom} ${medecin.nom}`}
                className="w-32 h-32 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border">
                <span className="text-2xl font-bold text-gray-500">
                  {medecin.prenom.charAt(0)}{medecin.nom.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Dr. {medecin.prenom} {medecin.nom}
            </h2>
            <p className="text-lg text-gray-600 mb-1">
              {medecinService.obtenirNomSpecialite(medecin.specialite_principale_id)}
            </p>
            <p className="text-gray-500">
              Matricule: {medecin.numero_matricule_professionnel || 'Non défini'}
            </p>
          </div>
        </div>

        {/* Informations du médecin */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Informations Personnelles
          </h3>
          <div className="grid grid-cols-2 gap-6 text-black">
            <div>
              <p className="text-black"><strong className="text-black">Nom:</strong> {medecin.nom}</p>
              <p className="text-black"><strong className="text-black">Prénom:</strong> {medecin.prenom}</p>
              <p className="text-black"><strong className="text-black">Date de naissance:</strong> {formatDate(medecin.date_naissance)}</p>
              <p className="text-black"><strong className="text-black">Sexe:</strong> {medecin.sexe === 'M' ? 'Masculin' : medecin.sexe === 'F' ? 'Féminin' : 'Autre'}</p>
            </div>
            <div>
              <p className="text-black"><strong className="text-black">Matricule:</strong> {medecin.numero_matricule_professionnel || 'Non défini'}</p>
              <p className="text-black"><strong className="text-black">Numéro ID:</strong> {medecin.numero_identification || 'Non renseigné'}</p>
              <p className="text-black"><strong className="text-black">Téléphone:</strong> {medecin.telephone || 'Non renseigné'}</p>
              <p className="text-black"><strong className="text-black">Email:</strong> {medecin.email_professionnel || 'Non renseigné'}</p>
              <p className="text-black"><strong className="text-black">Âge:</strong> {calculateAge(medecin.date_naissance)} ans</p>
            </div>
          </div>
        </div>

        {/* Spécialités */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Spécialités
          </h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-600">Spécialité principale:</span>
              <span className="ml-2">{medecinService.obtenirNomSpecialite(medecin.specialite_principale_id)}</span>
            </div>
            {medecin.specialites_secondaires && medecin.specialites_secondaires.length > 0 && (
              <div>
                <span className="font-medium text-gray-600">Spécialités secondaires:</span>
                <div className="ml-2 mt-1">
                  {medecin.specialites_secondaires.map(specialiteId => (
                    <span key={specialiteId} className="inline-block bg-gray-100 px-2 py-1 rounded text-sm mr-2 mb-1">
                      {medecinService.obtenirNomSpecialite(specialiteId)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations système */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Informations Système
          </h3>
          <div className="grid grid-cols-2 gap-6 text-black">
            <div>
              <p className="text-black"><strong className="text-black">Créé le:</strong> {formatDate(medecin.cree_le)}</p>
            </div>
            <div>
              <p className="text-black"><strong className="text-black">Modifié le:</strong> {formatDate(medecin.modifie_le)}</p>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>Ce document est confidentiel et destiné uniquement à un usage médical.</p>
          <p>Généré automatiquement par le système de gestion hospitalière TRIMED</p>
        </div>
      </div>
    </div>
  );
};