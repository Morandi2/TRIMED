import React, { useState, useEffect } from 'react';
import { consultationService, Consultation } from './services/ConsultationService';
import { ConsultationModal } from './components/ConsultationModal';
import { ConsultationPrintPage } from './components/ConsultationPrintPage';
import { ConsultationStats } from './components/ConsultationStats';

interface GestionConsultationsProps {
  tenantId: number;
  hopitalNom?: string;
}

const GestionConsultations: React.FC<GestionConsultationsProps> = ({ tenantId, hopitalNom }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const init = async () => {
      await consultationService.loadCache(tenantId);
      await chargerConsultations();
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion des Consultations
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {hopitalNom || "Mon Hôpital"}
                </p>
              </div>
              <button
                onClick={handleNouvelleConsultation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Enregistrer une Consultation
              </button>
            </div>

            {/* Seksyon Estatistik */}
            <ConsultationStats consultations={consultations} />

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par patient, médecin ou motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredConsultations.length} consultation(s) trouvée(s)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.consultation_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {consultation.patient_nom || consultationService.obtenirNomPatient(consultation.patient_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {consultation.medecin_nom || consultationService.obtenirNomMedecin(consultation.medecin_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(consultation.date_consultation).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {consultation.motif}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVoirConsultation(consultation.consultation_id)}
                          className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20 transition-all duration-200"
                          title="Voir les détails"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleModifierConsultation(consultation.consultation_id)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200"
                          title="Modifier"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleSupprimerConsultation(consultation.consultation_id)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
                          title="Supprimer"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredConsultations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  Aucune consultation trouvée
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConsultation}
        consultationId={selectedConsultationId}
        tenantId={tenantId}
      />

      {/* Modal de visualisation */}
      {modalType === 'view' && selectedConsultation && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center animate-fadeIn">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails de la Consultation</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePrintConsultation(selectedConsultation)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimer
                  </button>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Patient:</label>
                    <p className="text-gray-900 dark:text-white">{selectedConsultation.patient_nom || consultationService.obtenirNomPatient(selectedConsultation.patient_id)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Médecin:</label>
                    <p className="text-gray-900 dark:text-white">{selectedConsultation.medecin_nom || consultationService.obtenirNomMedecin(selectedConsultation.medecin_id)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date et heure:</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedConsultation.date_consultation).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Motif:</label>
                  <p className="text-gray-900 dark:text-white">{selectedConsultation.motif}</p>
                </div>
                {selectedConsultation.diagnostic_principal && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Diagnostic principal:</label>
                    <p className="text-gray-900 dark:text-white">{selectedConsultation.diagnostic_principal}</p>
                  </div>
                )}
                {selectedConsultation.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes:</label>
                    <p className="text-gray-900 dark:text-white">{selectedConsultation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {modalType === 'delete' && selectedConsultation && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center animate-fadeIn">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmer la suppression</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès/erreur */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center animate-fadeIn">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full mr-3 ${
                  successModal.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {successModal.type === 'success' ? (
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{successModal.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{successModal.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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