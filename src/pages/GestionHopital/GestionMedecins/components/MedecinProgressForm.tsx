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
  const [identificationType, setIdentificationType] = useState<'CIN' | 'NIF'>('CIN');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const specialites = medecinService.obtenirSpecialites();
  const isModifying = !!medecinId;

  // Fonksyon pou kalkile date minimim ak maksimim
  const getDateConstraints = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()); // 100 ane de sa
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()); // 18 ane de sa (laj minimim pou doktè)
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

  const dateConstraints = getDateConstraints();

  // Fonksyon pou valide CIN/NIF selon fòma ayisyen
  const validateNumeroIdentification = (value: string, type: 'CIN' | 'NIF'): boolean => {
    if (type === 'CIN') {
      // CIN: 1234-5678-9012 (12 chif ak tirè)
      const cinRegex = /^\d{4}-\d{4}-\d{4}$/;
      return cinRegex.test(value);
    } else {
      // NIF: 1234567890 (10 chif)
      const nifRegex = /^\d{10}$/;
      return nifRegex.test(value);
    }
  };

  // Fonksyon pou valide nimewo telefòn ayisyen
  const validateTelephone = (value: string): boolean => {
    // Fòma: +509 3123 4567 oubyen 50931234567
    const phoneRegex = /^(?:\+509|509)\s?\d{2}\s?\d{2}\s?\d{4}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  };

  // Fonksyon pou valide email
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Fonksyon pou fòmate CIN/NIF otomatikman
  const formatNumeroIdentification = (value: string, type: 'CIN' | 'NIF'): string => {
    // Retire tout karaktè ki pa chif
    const numericValue = value.replace(/\D/g, '');
    
    if (type === 'CIN') {
      // Fòma CIN: 1234-5678-9012
      if (numericValue.length <= 4) {
        return numericValue;
      } else if (numericValue.length <= 8) {
        return `${numericValue.slice(0, 4)}-${numericValue.slice(4)}`;
      } else {
        return `${numericValue.slice(0, 4)}-${numericValue.slice(4, 8)}-${numericValue.slice(8, 12)}`;
      }
    } else {
      // NIF: 10 chif san fòma
      return numericValue.slice(0, 10);
    }
  };

  // Fonksyon pou fòmate telefòn otomatikman
  const formatTelephone = (value: string): string => {
    // Retire tout karaktè ki pa chif
    const numericValue = value.replace(/\D/g, '');
    
    // Si kòmanse ak 509, retire li epi ajoute +509
    let formattedValue = numericValue;
    if (numericValue.startsWith('509')) {
      formattedValue = numericValue.slice(3);
    }
    
    // Limite a 8 chif (apre +509)
    formattedValue = formattedValue.slice(0, 8);
    
    // Fòmate: +509 XX XX XXXX
    if (formattedValue.length <= 2) {
      return `+509 ${formattedValue}`;
    } else if (formattedValue.length <= 4) {
      return `+509 ${formattedValue.slice(0, 2)} ${formattedValue.slice(2)}`;
    } else if (formattedValue.length <= 6) {
      return `+509 ${formattedValue.slice(0, 2)} ${formattedValue.slice(2, 4)} ${formattedValue.slice(4)}`;
    } else {
      return `+509 ${formattedValue.slice(0, 2)} ${formattedValue.slice(2, 4)} ${formattedValue.slice(4, 8)}`;
    }
  };

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
        
        // Detèmine type idantifikasyon selon fòma
        if (medecin.numero_identification) {
          if (medecin.numero_identification.includes('-')) {
            setIdentificationType('CIN');
          } else {
            setIdentificationType('NIF');
          }
        }
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
        return !!(formData.medecin.nom.trim() && 
                 formData.medecin.prenom.trim() && 
                 formData.medecin.date_naissance &&
                 validateNumeroIdentification(formData.medecin.numero_identification, identificationType));
      case 2:
        return !!(formData.medecin.telephone.trim() && 
                 formData.medecin.email_professionnel.trim() &&
                 validateTelephone(formData.medecin.telephone) &&
                 validateEmail(formData.medecin.email_professionnel));
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

  const handleNumeroIdentificationChange = (value: string) => {
    const formattedValue = formatNumeroIdentification(value, identificationType);
    handleInputChange('numero_identification', formattedValue);
  };

  const handleTelephoneChange = (value: string) => {
    const formattedValue = formatTelephone(value);
    handleInputChange('telephone', formattedValue);
  };

  const handleIdentificationTypeChange = (type: 'CIN' | 'NIF') => {
    setIdentificationType(type);
    // Reset valè a lè chanje type
    handleInputChange('numero_identification', '');
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
    <div className="mb-4 sm:mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3].map(step => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            className={`flex flex-col items-center transition-all duration-200 flex-1 ${
              step <= currentStep 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 text-xs sm:text-sm ${
                step <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
              }`}
            >
              {step}
            </div>
            <span className="text-xs mt-1 font-medium text-center">
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

  const inputClass = "w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
          
          {/* Header fixe */}
          <div className="flex-none px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isModifying ? 'Modifier Médecin' : 'Nouveau Médecin'} - Étape {currentStep}/{totalSteps}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <ProgressBar />
          </div>

          {/* Body scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Informations Personnelles</h3>
                
                  <div className="space-y-6">
                    {/* Foto a deplase anlè */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          min={dateConstraints.min}
                          max={dateConstraints.max}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Doit être entre {dateConstraints.min} et {dateConstraints.max}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Numéro d'identification <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        {/* Seleksyon type ID */}
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="identificationType"
                              value="CIN"
                              checked={identificationType === 'CIN'}
                              onChange={(e) => handleIdentificationTypeChange('CIN')}
                              className="mr-2"
                            />
                            CIN
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="identificationType"
                              value="NIF"
                              checked={identificationType === 'NIF'}
                              onChange={(e) => handleIdentificationTypeChange('NIF')}
                              className="mr-2"
                            />
                            NIF
                          </label>
                        </div>

                        {/* Champ nimewo ID */}
                        <input
                          type="text"
                          value={formData.medecin.numero_identification}
                          onChange={(e) => handleNumeroIdentificationChange(e.target.value)}
                          className={inputClass}
                          placeholder={
                            identificationType === 'CIN' 
                              ? "Ex: 1234-5678-9012" 
                              : "Ex: 1234567890"
                          }
                          required
                        />
                        
                        {/* Mesaj gid */}
                        <p className="text-xs text-gray-500">
                          {identificationType === 'CIN' 
                            ? "Format: 12 chiffres avec tirets (1234-5678-9012)" 
                            : "Format: 10 chiffres sans tirets (1234567890)"}
                        </p>

                        {/* Mesaj erè */}
                        {formData.medecin.numero_identification && 
                         !validateNumeroIdentification(formData.medecin.numero_identification, identificationType) && (
                          <p className="text-red-500 text-xs">
                            {identificationType === 'CIN' 
                              ? "Le CIN doit être au format 1234-5678-9012" 
                              : "Le NIF doit contenir exactement 10 chiffres"}
                          </p>
                        )}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.medecin.telephone}
                          onChange={(e) => handleTelephoneChange(e.target.value)}
                          className={inputClass}
                          placeholder="Ex: +509 31 23 4567"
                          required
                        />
                        {formData.medecin.telephone && !validateTelephone(formData.medecin.telephone) && (
                          <p className="text-red-500 text-xs mt-1">
                            Format: +509 suivi de 8 chiffres (ex: +509 31 23 4567)
                          </p>
                        )}
                        {formData.medecin.telephone && validateTelephone(formData.medecin.telephone) && (
                          <p className="text-green-500 text-xs mt-1">
                            Format téléphone valide
                          </p>
                        )}
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
                          placeholder="dr.nom@hopital.ht"
                          required
                        />
                        {formData.medecin.email_professionnel && !validateEmail(formData.medecin.email_professionnel) && (
                          <p className="text-red-500 text-xs mt-1">
                            Format email invalide (ex: nom@domaine.com)
                          </p>
                        )}
                        {formData.medecin.email_professionnel && validateEmail(formData.medecin.email_professionnel) && (
                          <p className="text-green-500 text-xs mt-1">
                            Format email valide
                          </p>
                        )}
                      </div>
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
                      <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        <select
                          value={selectedSpecialite}
                          onChange={(e) => setSelectedSpecialite(e.target.value ? parseInt(e.target.value) : '')}
                          className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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

          {/* Footer fixe */}
          <div className="flex-none px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
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
    </div>
  );
};