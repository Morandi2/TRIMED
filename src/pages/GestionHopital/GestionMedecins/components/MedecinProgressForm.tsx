import React, { useState, useEffect, useRef } from 'react';
import { Medecin, MedecinFormData, medecinService } from '../services/MedecinService';

interface MedecinProgressFormProps {
  hopitalId: number;
  onSave: (formData: MedecinFormData, isModifying: boolean) => void;
  onClose: () => void;
  medecinId?: number;
}

export const MedecinProgressForm: React.FC<MedecinProgressFormProps> = ({
  hopitalId,
  onSave,
  onClose,
  medecinId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MedecinFormData>({
    medecin: {
      nom: '',
      prenom: '',
      sexe: 'M',
      date_naissance: '',
      telephone: '',
      email_professionnel: '',
      numero_identification: '',
      numero_matricule_professionnel: '',
      specialite_principale_id: undefined,
      specialites_secondaires: [],
      photo: ''
    }
  });

  const [selectedSpecialites, setSelectedSpecialites] = useState<number[]>([]);
  const [selectedSpecialite, setSelectedSpecialite] = useState<number | ''>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const specialites = medecinService.obtenirSpecialites();
  const isModifying = !!medecinId;

  useEffect(() => {
    if (medecinId) {
      const medecin = medecinService.obtenirMedecin(medecinId);
      if (medecin) {
        setFormData({
          medecin: {
            nom: medecin.nom,
            prenom: medecin.prenom,
            sexe: medecin.sexe,
            date_naissance: medecin.date_naissance || '',
            telephone: medecin.telephone || '',
            email_professionnel: medecin.email_professionnel || '',
            numero_identification: medecin.numero_identification || '',
            numero_matricule_professionnel: medecin.numero_matricule_professionnel || '',
            specialite_principale_id: medecin.specialite_principale_id,
            specialites_secondaires: medecin.specialites_secondaires || [],
            photo: medecin.photo || ''
          }
        });
        setSelectedSpecialites(medecin.specialites_secondaires || []);
      }
    }
  }, [medecinId]);

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.medecin.nom && formData.medecin.prenom && formData.medecin.date_naissance);
      case 2:
        return !!(formData.medecin.telephone && formData.medecin.email_professionnel && formData.medecin.numero_identification);
      case 3:
        return !!formData.medecin.specialite_principale_id;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      onSave(formData, isModifying);
    }
  };

  const handleInputChange = (field: keyof Medecin, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      medecin: {
        ...prev.medecin,
        [field]: value
      }
    }));
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleInputChange('photo', result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const addSpecialite = () => {
    if (selectedSpecialite && !selectedSpecialites.includes(selectedSpecialite as number)) {
      const newSpecialites = [...selectedSpecialites, selectedSpecialite as number];
      setSelectedSpecialites(newSpecialites);
      setFormData(prev => ({
        ...prev,
        medecin: {
          ...prev.medecin,
          specialites_secondaires: newSpecialites
        }
      }));
      setSelectedSpecialite('');
    }
  };

  const removeSpecialite = (specialiteId: number) => {
    const newSpecialites = selectedSpecialites.filter(id => id !== specialiteId);
    setSelectedSpecialites(newSpecialites);
    setFormData(prev => ({
      ...prev,
      medecin: {
        ...prev.medecin,
        specialites_secondaires: newSpecialites
      }
    }));
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
              {step === 1 && 'Information'}
              {step === 2 && 'Contact'}
              {step === 3 && 'Spécialité'}
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl z-[100000] mx-4">
        
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isModifying ? 'Modifier Médecin' : 'Nouveau Médecin'} - Étape {currentStep}/{totalSteps}
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
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Informations Personnelles</h3>
                
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.medecin.nom}
                          onChange={(e) => handleInputChange('nom', e.target.value)}
                          className={inputClass}
                          placeholder="Entrez le nom de famille"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.medecin.prenom}
                          onChange={(e) => handleInputChange('prenom', e.target.value)}
                          className={inputClass}
                          placeholder="Entrez le prénom"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sexe <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.medecin.sexe}
                          onChange={(e) => handleInputChange('sexe', e.target.value)}
                          className={inputClass}
                          required
                        >
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date de naissance <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.medecin.date_naissance}
                          onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Photo du médecin
                      </label>
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive 
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {formData.medecin.photo ? (
                          <div className="space-y-2">
                            <img 
                              src={formData.medecin.photo.startsWith('data:image/') ? formData.medecin.photo : ''} 
                              alt="Photo médecin" 
                              className="w-20 h-20 rounded-full mx-auto object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleInputChange('photo', '')}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-600 dark:text-gray-400">Glissez une image ici ou</p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              parcourir les fichiers
                            </button>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-6">Informations de Contact</h3>
                
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.medecin.telephone}
                          onChange={(e) => handleInputChange('telephone', e.target.value)}
                          className={inputClass}
                          placeholder="Ex: +509 3123 4567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email professionnel <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.medecin.email_professionnel}
                          onChange={(e) => handleInputChange('email_professionnel', e.target.value)}
                          className={inputClass}
                          placeholder="dr.nom@hopital.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Numéro d'identification <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.medecin.numero_identification}
                          onChange={(e) => handleInputChange('numero_identification', e.target.value)}
                          className={inputClass}
                          placeholder="Ex: 123456789012"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Matricule professionnel
                        </label>
                        <input
                          type="text"
                          value={formData.medecin.numero_matricule_professionnel}
                          onChange={(e) => handleInputChange('numero_matricule_professionnel', e.target.value)}
                          className={inputClass}
                          placeholder="Ex: MED001 (optionnel)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-6">Spécialités Médicales</h3>
                
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Spécialité principale <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.medecin.specialite_principale_id || ''}
                        onChange={(e) => handleInputChange('specialite_principale_id', e.target.value ? parseInt(e.target.value) : undefined)}
                        className={inputClass}
                        required
                      >
                        <option value="">Sélectionner une spécialité</option>
                        {specialites.map(specialite => (
                          <option key={specialite.specialite_id} value={specialite.specialite_id}>
                            {specialite.nom_specialite}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Spécialités secondaires
                      </label>
                      <div className="flex gap-2 mb-2">
                        <select
                          value={selectedSpecialite}
                          onChange={(e) => setSelectedSpecialite(e.target.value ? parseInt(e.target.value) : '')}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Ajouter une spécialité</option>
                          {specialites
                            .filter(s => s.specialite_id !== formData.medecin.specialite_principale_id && !selectedSpecialites.includes(s.specialite_id))
                            .map(specialite => (
                              <option key={specialite.specialite_id} value={specialite.specialite_id}>
                                {specialite.nom_specialite}
                              </option>
                            ))
                          }
                        </select>
                        <button
                          type="button"
                          onClick={addSpecialite}
                          disabled={!selectedSpecialite}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Ajouter
                        </button>
                      </div>
                      
                      {selectedSpecialites.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedSpecialites.map(specialiteId => {
                            const specialite = specialites.find(s => s.specialite_id === specialiteId);
                            return (
                              <span
                                key={specialiteId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                              >
                                {specialite?.nom_specialite}
                                <button
                                  type="button"
                                  onClick={() => removeSpecialite(specialiteId)}
                                  className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
    </div>
  );
};