import React, { useState, useEffect } from 'react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { consultationService, Consultation } from './services/ConsultationService';
import { ConsultationModal } from './components/ConsultationModal';
import { ConsultationPrintPage } from './components/ConsultationPrintPage';
import { ConsultationStats } from './components/ConsultationStats';
import { formatDateTimeFR } from '../../../utils/dateUtils';
import Badge from '../../../components/ui/badge/Badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  Pencil, 
  Trash, 
  Printer, 
  X, 
  AlertTriangle, 
  CheckCircle,
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';

interface GestionConsultationsProps {
  tenantId: number;
  hopitalNom?: string;
}

const GestionConsultations: React.FC<GestionConsultationsProps> = ({ tenantId, hopitalNom }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await consultationService.loadCache(tenantId);
        await chargerConsultations();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [tenantId]);

  const chargerConsultations = async () => {
    const consultationsData = await consultationService.obtenirConsultationsParTenant(tenantId);
    setConsultations(consultationsData);
  };

  const handleNouvelleConsultation = () => {
    setSelectedConsultationId(undefined);
    setIsModalOpen(true);
  };

  const handleModifierConsultation = (consultationId: number) => {
    setSelectedConsultationId(consultationId);
    setIsModalOpen(true);
  };

  const [modalType, setModalType] = useState<'view' | 'delete' | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [showPrintPage, setShowPrintPage] = useState(false);
  const [printConsultation, setPrintConsultation] = useState<Consultation | null>(null);

  const handleVoirConsultation = async (consultationId: number) => {
    const consultation = await consultationService.obtenirConsultation(consultationId);
    if (consultation) {
      setSelectedConsultation(consultation);
      setModalType('view');
    }
  };

  const handleSupprimerConsultation = async (consultationId: number) => {
    const consultation = await consultationService.obtenirConsultation(consultationId);
    if (consultation) {
      setSelectedConsultation(consultation);
      setModalType('delete');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedConsultation) {
      const success = await consultationService.supprimerConsultation(selectedConsultation.consultation_id);
      if (success) {
        await chargerConsultations();
        setSuccessModal({
          isOpen: true,
          title: 'Suppression réussie',
          message: 'La consultation a été supprimée avec succès.',
          type: 'success'
        });
      } else {
        setSuccessModal({
          isOpen: true,
          title: 'Erreur',
          message: 'Une erreur s\'est produite lors de la suppression.',
          type: 'error'
        });
      }
      setModalType(null);
      setSelectedConsultation(null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedConsultation(null);
  };

  const handlePrintConsultation = (consultation: Consultation) => {
    setPrintConsultation(consultation);
    setShowPrintPage(true);
  };

  const handleSaveConsultation = async () => {
    await chargerConsultations();
    setSuccessModal({
      isOpen: true,
      title: 'Opération réussie',
      message: 'La consultation a été sauvegardée avec succès.',
      type: 'success'
    });
  };

  const filteredConsultations = consultations.filter(consultation => {
    const patientName = consultation.patient_nom || consultationService.obtenirNomPatient(consultation.patient_id);
    const medecinName = consultation.medecin_nom || consultationService.obtenirNomMedecin(consultation.medecin_id);
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.motif.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Consultations
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || "Hôpital Santé Plus"}</span>
            </p>
          </div>

          <button 
            onClick={handleNouvelleConsultation}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Ajouter Consultation
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <ConsultationStats consultations={consultations} />

      {/* Glass Container for Table & Filters */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un dossier, médecin ou symptôme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all dark:text-white font-medium placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 bg-gray-100/50 dark:bg-white/5 px-5 py-3 rounded-xl uppercase tracking-widest border border-gray-100 dark:border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
              {filteredConsultations.length} RÉSULTATS
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Bénéficiaire</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Praticien Responsable</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Session Temporelle</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Motif / Diagnostic</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {isLoading ? (
                <tr>
                  <td colSpan={5}>
                    <TableSkeleton rows={5} columns={4} />
                  </td>
                </tr>
              ) : filteredConsultations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-4">
                        <FileText className="w-10 h-10 text-gray-300" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aucune session trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredConsultations.map((consultation) => {
                  const patientName = consultation.patient_nom || consultationService.obtenirNomPatient(consultation.patient_id);
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];
                  const avatarColor = colors[patientName.length % colors.length];

                  return (
                    <tr key={consultation.consultation_id} className="hover:bg-white/60 dark:hover:bg-white/[0.03] transition-all duration-200 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-black text-sm shadow-lg ring-4 ring-white/50 dark:ring-transparent transition-transform group-hover:scale-110`}>
                            {patientName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                              {patientName}
                            </span>
                            <span className="text-[10px] font-bold text-blue-500 uppercase">Consultation #{consultation.consultation_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                            Dr. {consultation.medecin_nom || consultationService.obtenirNomMedecin(consultation.medecin_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100">
                            {consultation.date_consultation ? new Date(consultation.date_consultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter italic">
                            {consultation.date_consultation ? new Date(consultation.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <Badge 
                            color={
                              consultation.motif?.toLowerCase().includes('urgence') ? 'error' : 
                              consultation.motif?.toLowerCase().includes('suivi') ? 'info' : 
                              'primary'
                            }
                            size="sm"
                            className="w-fit font-black uppercase tracking-widest text-[9px] py-1 px-3 rounded-lg"
                          >
                            {consultation.motif}
                          </Badge>
                          {consultation.diagnostic_principal && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px] italic font-medium">
                              {consultation.diagnostic_principal}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2 transition-all duration-300">
                          <button 
                            onClick={() => handleVoirConsultation(consultation.consultation_id)}
                            className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleModifierConsultation(consultation.consultation_id)}
                            className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white transition-all active:scale-90"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleSupprimerConsultation(consultation.consultation_id)}
                            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all active:scale-90"
                            title="Supprimer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConsultation}
        consultationId={selectedConsultationId}
        tenantId={tenantId}
      />

      {/* Modern Visualisation Modal */}
      {modalType === 'view' && selectedConsultation && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Détails de la Session</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Consultation #{selectedConsultation.consultation_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrintConsultation(selectedConsultation)}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={closeModal} className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Patient</label>
                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                      {selectedConsultation.patient_nom || consultationService.obtenirNomPatient(selectedConsultation.patient_id)}
                    </p>
                  </div>
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Praticien</label>
                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                      {selectedConsultation.medecin_nom || consultationService.obtenirNomMedecin(selectedConsultation.medecin_id)}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date & Heure</label>
                      <p className="font-black text-gray-900 dark:text-white">
                        {formatDateTimeFR(selectedConsultation.date_consultation)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500 opacity-20" />
                  </div>
                  <div className="p-6 rounded-3xl bg-blue-600 shadow-xl shadow-blue-600/20">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Motif Principal</label>
                    <p className="font-black text-white text-lg tracking-tight">
                      {selectedConsultation.motif}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {selectedConsultation.diagnostic_principal && (
                  <div className="p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Diagnostic Principal</label>
                    <p className="text-gray-900 dark:text-white font-medium leading-relaxed italic">
                    "{selectedConsultation.diagnostic_principal}"
                    </p>
                  </div>
                )}
                {selectedConsultation.notes && (
                  <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                    <label className="text-[10px] font-black text-amber-600/60 dark:text-amber-400/60 uppercase tracking-widest block mb-2">Notes & Observations</label>
                    <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap leading-relaxed">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirm Delete Modal */}
      <DeleteConfirmModal
        isOpen={modalType === 'delete' && !!selectedConsultation}
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
        title="Supprimer la consultation"
        entityId={selectedConsultation?.consultation_id}
        message={`Êtes-vous sûr de vouloir supprimer la consultation #${selectedConsultation?.consultation_id} ? Cette action effacera définitivement les données.`}
      />

      {/* Stylish Success/Error Notification */}
      <NotificationToast
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        message={successModal.message}
        type={successModal.type === 'error' ? 'error' : 'success'}
      />

      {/* Page d'impression */}
      {showPrintPage && printConsultation && (
        <ConsultationPrintPage
          consultation={printConsultation}
          hopitalNom={hopitalNom || ""}
          onClose={() => {
            setShowPrintPage(false);
            setPrintConsultation(null);
          }}
        />
      )}
    </div>
  );
};

export default GestionConsultations;