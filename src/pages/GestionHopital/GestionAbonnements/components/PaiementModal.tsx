import React, { useState, useEffect } from 'react';
import { PaiementFormData, PaiementMethode, PaiementStatut } from '../types/AbonnementTypes';

interface PaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaiementFormData) => void;
  abonnementId: number;
  tenantId: number;
  methodes: PaiementMethode[];
  statuts: PaiementStatut[];
}

export const PaiementModal: React.FC<PaiementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  abonnementId,
  tenantId,
  methodes,
  statuts
}) => {
  const [formData, setFormData] = useState<PaiementFormData>({
    tenant_id: tenantId,
    abonnement_id: abonnementId,
    montant: 0,
    methode_id: 1,
    date_paiement: new Date().toISOString().split('T')[0],
    statut_id: 1,
    reference: ''
  });

  useEffect(() => {
    // Only update if IDs change to prevent infinite loops from array prop references
    setFormData(prev => {
      if (prev.tenant_id === tenantId && prev.abonnement_id === abonnementId) return prev;
      return {
        ...prev,
        tenant_id: tenantId,
        abonnement_id: abonnementId,
        methode_id: methodes[0]?.methode_id || 1,
        statut_id: statuts[0]?.statut_id || 1
      };
    });
  }, [abonnementId, tenantId]); // Only depend on stable IDs

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
            Nouveau paiement
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
                Montant *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.montant}
                onChange={(e) => setFormData(prev => ({ ...prev, montant: parseFloat(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Méthode de paiement *
              </label>
              <select
                required
                value={formData.methode_id}
                onChange={(e) => setFormData(prev => ({ ...prev, methode_id: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {methodes.map(methode => (
                  <option key={methode.methode_id} value={methode.methode_id}>
                    {methode.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de paiement *
              </label>
              <input
                type="date"
                required
                value={formData.date_paiement}
                onChange={(e) => setFormData(prev => ({ ...prev, date_paiement: e.target.value }))}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Référence
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
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
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};