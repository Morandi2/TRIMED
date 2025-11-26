import { 
  RendezVous, 
  RendezVousFormData, 
  RendezVousType,
  RendezVousStatut,
  RendezVousStats
} from '../types/RendezVousTypes';

// Service pou gestion rendez-vous
export class RendezVousService {
  private static instance: RendezVousService;
  private rendezVous: RendezVous[] = [];
  private types: RendezVousType[] = [];
  private statuts: RendezVousStatut[] = [];


  private constructor() {
    this.initializeData();
  }

  public static getInstance(): RendezVousService {
    if (!RendezVousService.instance) {
      RendezVousService.instance = new RendezVousService();
    }
    return RendezVousService.instance;
  }

  private initializeData() {
    // Initialize ak done test yo
    this.types = [
      {
        type_id: 1,
        tenant_id: 1,
        nom: "Consultation",
        description: "Consultation médicale générale"
      },
      {
        type_id: 2,
        tenant_id: 1,
        nom: "Contrôle",
        description: "Visite de contrôle"
      },
      {
        type_id: 3,
        tenant_id: 1,
        nom: "Urgence",
        description: "Consultation d'urgence"
      }
    ];

    this.statuts = [
      {
        statut_id: 1,
        tenant_id: 1,
        nom: "Programmé",
        description: "Rendez-vous programmé"
      },
      {
        statut_id: 2,
        tenant_id: 1,
        nom: "Confirmé",
        description: "Rendez-vous confirmé"
      },
      {
        statut_id: 3,
        tenant_id: 1,
        nom: "Terminé",
        description: "Rendez-vous terminé"
      },
      {
        statut_id: 4,
        tenant_id: 1,
        nom: "Annulé",
        description: "Rendez-vous annulé"
      }
    ];



    this.rendezVous = [
      {
        rendez_vous_id: 1,
        tenant_id: 1,
        patient_id: 1,
        medecin_id: 1,
        date_heure: "2024-01-15T09:00:00",
        type_id: 1,
        statut_id: 2,
        motif: "Douleur thoracique",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),

      }
    ];
  }

  // CRUD operations pou rendez-vous
  public creerRendezVous(data: RendezVousFormData, tenantId: number): { success: boolean; data?: RendezVous; errors?: string[] } {
    try {
      const errors = this.validateRendezVousData(data);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const newId = Math.max(...this.rendezVous.map(r => r.rendez_vous_id), 0) + 1;

      const newRendezVous: RendezVous = {
        rendez_vous_id: newId,
        tenant_id: tenantId,
        patient_id: data.patient_id,
        medecin_id: data.medecin_id,
        date_heure: data.date_heure,
        type_id: data.type_id,
        statut_id: data.statut_id,
        motif: data.motif,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.rendezVous.push(newRendezVous);
      return { success: true, data: newRendezVous };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la création du rendez-vous"] };
    }
  }

  public modifierRendezVous(id: number, data: RendezVousFormData): { success: boolean; data?: RendezVous; errors?: string[] } {
    try {
      const errors = this.validateRendezVousData(data);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const index = this.rendezVous.findIndex(r => r.rendez_vous_id === id);
      if (index === -1) {
        return { success: false, errors: ["Rendez-vous non trouvé"] };
      }

      this.rendezVous[index] = {
        ...this.rendezVous[index],
        patient_id: data.patient_id,
        medecin_id: data.medecin_id,
        date_heure: data.date_heure,
        type_id: data.type_id,
        statut_id: data.statut_id,
        motif: data.motif,
        updated_at: new Date().toISOString()
      };

      return { success: true, data: this.rendezVous[index] };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la modification du rendez-vous"] };
    }
  }

  public supprimerRendezVous(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.rendezVous.findIndex(r => r.rendez_vous_id === id);
      if (index === -1) {
        return { success: false, errors: ["Rendez-vous non trouvé"] };
      }

      this.rendezVous.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la suppression du rendez-vous"] };
    }
  }

  public obtenirRendezVous(id: number): RendezVous | null {
    return this.rendezVous.find(r => r.rendez_vous_id === id) || null;
  }

  public obtenirTousRendezVous(tenantId: number): RendezVous[] {
    return this.rendezVous.filter(r => r.tenant_id === tenantId);
  }

  // Types ak statuts operations
  public obtenirTypes(tenantId: number): RendezVousType[] {
    return this.types.filter(t => t.tenant_id === tenantId);
  }

  public obtenirStatuts(tenantId: number): RendezVousStatut[] {
    return this.statuts.filter(s => s.tenant_id === tenantId);
  }



  // Statistics
  public obtenirStatistiques(tenantId: number): RendezVousStats {
    const rendezVous = this.obtenirTousRendezVous(tenantId);
    const aujourdhui = new Date().toISOString().split('T')[0];
    const debutSemaine = this.getDebutSemaine();
    const finSemaine = this.getFinSemaine();
    
    const programmeStatut = this.statuts.find(s => s.nom === "Programmé");
    const confirmeStatut = this.statuts.find(s => s.nom === "Confirmé");
    const termineStatut = this.statuts.find(s => s.nom === "Terminé");
    const annuleStatut = this.statuts.find(s => s.nom === "Annulé");
    
    return {
      total: rendezVous.length,
      programme: rendezVous.filter(r => r.statut_id === programmeStatut?.statut_id).length,
      confirme: rendezVous.filter(r => r.statut_id === confirmeStatut?.statut_id).length,
      termine: rendezVous.filter(r => r.statut_id === termineStatut?.statut_id).length,
      annule: rendezVous.filter(r => r.statut_id === annuleStatut?.statut_id).length,
      aujourdhui: rendezVous.filter(r => r.date_heure.split('T')[0] === aujourdhui).length,
      cette_semaine: rendezVous.filter(r => {
        const dateRdv = r.date_heure.split('T')[0];
        return dateRdv >= debutSemaine && dateRdv <= finSemaine;
      }).length
    };
  }



  // Validation helpers
  private validateRendezVousData(data: RendezVousFormData): string[] {
    const errors: string[] = [];

    if (!data.patient_id) {
      errors.push("Le patient est obligatoire");
    }

    if (!data.medecin_id) {
      errors.push("Le médecin est obligatoire");
    }

    if (!data.date_heure) {
      errors.push("La date et l'heure sont obligatoires");
    } else {
      const dateRdv = new Date(data.date_heure);
      if (dateRdv < new Date()) {
        errors.push("La date ne peut pas être dans le passé");
      }
    }

    if (!data.motif?.trim()) {
      errors.push("Le motif de consultation est obligatoire");
    }

    return errors;
  }

  private getDebutSemaine(): string {
    const aujourd = new Date();
    const jour = aujourd.getDay();
    const diff = aujourd.getDate() - jour + (jour === 0 ? -6 : 1);
    const lundi = new Date(aujourd.setDate(diff));
    return lundi.toISOString().split('T')[0];
  }

  private getFinSemaine(): string {
    const aujourd = new Date();
    const jour = aujourd.getDay();
    const diff = aujourd.getDate() - jour + (jour === 0 ? 0 : 7);
    const dimanche = new Date(aujourd.setDate(diff));
    return dimanche.toISOString().split('T')[0];
  }
}

// Export singleton instance
export const rendezVousService = RendezVousService.getInstance();