import { useEffect, useState } from 'react';
import { lireTout } from '../../../api/listes';

/**
 * Patients hospitalisés en ce moment, avec le numéro de leur lit (pour le badge de la liste des patients).
 * Un refus du serveur (rôle sans accès) donne simplement une liste vide.
 */
export function useHospitalises(actif: boolean) {
  const [lits, setLits] = useState<Map<number, string>>(new Map());
  useEffect(() => {
    if (!actif) return;
    let annule = false;
    Promise.all([
      lireTout<{ patient: number; lit: number }>('/hospitalisation/admissions/', { statut: 'hospitalise' }),
      lireTout<{ id: number; numero_lit: string }>('/hospitalisation/lits/', {}, { maxPages: 50 }).catch(() => []),
    ]).then(([admissions, listeLits]) => {
      if (annule) return;
      const numeros = new Map(listeLits.map((l) => [l.id, l.numero_lit]));
      setLits(new Map(admissions.map((a) => [a.patient, numeros.get(a.lit) ?? ''])));
    }).catch(() => undefined);
    return () => { annule = true; };
  }, [actif]);
  return lits;
}
