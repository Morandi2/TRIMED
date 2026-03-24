import hospitalApi from '../../../../api/hospitalApi';
import {
  Paiement,
  PaiementFormData,
  PaiementStats,
  MethodePaiement,
  StatutPaiement
} from '../types/PaiementTypes';

class PaiementService {
  // Méthodes de paiement disponibles
  private methodesPaiement: MethodePaiement[] = [
    { methode_id: 1, nom: 'Espèces', actif: true },
    { methode_id: 2, nom: 'Carte bancaire', actif: true },
    { methode_id: 3, nom: 'Chèque', actif: true },
    { methode_id: 4, nom: 'Virement', actif: true },
    { methode_id: 5, nom: 'Assurance', actif: true }
  ];

  // Statuts de paiement disponibles
  private statutsPaiement: StatutPaiement[] = [
    { statut_id: 1, nom: 'Payé', couleur: 'success' },
    { statut_id: 2, nom: 'En attente', couleur: 'warning' },
    { statut_id: 3, nom: 'Remboursé', couleur: 'info' },
    { statut_id: 4, nom: 'Annulé', couleur: 'error' }
  ];

  async obtenirTousPaiements(tenantId: number): Promise<Paiement[]> {
    const response = await hospitalApi.facturation.paiements.getAll({ tenant: tenantId });
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  }

  async obtenirPaiementParId(id: number): Promise<Paiement | null> {
    // Note: Le backend n'a pas forcément de getById spécifique pour paiement dans views.py
    // mais on peut le rajouter si besoin ou filtrer la liste
    const response = await hospitalApi.facturation.paiements.getAll({ id });
    if (response.success && response.data.length > 0) {
      return response.data[0];
    }
    return null;
  }

  async creerPaiement(data: PaiementFormData, tenantId: number): Promise<{ success: boolean; data?: any; message?: string }> {
    const response = await (hospitalApi.facturation.paiements as any).create({ ...data, tenant: tenantId });
    return response;
  }

  async obtenirStatistiques(tenantId: number): Promise<PaiementStats> {
    const response = await hospitalApi.facturation.paiements.getStats();
    if (response.success) {
      const stats = response.data;
      return {
        total: stats.total_paiements || 0,
        paye: stats.par_statut?.find((s: any) => s.statut__nom === 'payé')?.total || 0,
        en_attente: stats.par_statut?.find((s: any) => s.statut__nom === 'en attente')?.total || 0,
        rembourse: 0,
        montant_total: stats.montant_total || 0,
        montant_mois: stats.montant_mois || 0
      };
    }
    return { total: 0, paye: 0, en_attente: 0, rembourse: 0, montant_total: 0, montant_mois: 0 };
  }

  obtenirMethodesPaiement(): MethodePaiement[] {
    return this.methodesPaiement.filter(m => m.actif);
  }

  obtenirStatutsPaiement(): StatutPaiement[] {
    return this.statutsPaiement;
  }
}

export const paiementService = new PaiementService();