import { describe, it, expect, vi, beforeEach } from 'vitest';
import { medecinService } from './MedecinService';
import hospitalApi from '../../../../api/hospitalApi';

// Mock de hospitalApi
vi.mock('../../../../api/hospitalApi', () => ({
  __esModule: true,
  default: {
    medecins: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

describe('MedecinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenirMedecinsParHopital', () => {
    it('doit mapper les données et trier par date de création décroissante', async () => {
      const mockResponse = {
        success: true,
        data: {
          results: [
            {
              id: 1,
              nom: 'Ancien',
              prenom: 'Doc',
              cree_le: '2023-01-01T10:00:00Z',
              date_naissance: '1980-01-01T00:00:00Z'
            },
            {
              id: 2,
              nom: 'Nouveau',
              prenom: 'Doc',
              cree_le: '2024-01-01T10:00:00Z',
              date_naissance: '1990-05-15T00:00:00Z'
            }
          ]
        }
      };

      (hospitalApi.medecins.getAll as any).mockResolvedValue(mockResponse);

      const result = await medecinService.obtenirMedecinsParHopital(1);

      expect(result).toHaveLength(2);
      // Le plus récent (id: 2) doit être en premier
      expect(result[0].medecin_id).toBe(2);
      expect(result[0].nom).toBe('Nouveau');
      // La date doit être tronquée
      expect(result[0].date_naissance).toBe('1990-05-15');
      
      expect(result[1].medecin_id).toBe(1);
      expect(result[1].nom).toBe('Ancien');
    });

    it('doit retourner un tableau vide en cas d\'échec', async () => {
      (hospitalApi.medecins.getAll as any).mockResolvedValue({ success: false });
      const result = await medecinService.obtenirMedecinsParHopital(1);
      expect(result).toEqual([]);
    });
  });

  describe('obtenirMedecin', () => {
    it('doit formater la date de naissance d\'un médecin', async () => {
      const mockMedecin = {
        success: true,
        data: {
          id: 5,
          nom: 'Test',
          date_naissance: '1975-12-25T08:00:00Z'
        }
      };

      (hospitalApi.medecins.getById as any).mockResolvedValue(mockMedecin);

      const result = await medecinService.obtenirMedecin(5);

      expect(result?.medecin_id).toBe(5);
      expect(result?.date_naissance).toBe('1975-12-25');
    });
  });

  describe('modifierMedecin', () => {
    it('doit nettoyer le payload avant l\'appel PATCH', async () => {
      const formData: any = {
        medecin: {
          medecin_id: 10,
          nom: 'Modifié',
          cree_le: '2023-01-01',
          created_at: '2023-01-01',
          specialite_principale: { id: 1, nom: 'Générale' }, // Objet complet
          telephone: '+509 33 33 3333'
        }
      };

      (hospitalApi.medecins.update as any).mockResolvedValue({ success: true, data: {} });

      await medecinService.modifierMedecin(10, formData);

      const calledPayload = (hospitalApi.medecins.update as any).mock.calls[0][1];
      
      // Doit contenir les champs modifiables
      expect(calledPayload).toHaveProperty('nom', 'Modifié');
      expect(calledPayload).toHaveProperty('telephone', '+509 33 33 3333');
      
      // Ne doit PAS contenir les champs IDs ou Read-only ou Objets complets
      expect(calledPayload).not.toHaveProperty('medecin_id');
      expect(calledPayload).not.toHaveProperty('cree_le');
      expect(calledPayload).not.toHaveProperty('created_at');
      expect(calledPayload).not.toHaveProperty('specialite_principale');
    });
  });
});
