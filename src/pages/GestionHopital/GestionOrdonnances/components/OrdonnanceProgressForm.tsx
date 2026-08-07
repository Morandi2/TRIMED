import React, { useState, useEffect } from 'react';
import { ordonnanceService, OrdonnanceFormData, Prescription } from '../services/OrdonnanceService';
import { SearchableSelect } from './SearchableSelect';

interface OrdonnanceProgressFormProps {
  tenantId: number;
  onSave: (formData: OrdonnanceFormData, isModifying: boolean) => void;
  onClose: () => void;
  ordonnanceId?: number;
}

export const OrdonnanceProgressForm: React.FC<OrdonnanceProgressFormProps> = ({
  tenantId,
  onSave,
  onClose,
  ordonnanceId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrdonnanceFormData>({
    ordonnance: {
      consultation_id: 0,
      patient_id: 0,
      medecin_id: 0,
      date_ordonnance: '',
      recommandations: '',
      validite: '',
      prescriptions: []
    }
  });

  const [newPrescription, setNewPrescription] = useState({
    medicament: "",
    dosage: "",
    duree: "",
    instructions: ""
  });

  const [isModifying, setIsModifying] = useState(false);
  const [selectedConsultationName, setSelectedConsultationName] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedMedecinName, setSelectedMedecinName] = useState('');
  const [dateError, setDateError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const loadOrdonnance = async () => {
      if (ordonnanceId) {
        setIsModifying(true);
        const ordonnance = await ordonnanceService.obtenirOrdonnance(ordonnanceId);
        if (ordonnance) {
          setFormData({
            ordonnance: {
              consultation_id: ordonnance.consultation_id,
              patient_id: ordonnance.patient_id,
              medecin_id: ordonnance.medecin_id,
              date_ordonnance: ordonnance.date_ordonnance.replace('T', 'T').slice(0, 16),
              recommandations: ordonnance.recommandations || '',
              validite: ordonnance.validite,
              prescriptions: ordonnance.prescriptions || []
            }
          });
          const consultation = ordonnanceService.obtenirConsultationInfo(ordonnance.consultation_id);
          setSelectedConsultationName(consultation?.motif || `Consultation #${ordonnance.consultation_id}`);
          setSelectedPatientName((ordonnance as any).patient_nom || ordonnanceService.obtenirNomPatient(ordonnance.patient_id));
          setSelectedMedecinName((ordonnance as any).medecin_nom || ordonnanceService.obtenirNomMedecin(ordonnance.medecin_id));
        }
      } else {
        setIsModifying(false);
      }
    };
    loadOrdonnance();
  }, [ordonnanceId]);

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

  const updateOrdonnanceField = (field: string, value: any) => {
    if (field === 'date_ordonnance') {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      
      if (selectedDate < currentDate) {
        setDateError('La date d\'ordonnance ne peut pas être dans le passé');
      } else {
        setDateError('');
      }
    }
    
    setFormData(prev => ({
      ordonnance: { ...prev.ordonnance, [field]: value }
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
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.ordonnance.consultation_id) newErrors.consultation_id = "La consultation est obligatoire";
      if (!formData.ordonnance.patient_id) newErrors.patient_id = "Le patient est obligatoire";
      if (!formData.ordonnance.medecin_id) newErrors.medecin_id = "Le médecin est obligatoire";
      
      isValid = Object.keys(newErrors).length === 0;
      if (updateState) {
        if (!isValid) setErrors(prev => ({ ...prev, ...newErrors }));
        else setErrors(prev => {
          const e = { ...prev };
          delete e.consultation_id; delete e.patient_id; delete e.medecin_id;
          return e;
        });
      }
      return isValid;
    }
    
    if (step === 2) {
      if (!formData.ordonnance.date_ordonnance) newErrors.date_ordonnance = "La date est obligatoire";
      if (!formData.ordonnance.validite) newErrors.validite = "La validité est obligatoire";
      
      isValid = Object.keys(newErrors).length === 0 && !dateError;
      if (updateState) {
        if (!isValid) setErrors(prev => ({ ...prev, ...newErrors }));
        else setErrors(prev => {
          const e = { ...prev };
          delete e.date_ordonnance; delete e.validite;
          return e;
        });
      }
      return isValid;
    }
    
    if (step === 3) return true;

    return true;
  };

  // Memoize validities to prevent computation in render and loop triggers
  const isStep1Valid = React.useMemo(() => validateStep(1, false), [formData.ordonnance.consultation_id, formData.ordonnance.patient_id, formData.ordonnance.medecin_id]);
  const isStep2Valid = React.useMemo(() => validateStep(2, false), [formData.ordonnance.date_ordonnance, formData.ordonnance.validite, dateError]);
  const isCurrentStepValid = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateStep(currentStep, true);
  };

  const handleSubmit = async () => {
    setTouched({
      consultation_id: true, patient_id: true, medecin_id: true,
      date_ordonnance: true, validite: true
    });
    if (isStep1Valid && isStep2Valid && !dateError && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSave(formData, isModifying);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'ordonnance:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleConsultationChange = (consultationName: string, consultationId?: number) => {
    setSelectedConsultationName(consultationName);
    if (consultationId) {
      updateOrdonnanceField('consultation_id', consultationId);
    }
  };

  const handlePatientChange = (patientName: string, patientId?: number) => {
    setSelectedPatientName(patientName);
    if (patientId) {
      updateOrdonnanceField('patient_id', patientId);
    }
  };

  const handleMedecinChange = (medecinName: string, medecinId?: number) => {
    setSelectedMedecinName(medecinName);
    if (medecinId) {
      updateOrdonnanceField('medecin_id', medecinId);
    }
  };

  const addPrescription = () => {
    if (newPrescription.medicament.trim() && newPrescription.dosage.trim()) {
      const prescription: Prescription = {
        id: formData.ordonnance.prescriptions.length + 1,
        ...newPrescription
      };
      updateOrdonnanceField('prescriptions', [...formData.ordonnance.prescriptions, prescription]);
      setNewPrescription({
        medicament: "",
        dosage: "",
        duree: "",
        instructions: ""
      });
    }
  };

  const removePrescription = (index: number) => {
    updateOrdonnanceField('prescriptions', formData.ordonnance.prescriptions.filter((_, i) => i !== index));
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
              {step === 2 && 'Ordonnance'}
              {step === 3 && 'Prescriptions'}
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
            {isModifying ? 'Modifier l\'Ordonnance' : 'Créer une Ordonnance'} - Étape {currentStep}/{totalSteps}
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
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Participants à l'Ordonnance</h3>
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SearchableSelect
                      value={selectedConsultationName}
                      onChange={handleConsultationChange}
                      required={true}
                      type="consultation"
                      placeholder="Rechercher une consultation..."
                      error={touched.consultation_id && errors.consultation_id ? errors.consultation_id : undefined}
                    />

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
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-6">Informations de l'Ordonnance</h3>
                
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date et heure d'ordonnance <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.ordonnance.date_ordonnance}
                        onChange={(e) => updateOrdonnanceField('date_ordonnance', e.target.value)}
                        onBlur={() => handleFieldBlur('date_ordonnance')}
                        min={getCurrentDateTime()}
                        className={errors.date_ordonnance && touched.date_ordonnance || dateError ? errorInputClass : inputClass}
                        required
                      />
                      {(errors.date_ordonnance && touched.date_ordonnance) || dateError ? (
                        <p className={errorTextClass}>{dateError || errors.date_ordonnance}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Validité <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.ordonnance.validite}
                        onChange={(e) => updateOrdonnanceField('validite', e.target.value)}
                        onBlur={() => handleFieldBlur('validite')}
                        className={errors.validite && touched.validite ? errorInputClass : inputClass}
                        required
                      >
                        <option value="">Sélectionner la validité...</option>
                        <option value="7 jours">7 jours</option>
                        <option value="15 jours">15 jours</option>
                        <option value="30 jours">30 jours</option>
                        <option value="60 jours">60 jours</option>
                        <option value="90 jours">90 jours</option>
                        <option value="6 mois">6 mois</option>
                        <option value="1 an">1 an</option>
                      </select>
                      {errors.validite && touched.validite && (
                        <p className={errorTextClass}>{errors.validite}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-6">Prescriptions et Recommandations</h3>
                
                  <div className="space-y-6">
                    {/* Section Prescriptions */}
                    <div>
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">Prescriptions</h4>
                      
                      {/* Liste des prescriptions */}
                      <div className="space-y-3 mb-4">
                        {formData.ordonnance.prescriptions.map((prescription, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 dark:text-white">
                                {prescription.medicament} - {prescription.dosage}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {prescription.duree} • {prescription.instructions}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePrescription(index)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Formulaire pour ajouter prescription */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <input
                          type="text"
                          value={newPrescription.medicament}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, medicament: e.target.value }))}
                          placeholder="Médicament"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={newPrescription.dosage}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="Dosage"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={newPrescription.duree}
                          onChange={(e) => setNewPrescription(prev => ({ ...prev, duree: e.target.value }))}
                          placeholder="Durée"
                          className={inputClass}
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPrescription.instructions}
                            onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                            placeholder="Instructions"
                            className={`${inputClass} flex-1`}
                          />
                          <button
                            type="button"
                            onClick={addPrescription}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section Recommandations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recommandations médicales
                      </label>
                      <textarea
                        value={formData.ordonnance.recommandations || ''}
                        onChange={(e) => updateOrdonnanceField('recommandations', e.target.value)}
                        className={inputClass}
                        rows={4}
                        placeholder="Recommandations pour le patient, instructions générales..."
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
                disabled={!isStep1Valid || !isStep2Valid || dateError !== '' || isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isStep1Valid && isStep2Valid && !dateError && !isSubmitting
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
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