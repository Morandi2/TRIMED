import { EssaiGratuit, EssaiFormData, EssaiStats } from '../types/EssaiTypes';

class EssaiService {
  private essais: EssaiGratuit[] = [];
  private nextId = 1;

  obtenirTousEssais(tenantId?: number): EssaiGratuit[] {
    return tenantId ? this.essais.filter(e => e.tenant_id === tenantId) : this.essais;
  }

  creerEssai(data: EssaiFormData): { success: boolean; essai?: EssaiGratuit; errors?: string[] } {
    try {
      const nouvelEssai: EssaiGratuit = {
        essai_id: this.nextId++,
        ...data
      };

      this.essais.push(nouvelEssai);
      return { success: true, essai: nouvelEssai };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la création de l\'essai'] };
    }
  }

  modifierEssai(id: number, data: EssaiFormData): { success: boolean; essai?: EssaiGratuit; errors?: string[] } {
    try {
      const index = this.essais.findIndex(e => e.essai_id === id);
      if (index === -1) {
        return { success: false, errors: ['Essai non trouvé'] };
      }

      this.essais[index] = {
        ...this.essais[index],
        ...data
      };

      return { success: true, essai: this.essais[index] };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la modification de l\'essai'] };
    }
  }

  supprimerEssai(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.essais.findIndex(e => e.essai_id === id);
      if (index === -1) {
        return { success: false, errors: ['Essai non trouvé'] };
      }

      this.essais.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ['Erreur lors de la suppression de l\'essai'] };
    }
  }

  obtenirStatistiques(): EssaiStats {
    const maintenant = new Date();

    return {
      total: this.essais.length,
      actif: this.essais.filter(e => e.statut_id === 1 && new Date(e.date_fin) > maintenant).length,
      expire: this.essais.filter(e => e.statut_id === 2 || new Date(e.date_fin) <= maintenant).length
    };
  }
}

export const essaiService = new EssaiService();