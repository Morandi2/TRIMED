
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { patientService } from './PatientService';
import hospitalApi from '../../../../api/hospitalApi';

// Mock de hospitalApi
vi.mock('../../../../api/hospitalApi', () => ({
  __esModule: true,
  default: {
    patients: {
      getAll: vi.fn(),
      getDossierComplet: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

describe('PatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Isolation: le service est un singleton, on vide le cache entre les tests.
    patientService.invalidateCache();
  });

  describe('obtenirPatientsParHopital', () => {
    it('doit mapper correctement les données de patients depuis une réponse DRF paginée', async () => {
      const mockResponse = {
        success: true,
        data: {
          results: [
            {
              id: 1,
              last_name: 'Jean',
              first_name: 'Pierre',
              gender: 'M',
              birth_date: '1990-05-15T00:00:00Z', // Format ISO long
              phone: '+509 12 34 56 78',
              file_number: 'PAT-12345'
            }
          ]
        }
      };

      (hospitalApi.patients.getAll as any).mockResolvedValue(mockResponse);

      const result = await patientService.obtenirPatientsParHopital(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        patient_id: 1,
        nom: 'Jean',
        prenom: 'Pierre',
        sexe: 'M',
        date_naissance: '1990-05-15' // Doit être tronqué
      }));
    });

    it('doit lever une erreur en cas d\'échec (aucun cache disponible)', async () => {
      // Nouveau contrat: en cas d'échec sans cache, on propage l'erreur pour que
      // l'UI affiche un message clair au lieu d'un tableau vide silencieux.
      (hospitalApi.patients.getAll as any).mockResolvedValue({ success: false, message: 'Échec' });
      await expect(patientService.obtenirPatientsParHopital(1)).rejects.toThrow();
    });
  });

  describe('obtenirPatientComplet', () => {
    it('doit formater la date de naissance dans le dossier complet', async () => {
      const mockFullPatient = {
        success: true,
        data: {
          id: 1,
          nom: 'Jean',
          date_naissance: '1985-10-20T12:00:00Z',
          adresses: [{ ville: 'Port-au-Prince' }]
        }
      };

      (hospitalApi.patients.getDossierComplet as any).mockResolvedValue(mockFullPatient);

      const result = await patientService.obtenirPatientComplet(1);

      expect(result?.patient.date_naissance).toBe('1985-10-20');
      expect(result?.adresse.ville).toBe('Port-au-Prince');
    });
  });

  describe('creerPatientComplet', () => {
    it('doit nettoyer les champs uniques vides avant l\'envoi', async () => {
      const formData: any = {
        patient: { nom: 'Test', email: '', telephone: '' },
        adresse: {},
        contacts: [],
        assurances: [],
        allergies: [],
        antecedents: []
      };

      (hospitalApi.patients.create as any).mockResolvedValue({ success: true, data: { id: 10 } });

      await patientService.creerPatientComplet(formData, 1);

      const calledPayload = (hospitalApi.patients.create as any).mock.calls[0][0];
      
      expect(calledPayload).toHaveProperty('nom', 'Test');
      expect(calledPayload).not.toHaveProperty('email');
      expect(calledPayload).not.toHaveProperty('telephone');
      expect(calledPayload.hopital).toBe(1);
    });
  });

  describe('modifierPatientComplet', () => {
    it('doit utiliser PATCH et filtrer les champs autorisés', async () => {
      const formData: any = {
        patient: { 
          nom: 'Modifié', 
          prenom: 'Test', 
          date_creation: '2020-01-01', // Devrait être filtré
          inutile: 'data' // Devrait être filtré
        }
      };

      (hospitalApi.patients.update as any).mockResolvedValue({ success: true, data: { id: 1 } });

      await patientService.modifierPatientComplet(1, formData);

      const calledPayload = (hospitalApi.patients.update as any).mock.calls[0][1];
      
      expect(calledPayload).toHaveProperty('nom', 'Modifié');
      expect(calledPayload).toHaveProperty('prenom', 'Test');
      expect(calledPayload).not.toHaveProperty('date_creation');
      expect(calledPayload).not.toHaveProperty('inutile');
    });
  });
});
