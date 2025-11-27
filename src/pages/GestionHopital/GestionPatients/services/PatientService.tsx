 
// Interfaces TypeScript
export interface Patient {
  patient_id: number;
  hopital_id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  numero_dossier_medical: string;
  numero_identification_nationale?: string;
  telephone?: string;
  email?: string;
  groupe_sanguin?: string;
  cree_le: string;
  modifie_le: string;
}

export interface AdressePatient {
  adresse_id: number;
  patient_id: number;
  pays: string;
  departement: string;
  ville: string;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  code_postal: string;
  cree_le: string;
  modifie_le: string;
}

export interface PersonneAContacter {
  contact_id: number;
  patient_id: number;
  nom: string;
  telephone: string;
  relation: string;
  cree_le: string;
}

export interface AssurancePatient {
  assurance_id: number;
  patient_id: number;
  nom_assurance: string;
  numero_police: string;
  date_expiration: string;
  cree_le: string;
}

export interface AllergiePatient {
  allergie_id: number;
  patient_id: number;
  nom_allergie: string;
  description?: string;
  cree_le: string;
}

export interface AntecedentMedical {
  antecedent_id: number;
  patient_id: number;
  type_antecedent: 'maladie' | 'chirurgie' | 'autre';
  description: string;
  date_debut?: string;
  date_fin?: string;
  cree_le: string;
}

export interface PatientFormData {
  patient: Omit<Patient, 'patient_id' | 'hopital_id' | 'cree_le' | 'modifie_le' | 'numero_dossier_medical'>;
  adresse: Omit<AdressePatient, 'adresse_id' | 'patient_id' | 'cree_le' | 'modifie_le'>;
  contacts: Omit<PersonneAContacter, 'contact_id' | 'patient_id' | 'cree_le'>[];
  assurances: Omit<AssurancePatient, 'assurance_id' | 'patient_id' | 'cree_le'>[];
  allergies: Omit<AllergiePatient, 'allergie_id' | 'patient_id' | 'cree_le'>[];
  antecedents: Omit<AntecedentMedical, 'antecedent_id' | 'patient_id' | 'cree_le'>[];
}

export interface Hopital {
  tenant_id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

// Service de gestion des patients
export class PatientService {
  private patients: Patient[] = [];
  private adresses: AdressePatient[] = [];
  private contacts: PersonneAContacter[] = [];
  private assurances: AssurancePatient[] = [];
  private allergies: AllergiePatient[] = [];
  private antecedents: AntecedentMedical[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage() {
    try {
      const patientsData = localStorage.getItem('patients');
      const adressesData = localStorage.getItem('adresses_patient');
      const contactsData = localStorage.getItem('contacts_patient');
      const assurancesData = localStorage.getItem('assurances_patient');
      const allergiesData = localStorage.getItem('allergies_patient');
      const antecedentsData = localStorage.getItem('antecedents_patient');

      this.patients = patientsData ? JSON.parse(patientsData) : [];
      this.adresses = adressesData ? JSON.parse(adressesData) : [];
      this.contacts = contactsData ? JSON.parse(contactsData) : [];
      this.assurances = assurancesData ? JSON.parse(assurancesData) : [];
      this.allergies = allergiesData ? JSON.parse(allergiesData) : [];
      this.antecedents = antecedentsData ? JSON.parse(antecedentsData) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.patients = [];
      this.adresses = [];
      this.contacts = [];
      this.assurances = [];
      this.allergies = [];
      this.antecedents = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('patients', JSON.stringify(this.patients));
      localStorage.setItem('adresses_patient', JSON.stringify(this.adresses));
      localStorage.setItem('contacts_patient', JSON.stringify(this.contacts));
      localStorage.setItem('assurances_patient', JSON.stringify(this.assurances));
      localStorage.setItem('allergies_patient', JSON.stringify(this.allergies));
      localStorage.setItem('antecedents_patient', JSON.stringify(this.antecedents));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }

  private initializeSampleData() {
    if (this.patients.length === 0) {
      console.log('Initialisation des données exemple...');
      const samplePatients = [
        {
          patient_id: 1,
          hopital_id: 1,
          nom: "JEAN",
          prenom: "Pierre",
          date_naissance: "1985-03-15",
          sexe: 'M' as const,
          numero_dossier_medical: "H001P00001",
          numero_identification_nationale: "00123456789",
          telephone: "+50931234567",
          email: "pierre.jean@example.com",
          groupe_sanguin: "O+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        },
        {
          patient_id: 2,
          hopital_id: 1,
          nom: "LAURENT",
          prenom: "Marie",
          date_naissance: "1990-07-22",
          sexe: 'F' as const,
          numero_dossier_medical: "H001P00002",
          numero_identification_nationale: "00234567890",
          telephone: "+50942234567",
          email: "marie.laurent@example.com",
          groupe_sanguin: "A+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        },
        {
          patient_id: 3,
          hopital_id: 1,
          nom: "PIERRE",
          prenom: "Jean-Claude",
          date_naissance: "1978-11-30",
          sexe: 'M' as const,
          numero_dossier_medical: "H001P00003",
          numero_identification_nationale: "00345678901",
          telephone: "+50933214567",
          email: "jc.pierre@example.com",
          groupe_sanguin: "B+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        }
      ];

      this.patients = samplePatients;
      this.saveToStorage();
      console.log('Données exemple initialisées:', this.patients);
    }
  }

  creerPatientComplet(formData: PatientFormData, hopitalId: number): { success: boolean; data?: Patient; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.patient.nom?.trim()) errors.push("Nom est requis");
    if (!formData.patient.prenom?.trim()) errors.push("Prenom est requis");
    if (!formData.patient.date_naissance) errors.push("Date naissance est requise");

    // Validation NIF/CIN
    if (formData.patient.numero_identification_nationale) {
      const nifCin = formData.patient.numero_identification_nationale.replace(/\s/g, '');
      if (!/^\d{9,13}$/.test(nifCin)) {
        errors.push("Le NIF/CIN doit contenir entre 9 et 13 chiffres");
      }
    }

    if (errors.length > 0) return { success: false, errors };

    try {
      const nouveauPatient: Patient = {
        ...formData.patient,
        patient_id: Date.now(),
        hopital_id: hopitalId,
        numero_dossier_medical: this.genererNumeroDossierMedical(hopitalId),
        cree_le: new Date().toISOString(),
        modifie_le: new Date().toISOString()
      };
      this.patients.push(nouveauPatient);

      if (formData.adresse.adresse_ligne1) {
        const nouvelleAdresse: AdressePatient = {
          ...formData.adresse,
          adresse_id: Date.now() + 1,
          patient_id: nouveauPatient.patient_id,
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        };
        this.adresses.push(nouvelleAdresse);
      }

      formData.contacts.forEach(contact => {
        if (contact.nom && contact.telephone) {
          const nouveauContact: PersonneAContacter = {
            ...contact,
            contact_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.contacts.push(nouveauContact);
        }
      });

      formData.assurances.forEach(assurance => {
        if (assurance.nom_assurance) {
          const nouvelleAssurance: AssurancePatient = {
            ...assurance,
            assurance_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.assurances.push(nouvelleAssurance);
        }
      });

      formData.allergies.forEach(allergie => {
        if (allergie.nom_allergie) {
          const nouvelleAllergie: AllergiePatient = {
            ...allergie,
            allergie_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.allergies.push(nouvelleAllergie);
        }
      });

      formData.antecedents.forEach(antecedent => {
        if (antecedent.description) {
          const nouvelAntecedent: AntecedentMedical = {
            ...antecedent,
            antecedent_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.antecedents.push(nouvelAntecedent);
        }
      });

      this.saveToStorage();
      return { success: true, data: nouveauPatient };

    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
      return { success: false, errors: ["Erreur lors de la création"] };
    }
  }

  obtenirPatientsParHopital(hopitalId: number): Patient[] {
    return this.patients.filter(p => p.hopital_id === hopitalId);
  }

  obtenirPatientComplet(patientId: number) {
    const patient = this.patients.find(p => p.patient_id === patientId);
    if (!patient) return null;

    const adresse = this.adresses.find(a => a.patient_id === patientId);
    const contacts = this.contacts.filter(c => c.patient_id === patientId);
    const assurances = this.assurances.filter(a => a.patient_id === patientId);
    const allergies = this.allergies.filter(a => a.patient_id === patientId);
    const antecedents = this.antecedents.filter(a => a.patient_id === patientId);

    return {
      patient,
      adresse,
      contacts,
      assurances,
      allergies,
      antecedents
    };
  }

  modifierPatientComplet(patientId: number, formData: PatientFormData): { success: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.patient.nom?.trim()) errors.push("Nom est requis");
    if (!formData.patient.prenom?.trim()) errors.push("Prenom est requis");
    if (!formData.patient.date_naissance) errors.push("Date naissance est requise");

    if (formData.patient.numero_identification_nationale) {
      const nifCin = formData.patient.numero_identification_nationale.replace(/\s/g, '');
      if (!/^\d{9,13}$/.test(nifCin)) {
        errors.push("Le NIF/CIN doit contenir entre 9 et 13 chiffres");
      }
    }

    if (errors.length > 0) return { success: false, errors };

    try {
      const patientIndex = this.patients.findIndex(p => p.patient_id === patientId);
      if (patientIndex === -1) return { success: false, errors: ["Patient non trouvé"] };

      // Conserver les données originales importantes
      const originalPatient = this.patients[patientIndex];
      
      // Mettre à jour le patient en conservant l'ID et les dates de création
      this.patients[patientIndex] = {
        ...originalPatient,
        ...formData.patient,
        patient_id: patientId, // Conserver l'ID original
        hopital_id: originalPatient.hopital_id, // Conserver l'hôpital original
        numero_dossier_medical: originalPatient.numero_dossier_medical, // Conserver le numéro de dossier
        cree_le: originalPatient.cree_le, // Conserver la date de création
        modifie_le: new Date().toISOString()
      };

      // Supprimer les anciennes données liées
      this.adresses = this.adresses.filter(a => a.patient_id !== patientId);
      this.contacts = this.contacts.filter(c => c.patient_id !== patientId);
      this.assurances = this.assurances.filter(a => a.patient_id !== patientId);
      this.allergies = this.allergies.filter(a => a.patient_id !== patientId);
      this.antecedents = this.antecedents.filter(a => a.patient_id !== patientId);

      // Ajouter les nouvelles données
      if (formData.adresse.adresse_ligne1) {
        const existingAdresse = this.adresses.find(a => a.patient_id === patientId);
        const nouvelleAdresse: AdressePatient = {
          ...formData.adresse,
          adresse_id: existingAdresse?.adresse_id || Date.now() + 1,
          patient_id: patientId,
          cree_le: existingAdresse?.cree_le || new Date().toISOString(),
          modifie_le: new Date().toISOString()
        };
        this.adresses.push(nouvelleAdresse);
      }

      formData.contacts.forEach((contact, index) => {
        if (contact.nom && contact.telephone) {
          const nouveauContact: PersonneAContacter = {
            ...contact,
            contact_id: Date.now() + index,
            patient_id: patientId,
            cree_le: new Date().toISOString()
          };
          this.contacts.push(nouveauContact);
        }
      });

      formData.assurances.forEach((assurance, index) => {
        if (assurance.nom_assurance) {
          const nouvelleAssurance: AssurancePatient = {
            ...assurance,
            assurance_id: Date.now() + index + 100,
            patient_id: patientId,
            cree_le: new Date().toISOString()
          };
          this.assurances.push(nouvelleAssurance);
        }
      });

      formData.allergies.forEach((allergie, index) => {
        if (allergie.nom_allergie) {
          const nouvelleAllergie: AllergiePatient = {
            ...allergie,
            allergie_id: Date.now() + index + 200,
            patient_id: patientId,
            cree_le: new Date().toISOString()
          };
          this.allergies.push(nouvelleAllergie);
        }
      });

      formData.antecedents.forEach((antecedent, index) => {
        if (antecedent.description) {
          const nouvelAntecedent: AntecedentMedical = {
            ...antecedent,
            antecedent_id: Date.now() + index + 300,
            patient_id: patientId,
            cree_le: new Date().toISOString()
          };
          this.antecedents.push(nouvelAntecedent);
        }
      });

      this.saveToStorage();
      return { success: true };

    } catch (error) {
      console.error('Erreur lors de la modification du patient:', error);
      return { success: false, errors: ["Erreur lors de la modification"] };
    }
  }

  supprimerPatient(patientId: number): boolean {
    const initialLength = this.patients.length;
    
    this.patients = this.patients.filter(p => p.patient_id !== patientId);
    this.adresses = this.adresses.filter(a => a.patient_id !== patientId);
    this.contacts = this.contacts.filter(c => c.patient_id !== patientId);
    this.assurances = this.assurances.filter(a => a.patient_id !== patientId);
    this.allergies = this.allergies.filter(a => a.patient_id !== patientId);
    this.antecedents = this.antecedents.filter(a => a.patient_id !== patientId);

    this.saveToStorage();
    return this.patients.length < initialLength;
  }

  genererNumeroDossierMedical(hopitalId: number): string {
    const patientsHopital = this.obtenirPatientsParHopital(hopitalId);
    const count = patientsHopital.length + 1;
    return `H${hopitalId.toString().padStart(3, '0')}P${count.toString().padStart(5, '0')}`;
  }
}

export const patientService = new PatientService();