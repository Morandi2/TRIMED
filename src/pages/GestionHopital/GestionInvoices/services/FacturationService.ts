/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi from '../../../../api/hospitalApi';

export const facturationService = {
  // Obtenir toutes les factures (invoices)
  obtenirFactures: async (params?: any) => {
    const response = await hospitalApi.facturation.invoices.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  },

  // Obtenir une facture par ID
  obtenirFacture: async (id: number) => {
    const response = await hospitalApi.facturation.invoices.getById(id);
    if (response.success) {
      return response.data;
    }
    return null;
  },

  // Obtenir tous les paiements
  obtenirPaiements: async (params?: any) => {
    const response = await hospitalApi.facturation.paiements.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  },

  // Obtenir les statistiques financières
  obtenirStatistiques: async () => {
    const response = await hospitalApi.facturation.paiements.getStats();
    if (response.success) {
      return response.data;
    }
    return null;
  },

  // Obtenir les tarifs de consultation
  obtenirTarifsConsultation: async (params?: any) => {
    const response = await hospitalApi.facturation.tarifs.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  },

  // Calculer un tarif spécifique
  calculerTarif: async (params: { specialite_id: number; urgenge?: boolean; nuit?: boolean; weekend?: boolean }) => {
    const response = await hospitalApi.facturation.tarifs.calculer(params);
    if (response.success) {
      return response.data;
    }
    return null;
  }
};
