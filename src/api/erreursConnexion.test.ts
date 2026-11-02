import { describe, it, expect } from 'vitest';
import { classerErreurConnexion } from './erreursConnexion';

describe('messages de connexion', () => {
  it('sans réponse et sans Internet : hors ligne', () => {
    expect(classerErreurConnexion({ code: 'ERR_NETWORK' }, false).code).toBe('hors_ligne');
  });
  it('sans réponse mais en ligne : le serveur démarre', () => {
    expect(classerErreurConnexion({ code: 'ECONNABORTED' }, true).code).toBe('demarrage');
    expect(classerErreurConnexion({ response: { status: 503 } }, true).code).toBe('demarrage');
  });
  it('mauvais identifiants', () => {
    expect(classerErreurConnexion({ response: { status: 401, data: { detail: 'No active account' } } }, true).code).toBe('identifiants');
    expect(classerErreurConnexion({ response: { status: 400, data: { non_field_errors: ['Identifiants invalides'] } } }, true).code).toBe('identifiants');
  });
  it('compte inactif', () => {
    expect(classerErreurConnexion({ response: { status: 403, data: { error: 'Compte inactif' } } }, true).code).toBe('inactif');
  });
  it('erreur du serveur', () => {
    const e = classerErreurConnexion({ response: { status: 500, data: {} } }, true);
    expect(e.code).toBe('serveur');
    expect(e.message).toMatch(/serveur/);
  });
});
