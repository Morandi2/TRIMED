import React, { useState, useEffect } from 'react';
import { consultationService, ConsultationFormData } from '../services/ConsultationService';
import { SearchableSelect } from './SearchableSelect';

interface ConsultationProgressFormProps {
  tenantId: number;
  onSave: (formData: ConsultationFormData, isModifying: boolean) => void;
  onClose: () => void;
  consultationId?: number;
}

export const ConsultationProgressForm: React.FC<ConsultationProgressFormProps> = ({
  tenantId,
  onSave,
  onClose,
  consultationId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ConsultationFormData>({
    consultation: {
      patient_id: 0,
      medecin_id: 0,
      rendez_vous_id: undefined,
      date_consultation: '',
      motif: '',
      diagnostic_principal: '',
      notes: ''
    }
  });

  const [isModifying, setIsModifying] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedMedecinName, setSelectedMedecinName] = useState('');
  const [selectedSalleName, setSelectedSalleName] = useState('');
  const [dateError, setDateError] = useState('');

  // Obtenir la date/heure actuelle au format datetime-local
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const loadConsultationData = async () => {
      if (consultationId) {
        setIsModifying(true);
        const consultation = await consultationService.obtenirConsultation(consultationId);
        if (consultation) {
          setFormData({
            consultation: {
              patient_id: consultation.patient_id,
              medecin_id: consultation.medecin_id,
              rendez_vous_id: consultation.rendez_vous_id,
              date_consultation: consultation.date_consultation.replace('T', 'T').slice(0, 16),
              motif: consultation.motif,
              diagnostic_principal: consultation.diagnostic_principal || '',
              notes: consultation.notes || ''
            }
          });
          setSelectedPatientName(consultationService.obtenirNomPatient(consultation.patient_id));
          setSelectedMedecinName(consultationService.obtenirNomMedecin(consultation.medecin_id));
        }
      } else {
        setIsModifying(false);
      }
    };
    
    loadConsultationData();
  }, [consultationId]);

  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConsultationField = (field: string, value: any) => {
    if (field === 'date_consultation') {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      
      if (selectedDate < currentDate) {
        setDateError('La date de consultation ne peut pas être dans le passé');
        return;
      } else {
        setDateError('');
      }
    }
    
    setFormData(prev => ({
      consultation: { ...prev.consultation, [field]: value }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.consultation.patient_id && formData.consultation.medecin_id && selectedSalleName);
      case 2:
        return !!(formData.consultation.date_consultation && formData.consultation.motif && !dateError);
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2) && !dateError) {
      onSave(formData, isModifying);
    }
  };

  const handlePatientChange = (patientName: string, patientId?: number) => {
    setSelectedPatientName(patientName);
    if (patientId) {
      updateConsultationField('patient_id', patientId);
    }
  };

  const handleMedecinChange = (medecinName: string, medecinId?: number) => {
    setSelectedMedecinName(medecinName);
    if (medecinId) {
      updateConsultationField('medecin_id', medecinId);
    }
  };

  const handleSalleChange = (salleName: string) => {
    setSelectedSalleName(salleName);
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map(step => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            className={`flex flex-col items-center transition-all duration-200 ${
              step <= currentStep 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                step <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}
            >
              {step}
            </div>
            <span className="text-xs mt-1 font-medium">
              {step === 1 && 'Participants'}
              {step === 2 && 'Consultation'}
              {step === 3 && 'Diagnostic'}
            </span>
          </button>
        ))}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="w-full h-[90vh] flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isModifying ? 'Modifier la Consultation' : 'Enregistrer une Consultation'} - Étape {currentStep}/{totalSteps}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <ProgressBar />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Participants à la Consultation</h3>
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SearchableSelect
                      value={selectedPatientName}
                      onChange={handlePatientChange}
                      required={true}
                      type="patient"
                      placeholder="Rechercher un patient..."
                    />

                    <SearchableSelect
                      value={selectedMedecinName}
                      onChange={handleMedecinChange}
                      required={true}
                      type="medecin"
                      placeholder="Rechercher un médecin..."
                    />

                    <SearchableSelect
                      value={selectedSalleName}
                      onChange={handleSalleChange}
                      required={true}
                      type="salle"
                      placeholder="Sélectionner une salle..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-6">Informations de Consultation</h3>
                
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date et heure de consultation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.consultation.date_consultation}
                        onChange={(e) => updateConsultationField('date_consultation', e.target.value)}
                        min={getCurrentDateTime()}
                        className={`${inputClass} ${dateError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        required
                      />
                      {dateError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{dateError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Motif de consultation <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.consultation.motif}
                        onChange={(e) => updateConsultationField('motif', e.target.value)}
                        className={inputClass}
                        rows={4}
                        placeholder="Décrivez le motif de la consultation..."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-6">Diagnostic et Notes</h3>
                
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Diagnostic principal
                      </label>
                      <textarea
                        value={formData.consultation.diagnostic_principal || ''}
                        onChange={(e) => updateConsultationField('diagnostic_principal', e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Diagnostic médical..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes supplémentaires
                      </label>
                      <textarea
                        value={formData.consultation.notes || ''}
                        onChange={(e) => updateConsultationField('notes', e.target.value)}
                        className={inputClass}
                        rows={4}
                        placeholder="Notes médicales, recommandations..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500'
            }`}
          >
            Précédent
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>

            {currentStep === totalSteps ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep(1) || !validateStep(2)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  validateStep(1) && validateStep(2)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                {isModifying ? 'Modifier' : 'Enregistrer'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  validateStep(currentStep)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};