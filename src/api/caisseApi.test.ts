import { describe, expect, it } from 'vitest';
import { calculerMonnaie, montant, nombre } from './caisseApi';

describe('caisse : calculs', () => {
  it('convertit la devise et rend la monnaie en gourdes', () => {
    // 10 USD à 132 HTG pour un reste dû de 200 HTG
    expect(calculerMonnaie(200, 10, 132)).toEqual({ recu: 1320, applique: 200, monnaie: 1120 });
  });

  it('ne rend rien quand le paiement est partiel', () => {
    expect(calculerMonnaie(500, 300, 1)).toEqual({ recu: 300, applique: 300, monnaie: 0 });
  });

  it('arrondit au centime', () => {
    expect(calculerMonnaie(100, 0.333, 131.7).recu).toBe(43.86);
  });

  it('lit les montants décimaux du serveur', () => {
    expect(nombre('1250.50')).toBe(1250.5);
    expect(nombre(null)).toBe(0);
    expect(nombre('')).toBe(0);
  });

  it('affiche la devise', () => {
    expect(montant('1250.5')).toMatch(/^1.250,50 HTG$/);
    expect(montant(10, 'USD')).toMatch(/^10,00 USD$/);
  });
});
