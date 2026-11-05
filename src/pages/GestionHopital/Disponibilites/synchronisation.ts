import apiClient from '../../../api/apiConfig';
import { lireTout } from '../../../api/listes';
import { corrections, type AdmissionActive } from './etats';

/**
 * Après une admission ou une sortie, aligne le statut enregistré des lits : « occupé » pour un lit
 * d’hospitalisation en cours, « nettoyage » pour un lit qui vient d’être libéré (le secrétariat le remet
 * « libre » une fois prêt). Les échecs sont ignorés : l’affichage reste juste, car il se fonde sur les admissions.
 */
export async function synchroniserLits(hopitalId: number) {
  try {
    const [chambres, lits, admissions] = await Promise.all([
      lireTout<{ id: number }>('/hospitalisation/chambres/', { tenant: hopitalId }, { sansCache: true }),
      lireTout<{ id: number; statut?: string; chambre: number }>('/hospitalisation/lits/', {}, { sansCache: true, maxPages: 50 }),
      lireTout<AdmissionActive>('/hospitalisation/admissions/', { statut: 'hospitalise' }, { sansCache: true }),
    ]);
    const ids = new Set(chambres.map((c) => c.id));
    const aCorriger = corrections(lits.filter((l) => ids.has(l.chambre)), admissions);
    await Promise.all(aCorriger.map((c) => apiClient.patch(`/hospitalisation/lits/${c.id}/`, { statut: c.statut }).catch(() => undefined)));
    return aCorriger.length;
  } catch {
    return 0;
  }
}
