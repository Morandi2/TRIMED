import { 
  RendezVous, 
  RendezVousFormData, 
  RendezVousType,
  RendezVousStatut,
  RendezVousStats,
  Patient,
  Medecin
} from '../types/RendezVousTypes';

// Service pou gestion rendez-vous
export class RendezVousService {
  private static instance: RendezVousService;
  private rendezVous: RendezVous[] = [];
  private types: RendezVousType[] = [];
  private statuts: RendezVousStatut[] = [];
  private patients: Patient[] = [];
  private medecins: Medecin[] = [];

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

    // Patients simule
    this.patients = [
      {
        patient_id: 1,
        nom: "Jean Dupont",
        email: "jean.dupont@email.com",
        telephone: "48123456",
        date_naissance: "1985-03-15",
        adresse: "123 Rue Principale, Port-au-Prince",
        assurance: "Assurance Santé Plus"
      },
      {
        patient_id: 2,
        nom: "Marie Laurent",
        email: "marie.laurent@email.com",
        telephone: "48234567",
        date_naissance: "1990-07-22",
        adresse: "456 Avenue Centrale, Pétion-Ville",
        assurance: "Médical Assurance"
      },
      {
        patient_id: 3,
        nom: "Pierre Michel",
        email: "pierre.michel@email.com",
        telephone: "48345678",
        date_naissance: "1978-11-30",
        adresse: "789 Boulevard des Fleurs, Delmas",
        assurance: "Santé Premium"
      },
      {
        patient_id: 4,
        nom: "Sophie Bernard",
        email: "sophie.bernard@email.com",
        telephone: "48456789",
        date_naissance: "1995-05-18",
        adresse: "321 Rue du Commerce, Carrefour",
        assurance: "Assurance Médicale"
      },
      {
        patient_id: 5,
        nom: "Luc Thomas",
        email: "luc.thomas@email.com",
        telephone: "48567890",
        date_naissance: "1982-09-12",
        adresse: "654 Avenue de la République, Cap-Haïtien",
        assurance: "Protection Santé"
      }
    ];

    // Medecins simule
    this.medecins = [
      {
        medecin_id: 1,
        nom: "Dr. Marie Cassandre",
        specialite: "Cardiologie",
        telephone: "48112233",
        email: "dr.cassandre@clinique.com",
        disponibilite: ["Lundi", "Mercredi", "Vendredi"]
      },
      {
        medecin_id: 2,
        nom: "Dr. Jean Baptiste",
        specialite: "Pédiatrie",
        telephone: "48223344",
        email: "dr.baptiste@clinique.com",
        disponibilite: ["Mardi", "Jeudi", "Samedi"]
      },
      {
        medecin_id: 3,
        nom: "Dr. Sarah Joseph",
        specialite: "Gynécologie",
        telephone: "48334455",
        email: "dr.joseph@clinique.com",
        disponibilite: ["Lundi", "Mardi", "Jeudi", "Vendredi"]
      },
      {
        medecin_id: 4,
        nom: "Dr. Marc Antoine",
        specialite: "Dermatologie",
        telephone: "48445566",
        email: "dr.antoine@clinique.com",
        disponibilite: ["Mercredi", "Jeudi", "Vendredi"]
      },
      {
        medecin_id: 5,
        nom: "Dr. Linda Pierre",
        specialite: "Ophtalmologie",
        telephone: "48556677",
        email: "dr.pierre@clinique.com",
        disponibilite: ["Lundi", "Mardi", "Mercredi"]
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
      console.log('Création rendez-vous avec données:', data);
      
      const errors = this.validateRendezVousData(data);
      if (errors.length > 0) {
        console.log('Erreurs validation:', errors);
        return { success: false, errors };
      }

      const newId = Math.max(...this.rendezVous.map(r => r.rendez_vous_id), 0) + 1;

      const newRendezVous: RendezVous = {
        rendez_vous_id: newId,
        tenant_id: tenantId,
        patient_id: data.patient_id || 0,
        medecin_id: data.medecin_id || 0,
        date_heure: data.date_heure,
        type_id: data.type_id || 1,
        statut_id: data.statut_id || 1,
        motif: data.motif || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Nouveau rendez-vous créé:', newRendezVous);
      this.rendezVous.push(newRendezVous);
      
      // Afficher tous les rendez-vous pour debug
      console.log('Tous les rendez-vous après création:', this.rendezVous);
      
      return { success: true, data: newRendezVous };
    } catch (error) {
      console.error('Erreur création:', error);
      return { success: false, errors: ["Erreur lors de la création du rendez-vous"] };
    }
  }

  public modifierRendezVous(id: number, data: RendezVousFormData): { success: boolean; data?: RendezVous; errors?: string[] } {
    try {
      console.log('Modification rendez-vous', id, 'avec données:', data);
      
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
        patient_id: data.patient_id || 0,
        medecin_id: data.medecin_id || 0,
        date_heure: data.date_heure,
        type_id: data.type_id || 1,
        statut_id: data.statut_id || 1,
        motif: data.motif || '',
        updated_at: new Date().toISOString()
      };

      console.log('Rendez-vous modifié:', this.rendezVous[index]);
      return { success: true, data: this.rendezVous[index] };
    } catch (error) {
      console.error('Erreur modification:', error);
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
      console.log('Rendez-vous supprimé:', id);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression:', error);
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

  // Operations pou patients ak medecins
  public rechercherPatients(term: string): Patient[] {
    if (!term.trim()) return [];
    
    return this.patients.filter(patient =>
      patient.nom.toLowerCase().includes(term.toLowerCase()) ||
      patient.telephone.includes(term) ||
      patient.email.toLowerCase().includes(term.toLowerCase())
    );
  }

  public rechercherMedecins(term: string): Medecin[] {
    if (!term.trim()) return [];
    
    return this.medecins.filter(medecin =>
      medecin.nom.toLowerCase().includes(term.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(term.toLowerCase()) ||
      medecin.telephone.includes(term)
    );
  }

  public obtenirPatientParId(id: number): Patient | null {
    return this.patients.find(p => p.patient_id === id) || null;
  }

  public obtenirMedecinParId(id: number): Medecin | null {
    return this.medecins.find(m => m.medecin_id === id) || null;
  }

  public obtenirPatientParTelephone(telephone: string): Patient | null {
    // Nettoyer le téléphone pour la recherche
    const cleanedPhone = this.cleanPhoneNumber(telephone);
    return this.patients.find(p => this.cleanPhoneNumber(p.telephone) === cleanedPhone) || null;
  }

  // Fonksyon pou netwaye nimewo telefòn
  public cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Retire tout karaktè ki pa nimewo
    const cleaned = phone.replace(/\D/g, '');
    
    // Si gen prefix 509, retire li
    if (cleaned.startsWith('509') && cleaned.length > 8) {
      return cleaned.substring(3);
    }
    
    // Si gen prefix +509, retire li
    if (cleaned.startsWith('509') && cleaned.length > 8) {
      return cleaned.substring(3);
    }
    
    return cleaned;
  }

  // Fonksyon pou fòmate nimewo telefòn pou afichaj
  public formatPhoneNumber(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone);
    
    if (cleaned.length === 8) {
      return `+509 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)}`;
    }
    
    return phone; // Retounen orijinal la si li pa gen bon longè
  }

  // Statistics
  public obtenirStatistiques(tenantId: number): RendezVousStats {
    const rendezVous = this.obtenirTousRendezVous(tenantId);
    const aujourdhui = new Date().toISOString().split('T')[0];
    const debutSemaine = this.getDebutSemaine();
    const finSemaine = this.getFinSemaine();
    
    return {
      total: rendezVous.length,
      programme: rendezVous.filter(r => r.statut_id === 1).length,
      confirme: rendezVous.filter(r => r.statut_id === 2).length,
      termine: rendezVous.filter(r => r.statut_id === 3).length,
      annule: rendezVous.filter(r => r.statut_id === 4).length,
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

    if (!data.patient_nom?.trim()) {
      errors.push("Le nom du patient est obligatoire");
    }

    if (!data.patient_phone?.trim()) {
      errors.push("Le téléphone du patient est obligatoire");
    } else if (!this.validatePhoneNumber(data.patient_phone)) {
      errors.push("Le format du téléphone est invalide. Il doit contenir 8 chiffres (ex: 48123456)");
    }

    if (!data.medecin_nom?.trim()) {
      errors.push("Le nom du médecin est obligatoire");
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

  private validatePhoneNumber(phone: string): boolean {
    // Validation pi fleksib pou nimewo telefòn 
    // Aksepte: +509, 509, oswa san prefix
    // Aksepte 8 chif, men pa oblije gen espas oswa tirè
    
    if (!phone || phone.trim() === '') return false;
    
    const cleanedPhone = phone.replace(/\s+/g, '').replace(/\+/g, '').replace(/-/g, '');
    
    // Si gen prefix 509, retire li
    let phoneDigits = cleanedPhone;
    if (cleanedPhone.startsWith('509')) {
      phoneDigits = cleanedPhone.substring(3);
    }
    
    // Verifye si se 8 chif sèlman epi kòmanse ak 3, 4, oswa 5
    const phoneRegex = /^[2-9][0-9]{7}$/;
    return phoneRegex.test(phoneDigits);
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