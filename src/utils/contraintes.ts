// Règles de saisie communes à tous les formulaires : bornes des dates (passé, futur), des montants, des quantités
// et des constantes vitales. Les bornes servent deux fois : en attributs min et max (le calendrier grise les dates
// interdites) et à la validation avant l'envoi (un navigateur laisse taper une date hors bornes).

type Decalage = { minutes?: number; jours?: number; mois?: number; ans?: number };
export interface RegleDate {
  /** Le plus tôt permis, par rapport à maintenant (ex. { ans: -120 }). */
  min: Decalage;
  /** Le plus tard permis, par rapport à maintenant (ex. { jours: 0 } : pas après aujourd'hui). */
  max: Decalage;
  /** Nom du champ dans les messages (« la date du rendez-vous »). */
  libelle: string;
}

const r = (libelle: string, min: Decalage, max: Decalage): RegleDate => ({ libelle, min, max });

/** Règles métier par type de date. « Aujourd'hui » compte en entier pour les champs sans heure. */
export const REGLES = {
  naissance: r('la date de naissance', { ans: -120 }, { jours: 0 }),
  naissanceMedecin: r('la date de naissance', { ans: -90 }, { ans: -20 }),
  consultation: r('la date de la consultation', { ans: -1 }, { minutes: 5 }),
  ordonnance: r('la date de l’ordonnance', { ans: -1 }, { minutes: 5 }),
  examen: r('la date de l’examen', { ans: -1 }, { mois: 3 }),
  admission: r('la date d’admission', { ans: -1 }, { minutes: 5 }),
  sortie: r('la date de sortie', { ans: -1 }, { minutes: 5 }),
  rendezVous: r('la date du rendez-vous', { minutes: -5 }, { ans: 1 }),
  teleconsultation: r('la date de la téléconsultation', { minutes: -5 }, { mois: 6 }),
  prochaineVisite: r('la date de la prochaine visite', { jours: 1 }, { ans: 1 }),
  creneau: r('la date du créneau', { jours: 0 }, { ans: 1 }),
  peremption: r('la date de péremption', { jours: 1 }, { ans: 10 }),
  fabrication: r('la date de fabrication', { ans: -10 }, { jours: 0 }),
  paiement: r('la date du paiement', { ans: -1 }, { jours: 0 }),
  expirationCarte: r('la date d’expiration', { jours: 0 }, { ans: 10 }),
  antecedent: r('la date', { ans: -120 }, { jours: 0 }),
  periodePassee: r('la date', { ans: -10 }, { jours: 0 }),
  debutContrat: r('la date de début', { ans: -5 }, { ans: 1 }),
  finContrat: r('la date de fin', { jours: 0 }, { ans: 10 }),
} satisfies Record<string, RegleDate>;

const decaler = (base: Date, d: Decalage) => {
  const x = new Date(base);
  if (d.ans) x.setFullYear(x.getFullYear() + d.ans);
  if (d.mois) x.setMonth(x.getMonth() + d.mois);
  if (d.jours) x.setDate(x.getDate() + d.jours);
  if (d.minutes) x.setMinutes(x.getMinutes() + d.minutes);
  return x;
};
const deux = (n: number) => String(n).padStart(2, '0');
/** Date locale au format des champs : « 2026-11-05 » ou « 2026-11-05T14:30 ». */
export const versChamp = (d: Date, type: 'date' | 'datetime-local') => {
  const jour = `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
  return type === 'date' ? jour : `${jour}T${deux(d.getHours())}:${deux(d.getMinutes())}`;
};
/** Lit la valeur d'un champ date ou date-heure en heure locale (sans décalage UTC). */
export const depuisChamp = (valeur: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(valeur || '');
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
};

/** Attributs min et max à étaler sur le champ : <input type="date" {...bornes(REGLES.naissance, 'date')} />. */
export function bornes(regle: RegleDate, type: 'date' | 'datetime-local', maintenant = new Date()) {
  return { min: versChamp(decaler(maintenant, regle.min), type), max: versChamp(decaler(maintenant, regle.max), type) };
}

/** Décalage « maintenant » ou « aujourd'hui » (à quelques minutes près). */
const estMaintenant = (d: Decalage) => !d.ans && !d.mois && !d.jours && Math.abs(d.minutes ?? 0) <= 5;

const formatLisible = (d: Date, avecHeure: boolean) =>
  avecHeure ? d.toLocaleString('fr-HT', { dateStyle: 'long', timeStyle: 'short' }) : d.toLocaleDateString('fr-HT', { dateStyle: 'long' });

/**
 * Message d'erreur si la valeur sort des bornes de la règle (ou d'une borne liée : `apres` = date de début, de
 * l'examen, de l'admission…). Valeur vide : rien (l'obligation de remplir se vérifie à part).
 */
export function verifierDate(valeur: string, regle: RegleDate, options: { apres?: string; libelleApres?: string; maintenant?: Date } = {}): string | undefined {
  if (!valeur) return undefined;
  const d = depuisChamp(valeur);
  if (!d || Number.isNaN(d.getTime())) return `Saisissez ${regle.libelle} au bon format.`;
  const avecHeure = valeur.includes('T');
  const maintenant = options.maintenant ?? new Date();
  let min = decaler(maintenant, regle.min), max = decaler(maintenant, regle.max);
  if (!avecHeure) {
    min = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    max = new Date(max.getFullYear(), max.getMonth(), max.getDate());
  }
  const libelle = regle.libelle.charAt(0).toUpperCase() + regle.libelle.slice(1);
  if (d < min) {
    if (estMaintenant(regle.min)) return `${libelle} ne peut pas être dans le passé.`;
    if (!regle.min.ans && !regle.min.mois && (regle.min.jours ?? 0) > 0) return `${libelle} doit être après aujourd’hui.`;
    return `${libelle} ne peut pas être avant le ${formatLisible(min, avecHeure)}.`;
  }
  if (d > max) {
    if (estMaintenant(regle.max)) return `${libelle} ne peut pas être dans le futur.`;
    return `${libelle} ne peut pas dépasser le ${formatLisible(max, avecHeure)}.`;
  }
  if (options.apres) {
    const debut = depuisChamp(options.apres);
    if (debut && d < debut) return `${libelle} doit venir après ${options.libelleApres ?? 'la date de début'}.`;
  }
  return undefined;
}

// ---------------------------------------------------------------- Nombres

export interface RegleNombre { min: number; max: number; entier?: boolean; libelle: string; unite?: string }
const n = (libelle: string, min: number, max: number, entier = false, unite?: string): RegleNombre => ({ libelle, min, max, entier, unite });

export const NOMBRES = {
  montant: n('le montant', 0.01, 100_000_000, false, 'HTG'),
  prix: n('le prix', 0, 10_000_000, false, 'HTG'),
  remise: n('la remise', 0.01, 10_000_000, false, 'HTG'),
  fondCaisse: n('le fond de caisse', 0, 10_000_000, false, 'HTG'),
  tauxChange: n('le taux', 1, 10_000),
  pourcentage: n('le pourcentage', 0, 100, false, '%'),
  quantite: n('la quantité', 1, 100_000, true),
  stock: n('le stock', 0, 10_000_000, true),
  lits: n('le nombre de lits', 1, 5_000, true),
  capacite: n('la capacité', 1, 50, true),
  duree: n('la durée', 5, 480, true, 'min'),
  validiteJours: n('la validité', 1, 365, true, 'jours'),
  experience: n('les années d’expérience', 0, 60, true, 'ans'),
  // Constantes vitales : mêmes bornes que le serveur (patients.SuiviPatient), au-delà c'est une erreur de saisie.
  temperature: n('la température', 30, 45, false, '°C'),
  pouls: n('le pouls', 30, 200, true, 'battements/min'),
  frequenceRespiratoire: n('la fréquence respiratoire', 8, 60, true, '/min'),
  tensionSystolique: n('la tension systolique', 50, 250, true, 'mmHg'),
  tensionDiastolique: n('la tension diastolique', 30, 150, true, 'mmHg'),
  poids: n('le poids', 0.3, 300, false, 'kg'),
  taille: n('la taille', 0.2, 2.5, false, 'm'),
  glycemie: n('la glycémie', 0.5, 30, false, 'mmol/L'),
} satisfies Record<string, RegleNombre>;

/** Attributs min, max et step du champ : <input type="number" {...limites(NOMBRES.pouls)} />. */
export const limites = (regle: RegleNombre) => ({ min: regle.min, max: regle.max, step: regle.entier ? 1 : 'any' });

/** Message d'erreur si la valeur n'est pas un nombre dans les bornes ; valeur vide : rien. */
export function verifierNombre(valeur: string | number | null | undefined, regle: RegleNombre): string | undefined {
  if (valeur === '' || valeur === null || valeur === undefined) return undefined;
  const v = typeof valeur === 'number' ? valeur : Number(String(valeur).replace(/\s/g, '').replace(',', '.'));
  const libelle = regle.libelle.charAt(0).toUpperCase() + regle.libelle.slice(1);
  const unite = regle.unite ? ` ${regle.unite}` : '';
  if (!Number.isFinite(v)) return `${libelle} doit être un nombre.`;
  if (regle.entier && !Number.isInteger(v)) return `${libelle} doit être un nombre entier.`;
  if (v < regle.min || v > regle.max) return `${libelle} doit être entre ${regle.min.toLocaleString('fr-HT')} et ${regle.max.toLocaleString('fr-HT')}${unite}.`;
  return undefined;
}

// ---------------------------------------------------------------- Textes

/** Téléphone haïtien : 8 chiffres, avec ou sans +509 (509 3712-3456, +509 37 12 34 56…). */
export function verifierTelephoneHaiti(valeur: string | null | undefined): string | undefined {
  if (!valeur || !valeur.trim()) return undefined;
  const chiffres = valeur.replace(/\D/g, '').replace(/^509(?=\d{8}$)/, '');
  return /^[2-5]\d{7}$/.test(chiffres) ? undefined : 'Le téléphone doit avoir 8 chiffres (ex. 3712-3456), avec ou sans +509.';
}

export function verifierEmail(valeur: string | null | undefined): string | undefined {
  if (!valeur || !valeur.trim()) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur.trim()) ? undefined : 'L’adresse e-mail n’est pas valide.';
}

/** Recherche sans accents ni majuscules (« etienne » trouve « Étienne »). */
export const normaliser = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
