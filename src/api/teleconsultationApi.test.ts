import { describe, expect, it } from 'vitest';
import { salleOuverte, type Teleconsultation } from './teleconsultationApi';

const tc = (statut: Teleconsultation['statut'], dansMinutes: number): Teleconsultation => ({
  id: 1, patient: 1, patient_nom: '', medecin: 1, medecin_nom: '', rendez_vous: null, visite: null,
  date_prevue: new Date(Date.UTC(2026, 10, 4, 15, 0) + dansMinutes * 60_000).toISOString(), motif: '', statut,
  consentement_le: null, mode_audio: false, patient_arrive_le: null, debut: null, fin: null,
});
const maintenant = Date.UTC(2026, 10, 4, 15, 0);

describe('téléconsultation : ouverture de la salle', () => {
  it("s'ouvre 15 minutes avant l'heure prévue", () => {
    expect(salleOuverte(tc('planifiee', 20), maintenant)).toBe(false);
    expect(salleOuverte(tc('planifiee', 10), maintenant)).toBe(true);
  });
  it('se ferme 3 heures après, sauf consultation en cours', () => {
    expect(salleOuverte(tc('planifiee', -200), maintenant)).toBe(false);
    expect(salleOuverte(tc('en_cours', -200), maintenant)).toBe(true);
  });
  it('reste fermée une fois terminée ou annulée', () => {
    expect(salleOuverte(tc('terminee', 0), maintenant)).toBe(false);
    expect(salleOuverte(tc('annulee', 0), maintenant)).toBe(false);
  });
});
