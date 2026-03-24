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
  const [_errors, _setErrors] = useState<Record<string, string>>({});

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
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateMedicamentField = (field: keyof MedicamentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.nom && formData.forme_pharmaceutique && formData.dosage_standard);
      case 2:
        return (formData.stock_minimum ?? 0) >= 0;
      case 3:
        return true; // Simple for now
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (validateStep(1) && validateStep(2) && validateStep(3)) {
      await onSave(formData, isModifying);
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

  const inputClass = "w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500";

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
                      placeholder="Ex: Paracétamol"
                      className={inputClass}
                      required
                    />
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
                      className={inputClass}
                    >
                      {FORMES_PHARMACEUTIQUES.map(forme => (
                        <option key={forme} value={forme}>{forme}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dosage_standard}
                      onChange={(e) => updateMedicamentField('dosage_standard', e.target.value)}
                      placeholder="Ex: 500mg, 10ml"
                      className={inputClass}
                      required
                    />
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
                      onChange={(e) => updateMedicamentField('stock_minimum', parseInt(e.target.value) || 0)}
                      className={inputClass}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock maximum <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.stock_maximum}
                      onChange={(e) => updateMedicamentField('stock_maximum', parseInt(e.target.value) || 0)}
                      className={inputClass}
                      min="1"
                    />
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
                disabled={!validateStep(1) || !validateStep(2) || !validateStep(3)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${validateStep(1) && validateStep(2) && validateStep(3)
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
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${validateStep(currentStep)
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