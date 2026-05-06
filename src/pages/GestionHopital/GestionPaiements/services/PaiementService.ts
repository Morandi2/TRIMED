import hospitalApi from '../../../../api/hospitalApi';
import {
  Paiement,
  PaiementFormData,
  PaiementStats,
  MethodePaiement,
  StatutPaiement
} from '../types/PaiementTypes';

interface PaiementsCache {
  data: Paiement[];
  tenantId: number;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;

class PaiementService {
  private paiementsCache: PaiementsCache | null = null;
  
  constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('paiements_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
          this.paiementsCache = parsed;
        } else {
          localStorage.removeItem('paiements_cache');
        }
      }
    } catch (e) {}
  }

  private saveCacheToStorage() {
    try {
      if (this.paiementsCache) {
        localStorage.setItem('paiements_cache', JSON.stringify(this.paiementsCache));
      }
    } catch (e) {}
  }

  public invalidateCache(): void {
    this.paiementsCache = null;
    try {
      localStorage.removeItem('paiements_cache');
    } catch (e) {}
  }
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
    if (this.paiementsCache && this.paiementsCache.tenantId === tenantId) {
      if (Date.now() - this.paiementsCache.fetchedAt < CACHE_TTL_MS) {
        return this.paiementsCache.data;
      }
    }

    const response = await hospitalApi.facturation.paiements.getAll({ tenant: tenantId });
    if (response.success) {
      const data = response.data.results || response.data;
      this.paiementsCache = {
        data,
        tenantId,
        fetchedAt: Date.now()
      };
      this.saveCacheToStorage();
      return data;
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

  async creerPaiement(data: PaiementFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    const response = await (hospitalApi.facturation.paiements as any).create({ ...data, tenant: tenantId });
    
    if (response.success && response.data) {
      this.invalidateCache();
      
      // Optimistic cache update
      if (this.paiementsCache && Array.isArray(this.paiementsCache.data)) {
        this.paiementsCache.data.unshift(response.data);
      }
    }
    
    return response;
  }

  async modifierPaiement(id: number, data: PaiementFormData): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    const response = await (hospitalApi.facturation.paiements as any).update(id, data);
    
    if (response.success && response.data) {
      this.invalidateCache();
      
      // Optimistic cache update
      if (this.paiementsCache && Array.isArray(this.paiementsCache.data)) {
        const index = this.paiementsCache.data.findIndex(p => (p.paiement_id || (p as any).id) === id);
        if (index !== -1) {
          this.paiementsCache.data[index] = response.data;
        }
      }
    }
    
    return response;
  }

  async supprimerPaiement(id: number): Promise<{ success: boolean; errors?: string[] }> {
    const response = await (hospitalApi.facturation.paiements as any).delete(id);
    if (response.success) this.invalidateCache();
    return response;
  }

  async obtenirStatistiques(tenantId: number): Promise<PaiementStats> {
    const response = await hospitalApi.facturation.paiements.getStats({ tenant: tenantId });
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