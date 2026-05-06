/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi, { Medicament, MedicamentCategorie, MedicamentStatistiques } from '../../../../api/hospitalApi';
import {
  MedicamentFormData,
  MouvementFormData,
  MedicamentStats,
} from '../types/MedicamentTypes';

interface MedicamentsCache {
  data: Medicament[];
  paramsStr: string;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;

// Service pou gestion medicaments
export class MedicamentService {
  private static instance: MedicamentService;
  private _categories: MedicamentCategorie[] = [];
  private medicamentsCache: MedicamentsCache | null = null;

  private constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('medicaments_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
          this.medicamentsCache = parsed;
        } else {
          localStorage.removeItem('medicaments_cache');
        }
      }
    } catch (e) {
      console.error('Erreur lecture localStorage medicaments', e);
    }
  }

  private saveCacheToStorage() {
    try {
      if (this.medicamentsCache) {
        localStorage.setItem('medicaments_cache', JSON.stringify(this.medicamentsCache));
      }
    } catch (e) {}
  }

  public invalidateCache(): void {
    this.medicamentsCache = null;
    try {
      localStorage.removeItem('medicaments_cache');
    } catch (e) {}
  }

  public static getInstance(): MedicamentService {
    if (!MedicamentService.instance) {
      MedicamentService.instance = new MedicamentService();
    }
    return MedicamentService.instance;
  }

  /**
   * Helper pou jwenn yon valè nan yon objè kèlkeswa kote l ye (Omni-Search)
   */
  private findField(obj: any, targetField: string | string[]): any {
    if (!obj || typeof obj !== 'object') return null;
    
    if (Array.isArray(targetField)) {
        for (const field of targetField) {
            const found = this.findField(obj, field);
            if (found !== undefined && found !== null) return found;
        }
        return null;
    }

    if (obj[targetField] !== undefined) return obj[targetField];

    // On évite de chercher les noms dans des objets qui ne sont pas le profil lui-même
    const restrictedKeys = ['hopital', 'user', 'tenant', 'pharmacie'];
    for (const key in obj) {
      if (typeof obj[key] === 'object' && !restrictedKeys.includes(key)) {
        const found = this.findField(obj[key], targetField);
        if (found !== undefined && found !== null) return found;
      }
    }
    return null;
  }

  /**
   * Normalizasyon done medikaman yo
   */
  public normaliserMedicament(m: any): Medicament {
    const find = (field: string | string[]) => this.findField(m, field);

    return {
      medicament_id: m.medicament_id || m.id || m.pk || find(['medicament_id', 'id']) || 0,
      nom_generique: m.nom_generique || find(['generic_name', 'nom_generique']) || '',
      nom_commercial: m.nom_commercial || find(['brand_name', 'name', 'nom_commercial']) || '',
      forme_galenique: m.forme_galenique || find(['dosage_form', 'forme_galenique', 'forme']) || '',
      dosage: m.dosage || find(['strength', 'dosage']) || '',
      quantite_en_stock: Number(m.quantite_en_stock || find(['stock_quantity', 'stock', 'quantite_en_stock']) || 0),
      seuil_alerte: Number(m.seuil_alerte || find(['reorder_level', 'seuil_alerte']) || 10),
      prix_unitaire: Number(m.prix_unitaire || find(['unit_price', 'price', 'prix_unitaire']) || 0),
      categorie_id: Number(m.categorie_id || m.categorie?.id || find(['category_id', 'categorie_id']) || 0),
      fabricant: m.fabricant || find(['manufacturer', 'fabricant']) || '',
      date_peremption: m.date_peremption || find(['expiry_date', 'date_peremption', 'peremption']) || '',
      cree_le: m.cree_le || find(['created_at', 'cree_le']) || '',
      ...m 
    };
  }

  public async creerMedicament(data: MedicamentFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const payload = { ...data, tenant: tenantId };
      const response: any = await hospitalApi.medicaments.create(payload as unknown as Medicament);
      
      let newMed = undefined;
      if (response.success && response.data) {
        newMed = this.normaliserMedicament(response.data);
        this.invalidateCache();
        
        // Ajout optimiste au cache pour affichage instantané
        if (this.medicamentsCache && Array.isArray(this.medicamentsCache.data)) {
          this.medicamentsCache.data.unshift(newMed);
        }
      }
      
      return {
        success: response.success,
        data: newMed,
        errors: response.success ? undefined : [response.message || "Erreur inconnue"]
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  public async modifierMedicament(id: number, data: MedicamentFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const payload = { ...data, tenant: tenantId };
      const response: any = await hospitalApi.medicaments.update(id, payload as Partial<Medicament>);
      
      let updatedMed = undefined;
      if (response.success && response.data) {
        updatedMed = this.normaliserMedicament(response.data);
        this.invalidateCache();
        
        // Mise à jour optimiste du cache
        if (this.medicamentsCache && Array.isArray(this.medicamentsCache.data)) {
          const index = this.medicamentsCache.data.findIndex(m => m.medicament_id === id);
          if (index !== -1) {
            this.medicamentsCache.data[index] = updatedMed;
          }
        }
      }
      
      return {
        success: response.success,
        data: updatedMed,
        errors: response.success ? undefined : [response.message || "Erreur inconnue"]
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  public async supprimerMedicament(id: number): Promise<{ success: boolean; errors?: string[] }> {
    const response = await hospitalApi.medicaments.delete(id);
    if (response.success) this.invalidateCache();
    return {
      success: response.success,
      errors: response.success ? undefined : [response.message || 'Erreur inconnue']
    };
  }

  public async obtenirMedicament(id: number): Promise<Medicament | null> {
    const response = await hospitalApi.medicaments.getById(id);
    return response.success ? this.normaliserMedicament(response.data) : null;
  }

  public async obtenirTousMedicaments(params?: any): Promise<Medicament[]> {
    const paramsStr = params ? JSON.stringify(params) : '';
    if (this.medicamentsCache && this.medicamentsCache.paramsStr === paramsStr) {
      if (Date.now() - this.medicamentsCache.fetchedAt < CACHE_TTL_MS) {
        return this.medicamentsCache.data;
      }
    }

    try {
      const response = await hospitalApi.medicaments.getAll({
        ordering: '-date_creation',
        page_size: 1000,
        ...params
      });
      if (!response.success || !response.data) return [];

      let results: any[] = [];
      const rawData = response.data;
      if (rawData.results) results = rawData.results;
      else if (rawData.data?.results) results = rawData.data.results;
      else if (Array.isArray(rawData.data)) results = rawData.data;
      else if (Array.isArray(rawData)) results = rawData;

      const sorted = results.map((m: any) => this.normaliserMedicament(m))
        .sort((a: any, b: any) => {
          const dA = a.cree_le ? new Date(a.cree_le).getTime() : 0;
          const dB = b.cree_le ? new Date(b.cree_le).getTime() : 0;
          return dB - dA;
        });

      this.medicamentsCache = {
        data: sorted,
        paramsStr,
        fetchedAt: Date.now()
      };
      this.saveCacheToStorage();

      return sorted;
    } catch (error) {
      return [];
    }
  }

  public async obtenirMouvements(tenantId: number): Promise<any[]> {
    // Return an empty array as a fallback to satisfy TypeScript and prevent runtime crashes if the dedicated endpoint isn't built yet
    return [];
  }

  public async creerMouvementStock(data: MouvementFormData): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const typeMap: Record<string, string> = {
        'Entrée': 'entree',
        'Sortie': 'sortie',
        'Ajustement': 'ajustement',
        'Péremption': 'peremption'
      };
      const payload = {
        type_mouvement: typeMap[data.type] || data.type.toLowerCase(),
        quantite: data.quantite,
        motif: data.motif,
        prix_unitaire: data.cout_unitaire?.toString()
      };
      const response = await hospitalApi.medicaments.updateStock(data.medicament_id, payload);
      if (response.success) this.invalidateCache();
      return {
        success: response.success,
        data: response.success ? response.data : undefined,
        errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  public async loadCategories(tenantId?: number) {
    const params = tenantId ? { tenant: tenantId } : {};
    const response = await hospitalApi.medicamentCategories.getAll(params as any);
    if (response.success && response.data) {
      this._categories = response.data.results || response.data;
    }
  }

  public obtenirCategories(): MedicamentCategorie[] {
    return this._categories;
  }

  public async creerCategorie(data: Partial<MedicamentCategorie>): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    const response = await hospitalApi.medicamentCategories.create(data as MedicamentCategorie);
    return {
      success: response.success,
      data: response.success ? response.data : undefined,
      errors: response.success ? undefined : [response.message || 'Erreur inconnue']
    };
  }

  public async obtenirStatistiques(tenantId?: number): Promise<MedicamentStats> {
    const params = tenantId ? { tenant: tenantId } : {};
    const response = await hospitalApi.medicaments.getStats(params as any);
    if (response.success && response.data) {
      const stats = response.data as MedicamentStatistiques;
      return {
        total: stats.total_medicaments || 0,
        disponible: (stats.medicaments_actifs || 0) - (stats.medicaments_rupture || 0),
        rupture: stats.medicaments_rupture || 0,
        stock_bas: stats.medicaments_stock_faible || 0,
        perime: stats.attention_requise?.filter(a => a.type === 'peremption').length || 0,
        valeur_stock: parseFloat((stats.valeur_stock_total || 0).toString())
      };
    }
    return { total: 0, disponible: 0, rupture: 0, stock_bas: 0, perime: 0, valeur_stock: 0 };
  }

  public async obtenirAlertes(tenantId?: number): Promise<Medicament[]> {
    const params = tenantId ? { tenant: tenantId } : {};
    const [ruptures, bas] = await Promise.all([
      hospitalApi.medicaments.getRuptures(params as any),
      hospitalApi.medicaments.getStockBas(params as any)
    ]);
    const results: Medicament[] = [];
    if (ruptures.success) {
      const d = ruptures.data?.results ?? ruptures.data;
      if (Array.isArray(d)) results.push(...d);
    }
    if (bas.success) {
      const d = bas.data?.results ?? bas.data;
      if (Array.isArray(d)) results.push(...d);
    }
    return results;
  }
}

export const medicamentService = MedicamentService.getInstance();
