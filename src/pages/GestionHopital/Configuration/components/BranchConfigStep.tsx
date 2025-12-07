import React, { useState } from 'react';
import { Plus, Trash2, Building } from 'lucide-react';
import { HospitalConfig, Branch, Department } from '../types/ConfigTypes';

interface Props {
  config: Partial<HospitalConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

export const BranchConfigStep: React.FC<Props> = ({ config, setConfig }) => {
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const defaultDepartments: Department[] = [
    { nom: 'Urgences', type: 'urgence', lits_total: 10, lits_disponibles: 10, lits_icu: 2 },
    { nom: 'Médecine Générale', type: 'general', lits_total: 50, lits_disponibles: 50, chambres_privees: 10 },
    { nom: 'Chirurgie', type: 'chirurgie', lits_total: 30, lits_disponibles: 30 },
    { nom: 'Pédiatrie', type: 'pediatrie', lits_total: 20, lits_disponibles: 20, lits_pediatrie: 20 },
  ];

  const handleAddBranch = () => {
    setEditingBranch({
      nom: '',
      adresse: '',
      telephone: '',
      responsable: '',
      specialites: [],
      capacite_lits: 0,
      departements: defaultDepartments,
    });
    setShowBranchForm(true);
  };

  const handleSaveBranch = () => {
    if (editingBranch) {
      const branches = config.branches || [];
      setConfig((prev) => ({
        ...prev,
        branches: [...branches, editingBranch],
      }));
      setShowBranchForm(false);
      setEditingBranch(null);
    }
  };

  const handleDeleteBranch = (index: number) => {
    const branches = config.branches || [];
    setConfig((prev) => ({
      ...prev,
      branches: branches.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Branches & Capacité
        </h2>
        <button
          onClick={handleAddBranch}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Branche
        </button>
      </div>

      {/* Liste des branches */}
      <div className="space-y-4">
        {(config.branches || []).map((branch, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{branch.nom}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{branch.adresse}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Responsable: {branch.responsable}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Capacité: {branch.capacite_lits} lits
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteBranch(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {(config.branches || []).length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Aucune branche configurée</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Cliquez sur "Ajouter une Branche" pour commencer
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout de branche */}
      {showBranchForm && editingBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Nouvelle Branche
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la Branche *
                </label>
                <input
                  type="text"
                  value={editingBranch.nom}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, nom: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ex: Branche Principale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={editingBranch.adresse}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, adresse: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ex: 123 Rue de l'Hôpital"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={editingBranch.telephone}
                    onChange={(e) =>
                      setEditingBranch({ ...editingBranch, telephone: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="+509 28 11 22 33"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsable *
                  </label>
                  <input
                    type="text"
                    value={editingBranch.responsable}
                    onChange={(e) =>
                      setEditingBranch({ ...editingBranch, responsable: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Dr. Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacité Totale (lits)
                </label>
                <input
                  type="number"
                  value={editingBranch.capacite_lits}
                  onChange={(e) =>
                    setEditingBranch({
                      ...editingBranch,
                      capacite_lits: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBranchForm(false);
                  setEditingBranch(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveBranch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
