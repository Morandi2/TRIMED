import { describe, expect, it } from 'vitest';
import { versEvenement } from './AuditService';
import type { EntreeJournalServeur } from '../types/AuditTypes';

const ligne = (champs: Partial<EntreeJournalServeur>): EntreeJournalServeur => ({
  evenement_id: 1, date: '2026-11-05T10:00:00Z', action: 'lecture', action_libelle: 'Consultation', ressource: 'patient', ressource_id: '24',
  utilisateur: 5, utilisateur_libelle: 'Stéphanie Louis', role: 'secretaire', patient: 24, patient_nom: 'Rachelle Alexis',
  tenant: 1, tenant_nom: 'Hôpital JCC', description: '', adresse_ip: '41.0.0.1', ...champs,
});

describe('journal d’audit du serveur', () => {
  it('présente l’ouverture d’un dossier avec le patient, le rôle et l’adresse', () => {
    const e = versEvenement(ligne({}));
    expect(e).toMatchObject({ categorie: 'Dossier', action: 'Ouverture : dossier patient', acteur: 'Stéphanie Louis', cible: 'Rachelle Alexis', type: 'lecture' });
    expect(e.details).toBe('Secrétaire, adresse 41.0.0.1');
  });

  it('nomme les actions particulières et classe la caisse', () => {
    expect(versEvenement(ligne({ action: 'modification', ressource: 'facture', description: 'emettre' })))
      .toMatchObject({ categorie: 'Caisse', action: 'Émission (facture)' });
    expect(versEvenement(ligne({ action: 'creation', ressource: 'consultation' }))).toMatchObject({ categorie: 'Consultation', action: 'Création : consultation' });
  });

  it('montre l’adresse tentée pour une connexion refusée, et l’hôpital pour l’équipe TRIMED', () => {
    const refus = versEvenement(ligne({ action: 'connexion_refusee', ressource: 'compte', utilisateur: null, utilisateur_libelle: '', role: '', description: 'x@jcc.ht', patient_nom: null }));
    expect(refus).toMatchObject({ categorie: 'Connexion', action: 'Connexion refusée', acteur: 'x@jcc.ht' });
    expect(refus.details).toBe('mot de passe ou compte refusé, adresse 41.0.0.1');
    expect(versEvenement(ligne({}), true).details).toBe('Secrétaire, Hôpital JCC, adresse 41.0.0.1');
  });
});
