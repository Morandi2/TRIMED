import React, { useState, useEffect } from 'react';
import {
  RendezVousFormData,
  RendezVous,
  RendezVousType,
  RendezVousStatut
} from '../types/RendezVousTypes';

interface RendezVousModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: RendezVousFormData) => void;
  rendezVous?: RendezVous | null;
  types: RendezVousType[];
  statuts: RendezVousStatut[];
}

export const RendezVousModal: React.FC<RendezVousModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rendezVous,
  types,
  statuts
}) => {
  const [formData, setFormData] = useState<any>({
    patient_id: '',
    medecin_id: '',
    date_heure: new Date().toISOString().slice(0, 16),
    type_id: types[0]?.type_id || null,
    statut_id: statuts[0]?.statut_id || 1,
    motif: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rendezVous) {
      setFormData({
        patient_id: rendezVous.patient_id.toString(),
        medecin_id: rendezVous.medecin_id.toString(),
        date_heure: rendezVous.date_heure.slice(0, 16),
        type_id: rendezVous.type_id,
        statut_id: rendezVous.statut_id,
        motif: rendezVous.motif || ''
      });
    } else {
      setFormData({
        patient_id: 0,
        medecin_id: 0,
        date_heure: new Date().toISOString().slice(0, 16),
        type_id: types[0]?.type_id || null,
        statut_id: statuts[0]?.statut_id || 1,
        motif: ''
      });
    }
  }, [rendezVous, types, statuts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.patient_id.toString().trim()) newErrors.patient_id = "Patient requis";
    if (!formData.medecin_id.toString().trim()) newErrors.medecin_id = "Médecin requis";
    if (!formData.date_heure) newErrors.date_heure = "Date et heure requises";
    if (!formData.motif.trim()) newErrors.motif = "Motif requis";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const saveData = {
        ...formData,
        patient_id: parseInt(formData.patient_id) || 0,
        medecin_id: parseInt(formData.medecin_id) || 0
      };
      onSave(saveData);
    }
  };

  const updateField = (field: keyof RendezVousFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {rendezVous ? 'Modifier le Rendez-vous' : 'Ajouter un Rendez-vous'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.patient_id || ''}
                onChange={(e) => updateField('patient_id', e.target.value)}
                placeholder="Ex: 1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white ${errors.patient_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                required
              />
              {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Médecin ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.medecin_id || ''}
                onChange={(e) => updateField('medecin_id', e.target.value)}
                placeholder="Ex: 1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white ${errors.medecin_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                required
              />
              {errors.medecin_id && <p className="text-red-500 text-sm mt-1">{errors.medecin_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date et Heure <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.date_heure}
                onChange={(e) => updateField('date_heure', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white ${errors.date_heure ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                required
              />
              {errors.date_heure && <p className="text-red-500 text-sm mt-1">{errors.date_heure}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type_id || ''}
                onChange={(e) => updateField('type_id', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un type</option>
                {types.map(type => (
                  <option key={type.type_id} value={type.type_id}>{type.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.statut_id}
                onChange={(e) => updateField('statut_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white"
                required
              >
                {statuts.map(statut => (
                  <option key={statut.statut_id} value={statut.statut_id}>{statut.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motif <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => updateField('motif', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white ${errors.motif ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Décrivez le motif du rendez-vous..."
              required
            />
            {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {rendezVous ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};