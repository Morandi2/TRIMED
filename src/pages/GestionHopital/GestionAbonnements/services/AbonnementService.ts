import hospitalApi from '../../../../api/hospitalApi';
import {
  Abonnement,
  AbonnementFormData,
  AbonnementStats,
  AbonnementStatut,
  Paiement,
  PaiementFormData,
  PaiementMethode,
  PaiementStatut,
  Invoice
} from '../types/AbonnementTypes';
import { AbonnementRenouvellement, RenouvellementFormData, RenouvellementStats } from '../types/RenouvellementTypes';

class AbonnementService {
  // Statuts d'abonnement
  private statutsAbonnement: AbonnementStatut[] = [
    { statut_id: 1, nom: 'Actif', description: 'Abonnement actif' },
    { statut_id: 2, nom: 'Expiré', description: 'Abonnement expiré' },
    { statut_id: 3, nom: 'Suspendu', description: 'Abonnement suspendu' }
  ];

  // Abonnements
  async obtenirTousAbonnements(tenantId: number): Promise<Abonnement[]> {
    const response = await hospitalApi.abonnements.getAll({ tenant: tenantId });
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  }

  async obtenirAbonnementParId(id: number): Promise<Abonnement | null> {
    const response = await hospitalApi.abonnements.getById(id);
    if (response.success) {
      return response.data;
    }
    return null;
  }

  // Créer un abonnement
  async creerAbonnement(data: AbonnementFormData): Promise<{ success: boolean; data?: any; message?: string }> {
    const response = await hospitalApi.abonnements.create(data);
    return response;
  }

  async modifierAbonnement(id: number, data: AbonnementFormData): Promise<{ success: boolean; data?: any; message?: string }> {
    const response = await hospitalApi.abonnements.update(id, data);
    return response;
  }

  async supprimerAbonnement(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await hospitalApi.abonnements.delete(id);
    return response;
  }

  // Renouvellements
  async creerRenouvellement(data: any): Promise<{ success: boolean; data?: any; message?: string }> {
    const response = await hospitalApi.abonnements.renouveler(data.abonnement_id, { periode_mois: data.periode_mois || 1 });
    return response;
  }

  // Statistiques
  async obtenirStatistiques(tenantId: number): Promise<AbonnementStats> {
    const response = await hospitalApi.facturation.paiements.getStats();
    if (response.success) {
      const stats = response.data;
      return {
        total: 1, // Supposons 1 abonnement par hôpital pour simplifier
        actif: 1,
        expire: 0,
        suspendu: 0,
        revenus_total: stats.montant_total || 0,
        revenus_mois: stats.montant_mois || 0
      };
    }
    return { total: 0, actif: 0, expire: 0, suspendu: 0, revenus_total: 0, revenus_mois: 0 };
  }

  // Paiements
  async obtenirPaiementsParAbonnement(abonnementId: number): Promise<Paiement[]> {
    const response = await hospitalApi.facturation.paiements.getAll({ abonnement: abonnementId });
    if (response.success) {
      const data = response.data?.results ?? response.data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }

  async creerPaiement(data: PaiementFormData): Promise<{ success: boolean; data?: any; message?: string }> {
    const response = await hospitalApi.facturation.paiements.create(data);
    return response;
  }

  // Getters pour les données de référence
  obtenirStatutsAbonnement(): AbonnementStatut[] {
    return this.statutsAbonnement;
  }

  obtenirMethodesPaiement(): PaiementMethode[] {
    return [
      { methode_id: 1, nom: 'MonCash' },
      { methode_id: 2, nom: 'NatCash' },
      { methode_id: 3, nom: 'Visa' },
      { methode_id: 4, nom: 'MasterCard' },
      { methode_id: 5, nom: 'PayPal' },
      { methode_id: 6, nom: 'Virement Bancaire' }
    ];
  }

  obtenirStatutsPaiement(): PaiementStatut[] {
    return [
      { statut_id: 1, nom: 'Payé' },
      { statut_id: 2, nom: 'En attente' },
      { statut_id: 3, nom: 'Échoué' }
    ];
  }
}

export const abonnementService = new AbonnementService();