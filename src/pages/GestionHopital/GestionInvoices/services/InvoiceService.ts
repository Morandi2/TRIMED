import hospitalApi from '../../../../api/hospitalApi';
import { Invoice, InvoiceFormData, InvoiceStats, InvoiceStatut } from '../types/InvoiceTypes';

class InvoiceService {
  private statuts: InvoiceStatut[] = [
    { statut_id: 1, nom: 'Payé', description: 'Facture payée' },
    { statut_id: 2, nom: 'En attente', description: 'Facture en attente' },
    { statut_id: 3, nom: 'Annulé', description: 'Facture annulée' }
  ];

  async obtenirToutesInvoices(tenantId: number): Promise<Invoice[]> {
    const response = await hospitalApi.facturation.invoices.getAll({ tenant: tenantId });
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  }

  async obtenirInvoice(id: number): Promise<Invoice | null> {
    const response = await hospitalApi.facturation.invoices.getById(id);
    if (response.success) {
      return response.data;
    }
    return null;
  }

  async creerInvoice(data: InvoiceFormData): Promise<{ success: boolean; data?: any; message?: string }> {
    // Note: Le backend gère la création via InvoiceViewSet si implémenté
    // Pour l'instant on utilise le point d'entrée générique
    const response = await (hospitalApi.facturation.invoices as any).create(data);
    return response;
  }

  async obtenirStatistiques(tenantId: number): Promise<InvoiceStats> {
    const response = await hospitalApi.facturation.paiements.getStats();
    if (response.success) {
      const stats = response.data;
      return {
        total: stats.total_paiements || 0,
        paye: stats.par_statut?.find((s: any) => s.statut__nom === 'payé')?.total || 0,
        en_attente: stats.par_statut?.find((s: any) => s.statut__nom === 'en attente')?.total || 0,
        annule: 0, // À adapter selon le backend
        montant_total: stats.montant_total || 0
      };
    }
    return { total: 0, paye: 0, en_attente: 0, annule: 0, montant_total: 0 };
  }

  obtenirStatuts(): InvoiceStatut[] {
    return this.statuts;
  }
}

export const invoiceService = new InvoiceService();