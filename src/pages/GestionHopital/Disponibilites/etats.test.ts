import { describe, it, expect } from 'vitest';
import { corrections, etatLit, etatSalle, normaliserEtatLit, reservationsActives } from './etats';

const maintenant = new Date('2026-11-02T10:00:00');

describe('disponibilités des lits et des salles', () => {
  it('un lit avec une hospitalisation en cours est occupé automatiquement', () => {
    expect(etatLit({ id: 3, statut: 'libre' }, [{ lit: 3, statut: 'hospitalise' }])).toEqual({ etat: 'occupe', automatique: true });
    expect(etatLit({ id: 3, statut: 'libre' }, [{ lit: 3, statut: 'sorti' }])).toEqual({ etat: 'libre', automatique: false });
  });

  it('un lit noté occupé sans hospitalisation passe en nettoyage', () => {
    expect(etatLit({ id: 4, statut: 'occupe' }, []).etat).toBe('nettoyage');
  });

  it('lit les anciennes valeurs', () => {
    expect(normaliserEtatLit('disponible')).toBe('libre');
    expect(normaliserEtatLit('maintenance')).toBe('hors_service');
  });

  it('une salle réservée maintenant est réservée automatiquement', () => {
    const r = [{ id: 1, salle: 9, date_debut: '2026-11-02T09:30:00', date_fin: '2026-11-02T11:00:00', statut: 'confirmee', motif: 'Intervention' }];
    expect(etatSalle({ id: 9, statut: 'disponible' }, r, maintenant).etat).toBe('reservee');
    expect(etatSalle({ id: 9, statut: 'disponible' }, [{ ...r[0], statut: 'annulee' }], maintenant).etat).toBe('disponible');
    expect(etatSalle({ id: 9, statut: 'disponible' }, [{ ...r[0], motif: 'Nettoyage' }], maintenant).etat).toBe('nettoyage');
  });

  it('garde les réservations à venir dans l’ordre', () => {
    const r = [
      { id: 2, salle: 9, date_debut: '2026-11-02T15:00:00', date_fin: '2026-11-02T16:00:00' },
      { id: 1, salle: 9, date_debut: '2026-11-02T12:00:00', date_fin: '2026-11-02T13:00:00' },
      { id: 3, salle: 9, date_debut: '2026-11-01T12:00:00', date_fin: '2026-11-01T13:00:00' },
    ];
    expect(reservationsActives(9, r, maintenant).map((x) => x.id)).toEqual([1, 2]);
  });

  it('propose les corrections après une admission ou une sortie', () => {
    const lits = [{ id: 1, statut: 'libre' }, { id: 2, statut: 'occupe' }, { id: 3, statut: 'nettoyage' }];
    expect(corrections(lits, [{ lit: 1, statut: 'hospitalise' }])).toEqual([{ id: 1, statut: 'occupe' }, { id: 2, statut: 'nettoyage' }]);
  });
});
