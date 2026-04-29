import React, { useState } from 'react';
import { Plus, Trash2, Building, LayoutGrid, ChevronRight, Hash } from 'lucide-react';
import { HospitalConfig, Branch, Department } from '../types/ConfigTypes';
import Button from '../../../../components/ui/button/Button';
import Label from '../../../../components/form/Label';
import Input from '../../../../components/form/input/InputField';

interface Props {
  config: Partial<HospitalConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

export const BranchConfigStep: React.FC<Props> = ({ config, setConfig }) => {
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const defaultDepartments: Department[] = [
    { nom: 'Urgences', type: 'urgence', lits_total: 10, lits_disponibles: 10, lits_icu: 2, rooms: [] },
    { nom: 'Médecine Générale', type: 'general', lits_total: 50, lits_disponibles: 50, chambres_privees: 10, rooms: [] },
    { nom: 'Chirurgie', type: 'chirurgie', lits_total: 30, lits_disponibles: 30, rooms: [] },
  ];

  const handleAddBranch = () => {
    setEditingBranch({
      nom: '',
      adresse: '',
      telephone: '',
      responsable: '',
      specialites: [],
      capacite_lits: 100,
      departements: defaultDepartments,
    });
    setShowBranchForm(true);
  };

  const handleSaveBranch = () => {
    if (editingBranch && editingBranch.nom) {
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hiérarchie Structurelle</h3>
          <p className="text-xs text-gray-500 mt-1">Définissez vos branches et départements médicaux.</p>
        </div>
        <Button
          onClick={handleAddBranch}
          className="px-4 py-2 text-xs flex items-center gap-2"
        >
          <Plus size={16} />
          Ajouter une Branche
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {(config.branches || []).map((branch, index) => (
          <div
            key={index}
            className="group relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-8 rounded-[2.5rem] shadow-xl shadow-black/5 hover:border-brand-500/50 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform duration-500">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{branch.nom}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                      <LayoutGrid size={12} />
                      {branch.departements.length} Départements
                    </span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                      <Hash size={12} />
                      Capacité: {branch.capacite_lits} Lits
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteBranch(index)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              {branch.departements.map((dept, i) => (
                <div key={i} className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between group/dept">
                   <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tighter">{dept.nom}</span>
                   <ChevronRight size={10} className="text-gray-300 group-hover/dept:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {(config.branches || []).length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Building size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune structure configurée pour le moment.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Ajoutez votre première branche pour commencer à configurer vos services.
            </p>
          </div>
        )}
      </div>

      {showBranchForm && editingBranch && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white dark:border-gray-800 rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-500">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Nouvelle Branche</h3>
            
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Identification</Label>
                <Input
                  name="branch_nom"
                  value={editingBranch.nom}
                  onChange={(e) => setEditingBranch({ ...editingBranch, nom: e.target.value })}
                  placeholder="Ex: Branche de Pétion-Ville"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Localisation</Label>
                <Input
                  name="branch_adresse"
                  value={editingBranch.adresse}
                  onChange={(e) => setEditingBranch({ ...editingBranch, adresse: e.target.value })}
                  placeholder="Adresse complète..."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Capacité Lits</Label>
                  <Input
                    type="number"
                    value={editingBranch.capacite_lits}
                    onChange={(e) => setEditingBranch({ ...editingBranch, capacite_lits: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Départements par défaut</Label>
                  <div className="h-11 flex items-center px-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    {editingBranch.departements.length} Inclus
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button
                onClick={() => { setShowBranchForm(false); setEditingBranch(null); }}
                className="flex-1 py-4 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Annuler
              </button>
              <Button
                onClick={handleSaveBranch}
                className="flex-[2] py-4 shadow-xl shadow-brand-500/10"
              >
                Confirmer & Créer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
