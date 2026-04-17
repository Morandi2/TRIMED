import React, { useState, useEffect } from "react";
import { Patient, patientService, PatientFormData } from './services/PatientService';
import { useUser } from '../../../context/UserContext';
import { PatientProgressForm } from './components/PatientProgressForm';
import { PatientTable } from './components/PatientTable';
import { PatientStats } from './components/PatientStats';
import { PatientViewModal } from './components/PatientViewModal';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { PatientPrintPage } from './components/PatientPrintPage';
import { 
  Users, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Users2,
  FileText,
  BadgeCheck
} from 'lucide-react';

interface GestionPatientsProps {
  tenantId: number;
  hopitalNom?: string;
}

const GestionPatients: React.FC<GestionPatientsProps> = ({ tenantId, hopitalNom }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [showPrintPage, setShowPrintPage] = useState(false);
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const patientsPerPage = 8; // Increased for premium feel
  const hopitalId = tenantId;

  useEffect(() => {
    loadPatients();
  }, [hopitalId]);

  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [modalType]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const patientsData = await patientService.obtenirPatientsParHopital(hopitalId);
      setPatients(patientsData);
    } catch (e) {
      console.error('[GestionPatients] Erreur chargement:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setSuccessModal({ isOpen: true, title, message, type });
  };

  const handleCreatePatient = async (formData: PatientFormData, isModifying: boolean) => {
    if (successModal.isOpen) return;
    let result;
    if (isModifying && selectedPatient) {
      result = await patientService.modifierPatientComplet(selectedPatient.patient_id, formData);
    } else {
      result = await patientService.creerPatientComplet(formData, hopitalId);
    }
    
    if (result.success) {
      await loadPatients();
      setModalType(null);
      setSelectedPatient(null);
      setFormErrors([]);
      showSuccessMessage(
        'Opération réussie', 
        isModifying ? 'Le patient a été modifié avec succès.' : 'Le patient a été enregistré avec succès.'
      );
    } else {
      setFormErrors(result.errors || ["Erreur lors de l'opération"]);
      showSuccessMessage('Erreur de validation', result.errors?.join(', ') || "Une erreur s'est produite.", 'error');
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType("edit");
    setFormErrors([]);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType("view");
  };

  const handlePrintPatient = (patient: Patient) => {
    setPrintPatient(patient);
    setShowPrintPage(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType("delete");
  };

  const handleDeleteConfirm = async () => {
    if (selectedPatient) {
      const success = await patientService.supprimerPatient(selectedPatient.patient_id);
      if (success) {
        await loadPatients();
        showSuccessMessage('Suppression réussie', 'Le patient a été supprimé avec succès.');
      } else {
        showSuccessMessage('Erreur', 'Une erreur s\'est produite.', 'error');
      }
      setModalType(null);
      setSelectedPatient(null);
    }
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setModalType("add");
    setFormErrors([]);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPatient(null);
    setFormErrors([]);
  };

  const filteredPatients = (Array.isArray(patients) ? patients : []).filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${patient?.nom || ''} ${patient?.prenom || ''}`.toLowerCase();
    return fullName.includes(searchLower) ||
      (patient?.numero_dossier_medical || "").toLowerCase().includes(searchLower) ||
      (patient?.telephone || "").toLowerCase().includes(searchLower);
  });

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const currentPatients = filteredPatients.slice((currentPage - 1) * patientsPerPage, currentPage * patientsPerPage);

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium Glassmorphism */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight">
                Gestion des Patients
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || "Portail Hospitalier"}</span>
            </p>
          </div>

          {useUser().permissions.canEditPatients && (
            <button
              onClick={handleAddPatient}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-600/20"
            >
              <Plus className="h-5 w-5" />
              Ajouter Patient
            </button>
          )}
        </div>
      </div>

      <PatientStats patients={patients} />

      {/* Main Container */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par nom, dossier ou téléphone..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <Users2 className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  {filteredPatients.length} DOSSIERS
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <PatientTable
              patients={currentPatients}
              currentPage={currentPage}
              patientsPerPage={patientsPerPage}
              onViewPatient={handleViewPatient}
              onEditPatient={handleEditPatient}
              onDeletePatient={handleDeleteClick}
            />
          )}
        </div>

        {/* Pagination Premium */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
              Affichage de {currentPatients.length} sur {filteredPatients.length} patients
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        currentPage === pageNum 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                          : 'bg-white dark:bg-white/5 text-gray-400 hover:text-indigo-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl border border-white/10">
            <PatientProgressForm
              hopitalId={hopitalId}
              onSave={handleCreatePatient}
              onClose={closeModal}
              patientId={modalType === "edit" && selectedPatient ? selectedPatient.patient_id : undefined}
            />
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={modalType === 'delete' && !!selectedPatient}
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
        title="Supprimer le patient"
        entityName={selectedPatient ? `${selectedPatient.prenom} ${selectedPatient.nom}` : undefined}
        entityId={selectedPatient?.patient_id}
      />

      {modalType === "view" && selectedPatient && (
        <PatientViewModal
          patient={selectedPatient}
          onClose={closeModal}
          onPrint={handlePrintPatient}
        />
      )}

      {showPrintPage && printPatient && (
        <PatientPrintPage
          patientComplet={patientService.obtenirPatientComplet(printPatient.patient_id)}
          hopitalNom={hopitalNom || ""}
          onClose={() => { setShowPrintPage(false); setPrintPatient(null); }}
        />
      )}
      
      <NotificationToast
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        message={successModal.message}
        type={successModal.type === 'error' ? 'error' : 'success'}
      />
    </div>
  );
};

export default GestionPatients;