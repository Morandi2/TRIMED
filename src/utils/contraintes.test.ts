import { describe, expect, it } from 'vitest';
import { bornes, NOMBRES, normaliser, REGLES, verifierDate, verifierNombre, verifierTelephoneHaiti } from './contraintes';

const maintenant = new Date(2026, 10, 5, 14, 30); // 5 novembre 2026, 14 h 30

describe('dates', () => {
  it('donne les bornes au format des champs', () => {
    expect(bornes(REGLES.naissance, 'date', maintenant)).toEqual({ min: '1906-11-05', max: '2026-11-05' });
    expect(bornes(REGLES.rendezVous, 'datetime-local', maintenant)).toEqual({ min: '2026-11-05T14:25', max: '2027-11-05T14:30' });
  });

  it('refuse un rendez-vous passé ou trop lointain', () => {
    expect(verifierDate('2026-11-04T10:00', REGLES.rendezVous, { maintenant })).toBe('La date du rendez-vous ne peut pas être dans le passé.');
    expect(verifierDate('2028-01-10T10:00', REGLES.rendezVous, { maintenant })).toMatch(/^La date du rendez-vous ne peut pas dépasser le /);
    expect(verifierDate('2026-11-06T09:00', REGLES.rendezVous, { maintenant })).toBeUndefined();
  });

  it('accepte une consultation de ce matin, refuse une consultation dans le futur', () => {
    expect(verifierDate('2026-11-05T08:00', REGLES.consultation, { maintenant })).toBeUndefined();
    expect(verifierDate('2026-11-06T08:00', REGLES.consultation, { maintenant })).toBe('La date de la consultation ne peut pas être dans le futur.');
  });

  it('traite les champs sans heure par jour entier', () => {
    expect(verifierDate('2026-11-05', REGLES.naissance, { maintenant })).toBeUndefined();
    expect(verifierDate('2026-11-06', REGLES.naissance, { maintenant })).toBe('La date de naissance ne peut pas être dans le futur.');
    expect(verifierDate('2026-11-05', REGLES.peremption, { maintenant })).toBe('La date de péremption doit être après aujourd’hui.');
  });

  it('vérifie l’ordre entre deux dates', () => {
    expect(verifierDate('2026-01-01', REGLES.periodePassee, { maintenant, apres: '2026-02-01', libelleApres: 'la date de début' }))
      .toBe('La date doit venir après la date de début.');
  });
});

describe('nombres et textes', () => {
  it('borne les constantes vitales et les montants', () => {
    expect(verifierNombre('37,5', NOMBRES.temperature)).toBeUndefined();
    expect(verifierNombre('375', NOMBRES.temperature)).toBe('La température doit être entre 30 et 45 °C.');
    expect(verifierNombre('-100', NOMBRES.montant)).toMatch(/^Le montant doit être entre/);
    expect(verifierNombre('2.5', NOMBRES.quantite)).toBe('La quantité doit être un nombre entier.');
    expect(verifierNombre('', NOMBRES.quantite)).toBeUndefined();
  });

  it('accepte les téléphones haïtiens courants', () => {
    for (const t of ['3712-3456', '+509 37 12 34 56', '50937123456', '2812 3456']) expect(verifierTelephoneHaiti(t)).toBeUndefined();
    expect(verifierTelephoneHaiti('1234')).toMatch(/8 chiffres/);
  });

  it('cherche sans accents', () => {
    expect(normaliser(' Étienne ')).toBe('etienne');
  });
});
