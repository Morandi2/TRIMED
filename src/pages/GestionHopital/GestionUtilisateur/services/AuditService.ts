import axios from 'axios';
import apiClient from '../../../../api/apiConfig';
import { lireTout } from '../../../../api/listes';
import { LIBELLES_ROLES, roleEffectif, type UserRole } from '../../../../types/userRoles';
import { dateLocale, estJourSeul } from '../../../../utils/dates';
import type { CategorieJournal, ChargementJournal, EntreeJournalServeur, EvenementJournal, FiltresJournal } from '../types/AuditTypes';

// Journal d’activité. Source principale : le journal d’audit du serveur (GET /api/comptes/audit-logs/), en ajout
// seul : connexions, ouvertures de dossiers, créations et modifications, avec l’adresse de connexion.
// Tant que le serveur n’a pas ce journal (réponse 404), on rassemble les traces datées qu’il conserve déjà :
// dernière connexion et création de chaque compte, consultations, ordonnances, examens, admissions et sorties,
// inscriptions d’hôpitaux. Rien n’est inventé.

interface Utilisateur { utilisateur_id: number; nom_complet?: string; email: string; role: string; is_staff?: boolean; cree_le?: string; derniere_connexion?: string | null; last_login?: string | null }
interface Consultation { consultation_id: number; date_consultation: string; motif?: string; patient_nom?: string; patient_prenom?: string; medecin_nom?: string; medecin_prenom?: string }
interface Ordonnance { ordonnance_id: number; date_ordonnance: string; medecin_nom?: string; medecin_prenom?: string; nb_prescriptions?: number }
interface Examen { examen_id: number; nom_examen: string; date_examen?: string; date_resultat?: string | null; patient_nom?: string; patient_prenom?: string; medecin_nom?: string }
interface Admission { id: number; date_admission: string; date_sortie?: string | null; motif?: string; patient: number }
interface Patient { patient_id: number; nom: string; prenom: string }
interface Hopital { tenant_id: number; nom: string; cree_le?: string; date_verification?: string | null; statut_verification_document?: string }

const UN_AN = 366 * 24 * 3600 * 1000;
const docteur = (prenom?: string, nom?: string) => (nom ? `Dr ${prenom ?? ''} ${nom}`.replace(/\s+/g, ' ').trim() : 'Médecin');
const personne = (prenom?: string, nom?: string) => `${prenom ?? ''} ${nom ?? ''}`.trim() || undefined;
const sur = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);

/** Ressource du serveur : catégorie du journal et nom lisible. */
const RESSOURCES: Record<string, [CategorieJournal, string]> = {
  compte: ['Compte', 'compte'], medecin: ['Compte', 'fiche médecin'],
  patient: ['Dossier', 'dossier patient'], allergie: ['Dossier', 'allergie'], antecedent: ['Dossier', 'antécédent'],
  suivi: ['Dossier', 'signes vitaux'], adresse_patient: ['Dossier', 'adresse du patient'], contact_patient: ['Dossier', 'personne à contacter'],
  assurance_patient: ['Dossier', 'assurance du patient'], visite: ['Dossier', 'visite'],
  consultation: ['Consultation', 'consultation'], ordonnance: ['Ordonnance', 'ordonnance'], prescription: ['Ordonnance', 'prescription'],
  examen: ['Examen', 'examen'], admission: ['Hospitalisation', 'admission'], rendez_vous: ['Rendez-vous', 'rendez-vous'],
  teleconsultation: ['Téléconsultation', 'téléconsultation'],
  facture: ['Caisse', 'facture'], paiement: ['Caisse', 'paiement'], session_caisse: ['Caisse', 'session de caisse'],
  element_facturable: ['Caisse', 'élément à facturer'], tarif: ['Caisse', 'tarif'], taux_change: ['Caisse', 'taux de change'],
  rapport_caisse: ['Caisse', 'rapport de caisse'],
  assureur: ['Assurance', 'assureur'], convention: ['Assurance', 'convention'], tarif_conventionne: ['Assurance', 'tarif conventionné'],
  couverture: ['Assurance', 'couverture'], accord_prealable: ['Assurance', 'accord préalable'], justificatif: ['Assurance', 'justificatif'],
  prise_en_charge: ['Assurance', 'prise en charge'], bordereau: ['Assurance', 'bordereau'],
  medicament: ['Pharmacie', 'médicament'], dispensation: ['Pharmacie', 'délivrance de médicament'],
  etablissement: ['Hôpital', 'hôpital'], parametres_hopital: ['Hôpital', 'paramètres de l’hôpital'], journal_audit: ['Hôpital', 'journal d’audit'],
};
const ACTIONS: Record<string, string> = {
  lecture: 'Ouverture', creation: 'Création', modification: 'Modification', suppression: 'Suppression', export: 'Export',
};
/** Actions particulières (« émettre », « annuler »…) : libellé lisible. */
const OPERATIONS: Record<string, string> = {
  dossier_complet: 'Ouverture du dossier complet', chronologie: 'Ouverture de la chronologie', telecharger: 'Téléchargement',
  emettre: 'Émission', annuler: 'Annulation', remise: 'Remise accordée', rembourser: 'Remboursement', ouvrir: 'Ouverture', fermer: 'Clôture',
  cloturer: 'Clôture', rejoindre: 'Entrée en salle', consentir: 'Consentement du patient', demarrer: 'Début de séance', terminer: 'Fin de séance',
  envoyer: 'Envoi', statuer: 'Décision de l’assureur', reglement: 'Règlement de l’assureur', repondre: 'Réponse de l’assureur',
  toggle_active: 'Activation ou désactivation', change_password: 'Changement de mot de passe', update_profile: 'Modification du profil',
  verifier_documents: 'Vérification des documents',
};
const CONNEXIONS: Record<string, string> = { connexion: 'Connexion', connexion_refusee: 'Connexion refusée', deconnexion: 'Déconnexion' };

const premiereLettre = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Ligne du journal du serveur → événement affiché. */
export function versEvenement(e: EntreeJournalServeur, equipeTrimed = false): EvenementJournal {
  const [categorieRessource, nomRessource] = RESSOURCES[e.ressource] ?? ['Hôpital', e.ressource.replace(/_/g, ' ')];
  const connexion = CONNEXIONS[e.action];
  const categorie: CategorieJournal = connexion ? 'Connexion' : categorieRessource;
  let action: string;
  if (connexion) action = connexion;
  else if (e.description && OPERATIONS[e.description]) action = `${OPERATIONS[e.description]} (${nomRessource})`;
  else if (e.description && e.action !== 'export') action = `${premiereLettre(e.description.replace(/_/g, ' '))} (${nomRessource})`;
  else action = `${ACTIONS[e.action] ?? e.action_libelle} : ${nomRessource}`;
  const refusee = e.action === 'connexion_refusee';
  const role = LIBELLES_ROLES[e.role as UserRole];
  return {
    id: `j-${e.evenement_id}`,
    date: e.date,
    categorie,
    type: e.action,
    action,
    acteur: e.utilisateur_libelle || (refusee ? e.description || 'Adresse inconnue' : 'Compte supprimé'),
    cible: e.patient_nom ?? undefined,
    details: [refusee ? 'mot de passe ou compte refusé' : role, equipeTrimed ? e.tenant_nom : null, e.adresse_ip ? `adresse ${e.adresse_ip}` : null]
      .filter(Boolean).join(', ') || undefined,
  };
}

class AuditService {
  readonly categories: CategorieJournal[] = ['Connexion', 'Compte', 'Dossier', 'Consultation', 'Ordonnance', 'Examen', 'Hospitalisation',
    'Rendez-vous', 'Téléconsultation', 'Caisse', 'Assurance', 'Pharmacie', 'Hôpital'];

  /** Tous les événements visibles par le compte connecté (douze derniers mois), du plus récent au plus ancien. */
  async obtenirEvenements(options: { equipeTrimed: boolean }): Promise<ChargementJournal> {
    try {
      const depuis = new Date(Date.now() - UN_AN).toISOString();
      const lignes = await lireTout<EntreeJournalServeur>('/comptes/audit-logs/', { date_debut: depuis, page_size: 500 }, { maxPages: 20, sansCache: true });
      return { evenements: lignes.map((l) => versEvenement(l, options.equipeTrimed)), journalServeur: true };
    } catch (e) {
      if (!(axios.isAxiosError(e) && e.response?.status === 404)) throw e;
    }
    return { evenements: await this.reconstituer(options), journalServeur: false };
  }

  /** Export CSV du journal du serveur (l’export est lui-même tracé par le serveur). */
  async exporterDuServeur(depuis?: Date): Promise<Blob> {
    const { data } = await apiClient.get('/comptes/audit-logs/', {
      params: { export: 'csv', ...(depuis ? { date_debut: depuis.toISOString() } : {}) }, responseType: 'blob',
    });
    return data as Blob;
  }

  /** Journal reconstitué à partir des traces datées, pour un serveur sans journal d’audit. */
  private async reconstituer(options: { equipeTrimed: boolean }): Promise<EvenementJournal[]> {
    const limite = Date.now() - UN_AN;
    const ancien = (champ: string) => (e: Record<string, string>) => dateLocale(e[champ]).getTime() < limite;

    const [utilisateurs, consultations, ordonnances, examens, admissions, patients, hopitaux] = await Promise.all([
      sur(lireTout<Utilisateur>('/comptes/utilisateurs/')),
      sur(lireTout<Consultation>('/medical/consultations/', { ordering: '-date_consultation' }, { maxPages: 20, arreterSi: ancien('date_consultation') as never })),
      sur(lireTout<Ordonnance>('/medical/ordonnances/', { ordering: '-date_ordonnance' }, { maxPages: 20, arreterSi: ancien('date_ordonnance') as never })),
      sur(lireTout<Examen>('/medical/examens/', { ordering: '-date_examen' }, { maxPages: 20 })),
      sur(lireTout<Admission>('/hospitalisation/admissions/', { ordering: '-date_admission' }, { maxPages: 10 })),
      sur(lireTout<Patient>('/patients/')),
      options.equipeTrimed ? sur(lireTout<Hopital>('/tenants/tenants/')) : Promise.resolve([] as Hopital[]),
    ]);

    const nomPatient = new Map(patients.map((p) => [p.patient_id, personne(p.prenom, p.nom)]));
    const ev: EvenementJournal[] = [];
    const ajouter = (cle: string, e: Omit<EvenementJournal, 'id'>) => { if (e.date) ev.push({ ...e, id: cle }); };

    for (const u of utilisateurs) {
      const nom = u.nom_complet || u.email;
      const role = LIBELLES_ROLES[roleEffectif(u)];
      const connexion = u.derniere_connexion || u.last_login;
      if (connexion) ajouter(`cx-${u.utilisateur_id}`, { date: connexion, categorie: 'Connexion', action: 'Dernière connexion', acteur: nom, details: role });
      if (u.cree_le) ajouter(`cpt-${u.utilisateur_id}`, { date: u.cree_le, categorie: 'Compte', action: 'Compte créé', acteur: nom, details: role });
    }
    for (const c of consultations) ajouter(`cs-${c.consultation_id}`, { date: c.date_consultation, categorie: 'Consultation', action: 'Consultation', acteur: docteur(c.medecin_prenom, c.medecin_nom), cible: personne(c.patient_prenom, c.patient_nom), details: c.motif });
    for (const o of ordonnances) ajouter(`or-${o.ordonnance_id}`, { date: o.date_ordonnance, categorie: 'Ordonnance', action: 'Ordonnance rédigée', acteur: docteur(o.medecin_prenom, o.medecin_nom), details: o.nb_prescriptions ? `${o.nb_prescriptions} médicament${o.nb_prescriptions > 1 ? 's' : ''}` : undefined });
    for (const x of examens) {
      if (x.date_examen) ajouter(`ex-${x.examen_id}`, { date: x.date_examen, categorie: 'Examen', action: 'Examen prescrit', acteur: x.medecin_nom ? `Dr ${x.medecin_nom}` : 'Médecin', cible: personne(x.patient_prenom, x.patient_nom), details: x.nom_examen });
      if (x.date_resultat) ajouter(`exr-${x.examen_id}`, { date: x.date_resultat, categorie: 'Examen', action: 'Résultat d’examen', acteur: 'Laboratoire', cible: personne(x.patient_prenom, x.patient_nom), details: x.nom_examen });
    }
    for (const a of admissions) {
      ajouter(`adm-${a.id}`, { date: a.date_admission, categorie: 'Hospitalisation', action: 'Admission', acteur: 'Service d’hospitalisation', cible: nomPatient.get(a.patient), details: a.motif });
      if (a.date_sortie) ajouter(`sor-${a.id}`, { date: a.date_sortie, categorie: 'Hospitalisation', action: 'Sortie', acteur: 'Service d’hospitalisation', cible: nomPatient.get(a.patient) });
    }
    for (const h of hopitaux) {
      if (h.cree_le) ajouter(`hop-${h.tenant_id}`, { date: h.cree_le, categorie: 'Hôpital', action: 'Hôpital inscrit', acteur: h.nom });
      if (h.date_verification) ajouter(`ver-${h.tenant_id}`, { date: h.date_verification, categorie: 'Hôpital', action: h.statut_verification_document === 'rejete' ? 'Documents refusés' : 'Documents vérifiés', acteur: 'Équipe TRIMED', cible: h.nom });
    }

    const maintenant = Date.now() + 60 * 1000;
    return ev.filter((e) => dateLocale(e.date).getTime() <= maintenant).sort((a, b) => dateLocale(b.date).getTime() - dateLocale(a.date).getTime());
  }

  /** Filtre côté interface : recherche libre, catégorie, période. */
  filtrer(evenements: EvenementJournal[], f: FiltresJournal, maintenant = new Date()): EvenementJournal[] {
    const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()).getTime();
    const depuis = { jour: debut, semaine: debut - 6 * 864e5, mois: debut - 29 * 864e5, tout: 0 }[f.periode];
    const q = f.recherche.trim().toLowerCase();
    return evenements.filter((e) =>
      dateLocale(e.date).getTime() >= depuis
      && (!f.categorie || e.categorie === f.categorie)
      && (!q || [e.action, e.acteur, e.cible, e.details].some((t) => t?.toLowerCase().includes(q))));
  }

  /** Début de la période choisie (pour l’export du serveur). */
  debutPeriode(periode: FiltresJournal['periode'], maintenant = new Date()): Date | undefined {
    const debut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    const jours = { jour: 0, semaine: 6, mois: 29, tout: null }[periode];
    return jours === null ? undefined : new Date(debut.getTime() - jours * 864e5);
  }

  /** Export CSV (séparateur « ; » pour Excel en français). */
  enCsv(evenements: EvenementJournal[]): string {
    const echapper = (v?: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const lignes = evenements.map((e) => [estJourSeul(e.date) ? dateLocale(e.date).toLocaleDateString('fr-HT') : new Date(e.date).toLocaleString('fr-HT'), e.categorie, e.action, e.acteur, e.cible, e.details].map(echapper).join(';'));
    return ['Date;Catégorie;Action;Par;Concerne;Détails', ...lignes].join('\r\n');
  }
}

export const auditService = new AuditService();
