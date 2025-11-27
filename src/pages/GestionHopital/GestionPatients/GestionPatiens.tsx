import React, { useState, useEffect } from "react";
import { Patient, patientService, Hopital, PatientFormData } from './services/PatientService';
import { PatientProgressForm } from './components/PatientProgressForm';
import { PatientTable } from './components/PatientTable';
import { PatientStats } from './components/PatientStats';
import { PatientViewModal } from './components/PatientViewModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Tooltip } from './components/Tooltip';
import { SuccessModal } from './components/SuccessModal';
import { PatientPrintPage } from './components/PatientPrintPage';


const hopitalCourant: Hopital = {
  tenant_id: 1,
  nom: "Hôpital Général de Port-au-Prince",
  adresse: "Port-au-Prince",
  telephone: "+509 28 11 22 33"
};

const GestionPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [showPrintPage, setShowPrintPage] = useState(false);
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);
  
  const patientsPerPage = 5;
  const hopitalId = hopitalCourant.tenant_id;

  useEffect(() => {
    console.log('Chargement des patients...');
    loadPatients();
  }, [hopitalId]);

  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalType]);

  const loadPatients = () => {
    const patientsData = patientService.obtenirPatientsParHopital(hopitalId);
    console.log('Patients chargés:', patientsData);
    setPatients(patientsData);
  };

  const handleCreatePatient = (formData: PatientFormData, isModifying: boolean) => {
    let result;
    
    if (isModifying && selectedPatient) {
      result = patientService.modifierPatientComplet(selectedPatient.patient_id, formData);
    } else {
      result = patientService.creerPatientComplet(formData, hopitalId);
    }
    
    if (result.success) {
      console.log(isModifying ? 'Patient modifié avec succès' : 'Patient créé avec succès');
      loadPatients();
      setModalType(null);
      setSelectedPatient(null);
      setFormErrors([]);
      
      // Afficher modal de succès
      setSuccessModal({
        isOpen: true,
        title: 'Opération réussie',
        message: isModifying ? 'Le patient a été modifié avec succès.' : 'Le patient a été enregistré avec succès.',
        type: 'success'
      });
    } else {
      console.error('Erreurs lors de l\'opération:', result.errors);
      setFormErrors(result.errors || ["Erreur lors de l'opération"]);
      
      // Afficher modal d'erreur
      setSuccessModal({
        isOpen: true,
        title: 'Erreur',
        message: result.errors?.[0] || "Une erreur s'est produite lors de l'opération.",
        type: 'error'
      });
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

  const handleDeleteConfirm = () => {
    if (selectedPatient) {
      const success = patientService.supprimerPatient(selectedPatient.patient_id);
      if (success) {
        loadPatients();
        setSuccessModal({
          isOpen: true,
          title: 'Suppression réussie',
          message: 'Le patient a été supprimé avec succès.',
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (modalType) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [modalType]);

  const filteredPatients = patients.filter(patient =>
    `${patient.nom} ${patient.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.numero_dossier_medical.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telephone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const _totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Patients - {hopitalCourant.nom}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les dossiers patients de votre hôpital
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Ajouter un nouveau patient" position="bottom">
              <button 
                onClick={handleAddPatient}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3.33331V12.6666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33301 8H12.6663"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Nouveau Patient
              </button>
            </Tooltip>
          </div>
        </div>



        {/* Seksyon Estatistik */}
        <PatientStats patients={patients} />

        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, numéro dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-theme-sm text-gray-800 placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <PatientTable
          patients={filteredPatients}
          currentPage={currentPage}
          patientsPerPage={patientsPerPage}
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeleteClick}
        />

        {_totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, _totalPages))}
                disabled={currentPage === _totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Affichage de <span className="font-medium">{(currentPage - 1) * patientsPerPage + 1}</span> à <span className="font-medium">
                    {Math.min(currentPage * patientsPerPage, filteredPatients.length)}
                  </span> sur <span className="font-medium">{filteredPatients.length}</span> patients
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:text-gray-400 dark:ring-gray-600 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: _totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, _totalPages))}
                    disabled={currentPage === _totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:text-gray-400 dark:ring-gray-600 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Suivant</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5-4.25a.75.75 0 010 1.08l4.5-4.25a.75.75 0 011.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType === "add" || modalType === "edit" ? (
        <PatientProgressForm
          hopitalId={hopitalId}
          onSave={handleCreatePatient}
          onClose={closeModal}
          patientId={modalType === "edit" && selectedPatient ? selectedPatient.patient_id : undefined}
        />
      ) : modalType === "delete" ? (
        <DeleteConfirmationModal
          patient={selectedPatient}
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      ) : modalType === "view" ? (
        <PatientViewModal
          patient={selectedPatient}
          onClose={closeModal}
          hopitalNom={hopitalCourant.nom}
          onPrint={handlePrintPatient}
        />
      ) : null}
      
      {/* Page d'impression */}
      {showPrintPage && printPatient && (
        <PatientPrintPage
          patientComplet={patientService.obtenirPatientComplet(printPatient.patient_id)}
          hopitalNom={hopitalCourant.nom}
          onClose={() => {
            setShowPrintPage(false);
            setPrintPatient(null);
          }}
        />
      )}
      
      {/* Modal de succès/erreur */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type}
      />
    </div>
  );
};

export default GestionPatients;