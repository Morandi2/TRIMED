import { Invoice, InvoiceFormData, InvoiceStats, InvoiceStatut } from '../types/InvoiceTypes';

class InvoiceService {
  private invoices: Invoice[] = [];
  private nextId = 1;

  private statuts: InvoiceStatut[] = [
    { statut_id: 1, nom: 'Payé', description: 'Facture payée' },
    { statut_id: 2, nom: 'En attente', description: 'Facture en attente' },
    { statut_id: 3, nom: 'Annulé', description: 'Facture annulée' }
  ];

  obtenirToutesInvoices(tenantId: number): Invoice[] {
    return this.invoices.filter(i => i.tenant_id === tenantId);
  }

  creerInvoice(data: InvoiceFormData): { success: boolean; invoice?: Invoice; errors?: string[] } {
    try {
      const nouvelleInvoice: Invoice = {
        invoice_id: this.nextId++,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.invoices.push(nouvelleInvoice);
      return { success: true, invoice: nouvelleInvoice };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création de la facture'] };
    }
  }

  modifierInvoice(id: number, data: InvoiceFormData): { success: boolean; invoice?: Invoice; errors?: string[] } {
    try {
      const index = this.invoices.findIndex(i => i.invoice_id === id);
      if (index === -1) {
        return { success: false, errors: ['Facture non trouvée'] };
      }

      this.invoices[index] = {
        ...this.invoices[index],
        ...data,
        updated_at: new Date().toISOString()
      };

      return { success: true, invoice: this.invoices[index] };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la modification de la facture'] };
    }
  }

  supprimerInvoice(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.invoices.findIndex(i => i.invoice_id === id);
      if (index === -1) {
        return { success: false, errors: ['Facture non trouvée'] };
      }

      this.invoices.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la suppression de la facture'] };
    }
  }

  obtenirStatistiques(tenantId: number): InvoiceStats {
    const invoices = this.obtenirToutesInvoices(tenantId);

    return {
      total: invoices.length,
      paye: invoices.filter(i => i.statut_id === 1).length,
      en_attente: invoices.filter(i => i.statut_id === 2).length,
      annule: invoices.filter(i => i.statut_id === 3).length,
      montant_total: invoices.reduce((sum, i) => sum + i.montant, 0)
    };
  }

  obtenirStatuts(): InvoiceStatut[] {
    return this.statuts;
  }
}

export const invoiceService = new InvoiceService();