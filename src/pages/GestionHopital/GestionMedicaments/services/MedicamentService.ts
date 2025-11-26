import { 
  Medicament, 
  MedicamentFormData, 
  MouvementStock, 
  MouvementFormData,
  MedicamentCategorie,
  MedicamentStats,
  STATUTS_MEDICAMENT 
} from '../types/MedicamentTypes';

// Service pou gestion medicaments
export class MedicamentService {
  private static instance: MedicamentService;
  private medicaments: Medicament[] = [];
  private mouvements: MouvementStock[] = [];
  private categories: MedicamentCategorie[] = [];

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): MedicamentService {
    if (!MedicamentService.instance) {
      MedicamentService.instance = new MedicamentService();
    }
    return MedicamentService.instance;
  }

  private initializeData() {
    // Initialize ak done test yo
    this.categories = [
      {
        categorie_id: 1,
        tenant_id: 1,
        nom: "Analgésique",
        description: "Médicaments contre la douleur",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        categorie_id: 2,
        tenant_id: 1,
        nom: "Antibiotique",
        description: "Médicaments contre les infections",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.medicaments = [
      {
        medicament_id: 1,
        tenant_id: 1,
        nom: "Paracétamol",
        forme_pharmaceutique: "Comprimé",
        dosage_standard: "500mg",
        categorie_id: 1,
        description: "Antalgique et antipyrétique",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        code: "MED20240001",
        nom_commercial: "Doliprane",
        laboratoire: "Sanofi",
        substance_active: "Paracétamol",
        dci: "Paracetamol",
        stock_actuel: 150,
        stock_minimum: 50,
        stock_maximum: 500,
        unite_stock: "Boîte",
        quantite_par_unite: 20,
        conditionnement: "Boîte de 20 comprimés",
        code_cip: "3400934567890",
        prix_achat: 2.50,
        prix_vente: 3.50,
        tva: 10,
        date_peremption: "2024-12-15",
        date_fabrication: "2023-12-15",
        date_entree_stock: "2024-01-20",
        statut: "Disponible",
        besoin_ordonnance: false,
        classe_therapeutique: "Classe A",
        conditions_conservation: "Ambiance",
        lot_number: "LOT12345",
        numero_autorisation: "AUT20240001",
        pays_fabrication: "France"
      }
    ];
  }

  // CRUD operations pou medicaments
  public creerMedicament(data: MedicamentFormData, tenantId: number): { success: boolean; data?: Medicament; errors?: string[] } {
    try {
      const errors = this.validateMedicamentData(data);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const newId = Math.max(...this.medicaments.map(m => m.medicament_id), 0) + 1;
      const code = `MED${new Date().getFullYear()}${String(newId).padStart(4, '0')}`;
      
      const statut = this.calculateStatut(data.stock_actuel || 0, data.stock_minimum || 0, data.date_peremption);

      const newMedicament: Medicament = {
        medicament_id: newId,
        tenant_id: tenantId,
        nom: data.nom,
        forme_pharmaceutique: data.forme_pharmaceutique,
        dosage_standard: data.dosage_standard,
        categorie_id: data.categorie_id,
        description: data.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        code,
        nom_commercial: data.nom_commercial,
        laboratoire: data.laboratoire,
        substance_active: data.substance_active,
        dci: data.dci,
        stock_actuel: data.stock_actuel || 0,
        stock_minimum: data.stock_minimum || 10,
        stock_maximum: data.stock_maximum || 100,
        unite_stock: data.unite_stock || "Boîte",
        quantite_par_unite: data.quantite_par_unite || 1,
        conditionnement: data.conditionnement,
        code_cip: data.code_cip,
        prix_achat: data.prix_achat || 0,
        prix_vente: data.prix_vente || 0,
        tva: data.tva || 10,
        date_peremption: data.date_peremption,
        date_fabrication: data.date_fabrication,
        date_entree_stock: new Date().toISOString().split('T')[0],
        statut,
        besoin_ordonnance: data.besoin_ordonnance || false,
        classe_therapeutique: data.classe_therapeutique || "Classe A",
        conditions_conservation: data.conditions_conservation || "Ambiance",
        lot_number: data.lot_number,
        numero_autorisation: data.numero_autorisation,
        pays_fabrication: data.pays_fabrication
      };

      this.medicaments.push(newMedicament);
      return { success: true, data: newMedicament };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la création du médicament"] };
    }
  }

  public modifierMedicament(id: number, data: MedicamentFormData): { success: boolean; data?: Medicament; errors?: string[] } {
    try {
      const errors = this.validateMedicamentData(data);
      if (errors.length > 0) {
        return { success: false, errors };
      }

      const index = this.medicaments.findIndex(m => m.medicament_id === id);
      if (index === -1) {
        return { success: false, errors: ["Médicament non trouvé"] };
      }

      const statut = this.calculateStatut(data.stock_actuel || 0, data.stock_minimum || 0, data.date_peremption);

      this.medicaments[index] = {
        ...this.medicaments[index],
        nom: data.nom,
        forme_pharmaceutique: data.forme_pharmaceutique,
        dosage_standard: data.dosage_standard,
        categorie_id: data.categorie_id,
        description: data.description,
        updated_at: new Date().toISOString(),
        nom_commercial: data.nom_commercial,
        laboratoire: data.laboratoire,
        substance_active: data.substance_active,
        dci: data.dci,
        stock_actuel: data.stock_actuel || 0,
        stock_minimum: data.stock_minimum || 10,
        stock_maximum: data.stock_maximum || 100,
        unite_stock: data.unite_stock || "Boîte",
        quantite_par_unite: data.quantite_par_unite || 1,
        conditionnement: data.conditionnement,
        code_cip: data.code_cip,
        prix_achat: data.prix_achat || 0,
        prix_vente: data.prix_vente || 0,
        tva: data.tva || 10,
        date_peremption: data.date_peremption,
        date_fabrication: data.date_fabrication,
        statut,
        besoin_ordonnance: data.besoin_ordonnance || false,
        classe_therapeutique: data.classe_therapeutique || "Classe A",
        conditions_conservation: data.conditions_conservation || "Ambiance",
        lot_number: data.lot_number,
        numero_autorisation: data.numero_autorisation,
        pays_fabrication: data.pays_fabrication
      };

      return { success: true, data: this.medicaments[index] };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la modification du médicament"] };
    }
  }

  public supprimerMedicament(id: number): { success: boolean; errors?: string[] } {
    try {
      const index = this.medicaments.findIndex(m => m.medicament_id === id);
      if (index === -1) {
        return { success: false, errors: ["Médicament non trouvé"] };
      }

      this.medicaments.splice(index, 1);
      return { success: true };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la suppression du médicament"] };
    }
  }

  public obtenirMedicament(id: number): Medicament | null {
    return this.medicaments.find(m => m.medicament_id === id) || null;
  }

  public obtenirTousMedicaments(tenantId: number): Medicament[] {
    return this.medicaments.filter(m => m.tenant_id === tenantId);
  }

  // Mouvement stock operations
  public creerMouvementStock(data: MouvementFormData, tenantId: number): { success: boolean; data?: MouvementStock; errors?: string[] } {
    try {
      const medicament = this.obtenirMedicament(data.medicament_id);
      if (!medicament) {
        return { success: false, errors: ["Médicament non trouvé"] };
      }

      const newId = Math.max(...this.mouvements.map(m => m.mouvement_id), 0) + 1;
      const reference = `${data.type === 'Entrée' ? 'ENT' : data.type === 'Sortie' ? 'SORT' : 'AJUST'}${new Date().getFullYear()}${String(newId).padStart(4, '0')}`;
      
      const stockAvant = medicament.stock_actuel || 0;
      let stockApres = stockAvant;

      if (data.type === 'Entrée') {
        stockApres = stockAvant + data.quantite;
      } else if (data.type === 'Sortie') {
        if (stockAvant < data.quantite) {
          return { success: false, errors: ["Stock insuffisant pour cette sortie"] };
        }
        stockApres = stockAvant - data.quantite;
      } else if (data.type === 'Ajustement') {
        stockApres = data.quantite;
      }

      const newMouvement: MouvementStock = {
        mouvement_id: newId,
        medicament_id: data.medicament_id,
        tenant_id: tenantId,
        type: data.type,
        quantite: data.quantite,
        date_mouvement: new Date().toISOString().split('T')[0],
        heure_mouvement: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        reference,
        motif: data.motif,
        utilisateur: data.utilisateur,
        stock_avant: stockAvant,
        stock_apres: stockApres,
        cout_unitaire: data.cout_unitaire,
        total: data.cout_unitaire ? data.cout_unitaire * data.quantite : 0,
        destination: data.destination,
        fournisseur: data.fournisseur,
        numero_lot: data.numero_lot,
        date_peremption: data.date_peremption,
        created_at: new Date().toISOString()
      };

      // Update medicament stock
      const medicamentIndex = this.medicaments.findIndex(m => m.medicament_id === data.medicament_id);
      if (medicamentIndex !== -1) {
        this.medicaments[medicamentIndex].stock_actuel = stockApres;
        this.medicaments[medicamentIndex].statut = this.calculateStatut(
          stockApres, 
          this.medicaments[medicamentIndex].stock_minimum || 0,
          this.medicaments[medicamentIndex].date_peremption
        );
        this.medicaments[medicamentIndex].updated_at = new Date().toISOString();
      }

      this.mouvements.push(newMouvement);
      return { success: true, data: newMouvement };
    } catch (_error) {
      return { success: false, errors: ["Erreur lors de la création du mouvement"] };
    }
  }

  public obtenirMouvements(tenantId: number): MouvementStock[] {
    return this.mouvements.filter(m => m.tenant_id === tenantId);
  }

  // Categories operations
  public obtenirCategories(tenantId: number): MedicamentCategorie[] {
    return this.categories.filter(c => c.tenant_id === tenantId);
  }

  // Statistics
  public obtenirStatistiques(tenantId: number): MedicamentStats {
    const medicaments = this.obtenirTousMedicaments(tenantId);
    
    return {
      total: medicaments.length,
      disponible: medicaments.filter(m => m.statut === "Disponible").length,
      rupture: medicaments.filter(m => m.statut === "Rupture").length,
      stock_bas: medicaments.filter(m => m.statut === "Stock bas").length,
      perime: medicaments.filter(m => m.statut === "Périmé").length,
      valeur_stock: medicaments.reduce((total, med) => 
        total + ((med.stock_actuel || 0) * (med.prix_achat || 0)), 0
      )
    };
  }

  // Alertes
  public obtenirAlertes(tenantId: number): Medicament[] {
    const medicaments = this.obtenirTousMedicaments(tenantId);
    const aujourdhui = new Date();
    const trenteJours = new Date(aujourdhui.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return medicaments.filter(med => {
      const datePeremption = med.date_peremption ? new Date(med.date_peremption) : null;
      
      return med.statut === "Stock bas" || 
             med.statut === "Rupture" || 
             med.statut === "Périmé" ||
             (datePeremption && datePeremption < trenteJours);
    });
  }

  // Validation helpers
  private validateMedicamentData(data: MedicamentFormData): string[] {
    const errors: string[] = [];

    if (!data.nom?.trim()) {
      errors.push("Le nom du médicament est obligatoire");
    }

    if (!data.forme_pharmaceutique?.trim()) {
      errors.push("La forme pharmaceutique est obligatoire");
    }

    if (!data.dosage_standard?.trim()) {
      errors.push("Le dosage est obligatoire");
    }

    if (data.stock_actuel !== undefined && data.stock_actuel < 0) {
      errors.push("Le stock ne peut pas être négatif");
    }

    if (data.stock_minimum !== undefined && data.stock_minimum < 0) {
      errors.push("Le stock minimum ne peut pas être négatif");
    }

    if (data.stock_maximum !== undefined && data.stock_minimum !== undefined && 
        data.stock_maximum <= data.stock_minimum) {
      errors.push("Le stock maximum doit être supérieur au stock minimum");
    }

    if (data.prix_achat !== undefined && data.prix_achat < 0) {
      errors.push("Le prix d'achat ne peut pas être négatif");
    }

    if (data.prix_vente !== undefined && data.prix_achat !== undefined && 
        data.prix_vente < data.prix_achat) {
      errors.push("Le prix de vente doit être supérieur ou égal au prix d'achat");
    }

    if (data.date_peremption) {
      const peremption = new Date(data.date_peremption);
      if (peremption < new Date()) {
        errors.push("La date de péremption ne peut pas être dans le passé");
      }
    }

    return errors;
  }

  private calculateStatut(stockActuel: number, stockMinimum: number, datePeremption?: string): "Disponible" | "Rupture" | "Stock bas" | "Périmé" | "Retiré" {
    // Check peremption premye
    if (datePeremption) {
      const peremption = new Date(datePeremption);
      if (peremption < new Date()) {
        return "Périmé";
      }
    }

    // Check stock levels
    if (stockActuel <= 0) {
      return "Rupture";
    } else if (stockActuel <= stockMinimum) {
      return "Stock bas";
    }

    return "Disponible";
  }
}

// Export singleton instance
export const medicamentService = MedicamentService.getInstance();