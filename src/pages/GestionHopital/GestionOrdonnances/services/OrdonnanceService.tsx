export interface Patient {
  patient_id: number;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  date_naissance?: string;
  telephone?: string;
  adresse?: string;
  numero_identification?: string;
}

export interface Medecin {
  medecin_id: number;
  nom: string;
  prenom: string;
  specialite_principale_id?: number;
}

export interface Consultation {
  consultation_id: number;
  tenant_id: number;
  patient_id: number;
  medecin_id: number;
  date_consultation: string;
  motif: string;
}

export interface Prescription {
  id: number;
  medicament: string;
  dosage: string;
  duree: string;
  instructions: string;
}

export interface Ordonnance {
  ordonnance_id: number;
  tenant_id: number;
  consultation_id: number;
  patient_id: number;
  medecin_id: number;
  date_ordonnance: string;
  recommandations?: string;
  validite: string;
  prescriptions: Prescription[];
  created_at: string;
  updated_at: string;
}

export interface OrdonnanceFormData {
  ordonnance: Omit<Ordonnance, 'ordonnance_id' | 'tenant_id' | 'created_at' | 'updated_at'>;
}

export class OrdonnanceService {
  private ordonnances: Ordonnance[] = [];
  private patients: Patient[] = [];
  private medecins: Medecin[] = [];
  private consultations: Consultation[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage() {
    try {
      const ordonnancesData = localStorage.getItem('ordonnances');
      const patientsData = localStorage.getItem('patients');
      const medecinsData = localStorage.getItem('medecins');
      const consultationsData = localStorage.getItem('consultations');

      this.ordonnances = ordonnancesData ? JSON.parse(ordonnancesData) : [];
      this.patients = patientsData ? JSON.parse(patientsData) : [];
      this.medecins = medecinsData ? JSON.parse(medecinsData) : [];
      this.consultations = consultationsData ? JSON.parse(consultationsData) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.ordonnances = [];
      this.patients = [];
      this.medecins = [];
      this.consultations = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('ordonnances', JSON.stringify(this.ordonnances));
      localStorage.setItem('patients', JSON.stringify(this.patients));
      localStorage.setItem('medecins', JSON.stringify(this.medecins));
      localStorage.setItem('consultations', JSON.stringify(this.consultations));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }

  private initializeSampleData() {
    if (this.patients.length === 0) {
      this.patients = [
        {
          patient_id: 1,
          nom: "PIERRE",
          prenom: "Jean",
          sexe: 'M',
          date_naissance: "1985-03-15",
          telephone: "+50931234567",
          adresse: "Port-au-Prince, Haiti",
          numero_identification: "98765432101"
        },
        {
          patient_id: 2,
          nom: "JOSEPH",
          prenom: "Marie",
          sexe: 'F',
          date_naissance: "1990-07-22",
          telephone: "+50942234567",
          adresse: "Cap-Haïtien, Haiti",
          numero_identification: "87654321012"
        }
      ];
    }

    if (this.medecins.length === 0) {
      this.medecins = [
        {
          medecin_id: 1,
          nom: "DUPONT",
          prenom: "Jean",
          specialite_principale_id: 1
        },
        {
          medecin_id: 2,
          nom: "MARTIN",
          prenom: "Marie",
          specialite_principale_id: 2
        }
      ];
    }

    if (this.consultations.length === 0) {
      this.consultations = [
        {
          consultation_id: 1,
          tenant_id: 1,
          patient_id: 1,
          medecin_id: 1,
          date_consultation: "2024-01-15T09:00:00",
          motif: "Douleur thoracique"
        }
      ];
    }

    if (this.ordonnances.length === 0) {
      const timestamp = new Date().toISOString();
      this.ordonnances = [
        {
          ordonnance_id: 1,
          tenant_id: 1,
          consultation_id: 1,
          patient_id: 1,
          medecin_id: 1,
          date_ordonnance: "2024-01-15T09:30:00",
          recommandations: "Prendre avec de la nourriture",
          validite: "30 jours",
          prescriptions: [
            {
              id: 1,
              medicament: "Aspirine",
              dosage: "100 mg",
              duree: "30 jours",
              instructions: "1 comprimé par jour"
            }
          ],
          created_at: timestamp,
          updated_at: timestamp
        }
      ];
    }

    this.saveToStorage();
  }

  creerOrdonnance(formData: OrdonnanceFormData, _tenantId: number): { success: boolean; data?: Ordonnance; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.ordonnance.consultation_id) errors.push("Consultation est requise");
    if (!formData.ordonnance.patient_id) errors.push("Patient est requis");
    if (!formData.ordonnance.medecin_id) errors.push("Médecin est requis");
    if (!formData.ordonnance.date_ordonnance) errors.push("Date d'ordonnance est requise");
    if (!formData.ordonnance.validite?.trim()) errors.push("Validité est requise");

    if (errors.length > 0) return { success: false, errors };

    try {
      const nouvelleOrdonnance: Ordonnance = {
        ...formData.ordonnance,
        ordonnance_id: Date.now(),
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.ordonnances.push(nouvelleOrdonnance);
      this.saveToStorage();
      return { success: true, data: nouvelleOrdonnance };
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordonnance:', error);
      return { success: false, errors: ["Erreur lors de la création"] };
    }
  }

  obtenirOrdonnancesParTenant(_tenantId: number): Ordonnance[] {
    return this.ordonnances.filter(o => o.tenant_id === _tenantId);
  }

  obtenirOrdonnance(ordonnanceId: number): Ordonnance | null {
    return this.ordonnances.find(o => o.ordonnance_id === ordonnanceId) || null;
  }

  modifierOrdonnance(ordonnanceId: number, formData: OrdonnanceFormData): { success: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.ordonnance.consultation_id) errors.push("Consultation est requise");
    if (!formData.ordonnance.patient_id) errors.push("Patient est requis");
    if (!formData.ordonnance.medecin_id) errors.push("Médecin est requis");
    if (!formData.ordonnance.date_ordonnance) errors.push("Date d'ordonnance est requise");
    if (!formData.ordonnance.validite?.trim()) errors.push("Validité est requise");

    if (errors.length > 0) return { success: false, errors };

    try {
      const ordonnanceIndex = this.ordonnances.findIndex(o => o.ordonnance_id === ordonnanceId);
      if (ordonnanceIndex === -1) return { success: false, errors: ["Ordonnance non trouvée"] };

      const originalOrdonnance = this.ordonnances[ordonnanceIndex];
      
      this.ordonnances[ordonnanceIndex] = {
        ...originalOrdonnance,
        ...formData.ordonnance,
        ordonnance_id: ordonnanceId,
        tenant_id: originalOrdonnance.tenant_id,
        created_at: originalOrdonnance.created_at,
        updated_at: new Date().toISOString()
      };

      this.saveToStorage();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la modification de l\'ordonnance:', error);
      return { success: false, errors: ["Erreur lors de la modification"] };
    }
  }

  supprimerOrdonnance(ordonnanceId: number): boolean {
    const initialLength = this.ordonnances.length;
    this.ordonnances = this.ordonnances.filter(o => o.ordonnance_id !== ordonnanceId);
    this.saveToStorage();
    return this.ordonnances.length < initialLength;
  }

  obtenirPatients(): Patient[] {
    return this.patients;
  }

  obtenirMedecins(): Medecin[] {
    return this.medecins;
  }

  obtenirConsultations(): Consultation[] {
    return this.consultations;
  }

  obtenirNomPatient(patientId?: number): string {
    if (!patientId) return "Non spécifié";
    const patient = this.patients.find(p => p.patient_id === patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : "Non spécifié";
  }

  obtenirNomMedecin(medecinId?: number): string {
    if (!medecinId) return "Non spécifié";
    const medecin = this.medecins.find(m => m.medecin_id === medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : "Non spécifié";
  }

  obtenirConsultationInfo(consultationId?: number): string {
    if (!consultationId) return "Non spécifiée";
    const consultation = this.consultations.find(c => c.consultation_id === consultationId);
    if (!consultation) return "Non spécifiée";
    
    const patientNom = this.obtenirNomPatient(consultation.patient_id);
    const date = new Date(consultation.date_consultation).toLocaleDateString('fr-FR');
    return `${patientNom} - ${date}`;
  }
}

export const ordonnanceService = new OrdonnanceService();