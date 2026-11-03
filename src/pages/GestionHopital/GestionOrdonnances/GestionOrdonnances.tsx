import React, { useState, useEffect, useRef } from 'react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { getApiErrorMessage, isCanceledError } from '../../../utils/apiErrorHandler';
import { ordonnanceService, Ordonnance } from './services/OrdonnanceService';
import { OrdonnanceModal } from './components/OrdonnanceModal';
import { OrdonnancePrintPage } from './components/OrdonnancePrintPage';
import { OrdonnanceStats } from './components/OrdonnanceStats';
import { formatDateTimeFR } from '../../../utils/dateUtils';
import Badge from '../../../components/ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useRechercheUrl } from "../../../hooks/useRechercheUrl";
import { 
  FileText, 
  Plus, 
  Search,
  Pencil,
  Trash,
  Printer,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Stethoscope,
  X
} from 'lucide-react';

interface GestionOrdonnancesProps {
  tenantId: number;
  hopitalNom?: string;
}

const GestionOrdonnances: React.FC<GestionOrdonnancesProps> = ({ tenantId, hopitalNom }) => {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrdonnanceId, setSelectedOrdonnanceId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  useRechercheUrl(setSearchTerm);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modalType, setModalType] = useState<'view' | 'delete' | null>(null);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPrintPage, setShowPrintPage] = useState(false);
  const [printOrdonnance, setPrintOrdonnance] = useState<Ordonnance | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const init = async () => {
      setIsLoading(true);
      try {
        await ordonnanceService.loadMetadata(tenantId);
        await chargerOrdonnances(controller.signal);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    init();
    return () => controller.abort();
  }, [tenantId]);

  const chargerOrdonnances = async (signal?: AbortSignal) => {
    try {
      const ordonnancesData = await ordonnanceService.obtenirOrdonnancesParTenant(tenantId, signal);
      if (signal?.aborted) return;
      setOrdonnances(ordonnancesData);
    } catch (e) {
      if (signal?.aborted || isCanceledError(e)) return;
      setSuccessMessage(`Erreur : ${getApiErrorMessage(e)}`);
      setShowSuccessModal(true);
    }
  };

  const handleNouvelleOrdonnance = () => {
    setSelectedOrdonnanceId(undefined);
    setIsModalOpen(true);
  };

  const handleModifierOrdonnance = (ordonnanceId: number) => {
    setSelectedOrdonnanceId(ordonnanceId);
    setIsModalOpen(true);
  };

  const handleVoirOrdonnance = async (ordonnanceId: number) => {
    const ordonnance = await ordonnanceService.obtenirOrdonnance(ordonnanceId);
    if (ordonnance) {
      setSelectedOrdonnance(ordonnance);
      setModalType('view');
    }
  };

  const handleSupprimerOrdonnance = async (ordonnanceId: number) => {
    const ordonnance = await ordonnanceService.obtenirOrdonnance(ordonnanceId);
    if (ordonnance) {
      setSelectedOrdonnance(ordonnance);
      setModalType('delete');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedOrdonnance) {
      const success = await ordonnanceService.supprimerOrdonnance(selectedOrdonnance.ordonnance_id);
      if (success) {
        await chargerOrdonnances();
        showSuccess('L\'ordonnance a été supprimée avec succès.');
      } else {
        showSuccess('Une erreur s\'est produite lors de la suppression.', true);
      }
      setModalType(null);
      setSelectedOrdonnance(null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedOrdonnance(null);
  };

  const handlePrintOrdonnance = async (ordonnance: Ordonnance) => {
    // La liste ne contient ni le patient ni les médicaments : on imprime le détail complet.
    const complete = await ordonnanceService.obtenirOrdonnance(ordonnance.ordonnance_id).catch(() => null);
    setPrintOrdonnance(complete ?? ordonnance);
    setShowPrintPage(true);
  };

  const handleSaveOrdonnance = async () => {
    await chargerOrdonnances();
    showSuccess('L\'ordonnance a été sauvegardée avec succès.');
    setIsModalOpen(false);
  };

  const showSuccess = (message: string, isError: boolean = false) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const filteredOrdonnances = ordonnances.filter(ordonnance => {
    const s = searchTerm.toLowerCase();
    const patientNm = (ordonnance.patient_nom || ordonnanceService.obtenirNomPatient(ordonnance.patient_id)).toLowerCase();
    const medecinNm = (ordonnance.medecin_nom || ordonnanceService.obtenirNomMedecin(ordonnance.medecin_id)).toLowerCase();
    const validite = (ordonnance.validite || '').toLowerCase();
    
    return patientNm.includes(s) || medecinNm.includes(s) || validite.includes(s);
  });

  const totalPages = Math.ceil(filteredOrdonnances.length / itemsPerPage);
  const currentOrdonnances = filteredOrdonnances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Le serveur ne renvoie pas le patient dans la liste : on complète les lignes affichées avec leur détail.
  const detailsDemandes = useRef(new Set<number>());
  useEffect(() => {
    const manquants = currentOrdonnances.filter((o) => !o.patient_nom && !detailsDemandes.current.has(o.ordonnance_id));
    if (!manquants.length) return;
    manquants.forEach((o) => detailsDemandes.current.add(o.ordonnance_id));
    Promise.all(manquants.map((o) => ordonnanceService.obtenirOrdonnance(o.ordonnance_id).catch(() => null))).then((details) => {
      const parId = new Map(details.filter((d): d is Ordonnance => !!d).map((d) => [d.ordonnance_id, d]));
      if (parId.size) setOrdonnances((liste) => liste.map((o) => parId.get(o.ordonnance_id) ?? o));
    });
  }, [currentOrdonnances]);

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium Glassmorphism */}
      <div className="relative p-6 sm:p-7 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-trimed-brume overflow-hidden text-gray-900 dark:border-gray-800 dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900 dark:text-white">
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-600 rounded-xl shadow-lg shadow-brand-600/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-marque text-xl sm:text-2xl">
                Gestion Ordonnances
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              {hopitalNom || "Votre hôpital"}
            </p>
          </div>

          <button
            onClick={handleNouvelleOrdonnance}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Ajouter Ordonnance
          </button>
        </div>
      </div>

      <OrdonnanceStats ordonnances={ordonnances} />

      {/* Main Content Container */}
      <div className="rounded-3xl bg-white dark:bg-white/[0.02] border border-white/20 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par patient, médecin ou validité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium text-black dark:text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-2xl">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                {filteredOrdonnances.length} PRESCRIPTIONS
              </span>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Patient & Médecin</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Date & Validité</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {currentOrdonnances.map((ordonnance) => (
                <TableRow key={ordonnance.ordonnance_id} className="group hover:bg-white dark:hover:bg-white/[0.03] transition-all">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm border border-brand-100 dark:border-brand-900/30 transition-transform group-hover:scale-110">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase tracking-tight text-gray-900 dark:text-white">
                          {ordonnance.patient_nom || ordonnanceService.obtenirNomPatient(ordonnance.patient_id)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 italic">
                          <Stethoscope className="w-3 h-3" />
                          <span>Dr. {ordonnance.medecin_nom || ordonnanceService.obtenirNomMedecin(ordonnance.medecin_id).replace(/^Dr. /, '')}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-5 px-6 font-medium">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-bold italic text-gray-800 dark:text-gray-200">{formatDateTimeFR(ordonnance.date_ordonnance)}</span>
                      </div>
                      <Badge 
                        color={ordonnance.validite?.toLowerCase().includes('expire') ? 'error' : 'success'}
                        size="sm"
                        variant="light"
                        className="w-fit"
                      >
                        {ordonnance.validite}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-2 transition-all duration-300">
                      <button 
                        onClick={() => handleVoirOrdonnance(ordonnance.ordonnance_id)}
                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        title="Détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handlePrintOrdonnance(ordonnance)}
                        className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        title="Imprimer"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleModifierOrdonnance(ordonnance.ordonnance_id)}
                        className="p-2.5 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleSupprimerOrdonnance(ordonnance.ordonnance_id)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                        title="Supprimer"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrdonnances.length === 0 && !isLoading && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-inner mb-4">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Aucune ordonnance</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium italic">Essayez de changer vos critères de recherche.</p>
            </div>
          )}

          {isLoading && (
            <TableSkeleton rows={5} columns={3} />
          )}
        </div>

        {/* Pagination Premium */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
              Affichage de {currentOrdonnances.length} sur {filteredOrdonnances.length} ordonnances
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm text-black dark:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-600/20">
                {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm text-black dark:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <OrdonnanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrdonnance}
        ordonnanceId={selectedOrdonnanceId}
        tenantId={tenantId}
      />

      {/* Modal de visualisation Premium */}
      {modalType === 'view' && selectedOrdonnance && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
            <div className="p-8 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500 rounded-xl shadow-lg shadow-green-500/20">
                     <Eye className="h-5 w-5 text-white" />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight text-left">Détails de l'Ordonnance</h2>
                </div>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left">
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">Patient</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedOrdonnance.patient_nom || ordonnanceService.obtenirNomPatient(selectedOrdonnance.patient_id)}
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">Médecin Prescripteur</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedOrdonnance.medecin_nom || ordonnanceService.obtenirNomMedecin(selectedOrdonnance.medecin_id)}
                  </p>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 border-l-4 border-brand-600 pl-3">Contenu de l'ordonnance</h4>
                  {selectedOrdonnance.prescriptions && selectedOrdonnance.prescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrdonnance.prescriptions.map((p, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div className="flex justify-between mb-1">
                            <p className="font-bold text-gray-900 dark:text-white">{p.medicament}</p>
                            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 rounded-lg">{p.dosage}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">{p.duree}, {p.instructions}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">Aucune prescription listée.</p>
                  )}
                </div>

                {selectedOrdonnance.recommandations && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-2 border-l-4 border-amber-500 pl-3">Recommandations</h4>
                    <div className="p-6 rounded-3xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {selectedOrdonnance.recommandations}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirm Delete Modal */}
      <DeleteConfirmModal
        isOpen={modalType === 'delete' && !!selectedOrdonnance}
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
        title="Supprimer l'ordonnance"
        message="Cette action est irréversible. Toutes les données liées à cette prescription seront effacées."
      />

      {/* Stylish Success Notification */}
      <NotificationToast
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        type={successMessage.toLowerCase().includes('erreur') ? 'error' : 'success'}
      />

      {/* Page d'impression */}
      {showPrintPage && printOrdonnance && (
        <OrdonnancePrintPage
          ordonnance={printOrdonnance}
          hopitalNom={hopitalNom || ""}
          onClose={() => {
            setShowPrintPage(false);
            setPrintOrdonnance(null);
          }}
        />
      )}
    </div>
  );
};

export default GestionOrdonnances;