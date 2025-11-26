export interface Specialite {
  specialite_id: number;
  nom_specialite: string;
  description?: string;
}

export interface Medecin {
  medecin_id: number;
  hopital_id: number;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  date_naissance?: string;
  telephone?: string;
  email_professionnel?: string;
  numero_identification?: string;
  numero_matricule_professionnel?: string;
  specialite_principale_id?: number;
  specialites_secondaires?: number[];
  photo?: string;
  cree_le: string;
  modifie_le: string;
}

export interface MedecinFormData {
  medecin: Omit<Medecin, 'medecin_id' | 'hopital_id' | 'cree_le' | 'modifie_le'>;
}

export class MedecinService {
  private medecins: Medecin[] = [];
  private specialites: Specialite[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage() {
    try {
      const medecinsData = localStorage.getItem('medecins');
      const specialitesData = localStorage.getItem('specialites');

      this.medecins = medecinsData ? JSON.parse(medecinsData) : [];
      this.specialites = specialitesData ? JSON.parse(specialitesData) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.medecins = [];
      this.specialites = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('medecins', JSON.stringify(this.medecins));
      localStorage.setItem('specialites', JSON.stringify(this.specialites));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }

  private initializeSampleData() {
    if (this.specialites.length === 0) {
      this.specialites = [
        { specialite_id: 1, nom_specialite: "Cardiologie", description: "Spécialité du cœur" },
        { specialite_id: 2, nom_specialite: "Pédiatrie", description: "Médecine des enfants" },
        { specialite_id: 3, nom_specialite: "Chirurgie", description: "Chirurgie générale" },
        { specialite_id: 4, nom_specialite: "Neurologie", description: "Spécialité du système nerveux" }
      ];
    }

    if (this.medecins.length === 0) {
      this.medecins = [
        {
          medecin_id: 1,
          hopital_id: 1,
          nom: "DUPONT",
          prenom: "Jean",
          sexe: 'M',
          date_naissance: "1975-05-15",
          telephone: "+50931234567",
          email_professionnel: "dr.dupont@hopital.com",
          numero_identification: "12345678901",
          numero_matricule_professionnel: "MED001",
          specialite_principale_id: 1,
          specialites_secondaires: [3],
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        },
        {
          medecin_id: 2,
          hopital_id: 1,
          nom: "MARTIN",
          prenom: "Marie",
          sexe: 'F',
          date_naissance: "1980-08-22",
          telephone: "+50942234567",
          email_professionnel: "dr.martin@hopital.com",
          numero_identification: "23456789012",
          numero_matricule_professionnel: "MED002",
          specialite_principale_id: 2,
          specialites_secondaires: [],
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        }
      ];
    }

    this.saveToStorage();
  }

  creerMedecin(formData: MedecinFormData, hopitalId: number): { success: boolean; data?: Medecin; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.medecin.nom?.trim()) errors.push("Nom est requis");
    if (!formData.medecin.prenom?.trim()) errors.push("Prénom est requis");
    if (!formData.medecin.sexe) errors.push("Sexe est requis");

    if (errors.length > 0) return { success: false, errors };

    try {
      const nouveauMedecin: Medecin = {
        ...formData.medecin,
        medecin_id: Date.now(),
        hopital_id: hopitalId,
        cree_le: new Date().toISOString(),
        modifie_le: new Date().toISOString()
      };

      this.medecins.push(nouveauMedecin);
      this.saveToStorage();
      return { success: true, data: nouveauMedecin };
    } catch (error) {
      console.error('Erreur lors de la création du médecin:', error);
      return { success: false, errors: ["Erreur lors de la création"] };
    }
  }

  obtenirMedecinsParHopital(hopitalId: number): Medecin[] {
    return this.medecins.filter(m => m.hopital_id === hopitalId);
  }

  obtenirMedecin(medecinId: number): Medecin | null {
    return this.medecins.find(m => m.medecin_id === medecinId) || null;
  }

  modifierMedecin(medecinId: number, formData: MedecinFormData): { success: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.medecin.nom?.trim()) errors.push("Nom est requis");
    if (!formData.medecin.prenom?.trim()) errors.push("Prénom est requis");
    if (!formData.medecin.sexe) errors.push("Sexe est requis");

    if (errors.length > 0) return { success: false, errors };

    try {
      const medecinIndex = this.medecins.findIndex(m => m.medecin_id === medecinId);
      if (medecinIndex === -1) return { success: false, errors: ["Médecin non trouvé"] };

      const originalMedecin = this.medecins[medecinIndex];
      
      this.medecins[medecinIndex] = {
        ...originalMedecin,
        ...formData.medecin,
        medecin_id: medecinId,
        hopital_id: originalMedecin.hopital_id,
        cree_le: originalMedecin.cree_le,
        modifie_le: new Date().toISOString()
      };

      this.saveToStorage();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la modification du médecin:', error);
      return { success: false, errors: ["Erreur lors de la modification"] };
    }
  }

  supprimerMedecin(medecinId: number): boolean {
    const initialLength = this.medecins.length;
    this.medecins = this.medecins.filter(m => m.medecin_id !== medecinId);
    this.saveToStorage();
    return this.medecins.length < initialLength;
  }

  obtenirSpecialites(): Specialite[] {
    return this.specialites;
  }

  obtenirNomSpecialite(specialiteId?: number): string {
    if (!specialiteId) return "Non spécifiée";
    const specialite = this.specialites.find(s => s.specialite_id === specialiteId);
    return specialite?.nom_specialite || "Non spécifiée";
  }
}

export const medecinService = new MedecinService();