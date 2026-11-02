import { lireTout } from '../../../../api/listes';
import { LIBELLES_ROLES, roleEffectif } from '../../../../types/userRoles';
import { dateLocale, estJourSeul } from '../../../../utils/dates';
import type { CategorieJournal, EvenementJournal, FiltresJournal } from '../types/AuditTypes';

// Journal d’activité. Le serveur n’a pas encore de journal d’audit dédié (BACKEND_MODIFICATIONS.md, point 5) :
// on rassemble les traces datées qu’il conserve déjà — dernière connexion et création de chaque compte,
// consultations, ordonnances, examens, admissions et sorties, inscriptions d’hôpitaux. Rien n’est inventé.

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

class AuditService {
  readonly categories: CategorieJournal[] = ['Connexion', 'Compte', 'Consultation', 'Ordonnance', 'Examen', 'Hospitalisation', 'Hôpital'];

  /** Tous les événements visibles par le compte connecté, du plus récent au plus ancien. */
  async obtenirEvenements(options: { equipeTrimed: boolean }): Promise<EvenementJournal[]> {
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

  /** Export CSV (séparateur « ; » pour Excel en français). */
  enCsv(evenements: EvenementJournal[]): string {
    const echapper = (v?: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const lignes = evenements.map((e) => [estJourSeul(e.date) ? dateLocale(e.date).toLocaleDateString('fr-HT') : new Date(e.date).toLocaleString('fr-HT'), e.categorie, e.action, e.acteur, e.cible, e.details].map(echapper).join(';'));
    return ['Date;Catégorie;Action;Par;Concerne;Détails', ...lignes].join('\r\n');
  }
}

export const auditService = new AuditService();
