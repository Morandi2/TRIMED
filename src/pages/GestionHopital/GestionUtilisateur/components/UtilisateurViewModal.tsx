import { Utilisateur, UtilisateurRole, UtilisateurStatut } from '../types/UtilisateurTypes';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';

interface UtilisateurViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  utilisateur: Utilisateur | null;
  roles: UtilisateurRole[];
  statuts: UtilisateurStatut[];
}

export const UtilisateurViewModal: React.FC<UtilisateurViewModalProps> = ({
  isOpen,
  onClose,
  utilisateur,
  roles,
  statuts
}) => {
  const { user } = useAuth();
  const { tenantConfig } = useTenant();
  const hospitalName = utilisateur?.hopital_nom || tenantConfig?.nom || user?.hopital_nom || 'TRIMEDH';

  if (!isOpen || !utilisateur) return null;

  const role = roles.find(r => r.role_id === utilisateur.role_id)?.nom || 'Inconnu';
  const statut = statuts.find(s => s.statut_id === utilisateur.statut_id)?.nom || 'Inconnu';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm print:bg-white print:p-0">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 print-content print:max-w-none print:rounded-none print:shadow-none">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="absolute top-4 left-6">
            <h2 className="text-white/90 text-sm font-bold uppercase tracking-widest drop-shadow-sm">
              {hospitalName}
            </h2>
          </div>
          
          <div className="absolute -bottom-10 left-6 flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-700 shadow-xl flex items-center justify-center border-4 border-white dark:border-gray-800">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(utilisateur.prenom?.[0] || '').toUpperCase()}{(utilisateur.nom?.[0] || '').toUpperCase()}
              </span>
            </div>
            <div className="pb-2">
              <h3 className="text-xl font-bold text-white mb-1">
                {utilisateur.prenom} {utilisateur.nom}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  utilisateur.statut_id === 1 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                }`}>
                  {statut}
                </span>
                <span className="text-white/70 text-sm font-medium">{role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">
                Prénom
              </label>
              <p className="text-gray-900 dark:text-white font-semibold text-lg">
                {utilisateur.prenom || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">
                Nom
              </label>
              <p className="text-gray-900 dark:text-white font-semibold text-lg">
                {utilisateur.nom || 'N/A'}
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">
                Adresse Email
              </label>
              <p className="text-gray-900 dark:text-white font-semibold text-lg select-all">
                {utilisateur.email}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">
                Téléphone
              </label>
              <p className="text-gray-900 dark:text-white font-semibold">
                {utilisateur.telephone || 'Non renseigné'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">
                Date d'inscription
              </label>
              <p className="text-gray-900 dark:text-white font-semibold">
                {new Date(utilisateur.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 opacity-80">
                ID Utilisateur
              </label>
              <p className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-sm font-bold">
                #{utilisateur.utilisateur_id}
              </p>
            </div>
          </div>

          {/* Footer d'impression */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500 hidden print:block">
            <p className="font-bold text-gray-700 mb-1">{hospitalName}</p>
            <p>Ce document est généré par le système TRIMEDH et est strictement confidentiel.</p>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Imprimer
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-all"
            >
              Fermer
            </button>
          </div>
          
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-content, .print-content * {
                visibility: visible;
              }
              .print-content {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 40px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
              }
              .print-content .bg-gradient-to-r {
                background: ${tenantConfig?.couleur_principale || '#2563eb'} !important;
                -webkit-print-color-adjust: exact;
              }
              .print-content * {
                color: black !important;
              }
              .print-content h3, .print-content .text-white, .print-content .text-white\\/90, .print-content .text-white\\/70 {
                color: white !important;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};
