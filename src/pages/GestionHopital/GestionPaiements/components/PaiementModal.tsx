import React, { useState, useEffect } from 'react';
import { Paiement, PaiementFormData, MethodePaiement, StatutPaiement } from '../types/PaiementTypes';

interface PaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaiementFormData) => Promise<void>;
  paiement?: Paiement | null;
  methodes: MethodePaiement[];
  statuts: StatutPaiement[];
}

export const PaiementModal: React.FC<PaiementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  paiement,
  methodes,
  statuts
}) => {
  const [formData, setFormData] = useState<PaiementFormData>({
    patient_id: 0,
    consultation_id: undefined,
    abonnement_id: 0,
    tenant_id: 0,
    montant: 0,
    methode_id: 0,
    statut_id: 0,
    methode_paiement: '',
    statut: '',
    date_paiement: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (paiement) {
      setFormData({
        patient_id: paiement.patient_id || 0,
        consultation_id: paiement.consultation_id,
        abonnement_id: paiement.abonnement_id,
        tenant_id: paiement.tenant_id,
        montant: paiement.montant,
        methode_id: paiement.methode_id,
        statut_id: paiement.statut_id,
        methode_paiement: paiement.methode_paiement,
        statut: paiement.statut,
        date_paiement: paiement.date_paiement ? paiement.date_paiement.split('T')[0] : new Date().toISOString().split('T')[0],
        reference: paiement.reference || '',
        notes: paiement.notes || ''
      });
    } else {
      setFormData({
        patient_id: 0,
        consultation_id: undefined,
        abonnement_id: 0,
        tenant_id: 0,
        montant: 0,
        methode_id: methodes[0]?.methode_id || 0,
        statut_id: statuts[0]?.statut_id || 0,
        methode_paiement: methodes[0]?.nom || '',
        statut: statuts[0]?.nom || '',
        date_paiement: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      });
    }
  }, [paiement, methodes, statuts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du paiement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {paiement ? 'Modifier le paiement' : 'Nouveau paiement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Patient *
              </label>
              <input
                type="number"
                required
                value={formData.patient_id}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_id: parseInt(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Consultation
              </label>
              <input
                type="number"
                value={formData.consultation_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

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
                value={formData.methode_paiement}
                onChange={(e) => {
                  const val = e.target.value;
                  const methode = methodes.find(m => m.nom === val);
                  setFormData(prev => ({
                    ...prev,
                    methode_paiement: val,
                    methode_id: methode ? methode.methode_id : prev.methode_id
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {methodes.map(methode => (
                  <option key={methode.methode_id} value={methode.nom}>
                    {methode.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut *
              </label>
              <select
                required
                value={formData.statut}
                onChange={(e) => {
                  const val = e.target.value;
                  const statutObj = statuts.find(s => s.nom === val);
                  setFormData(prev => ({
                    ...prev,
                    statut: val,
                    statut_id: statutObj ? statutObj.statut_id : prev.statut_id
                  }));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {statuts.map(statut => (
                  <option key={statut.statut_id} value={statut.nom}>
                    {statut.nom}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </>
              ) : (paiement ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};