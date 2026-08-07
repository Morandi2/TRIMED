import React from 'react';
import { Medecin, medecinService, Specialite } from '../services/MedecinService';
import { Tooltip } from '../../GestionPatients/components/Tooltip';
import { formatDateFR } from '../../../../utils/dateUtils';

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
    return formatDateFR(dateString);
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
              Créé le
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {currentMedecins.map((medecin, index) => {
            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500'];
            const colorIndex = ((medecin?.nom || '').length + (medecin?.prenom || '').length) % colors.length;
            const avatarBg = colors[colorIndex];

            const rowKey = medecin.medecin_id || `user-${index}`;

            return (
              <tr key={rowKey} className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors duration-200">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {medecin.photo ? (
                        <img 
                          src={medecin.photo} 
                          alt={`Dr. ${medecin?.prenom || ''} ${medecin?.nom || ''}`}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm"
                        />
                      ) : (
                        <div className={`h-11 w-11 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-800`}>
                          {(medecin?.prenom || 'M').charAt(0)}{(medecin?.nom || 'D').charAt(0)}
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${medecin.statut === 'Actif' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Dr. {medecin?.prenom || ''} {medecin?.nom || ''}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        {medecin.numero_matricule_professionnel || 'Sans matricule'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    {medecin?.specialite_principale_nom || medecinService.obtenirNomSpecialite(medecin?.specialite_principale_id, specialites)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      {medecin.telephone || '—'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 italic">
                      <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      {medecin.email_professionnel || '—'}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 font-bold">
                  {(() => {
                    const createdDate = formatDate(medecin?.cree_le);
                    if (createdDate !== 'N/A') {
                      return createdDate;
                    }
                    return <span className="text-xs text-gray-400 italic font-normal">Non renseigné</span>;
                  })()}
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Tooltip text="Voir détails">
                      <button
                        onClick={() => medecin && onViewMedecin(medecin)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all active:scale-90"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </Tooltip>
                    <Tooltip text="Modifier">
                      <button
                        onClick={() => medecin && onEditMedecin(medecin)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 transition-all active:scale-90"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </Tooltip>
                    <Tooltip text="Supprimer">
                      <button
                        onClick={() => medecin && onDeleteMedecin(medecin)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all active:scale-90"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
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