import React, { useState, useEffect, useCallback } from 'react';
import { 
  RendezVousFormData,
  MOYENS_PAIEMENT,
  SALLES_CONSULTATION,
  DUREES_CONSULTATION,
  RendezVousType,
  RendezVousStatut
} from '../types/RendezVousTypes';
import { SearchableSelect } from './SearchableSelect';
import { rendezVousService } from '../services/RendezVousService';


interface RendezVousProgressFormProps {
  tenantId: number;
  onSave: (formData: RendezVousFormData, isModifying: boolean) => void;
  onClose: () => void;
  rendezVousId?: number;
  onSuccess?: (message: string) => void;
}

export const RendezVousProgressForm: React.FC<RendezVousProgressFormProps> = ({
  tenantId,
  onSave,
  onClose,
  rendezVousId,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dynamicTypes, setDynamicTypes] = useState<RendezVousType[]>([]);
  const [dynamicStatuts, setDynamicStatuts] = useState<RendezVousStatut[]>([]);
  const [formData, setFormData] = useState<RendezVousFormData>({
    patient_id: 0,
    patient_nom: '',
    patient_email: '',
    patient_phone: '',
    medecin_id: 0,
    medecin_nom: '',
    specialite: '',
    date_heure: new Date().toISOString().split('T')[0] + 'T09:00',
    type_id: 1,
    type_nom: 'Consultation',
    statut_id: 1,
    statut_nom: 'Programmé',
    motif: '',
    duree: 30,
    salle: 'Salle 101',
    prix: 0,
    notes: '',
    moyen_paiement: undefined,
    assurance_validee: false
  });

  const [isModifying, setIsModifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedMedecinName, setSelectedMedecinName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load types & statuts
    const t = rendezVousService.obtenirTypes();
    const s = rendezVousService.obtenirStatuts();
    setDynamicTypes(t);
    setDynamicStatuts(s);

    if (rendezVousId) {
      setIsModifying(true);
      // Let existing logic apply, but normally we should load by ID
      const existingData = {
        patient_id: 1,
        patient_nom: 'Jean Dupont',
        patient_email: 'jean.dupont@email.com',
        patient_phone: '+509 48 12 34 56',
        medecin_id: 1,
        medecin_nom: 'Dr. Marie Cassandre',
        specialite: 'Cardiologie',
        date_heure: new Date().toISOString().split('T')[0] + 'T10:00',
        type_id: t.length > 0 ? t[0].type_id || (t[0] as any).id : 1,
        type_nom: t.length > 0 ? t[0].nom : 'Consultation',
        statut_id: s.length > 0 ? s[0].statut_id || (s[0] as any).id : 1,
        statut_nom: s.length > 0 ? s[0].nom : 'Programmé',
        motif: 'Consultation de routine',
        duree: 30,
        salle: 'Salle 101',
        prix: 1500,
        notes: 'Patient régulier',
        moyen_paiement: 'Espèces',
        assurance_validee: true
      };
      setFormData(existingData);
      setSelectedPatientName('Jean Dupont');
      setSelectedMedecinName('Dr. Marie Cassandre');
    } else {
      setIsModifying(false);
      // Reset form data for new appointment
      setFormData({
        patient_id: 0,
        patient_nom: '',
        patient_email: '',
        patient_phone: '',
        medecin_id: 0,
        medecin_nom: '',
        specialite: '',
        date_heure: new Date().toISOString().split('T')[0] + 'T09:00',
        type_id: t.length > 0 ? t[0].type_id || (t[0] as any).id : 1,
        type_nom: t.length > 0 ? t[0].nom : 'Consultation',
        statut_id: s.length > 0 ? s[0].statut_id || (s[0] as any).id : 1,
        statut_nom: s.length > 0 ? s[0].nom : 'Programmé',
        motif: '',
        duree: 30,
        salle: 'Salle 101',
        prix: 0,
        notes: '',
        moyen_paiement: undefined,
        assurance_validee: false
      });
      setSelectedPatientName('');
      setSelectedMedecinName('');
    }
  }, [rendezVousId]);

  // Ecouter les événements pour le pré-remplissage
  useEffect(() => {
    const handlePatientSelected = (event: CustomEvent) => {
      const { patient_id, patient_nom, patient_email, patient_phone } = event.detail;
      setFormData(prev => ({
        ...prev,
        patient_id,
        patient_nom,
        patient_email,
        patient_phone
      }));
      setSelectedPatientName(patient_nom);
    };

    const handleMedecinSelected = (event: CustomEvent) => {
      const { medecin_id, medecin_nom, specialite } = event.detail;
      setFormData(prev => ({
        ...prev,
        medecin_id,
        medecin_nom,
        specialite
      }));
      setSelectedMedecinName(medecin_nom);
    };

    window.addEventListener('patientSelected', handlePatientSelected as EventListener);
    window.addEventListener('medecinSelected', handleMedecinSelected as EventListener);

    return () => {
      window.removeEventListener('patientSelected', handlePatientSelected as EventListener);
      window.removeEventListener('medecinSelected', handleMedecinSelected as EventListener);
    };
  }, []);

  const totalSteps = 4;

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.patient_nom?.trim()) newErrors.patient_nom = "Nom du patient requis";
        if (!formData.patient_phone?.trim()) newErrors.patient_phone = "Téléphone requis";
        break;
      case 2:
        if (!formData.medecin_nom?.trim()) newErrors.medecin_nom = "Nom du médecin requis";
        if (!formData.date_heure) newErrors.date_heure = "Date et heure requises";
        break;
      case 3:
        if (!formData.motif?.trim()) newErrors.motif = "Motif requis";
        if (!formData.salle?.trim()) newErrors.salle = "Salle requise";
        break;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    
    return true;
  }, [formData]);

  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const updateRendezVousField = (field: keyof RendezVousFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePatientChange = (patientName: string, patientId?: number) => {
    setSelectedPatientName(patientName);
    if (patientId) {
      updateRendezVousField('patient_id', patientId);
      updateRendezVousField('patient_nom', patientName);
    }
  };

  const handleMedecinChange = (medecinName: string, medecinId?: number) => {
    setSelectedMedecinName(medecinName);
    if (medecinId) {
      updateRendezVousField('medecin_id', medecinId);
      updateRendezVousField('medecin_nom', medecinName);
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    
    // Valider tout les étapes avant de soumettre
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);


    if (step1Valid && step2Valid && step3Valid) {
      setIsSaving(true);
      try {
        
        // Prepare data for service
        const submitData = {
          ...formData,
          patient_id: formData.patient_id || 1,
          medecin_id: formData.medecin_id || 1,
          type_id: formData.type_id || 1,
          statut_id: formData.statut_id || 1
        };
        
        await onSave(submitData, isModifying);
        if (onSuccess) {
          onSuccess(isModifying ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès');
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du rendez-vous:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map(step => (
          <button
            key={step}
            onClick={() => {
              if (validateStep(currentStep)) {
                setCurrentStep(step);
                setErrors({});
              }
            }}
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
              {step === 1 && 'Patient'}
              {step === 2 && 'Médecin'}
              {step === 3 && 'Consultation'}
              {step === 4 && 'Finalisation'}
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

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.patient_nom?.trim() && formData.patient_phone?.trim());
      case 2:
        return !!(formData.medecin_nom?.trim() && formData.date_heure);
      case 3:
        return !!(formData.motif?.trim() && formData.salle?.trim());
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="w-full h-[90vh] flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isModifying ? 'Modifier le Rendez-vous' : 'Ajouter un Rendez-vous'} - Étape {currentStep}/{totalSteps}
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
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Informations Patient</h3>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rechercher un patient <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={selectedPatientName}
                      onChange={handlePatientChange}
                      type="patient"
                      required={true}
                      placeholder="Rechercher par nom, téléphone ou email..."
                    />
                    {errors.patient_nom && <p className="text-red-500 text-sm mt-1">{errors.patient_nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.patient_phone}
                      onChange={(e) => updateRendezVousField('patient_phone', e.target.value)}
                      placeholder="+509 48 12 34 56"
                      className={`${inputClass} ${errors.patient_phone ? 'border-red-500' : ''}`}
                    />
                    {errors.patient_phone && <p className="text-red-500 text-sm mt-1">{errors.patient_phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.patient_email}
                      onChange={(e) => updateRendezVousField('patient_email', e.target.value)}
                      placeholder="patient@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-6">Médecin et Horaire</h3>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rechercher un médecin <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      value={selectedMedecinName}
                      onChange={handleMedecinChange}
                      type="medecin"
                      required={true}
                      placeholder="Rechercher par nom, spécialité ou téléphone..."
                    />
                    {errors.medecin_nom && <p className="text-red-500 text-sm mt-1">{errors.medecin_nom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Spécialité
                    </label>
                    <input
                      type="text"
                      value={formData.specialite}
                      onChange={(e) => updateRendezVousField('specialite', e.target.value)}
                      placeholder="Cardiologie"
                      className={inputClass}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date et heure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.date_heure}
                      onChange={(e) => updateRendezVousField('date_heure', e.target.value)}
                      className={`${inputClass} ${errors.date_heure ? 'border-red-500' : ''}`}
                    />
                    {errors.date_heure && <p className="text-red-500 text-sm mt-1">{errors.date_heure}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée (minutes)
                    </label>
                    <select
                      value={formData.duree}
                      onChange={(e) => updateRendezVousField('duree', parseInt(e.target.value))}
                      className={inputClass}
                    >
                      {DUREES_CONSULTATION.map(duree => (
                        <option key={duree} value={duree}>{duree} minutes</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-6">Détails Consultation</h3>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de consultation
                    </label>
                    <select
                      value={formData.type_id || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const selectedType = dynamicTypes.find(t => (t.type_id || (t as any).id) === val);
                        if (selectedType) {
                          updateRendezVousField('type_id', val);
                          updateRendezVousField('type_nom', selectedType.nom);
                        }
                      }}
                      className={inputClass}
                    >
                      {dynamicTypes.map((type: any) => (
                        <option key={type.type_id || type.id} value={type.type_id || type.id}>
                          {type.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.salle}
                      onChange={(e) => updateRendezVousField('salle', e.target.value)}
                      className={`${inputClass} ${errors.salle ? 'border-red-500' : ''}`}
                    >
                      {SALLES_CONSULTATION.map(salle => (
                        <option key={salle} value={salle}>{salle}</option>
                      ))}
                    </select>
                    {errors.salle && <p className="text-red-500 text-sm mt-1">{errors.salle}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Motif de consultation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.motif}
                      onChange={(e) => updateRendezVousField('motif', e.target.value)}
                      rows={3}
                      placeholder="Décrivez le motif de la consultation..."
                      className={`${inputClass} ${errors.motif ? 'border-red-500' : ''}`}
                    />
                    {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes supplémentaires
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateRendezVousField('notes', e.target.value)}
                      rows={2}
                      placeholder="Notes médicales ou informations complémentaires..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-6">Finalisation</h3>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.statut_id || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const selectedStatut = dynamicStatuts.find(s => (s.statut_id || (s as any).id) === val);
                        if (selectedStatut) {
                          updateRendezVousField('statut_id', val);
                          updateRendezVousField('statut_nom', selectedStatut.nom);
                        }
                      }}
                      className={inputClass}
                    >
                      {dynamicStatuts.map((statut: any) => (
                        <option key={statut.statut_id || statut.id} value={statut.statut_id || statut.id}>
                          {statut.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix (HTG)
                    </label>
                    <input
                      type="number"
                      value={formData.prix}
                      onChange={(e) => updateRendezVousField('prix', parseFloat(e.target.value) || 0)}
                      className={inputClass}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Moyen de paiement
                    </label>
                    <select
                      value={formData.moyen_paiement || ''}
                      onChange={(e) => updateRendezVousField('moyen_paiement', e.target.value || undefined)}
                      className={inputClass}
                    >
                      <option value="">Sélectionner...</option>
                      {MOYENS_PAIEMENT.map(moyen => (
                        <option key={moyen} value={moyen}>{moyen}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="assuranceValidee"
                      checked={formData.assurance_validee}
                      onChange={(e) => updateRendezVousField('assurance_validee', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="assuranceValidee" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assurance validée
                    </label>
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
                disabled={!isStepValid(1) || !isStepValid(2) || !isStepValid(3) || isSaving}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isStepValid(1) && isStepValid(2) && isStepValid(3) && !isSaving
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
                disabled={!isStepValid(currentStep)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isStepValid(currentStep)
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