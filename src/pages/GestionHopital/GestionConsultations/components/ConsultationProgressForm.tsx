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

  const [formData, setFormData] = useState<ConsultationFormData>({
    consultation: {
      patient_id: 0,
      medecin_id: 0,
      rendez_vous_id: undefined,
      date_consultation: getCurrentDateTime(),
      motif: '',
      diagnostic_principal: '',
      notes: ''
    }
  });

  const [isModifying, setIsModifying] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedMedecinName, setSelectedMedecinName] = useState('');
  const [selectedSalleName, setSelectedSalleName] = useState('');
  const [dateError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

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
    if (currentStep < totalSteps && isCurrentStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConsultationField = (field: string, value: any) => {
    setFormData(prev => ({
      consultation: { ...prev.consultation, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  const validateStep = (step: number, updateState: boolean = true): boolean => {
    let newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (step === 1) {
      if (!formData.consultation.patient_id) newErrors.patient_id = "Le patient est obligatoire";
      if (!formData.consultation.medecin_id) newErrors.medecin_id = "Le médecin est obligatoire";
      
      isValid = Object.keys(newErrors).length === 0;
      if (updateState) {
        if (!isValid) setErrors(prev => ({ ...prev, ...newErrors }));
        else setErrors(prev => {
          const e = { ...prev };
          delete e.patient_id; delete e.medecin_id;
          return e;
        });
      }
      return isValid;
    }
    
    if (step === 2) {
      if (!formData.consultation.date_consultation) newErrors.date_consultation = "La date et l'heure sont obligatoires";
      if (!formData.consultation.motif || !formData.consultation.motif.trim()) newErrors.motif = "Le motif est obligatoire";
      
      isValid = Object.keys(newErrors).length === 0;
      if (updateState) {
        if (!isValid) setErrors(prev => ({ ...prev, ...newErrors }));
        else setErrors(prev => {
          const e = { ...prev };
          delete e.date_consultation; delete e.motif;
          return e;
        });
      }
      return isValid;
    }
    
    return true;
  };

  // Memoize validities to prevent computation in render and potential loop triggers
  const isStep1Valid = React.useMemo(() => validateStep(1, false), [formData.consultation.patient_id, formData.consultation.medecin_id]);
  const isStep2Valid = React.useMemo(() => validateStep(2, false), [formData.consultation.date_consultation, formData.consultation.motif]);
  const isCurrentStepValid = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateStep(currentStep, true);
  };

  const handleSubmit = async () => {
    setTouched({
      patient_id: true, medecin_id: true, date_consultation: true, motif: true
    });
    if (isStep1Valid && isStep2Valid && !isSaving) {
      setIsSaving(true);
      try {
        await onSave(formData, isModifying);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la consultation:", error);
      } finally {
        setIsSaving(false);
      }
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

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200";
  const errorInputClass = "w-full px-4 py-3 border border-red-500 dark:border-red-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200";
  const errorTextClass = "text-red-500 dark:text-red-400 text-sm mt-1";

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
                      error={touched.patient_id && errors.patient_id ? errors.patient_id : undefined}
                    />

                    <SearchableSelect
                      value={selectedMedecinName}
                      onChange={handleMedecinChange}
                      required={true}
                      type="medecin"
                      placeholder="Rechercher un médecin..."
                      error={touched.medecin_id && errors.medecin_id ? errors.medecin_id : undefined}
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
                        onBlur={() => handleFieldBlur('date_consultation')}
                        min={getCurrentDateTime()}
                        className={errors.date_consultation && touched.date_consultation ? errorInputClass : inputClass}
                        required
                      />
                      {errors.date_consultation && touched.date_consultation && (
                        <p className={errorTextClass}>{errors.date_consultation}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Motif de consultation <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.consultation.motif}
                        onChange={(e) => updateConsultationField('motif', e.target.value)}
                        onBlur={() => handleFieldBlur('motif')}
                        className={errors.motif && touched.motif ? errorInputClass : inputClass}
                        rows={4}
                        placeholder="Décrivez le motif de la consultation..."
                        required
                      />
                      {errors.motif && touched.motif && (
                        <p className={errorTextClass}>{errors.motif}</p>
                      )}
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
                disabled={!isStep1Valid || !isStep2Valid || isSaving}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isStep1Valid && isStep2Valid && !isSaving
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </>
                ) : (
                  isModifying ? 'Modifier' : 'Enregistrer'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isCurrentStepValid}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isCurrentStepValid
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