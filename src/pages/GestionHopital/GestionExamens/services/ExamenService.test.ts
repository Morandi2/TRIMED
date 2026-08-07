import { describe, it, expect, vi, beforeEach } from 'vitest';
import { examenService } from './ExamenService';
import hospitalApi from '../../../../api/hospitalApi';

vi.mock('../../../../api/hospitalApi', () => ({
  __esModule: true,
  default: {
    examens: {
      getAll: vi.fn(),
      create: vi.fn(),
      updateResultat: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('ExamenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    examenService.invalidateCache();
  });

  describe('normaliserExamen', () => {
    it('normalise nom_examen, type_examen (catégorie) et ids', () => {
      const n = examenService.normaliserExamen({
        examen_id: 3,
        patient: 5,
        medecin_prescripteur: 7,
        consultation: 9,
        nom_examen: 'Radiographie thoracique',
        type_examen: 'radiologie',
        date_examen: '2026-01-01T10:00:00Z',
        resultat: 'RAS',
      });
      expect(n.examen_id).toBe(3);
      expect(n.patient_id).toBe(5);
      expect(n.medecin_prescripteur_id).toBe(7);
      expect(n.consultation_id).toBe(9);
      expect(n.nom_examen).toBe('Radiographie thoracique');
      expect(n.type_examen).toBe('radiologie');
      expect(n.resultat).toBe('RAS');
    });
  });

  describe('obtenirExamensParTenant', () => {
    it('charge et trie par date_examen décroissante', async () => {
      (hospitalApi.examens.getAll as any).mockResolvedValue({
        success: true,
        data: {
          results: [
            { examen_id: 1, nom_examen: 'A', date_examen: '2026-01-01T00:00:00Z' },
            { examen_id: 2, nom_examen: 'B', date_examen: '2026-02-01T00:00:00Z' },
          ],
        },
      });
      const res = await examenService.obtenirExamensParTenant(1);
      expect(res).toHaveLength(2);
      expect(res[0].examen_id).toBe(2);
    });

    it('lève une erreur en cas d\'échec sans cache', async () => {
      (hospitalApi.examens.getAll as any).mockResolvedValue({ success: false, message: 'Échec' });
      await expect(examenService.obtenirExamensParTenant(99)).rejects.toThrow();
    });
  });

  describe('prescrireExamen', () => {
    it('envoie nom_examen, date_examen, tenant et les champs requis', async () => {
      (hospitalApi.examens.create as any).mockResolvedValue({ success: true, data: { examen_id: 10, nom_examen: 'Radio' } });
      const res = await examenService.prescrireExamen(
        { patient: 5, medecin_prescripteur: 7, nom_examen: 'Radio', type_examen: 'radiologie', date_examen: '2026-01-01T10:00:00Z' },
        2
      );
      expect(res.success).toBe(true);
      const payload = (hospitalApi.examens.create as any).mock.calls[0][0];
      expect(payload).toEqual(expect.objectContaining({ patient: 5, nom_examen: 'Radio', type_examen: 'radiologie', tenant: 2 }));
      expect(payload.date_examen).toBeTruthy();
    });
  });

  describe('ajouterResultat', () => {
    it('transmet résultat et notes', async () => {
      (hospitalApi.examens.updateResultat as any).mockResolvedValue({ success: true });
      await examenService.ajouterResultat(4, 'RAS', 'note');
      const [id, data] = (hospitalApi.examens.updateResultat as any).mock.calls[0];
      expect(id).toBe(4);
      expect(data).toEqual(expect.objectContaining({ resultat: 'RAS', notes: 'note' }));
    });
  });
});
