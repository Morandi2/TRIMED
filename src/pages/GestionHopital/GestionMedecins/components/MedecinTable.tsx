import React from 'react';
import { Medecin, medecinService, Specialite } from '../services/MedecinService';
import { Tooltip } from '../../GestionPatients/components/Tooltip';

interface MedecinTableProps {
  medecins: Medecin[];
  currentPage: number;
  medecinsPerPage: number;
  onViewMedecin: (medecin: Medecin) => void;
  onEditMedecin: (medecin: Medecin) => void;
  onDeleteMedecin: (medecin: Medecin) => void;
  specialites: Specialite[];
}

export const MedecinTable: React.FC<MedecinTableProps> = ({
  medecins,
  currentPage,
  medecinsPerPage,
  onViewMedecin,
  onEditMedecin,
  onDeleteMedecin,
  specialites
}) => {
  const safeMedecins = Array.isArray(medecins) ? medecins : [];
  const startIndex = (currentPage - 1) * medecinsPerPage;
  const endIndex = startIndex + medecinsPerPage;
  const currentMedecins = safeMedecins.slice(startIndex, endIndex);

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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Médecin
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Spécialité
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Âge
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {currentMedecins.map((medecin) => (
            <tr key={medecin.medecin_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {medecin.photo ? (
                      <img 
                        src={medecin.photo} 
                        alt={`Dr. ${medecin.prenom} ${medecin.nom}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {medecin.prenom.charAt(0)}{medecin.nom.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Dr. {medecin.prenom} {medecin.nom}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {medecin.numero_matricule_professionnel || 'Matricule non défini'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {medecinService.obtenirNomSpecialite(medecin.specialite_principale_id, specialites)}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-900 dark:text-white">
                  {medecin.telephone || 'Non spécifié'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {medecin.email_professionnel || 'Email non spécifié'}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-900 dark:text-white font-medium">
                  {medecin.date_naissance ? `${calculateAge(medecin.date_naissance)} ans` : 'Âge inconnu'}
                </div>
                {medecin.date_naissance && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(medecin.date_naissance)}
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Tooltip text="Voir les détails">
                    <button
                      onClick={() => onViewMedecin(medecin)}
                      className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Modifier">
                    <button
                      onClick={() => onEditMedecin(medecin)}
                      className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Supprimer">
                    <button
                      onClick={() => onDeleteMedecin(medecin)}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {currentMedecins.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Aucun médecin trouvé</p>
        </div>
      )}
    </div>
  );
};