import { 
  Paiement, 
  PaiementFormData, 
  PaiementStats, 
  MethodePaiement, 
  StatutPaiement 
} from '../types/PaiementTypes';

class PaiementService {
  private paiements: Paiement[] = [];
  private nextId = 1;

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

  obtenirTousPaiements(tenantId: number): Paiement[] {
    return this.paiements.filter(p => p.tenant_id === tenantId);
  }

  obtenirPaiementParId(id: number): Paiement | undefined {
    return this.paiements.find(p => p.paiement_id === id);
  }

  creerPaiement(data: PaiementFormData, tenantId: number): { success: boolean; paiement?: Paiement; errors?: string[] } {
    try {
      const nouveauPaiement: Paiement = {
        paiement_id: this.nextId++,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tenant_id: tenantId
      };

      this.paiements.push(nouveauPaiement);
      return { success: true, paiement: nouveauPaiement };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création du paiement'] };
    }
  }

  modifierPaiement(id: number, data: PaiementFormData): { success: boolean; paiement?: Paiement; errors?: string[] } {
    try {
      const index = this.paiements.findIndex(p => p.paiement_id === id);
      if (index === -1) {
        return { success: false, errors: ['Paiement non trouvé'] };
      }

      this.paiements[index] = {
        ...this.paiements[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      return { success: true, paiement: this.paiements[index] };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la modification du paiement'] };
    }
  }

  supprimerPaiement(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.paiements.findIndex(p => p.paiement_id === id);
      if (index === -1) {
        return { success: false, errors: ['Paiement non trouvé'] };
      }

      this.paiements.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la suppression du paiement'] };
    }
  }

  obtenirStatistiques(tenantId: number): PaiementStats {
    const paiements = this.obtenirTousPaiements(tenantId);
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    return {
      total: paiements.length,
      paye: paiements.filter(p => p.statut === 'Payé').length,
      en_attente: paiements.filter(p => p.statut === 'En attente').length,
      rembourse: paiements.filter(p => p.statut === 'Remboursé').length,
      montant_total: paiements.reduce((sum, p) => sum + p.montant, 0),
      montant_mois: paiements
        .filter(p => new Date(p.date_paiement) >= debutMois)
        .reduce((sum, p) => sum + p.montant, 0)
    };
  }

  obtenirMethodesPaiement(): MethodePaiement[] {
    return this.methodesPaiement.filter(m => m.actif);
  }

  obtenirStatutsPaiement(): StatutPaiement[] {
    return this.statutsPaiement;
  }
}

export const paiementService = new PaiementService();