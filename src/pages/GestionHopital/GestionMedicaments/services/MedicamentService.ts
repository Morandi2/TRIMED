/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi, { Medicament, MedicamentCategorie, MedicamentStatistiques } from '../../../../api/hospitalApi';
import {
  MedicamentFormData,
  MouvementFormData,
  MedicamentStats,
} from '../types/MedicamentTypes';

// Service pou gestion medicaments
export class MedicamentService {
  private static instance: MedicamentService;
  private _categories: MedicamentCategorie[] = [];

  private constructor() {}

  public static getInstance(): MedicamentService {
    if (!MedicamentService.instance) {
      MedicamentService.instance = new MedicamentService();
    }
    return MedicamentService.instance;
  }

  // CRUD operations pou medicaments
  public async creerMedicament(data: MedicamentFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const payload = {
        ...data,
        tenant: tenantId
      };
      const response = await hospitalApi.medicaments.create(payload as unknown as Medicament);
      return {
        success: response.success,
        data: (response as any).data,
        errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
      };
    } catch (error: any) {
      console.error("DEBUG CREATION MEDICAMENT ERROR:", error.response?.data);
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      return { success: false, errors: [errorMsg] };
    }
  }

  public async modifierMedicament(id: number, data: MedicamentFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const payload = { ...data, tenant: tenantId };
      const response = await hospitalApi.medicaments.update(id, payload as Partial<Medicament>);
      return {
        success: response.success,
        data: (response as any).data,
        errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  public async supprimerMedicament(id: number): Promise<{ success: boolean; errors?: string[] }> {
    const response = await hospitalApi.medicaments.delete(id);
    const success = response.success === true;
    return {
      success,
      errors: success ? undefined : [response.message || 'Erreur inconnue']
    };
  }

  public async obtenirMedicament(id: number): Promise<Medicament | null> {
    const response = await hospitalApi.medicaments.getById(id);
    return response.success ? response.data : null;
  }

  public async obtenirTousMedicaments(params?: any): Promise<Medicament[]> {
    const response = await hospitalApi.medicaments.getAll(params);
    if (response.success && response.data) {
      let rawData = response.data;
      if (rawData.data && typeof rawData.data === 'object') {
        if (rawData.data.results && Array.isArray(rawData.data.results)) {
          rawData = rawData.data.results;
        } else if (rawData.data.data && Array.isArray(rawData.data.data)) {
           rawData = rawData.data.data;
        } else if (Array.isArray(rawData.data)) {
          rawData = rawData.data;
        }
      } else if (rawData.results && Array.isArray(rawData.results)) {
        rawData = rawData.results;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      
      return Array.isArray(rawData) ? rawData : [];
    }
    return [];
  }

  // Mouvement stock operations
  public async creerMouvementStock(data: MouvementFormData): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      // Backend types: 'entree', 'sortie', 'ajustement', 'peremption'
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
      return {
        success: response.success,
        data: (response as any).data,
        errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  // Categories operations
  public async loadCategories(tenantId?: number) {
    const params = tenantId ? { tenant: tenantId } : {};
    const response = await hospitalApi.medicamentCategories.getAll(params as any);
    if (response.success) {
      this._categories = response.data.results || response.data;
    }
  }

  public obtenirCategories(): MedicamentCategorie[] {
    return this._categories;
  }

  public async creerCategorie(data: Partial<MedicamentCategorie>): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    const response = await hospitalApi.medicamentCategories.create(data as MedicamentCategorie);
    const success = response.success === true;
    return {
      success,
        data: (response as any).data,
      errors: success ? undefined : [response.message || 'Erreur inconnue']
    };
  }

  // Statistics
  public async obtenirStatistiques(tenantId?: number): Promise<MedicamentStats> {
    const params = tenantId ? { tenant: tenantId } : {};
    const response = await hospitalApi.medicaments.getStats(params as any);
    if (response.success) {
      const stats = response.data as MedicamentStatistiques;
      return {
        total: stats.total_medicaments,
        disponible: stats.medicaments_actifs - stats.medicaments_rupture - stats.medicaments_stock_faible,
        rupture: stats.medicaments_rupture,
        stock_bas: stats.medicaments_stock_faible,
        perime: stats.attention_requise?.filter(a => a.type === 'peremption').length || 0,
        valeur_stock: parseFloat(stats.valeur_stock_total.toString())
      };
    }
    return {
      total: 0,
      disponible: 0,
      rupture: 0,
      stock_bas: 0,
      perime: 0,
      valeur_stock: 0
    };
  }

  // Alertes
  public async obtenirAlertes(tenantId?: number): Promise<Medicament[]> {
    const params = tenantId ? { tenant: tenantId } : {};
    const [ruptures, bas] = await Promise.all([
      hospitalApi.medicaments.getRuptures(params as any),
      hospitalApi.medicaments.getStockBas(params as any)
    ]);
    
    const results: Medicament[] = [];
    if (ruptures.success) {
      const data = ruptures.data?.results ?? ruptures.data;
      if (Array.isArray(data)) results.push(...data);
    }
    if (bas.success) {
      const data = bas.data?.results ?? bas.data;
      if (Array.isArray(data)) results.push(...data);
    }
    
    return results;
  }
}

// Export singleton instance
export const medicamentService = MedicamentService.getInstance();
