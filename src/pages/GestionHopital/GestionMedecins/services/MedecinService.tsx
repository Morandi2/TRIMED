/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi from '../../../../api/hospitalApi';

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
  medecin: any;
}

export const medecinService = {
  // Obtenir tous les médecins
  obtenirMedecinsParHopital: async (hopitalId: number) => {
    const response = await hospitalApi.medecins.getAll({ hopital_id: hopitalId } as any);
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

      const medecins = Array.isArray(rawData) ? rawData : (rawData && typeof rawData === 'object' && (rawData.id || rawData.medecin_id) ? [rawData] : []);
      
      return medecins.map((m: any) => ({
        ...m, // PRESERVE ALL ORIGINAL FIELDS
        medecin_id: m.id || m.medecin_id || 0,
        nom: m.nom || m.last_name || m.nom || '',
        prenom: m.prenom || m.first_name || m.prenom || '',
        email_professionnel: m.email_professionnel || m.email || m.email_professionnel || '',
        telephone: m.telephone || m.phone || m.telephone || '',
        specialite_principale_id: m.specialite_principale_id || (m.specialite_principale ? m.specialite_principale.id : 0),
        statut: m.statut || 'Actif'
      }));
    }
    return [];
  },

  // Créer un médecin
  creerMedecin: async (formData: MedecinFormData, hopitalId: number) => {
    const payload = {
      ...formData.medecin,
      hopital_id: hopitalId
    };
    const response = await hospitalApi.medecins.create(payload);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [response.message]
    };
  },

  // Obtenir les spécialités
  obtenirSpecialites: async () => {
    console.log('Utilisation des spécialités par défaut (API non disponible)');
    return [
      { specialite_id: 1, nom_specialite: 'Médecine Générale' },
      { specialite_id: 2, nom_specialite: 'Pédiatrie' },
      { specialite_id: 3, nom_specialite: 'Gynécologie' },
      { specialite_id: 4, nom_specialite: 'Chirurgie' },
      { specialite_id: 5, nom_specialite: 'Cardiologie' },
      { specialite_id: 6, nom_specialite: 'Ophtalmologie' },
      { specialite_id: 7, nom_specialite: 'Dermatologie' },
      { specialite_id: 8, nom_specialite: 'Urologie' },
      { specialite_id: 9, nom_specialite: 'Neurologie' },
      { specialite_id: 10, nom_specialite: 'Psychiatrie' },
      { specialite_id: 11, nom_specialite: 'Orthopédie' },
      { specialite_id: 12, nom_specialite: 'Oncologie' }
    ];
  },

  // Obtenir yon sèl medsen pa ID
  obtenirMedecin: async (medecinId: number) => {
    const response = await hospitalApi.medecins.getById(medecinId);
    return response.success ? response.data : null;
  },

  // Modifier yon medsen
  modifierMedecin: async (medecinId: number, formData: MedecinFormData) => {
    const response = await hospitalApi.medecins.update(medecinId, formData.medecin);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [response.message]
    };
  },

  // Supprimer un médecin
  supprimerMedecin: async (medecinId: number) => {
    const response = await hospitalApi.medecins.delete(medecinId);
    return response.success;
  },

  // Helper pour obtenir le nom d'une spécialité (utile pour les tableaux)
  obtenirNomSpecialite: (specialiteId?: number, specialites: Specialite[] = []) => {
    if (!specialiteId) return 'Non spécifiée';
    const specialite = specialites.find(s => s.specialite_id === specialiteId);
    return specialite ? specialite.nom_specialite : 'Spécialité inconnue';
  }
};