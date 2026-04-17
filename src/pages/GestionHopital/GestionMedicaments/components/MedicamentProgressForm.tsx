import React, { useState, useEffect } from 'react';
import { medicamentService } from '../services/MedicamentService';
import {
  MedicamentFormData,
  Medicament,
  FORMES_PHARMACEUTIQUES,
  UNITES_STOCK,
  CLASSES_THERAPEUTIQUES,
  CONDITIONS_CONSERVATION
} from '../types/MedicamentTypes';

interface MedicamentProgressFormProps {
  tenantId: number;
  onSave: (formData: MedicamentFormData, isModifying: boolean) => Promise<void>;
  onClose: () => void;
  medicamentId?: number;
}

export const MedicamentProgressForm: React.FC<MedicamentProgressFormProps> = ({
  tenantId,
  onSave,
  onClose,
  medicamentId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MedicamentFormData>({
    nom: '',
    forme_pharmaceutique: 'Comprimé',
    dosage_standard: '',
    categorie: null,
    description: '',
    stock_actuel: 0,
    stock_minimum: 10,
    prix_unitaire: '0',
    necessite_ordonnance: false,
    actif: true,
    code_atc: '',
    dci: '',
    // UI Only/Legacy fields
    nom_commercial: '',
    laboratoire: '',
    substance_active: '',
    stock_maximum: 100,
    unite_stock: 'Boîte',
    quantite_par_unite: 1,
    conditionnement: '',
    code_cip: '',
    prix_achat: 0,
    prix_vente: 0,
    tva: 10,
    date_peremption: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_fabrication: '',
    pays_fabrication: ''
  });

  const [isModifying, setIsModifying] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadInitData = async () => {
      await medicamentService.loadCategories();
      setCategories(medicamentService.obtenirCategories());

      if (medicamentId) {
        setIsModifying(true);
        const medicament = await medicamentService.obtenirMedicament(medicamentId);
        if (medicament) {
          setFormData({
            nom: medicament.nom,
            forme_pharmaceutique: medicament.forme_pharmaceutique,
            dosage_standard: medicament.dosage_standard || '',
            categorie: medicament.categorie,
            description: medicament.description || '',
            stock_actuel: medicament.stock_actuel,
            stock_minimum: medicament.stock_minimum,
            prix_unitaire: medicament.prix_unitaire || '0',
            necessite_ordonnance: medicament.necessite_ordonnance,
            actif: medicament.actif,
            code_atc: medicament.code_atc || '',
            dci: medicament.dci || '',
            // Populate legacy fields if they existed in the response (optional)
            nom_commercial: (medicament as any).nom_commercial || '',
            laboratoire: (medicament as any).laboratoire || '',
            substance_active: (medicament as any).substance_active || '',
          } as any);
        }
      } else {
        setIsModifying(false);
      }
    };
    loadInitData();
  }, [medicamentId]);

  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep, true)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number, updateState: boolean = true): boolean => {
    let newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.nom) newErrors.nom = "Le nom du médicament est obligatoire";
      if (!formData.forme_pharmaceutique) newErrors.forme_pharmaceutique = "La forme pharmaceutique est obligatoire";
      if (!formData.dosage_standard) newErrors.dosage_standard = "Le dosage est obligatoire";
      
      isValid = Object.keys(newErrors).length === 0;
      if (updateState) {
        if (!isValid) setErrors(prev => ({ ...prev, ...newErrors }));
        else setErrors(prev => {
          const e = { ...prev };
          delete e.nom; delete e.forme_pharmaceutique; delete e.dosage_standard;
          return e;
        });
      }
      return isValid;
    }

    if (step === 2) {
      if (formData.stock_minimum < 0) newErrors.stock_minimum = "Le stock minimum ne peut être négatif";
      if (formData.stock_minimum === null || formData.stock_minimum === undefined || formData.stock_minimum.toString() === '') newErrors.stock_minimum = "Le stock minimum est obligatoire";
      
      if ((formData.stock_maximum ?? 0) < 1) newErrors.stock_maximum = "Le stock maximum doit être supérieur à 0";
      if (!formData.stock_maximum) newErrors.stock_maximum = "Le stock maximum est obligatoire";

      isValid = Object.keys(newErrors).length === 0;
      if (updateState) {
        if (!isValid) setErrors(prev => ({ ...prev, ...newErrors }));
        else setErrors(prev => {
          const e = { ...prev };
          delete e.stock_minimum; delete e.stock_maximum;
          return e;
        });
      }
      return isValid;
    }

    return true;
  };

  // Memoize validities to prevent computation in render and potential loop triggers
  const isStep1Valid = React.useMemo(() => validateStep(1, false), [formData.nom, formData.forme_pharmaceutique, formData.dosage_standard]);
  const isStep2Valid = React.useMemo(() => validateStep(2, false), [formData.stock_minimum, formData.stock_maximum]);
  const isStep3Valid = React.useMemo(() => validateStep(3, false), [formData.prix_unitaire]);
  
  const isCurrentStepValid = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateStep(currentStep, true);
  };

  const updateMedicamentField = (field: keyof MedicamentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setTouched({
      nom: true, forme_pharmaceutique: true, dosage_standard: true,
      stock_minimum: true, stock_maximum: true
    });
    
    if (validateStep(1, true) && validateStep(2, true) && validateStep(3, true) && !isSaving) {
      setIsSaving(true);
      try {
        await onSave(formData, isModifying);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du médicament:", error);
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
            onClick={() => setCurrentStep(step)}
            className={`flex flex-col items-center transition-all duration-200 ${step <= currentStep
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500'
              }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${step <= currentStep
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
            >
              {step}
            </div>
            <span className="text-xs mt-1 font-medium">
              {step === 1 && 'Général'}
              {step === 2 && 'Stock'}
              {step === 3 && 'Prix'}
              {step === 4 && 'Sécurité'}
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

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200";
  const errorInputClass = "w-full px-4 py-3 border border-red-500 dark:border-red-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-200";
  const errorTextClass = "text-red-500 dark:text-red-400 text-sm mt-1";

  return (
    <div className="w-full h-[90vh] flex flex-col">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isModifying ? 'Modifier le Médicament' : 'Ajouter un Médicament'} - Étape {currentStep}/{totalSteps}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Informations Générales</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du médicament <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => updateMedicamentField('nom', e.target.value)}
                      onBlur={() => handleFieldBlur('nom')}
                      placeholder="Ex: Paracétamol"
                      className={errors.nom && touched.nom ? errorInputClass : inputClass}
                      required
                    />
                    {errors.nom && touched.nom && (
                      <div className={errorTextClass}>{errors.nom}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom commercial
                    </label>
                    <input
                      type="text"
                      value={formData.nom_commercial}
                      onChange={(e) => updateMedicamentField('nom_commercial', e.target.value)}
                      placeholder="Ex: Doliprane"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Forme pharmaceutique <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.forme_pharmaceutique}
                      onChange={(e) => updateMedicamentField('forme_pharmaceutique', e.target.value)}
                      onBlur={() => handleFieldBlur('forme_pharmaceutique')}
                      className={errors.forme_pharmaceutique && touched.forme_pharmaceutique ? errorInputClass : inputClass}
                    >
                      {FORMES_PHARMACEUTIQUES.map(forme => (
                        <option key={forme} value={forme}>{forme}</option>
                      ))}
                    </select>
                    {errors.forme_pharmaceutique && touched.forme_pharmaceutique && (
                      <div className={errorTextClass}>{errors.forme_pharmaceutique}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dosage_standard}
                      onChange={(e) => updateMedicamentField('dosage_standard', e.target.value)}
                      onBlur={() => handleFieldBlur('dosage_standard')}
                      placeholder="Ex: 500mg, 10ml"
                      className={errors.dosage_standard && touched.dosage_standard ? errorInputClass : inputClass}
                      required
                    />
                    {errors.dosage_standard && touched.dosage_standard && (
                      <div className={errorTextClass}>{errors.dosage_standard}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.categorie || ''}
                      onChange={(e) => updateMedicamentField('categorie', e.target.value ? parseInt(e.target.value) : null)}
                      className={inputClass}
                    >
                      <option value="">Sélectionner une catégorie...</option>
                      {categories.map(cat => (
                        <option key={cat.categorie_id} value={cat.categorie_id}>{cat.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Laboratoire
                    </label>
                    <input
                      type="text"
                      value={formData.laboratoire}
                      onChange={(e) => updateMedicamentField('laboratoire', e.target.value)}
                      placeholder="Ex: Sanofi, Pfizer..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateMedicamentField('description', e.target.value)}
                    rows={3}
                    placeholder="Description du médicament, indications, contre-indications..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-6">Gestion du Stock</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock actuel
                    </label>
                    <input
                      type="number"
                      value={formData.stock_actuel}
                      onChange={(e) => updateMedicamentField('stock_actuel', parseInt(e.target.value) || 0)}
                      className={inputClass}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock minimum <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock_minimum}
                      onChange={(e) => updateMedicamentField('stock_minimum', parseInt(e.target.value))}
                      onBlur={() => handleFieldBlur('stock_minimum')}
                      className={errors.stock_minimum && touched.stock_minimum ? errorInputClass : inputClass}
                      min="0"
                    />
                    {errors.stock_minimum && touched.stock_minimum && (
                      <div className={errorTextClass}>{errors.stock_minimum}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock maximum <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock_maximum}
                      onChange={(e) => updateMedicamentField('stock_maximum', parseInt(e.target.value))}
                      onBlur={() => handleFieldBlur('stock_maximum')}
                      className={errors.stock_maximum && touched.stock_maximum ? errorInputClass : inputClass}
                      min="1"
                    />
                    {errors.stock_maximum && touched.stock_maximum && (
                      <div className={errorTextClass}>{errors.stock_maximum}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unité de stock
                    </label>
                    <select
                      value={formData.unite_stock}
                      onChange={(e) => updateMedicamentField('unite_stock', e.target.value)}
                      className={inputClass}
                    >
                      {UNITES_STOCK.map(unite => (
                        <option key={unite} value={unite}>{unite}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conditionnement
                    </label>
                    <input
                      type="text"
                      value={formData.conditionnement}
                      onChange={(e) => updateMedicamentField('conditionnement', e.target.value)}
                      placeholder="Ex: Boîte de 20 comprimés"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantité par unité
                    </label>
                    <input
                      type="number"
                      value={formData.quantite_par_unite}
                      onChange={(e) => updateMedicamentField('quantite_par_unite', parseInt(e.target.value) || 1)}
                      className={inputClass}
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-6">Informations Financières</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix unitaire (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.prix_unitaire}
                      onChange={(e) => updateMedicamentField('prix_unitaire', e.target.value)}
                      className={inputClass}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de péremption
                    </label>
                    <input
                      type="date"
                      value={formData.date_peremption}
                      onChange={(e) => updateMedicamentField('date_peremption', e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de fabrication
                    </label>
                    <input
                      type="date"
                      value={formData.date_fabrication}
                      onChange={(e) => updateMedicamentField('date_fabrication', e.target.value)}
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
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-6">Sécurité et Réglementation</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Classe thérapeutique
                    </label>
                    <select
                      value={formData.classe_therapeutique}
                      onChange={(e) => updateMedicamentField('classe_therapeutique', e.target.value)}
                      className={inputClass}
                    >
                      {CLASSES_THERAPEUTIQUES.map(classe => (
                        <option key={classe} value={classe}>{classe}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Conditions de conservation
                    </label>
                    <select
                      value={formData.conditions_conservation}
                      onChange={(e) => updateMedicamentField('conditions_conservation', e.target.value)}
                      className={inputClass}
                    >
                      {CONDITIONS_CONSERVATION.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Substance active
                    </label>
                    <input
                      type="text"
                      value={formData.substance_active}
                      onChange={(e) => updateMedicamentField('substance_active', e.target.value)}
                      placeholder="Ex: Paracétamol"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      DCI
                    </label>
                    <input
                      type="text"
                      value={formData.dci}
                      onChange={(e) => updateMedicamentField('dci', e.target.value)}
                      placeholder="Ex: Paracetamol"
                      className={inputClass}
                    />
                  </div>
                </div>

                  <div className="flex items-center gap-3 mt-6">
                    <input
                      type="checkbox"
                      id="besoinOrdonnance"
                      checked={formData.necessite_ordonnance}
                      onChange={(e) => updateMedicamentField('necessite_ordonnance', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="besoinOrdonnance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nécessite une ordonnance
                    </label>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="estActif"
                      checked={formData.actif}
                      onChange={(e) => updateMedicamentField('actif', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="estActif" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Médicament actif
                    </label>
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
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
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
                disabled={!validateStep(1, false) || !validateStep(2, false) || !validateStep(3, false) || isSaving}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${validateStep(1, false) && validateStep(2, false) && validateStep(3, false) && !isSaving
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
                disabled={!validateStep(currentStep, false)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${validateStep(currentStep, false)
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