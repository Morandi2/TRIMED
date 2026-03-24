import React, { useState, useEffect } from 'react';
import { Abonnement, AbonnementFormData, AbonnementStatut } from '../types/AbonnementTypes';

interface AbonnementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AbonnementFormData) => void;
  abonnement?: Abonnement | null;
  statuts: AbonnementStatut[];
  tenantId: number;
}

export const AbonnementModal: React.FC<AbonnementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  abonnement,
  statuts,
  tenantId
}) => {
  const [formData, setFormData] = useState<AbonnementFormData>({
    tenant_id: tenantId,
    plan_id: 1,
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
    statut_id: 1
  });

  useEffect(() => {
    if (abonnement) {
      setFormData({
        tenant_id: abonnement.tenant_id,
        plan_id: abonnement.plan_id,
        date_debut: abonnement.date_debut.split('T')[0],
        date_fin: abonnement.date_fin.split('T')[0],
        statut_id: abonnement.statut_id
      });
    } else {
      const dateDebut = new Date();
      const dateFin = new Date();
      dateFin.setMonth(dateFin.getMonth() + 1);
      
      setFormData({
        tenant_id: tenantId,
        plan_id: 1,
        date_debut: dateDebut.toISOString().split('T')[0],
        date_fin: dateFin.toISOString().split('T')[0],
        statut_id: statuts[0]?.statut_id || 1
      });
    }
  }, [abonnement, statuts, tenantId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {abonnement ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant ID *
              </label>
              <input
                type="number"
                required
                value={formData.tenant_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan ID *
              </label>
              <select
                required
                value={formData.plan_id}
                onChange={(e) => setFormData(prev => ({ ...prev, plan_id: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>Plan Basique</option>
                <option value={2}>Plan Professionnel</option>
                <option value={3}>Plan Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                required
                value={formData.date_debut}
                onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                required
                value={formData.date_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut *
              </label>
              <select
                required
                value={formData.statut_id}
                onChange={(e) => setFormData(prev => ({ ...prev, statut_id: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {statuts.map(statut => (
                  <option key={statut.statut_id} value={statut.statut_id}>
                    {statut.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {abonnement ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};