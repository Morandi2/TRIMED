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
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl z-[100000] mx-4 flex flex-col max-h-[90vh]">
        
        <div className="overflow-y-auto w-full h-full flex flex-col">
          {/* Blue Header Section */}
          <div className="relative bg-blue-600 dark:bg-blue-700 h-36 px-6 py-5 flex items-start justify-between shrink-0">
            <span className="text-white text-xs font-bold tracking-widest uppercase">{hopitalNom || 'HOPITAL'}</span>
            <button onClick={onClose} className="text-white/80 hover:text-white mt-1 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Section */}
          <div className="relative px-8 pb-8 bg-white dark:bg-gray-800 shrink-0">
            {/* Profile Card & Info */}
            <div className="flex items-end gap-5 -mt-16 mb-8 relative z-10">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-3xl border-[3px] border-white dark:border-gray-800 shrink-0 overflow-hidden">
                {medecin.photo ? (
                  <img src={medecin.photo} alt={`${medecin.prenom} ${medecin.nom}`} className="w-full h-full object-cover" />
                ) : (
                  <span>{(medecin.prenom || 'M').charAt(0)}{(medecin.nom || 'E').charAt(0)}</span>
                )}
              </div>
            <div className="pb-1 w-full max-w-[calc(100%-7rem)]">
              <h2 className="text-gray-900 dark:text-white font-black text-xl leading-tight truncate">Dr. {medecin.prenom} {medecin.nom}</h2>
              {medecin.statut && (
                <span className={`inline-block mt-1 px-3 py-0.5 text-[10px] font-black uppercase rounded-full ${
                  medecin.statut.toLowerCase() === 'actif' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {medecin.statut}
                </span>
              )}
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Prénom</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{medecin.prenom}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Nom</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{medecin.nom}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Adresse Email</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{medecin.email_professionnel || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Téléphone</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{medecin.telephone || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Sexe & Âge</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {medecin.sexe === 'M' ? 'Masculin' : medecin.sexe === 'F' ? 'Féminin' : 'Autre'} • {calculateAge(medecin.date_naissance)} ans
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Spécialité Principale</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg inline-block">
                {medecinService.obtenirNomSpecialite(medecin.specialite_principale_id)}
              </p>
            </div>
            {medecin.specialites_secondaires && medecin.specialites_secondaires.length > 0 && (
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Spécialités Secondaires</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {medecin.specialites_secondaires.map((spId, idx) => (
                    <span key={idx} className="bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-md">
                      {medecinService.obtenirNomSpecialite(spId)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">ID / Matricule</label>
              <div className="flex gap-2">
                <span className="inline-block bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-md">
                  ID #{medecin.numero_identification || 'N/A'}
                </span>
                <span className="inline-block bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-md">
                  MAT #{medecin.numero_matricule_professionnel || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-white/5 shrink-0">
            <button 
              onClick={() => onPrint(medecin)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
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