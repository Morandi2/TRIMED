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
  rendez_vous_id?: number;
  date_consultation: string;
  motif: string;
  diagnostic_principal?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationFormData {
  consultation: Omit<Consultation, 'consultation_id' | 'tenant_id' | 'created_at' | 'updated_at'>;
}

export class ConsultationService {
  private consultations: Consultation[] = [];
  private patients: Patient[] = [];
  private medecins: Medecin[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage() {
    try {
      const consultationsData = localStorage.getItem('consultations');
      const patientsData = localStorage.getItem('patients');
      const medecinsData = localStorage.getItem('medecins');

      this.consultations = consultationsData ? JSON.parse(consultationsData) : [];
      this.patients = patientsData ? JSON.parse(patientsData) : [];
      this.medecins = medecinsData ? JSON.parse(medecinsData) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.consultations = [];
      this.patients = [];
      this.medecins = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('consultations', JSON.stringify(this.consultations));
      localStorage.setItem('patients', JSON.stringify(this.patients));
      localStorage.setItem('medecins', JSON.stringify(this.medecins));
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
      const timestamp = new Date().toISOString();
      this.consultations = [
        {
          consultation_id: 1,
          tenant_id: 1,
          patient_id: 1,
          medecin_id: 1,
          rendez_vous_id: undefined,
          date_consultation: "2024-01-15T09:00:00",
          motif: "Douleur thoracique",
          diagnostic_principal: "Hypertension artérielle",
          notes: "Patient stable, contrôle dans 1 mois",
          created_at: timestamp,
          updated_at: timestamp
        }
      ];
    }

    this.saveToStorage();
  }

  creerConsultation(formData: ConsultationFormData, _tenantId: number): { success: boolean; data?: Consultation; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.consultation.patient_id) errors.push("Patient est requis");
    if (!formData.consultation.medecin_id) errors.push("Médecin est requis");
    if (!formData.consultation.date_consultation) errors.push("Date de consultation est requise");
    if (!formData.consultation.motif?.trim()) errors.push("Motif de consultation est requis");
    
    // Vérifier que la date n'est pas dans le passé
    if (formData.consultation.date_consultation) {
      const consultationDate = new Date(formData.consultation.date_consultation);
      const currentDate = new Date();
      if (consultationDate < currentDate) {
        errors.push("La date de consultation ne peut pas être dans le passé");
      }
    }

    if (errors.length > 0) return { success: false, errors };

    try {
      const nouvelleConsultation: Consultation = {
        ...formData.consultation,
        consultation_id: Date.now(),
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.consultations.push(nouvelleConsultation);
      this.saveToStorage();
      return { success: true, data: nouvelleConsultation };
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      return { success: false, errors: ["Erreur lors de la création"] };
    }
  }

  obtenirConsultationsParTenant(_tenantId: number): Consultation[] {
    return this.consultations.filter(c => c.tenant_id === _tenantId);
  }

  obtenirConsultation(consultationId: number): Consultation | null {
    return this.consultations.find(c => c.consultation_id === consultationId) || null;
  }

  modifierConsultation(consultationId: number, formData: ConsultationFormData): { success: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.consultation.patient_id) errors.push("Patient est requis");
    if (!formData.consultation.medecin_id) errors.push("Médecin est requis");
    if (!formData.consultation.date_consultation) errors.push("Date de consultation est requise");
    if (!formData.consultation.motif?.trim()) errors.push("Motif de consultation est requis");
    
    // Vérifier que la date n'est pas dans le passé (sauf si c'est une consultation existante)
    if (formData.consultation.date_consultation) {
      const consultationDate = new Date(formData.consultation.date_consultation);
      const currentDate = new Date();
      const existingConsultation = this.obtenirConsultation(consultationId);
      
      // Permettre la modification si c'est la même date ou une date future
      if (consultationDate < currentDate && 
          (!existingConsultation || new Date(existingConsultation.date_consultation).getTime() !== consultationDate.getTime())) {
        errors.push("La date de consultation ne peut pas être dans le passé");
      }
    }

    if (errors.length > 0) return { success: false, errors };

    try {
      const consultationIndex = this.consultations.findIndex(c => c.consultation_id === consultationId);
      if (consultationIndex === -1) return { success: false, errors: ["Consultation non trouvée"] };

      const originalConsultation = this.consultations[consultationIndex];
      
      this.consultations[consultationIndex] = {
        ...originalConsultation,
        ...formData.consultation,
        consultation_id: consultationId,
        tenant_id: originalConsultation.tenant_id,
        created_at: originalConsultation.created_at,
        updated_at: new Date().toISOString()
      };

      this.saveToStorage();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la modification de la consultation:', error);
      return { success: false, errors: ["Erreur lors de la modification"] };
    }
  }

  supprimerConsultation(consultationId: number): boolean {
    const initialLength = this.consultations.length;
    this.consultations = this.consultations.filter(c => c.consultation_id !== consultationId);
    this.saveToStorage();
    return this.consultations.length < initialLength;
  }

  obtenirPatients(): Patient[] {
    return this.patients;
  }

  obtenirMedecins(): Medecin[] {
    return this.medecins;
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
}

export const consultationService = new ConsultationService();