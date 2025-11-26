import React, { useState, useEffect } from 'react';
import { 
  RendezVousFormData, 
  RendezVous,
  STATUTS_RENDEZ_VOUS,
  TYPES_CONSULTATION,
  MOYENS_PAIEMENT,
  SALLES_CONSULTATION,
  DUREES_CONSULTATION,
  HEURES_CONSULTATION
} from '../types/RendezVousTypes';

interface RendezVousProgressFormProps {
  tenantId: number;
  onSave: (formData: RendezVousFormData, isModifying: boolean) => void;
  onClose: () => void;
  rendezVousId?: number;
}

export const RendezVousProgressForm: React.FC<RendezVousProgressFormProps> = ({
  tenantId,
  onSave,
  onClose,
  rendezVousId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  useEffect(() => {
    if (rendezVousId) {
      setIsModifying(true);
      // Charger les données du rendez-vous existant
    } else {
      setIsModifying(false);
    }
  }, [rendezVousId]);

  const totalSteps = 4;

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

  const updateRendezVousField = (field: keyof RendezVousFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.patient_nom && formData.patient_phone);
      case 2:
        return !!(formData.medecin_nom && formData.date_heure);
      case 3:
        return !!(formData.motif && formData.salle);
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      onSave(formData, isModifying);
    }
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4].map(step => (
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

  return (
    <div className="w-full h-[90vh] flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isModifying ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous'} - Étape {currentStep}/{totalSteps}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du patient <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.patient_nom}
                      onChange={(e) => updateRendezVousField('patient_nom', e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className={inputClass}
                      required
                    />
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
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Médecin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.medecin_nom}
                      onChange={(e) => updateRendezVousField('medecin_nom', e.target.value)}
                      placeholder="Dr. Marie Laurent"
                      className={inputClass}
                      required
                    />
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
                      className={inputClass}
                      required
                    />
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
                      value={formData.type_nom}
                      onChange={(e) => updateRendezVousField('type_nom', e.target.value)}
                      className={inputClass}
                    >
                      {TYPES_CONSULTATION.map(type => (
                        <option key={type} value={type}>{type}</option>
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
                      className={inputClass}
                    >
                      {SALLES_CONSULTATION.map(salle => (
                        <option key={salle} value={salle}>{salle}</option>
                      ))}
                    </select>
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
                      className={inputClass}
                      required
                    />
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
                      value={formData.statut_nom}
                      onChange={(e) => updateRendezVousField('statut_nom', e.target.value)}
                      className={inputClass}
                    >
                      {STATUTS_RENDEZ_VOUS.map(statut => (
                        <option key={statut} value={statut}>{statut}</option>
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
                disabled={!validateStep(1) || !validateStep(2) || !validateStep(3)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  validateStep(1) && validateStep(2) && validateStep(3)
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