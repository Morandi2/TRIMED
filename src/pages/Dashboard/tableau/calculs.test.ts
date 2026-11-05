import { describe, it, expect } from 'vitest';
import { parJour, parMois, prochains, repartitionAges, tauxOccupation, variation } from './calculs';

const maintenant = new Date(2026, 10, 1, 10, 0); // 1er novembre 2026, 10 h

describe('calculs du tableau de bord', () => {
  it('compte par jour sur une fenêtre glissante', () => {
    const { compte } = parJour(['2026-11-01T08:00:00', '2026-10-31T23:00:00', '2026-10-31T09:00:00', '2026-09-01T09:00:00'], 7, maintenant);
    expect(compte).toEqual([0, 0, 0, 0, 0, 2, 1]);
  });

  it('compte par mois et nomme les mois', () => {
    const { compte, libelles } = parMois(['2026-11-01', '2026-10-15', '2026-10-02', '2025-12-31'], 3, maintenant);
    expect(compte).toEqual([0, 2, 1]);
    expect(libelles).toEqual(['sept.', 'oct.', 'nov.']);
  });

  it('répartit les âges par tranche et ignore les âges inconnus', () => {
    expect(repartitionAges([3, 15, 30, 50, 80, null, undefined])).toEqual([1, 1, 1, 1, 1]);
  });

  it('calcule variation et occupation sans diviser par zéro', () => {
    expect(variation(12, 10)).toBe(20);
    expect(variation(5, 0)).toBeNull();
    expect(tauxOccupation(3, 4)).toBe(75);
    expect(tauxOccupation(0, 0)).toBe(0);
  });

  it('garde les prochains rendez-vous, du plus proche au plus lointain', () => {
    const rdv = [{ d: '2026-11-03T09:00:00' }, { d: '2026-10-30T09:00:00' }, { d: '2026-11-01T11:00:00' }];
    expect(prochains(rdv, (r) => r.d, 5, maintenant).map((r) => r.d)).toEqual(['2026-11-01T11:00:00', '2026-11-03T09:00:00']);
  });
});

describe('dates du serveur', () => {
  it('lit une date sans heure comme ce jour-là, heure locale', async () => {
    const { dateLocale } = await import('../../../utils/dates');
    const d = dateLocale('2026-11-01');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 1, 0]);
  });
});
