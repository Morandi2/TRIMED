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
  private abonnements: Abonnement[] = [];
  private paiements: Paiement[] = [];
  private invoices: Invoice[] = [];
  private renouvellements: AbonnementRenouvellement[] = [];
  private nextAbonnementId = 1;
  private nextPaiementId = 1;
  private nextInvoiceId = 1;
  private nextRenouvellementId = 1;

  // Statuts d'abonnement
  private statutsAbonnement: AbonnementStatut[] = [
    { statut_id: 1, nom: 'Actif', description: 'Abonnement actif' },
    { statut_id: 2, nom: 'Expiré', description: 'Abonnement expiré' },
    { statut_id: 3, nom: 'Suspendu', description: 'Abonnement suspendu' }
  ];

  // Méthodes de paiement
  private methodesPaiement: PaiementMethode[] = [
    { methode_id: 1, nom: 'Carte', description: 'Paiement par carte bancaire' },
    { methode_id: 2, nom: 'Mobile Money', description: 'Paiement mobile' },
    { methode_id: 3, nom: 'PayPal', description: 'Paiement PayPal' },
    { methode_id: 4, nom: 'Virement', description: 'Virement bancaire' }
  ];

  // Statuts de paiement
  private statutsPaiement: PaiementStatut[] = [
    { statut_id: 1, nom: 'Payé', description: 'Paiement effectué' },
    { statut_id: 2, nom: 'En attente', description: 'Paiement en attente' },
    { statut_id: 3, nom: 'Échoué', description: 'Paiement échoué' }
  ];

  // Abonnements
  obtenirTousAbonnements(tenantId: number): Abonnement[] {
    return this.abonnements.filter(a => a.tenant_id === tenantId);
  }

  obtenirAbonnementParId(id: number): Abonnement | undefined {
    return this.abonnements.find(a => a.abonnement_id === id);
  }

  creerAbonnement(data: AbonnementFormData): { success: boolean; abonnement?: Abonnement; errors?: string[] } {
    try {
      const nouvelAbonnement: Abonnement = {
        abonnement_id: this.nextAbonnementId++,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.abonnements.push(nouvelAbonnement);
      return { success: true, abonnement: nouvelAbonnement };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création de l\'abonnement'] };
    }
  }

  modifierAbonnement(id: number, data: AbonnementFormData): { success: boolean; abonnement?: Abonnement; errors?: string[] } {
    try {
      const index = this.abonnements.findIndex(a => a.abonnement_id === id);
      if (index === -1) {
        return { success: false, errors: ['Abonnement non trouvé'] };
      }

      this.abonnements[index] = {
        ...this.abonnements[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      return { success: true, abonnement: this.abonnements[index] };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la modification de l\'abonnement'] };
    }
  }

  supprimerAbonnement(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.abonnements.findIndex(a => a.abonnement_id === id);
      if (index === -1) { 
        return { success: false, errors: ['Abonnement non trouvé'] };
      }

      this.abonnements.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la suppression de l\'abonnement'] };
    }
  }

  // Paiements
  obtenirPaiementsParAbonnement(abonnementId: number): Paiement[] {
    return this.paiements.filter(p => p.abonnement_id === abonnementId);
  }

  creerPaiement(data: PaiementFormData): { success: boolean; paiement?: Paiement; errors?: string[] } {
    try {
      const nouveauPaiement: Paiement = {
        paiement_id: this.nextPaiementId++,
        ...data,
        created_at: new Date().toISOString()
      };

      this.paiements.push(nouveauPaiement);
      return { success: true, paiement: nouveauPaiement };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création du paiement'] };
    }
  }

  // Statistiques
  obtenirStatistiques(tenantId: number): AbonnementStats {
    const abonnements = this.obtenirTousAbonnements(tenantId);
    const paiements = this.paiements.filter(p => p.tenant_id === tenantId);
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    return {
      total: abonnements.length,
      actif: abonnements.filter(a => a.statut_id === 1).length,
      expire: abonnements.filter(a => a.statut_id === 2).length,
      suspendu: abonnements.filter(a => a.statut_id === 3).length,
      revenus_total: paiements.filter(p => p.statut_id === 1).reduce((sum, p) => sum + p.montant, 0),
      revenus_mois: paiements
        .filter(p => p.statut_id === 1 && new Date(p.date_paiement) >= debutMois)
        .reduce((sum, p) => sum + p.montant, 0)
    };
  }

  // Getters pour les données de référence
  obtenirStatutsAbonnement(): AbonnementStatut[] {
    return this.statutsAbonnement;
  }

  obtenirMethodesPaiement(): PaiementMethode[] {
    return this.methodesPaiement;
  }

  obtenirStatutsPaiement(): PaiementStatut[] {
    return this.statutsPaiement;
  }

  // Renouvellements
  creerRenouvellement(data: RenouvellementFormData): { success: boolean; renouvellement?: AbonnementRenouvellement; errors?: string[] } {
    try {
      const nouveauRenouvellement: AbonnementRenouvellement = {
        renouvellement_id: this.nextRenouvellementId++,
        ...data
      };

      this.renouvellements.push(nouveauRenouvellement);
      return { success: true, renouvellement: nouveauRenouvellement };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création du renouvellement'] };
    }
  }

  obtenirRenouvellements(abonnementId: number): AbonnementRenouvellement[] {
    return this.renouvellements.filter(r => r.abonnement_id === abonnementId);
  }

  obtenirStatistiquesRenouvellement(): RenouvellementStats {
    return {
      total: this.renouvellements.length,
      reussi: this.renouvellements.filter(r => r.statut_id === 1).length,
      echoue: this.renouvellements.filter(r => r.statut_id === 3).length,
      en_attente: this.renouvellements.filter(r => r.statut_id === 2).length
    };
  }
}

export const abonnementService = new AbonnementService();