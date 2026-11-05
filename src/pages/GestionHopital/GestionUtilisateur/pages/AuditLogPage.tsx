import { useEffect, useMemo, useState } from 'react';
import { Activity, BedDouble, Building2, CalendarDays, Download, FileText, FlaskConical, FolderOpen, LogIn, Pill, RefreshCw, Search, ShieldCheck, Stethoscope, UserPlus, Users, Video, Wallet } from 'lucide-react';
import PageMeta from '../../../../components/common/PageMeta';
import { useUser } from '../../../../context/UserContext';
import { auditService } from '../services/AuditService';
import type { CategorieJournal, EvenementJournal, FiltresJournal, PeriodeJournal } from '../types/AuditTypes';
import { dateLocale, estJourSeul } from '../../../../utils/dates';

const GRIS = 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200';
const ICONES: Record<CategorieJournal, { icone: typeof LogIn; teinte: string }> = {
  Connexion: { icone: LogIn, teinte: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300' },
  Compte: { icone: UserPlus, teinte: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' },
  Dossier: { icone: FolderOpen, teinte: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  Consultation: { icone: Stethoscope, teinte: 'bg-trimed-brume text-trimed-vert-fonce dark:bg-trimed-vert/15 dark:text-trimed-menthe' },
  Ordonnance: { icone: FileText, teinte: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' },
  Examen: { icone: FlaskConical, teinte: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  Hospitalisation: { icone: BedDouble, teinte: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
  'Rendez-vous': { icone: CalendarDays, teinte: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300' },
  Téléconsultation: { icone: Video, teinte: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300' },
  Caisse: { icone: Wallet, teinte: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  Assurance: { icone: ShieldCheck, teinte: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300' },
  Pharmacie: { icone: Pill, teinte: 'bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300' },
  Hôpital: { icone: Building2, teinte: GRIS },
};
// Avec le journal du serveur, les ouvertures de dossier et les connexions refusées ne sont pas des actes.
const estConnexion = (e: EvenementJournal) => e.categorie === 'Connexion' && (!e.type || e.type === 'connexion');
const estActeMedical = (e: EvenementJournal) => ['Consultation', 'Ordonnance', 'Examen', 'Hospitalisation'].includes(e.categorie) && (!e.type || e.type === 'creation');
const PERIODES: [PeriodeJournal, string][] = [['jour', 'Aujourd’hui'], ['semaine', '7 jours'], ['mois', '30 jours'], ['tout', 'Tout']];
const PAR_PAGE = 60;

const titreJour = (iso: string) => {
  const d = dateLocale(iso), auj = new Date(), hier = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() - 1);
  if (d.toDateString() === auj.toDateString()) return 'Aujourd’hui';
  if (d.toDateString() === hier.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-HT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// Journal d’activité : connexions et actions enregistrées sur le serveur, regroupées par jour.
export const AuditLogPage = () => {
  const { currentUserRole } = useUser();
  const [evenements, setEvenements] = useState<EvenementJournal[] | null>(null);
  const [journalServeur, setJournalServeur] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [exportEnCours, setExportEnCours] = useState(false);
  const [version, setVersion] = useState(0);
  const [filtres, setFiltres] = useState<FiltresJournal>({ recherche: '', categorie: '', periode: 'mois' });
  const [nb, setNb] = useState(PAR_PAGE);

  useEffect(() => {
    let annule = false;
    setErreur(false);
    auditService.obtenirEvenements({ equipeTrimed: currentUserRole === 'admin-systeme' })
      .then((r) => { if (!annule) { setEvenements(r.evenements); setJournalServeur(r.journalServeur); } })
      .catch(() => { if (!annule) setErreur(true); });
    return () => { annule = true; };
  }, [currentUserRole, version]);

  const filtres_ = useMemo(() => (evenements ? auditService.filtrer(evenements, filtres) : []), [evenements, filtres]);
  useEffect(() => setNb(PAR_PAGE), [filtres]);

  // Chiffres de la semaine
  const semaine = useMemo(() => (evenements ? auditService.filtrer(evenements, { recherche: '', categorie: '', periode: 'semaine' }) : []), [evenements]);
  const connexionsAuj = evenements ? auditService.filtrer(evenements, { recherche: '', categorie: 'Connexion', periode: 'jour' }).filter(estConnexion).length : 0;
  const actifs7j = new Set(semaine.filter(estConnexion).map((e) => e.acteur)).size;
  const actes7j = semaine.filter(estActeMedical).length;

  // Regroupement par jour
  const groupes = useMemo(() => {
    const g: { jour: string; liste: EvenementJournal[] }[] = [];
    for (const e of filtres_.slice(0, nb)) {
      const jour = dateLocale(e.date).toDateString();
      if (g[g.length - 1]?.jour !== jour) g.push({ jour, liste: [] });
      g[g.length - 1].liste.push(e);
    }
    return g;
  }, [filtres_, nb]);

  // Avec le journal du serveur, l’export vient du serveur (il y est tracé) ; sinon, export des événements affichés.
  const exporter = async () => {
    setExportEnCours(true);
    try {
      const blob = journalServeur
        ? await auditService.exporterDuServeur(auditService.debutPeriode(filtres.periode))
        : new Blob(['﻿' + auditService.enCsv(filtres_)], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `journal-${journalServeur ? 'audit' : 'activite'}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setErreur(true);
    } finally {
      setExportEnCours(false);
    }
  };

  const champ = 'h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

  return (
    <>
      <PageMeta title="Journal d’activité | TRIMED" description="Connexions et actions enregistrées sur le serveur." />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-marque text-xl text-gray-900 sm:text-2xl dark:text-white">Journal d’activité</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {journalServeur
                ? 'Journal d’audit du serveur : connexions, ouvertures de dossiers, créations et modifications, avec l’adresse de connexion. Il ne peut être ni modifié ni effacé.'
                : 'Connexions des comptes et actions enregistrées : consultations, ordonnances, examens, hospitalisations.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setVersion((v) => v + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualiser</button>
            <button type="button" onClick={exporter} disabled={!filtres_.length || exportEnCours} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-3.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40"><Download className="h-4 w-4" aria-hidden="true" /> {exportEnCours ? 'Export…' : 'Exporter (CSV)'}</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { libelle: 'Connexions aujourd’hui', valeur: connexionsAuj, icone: LogIn },
            { libelle: 'Comptes actifs (7 jours)', valeur: actifs7j, icone: Users },
            { libelle: 'Actes médicaux (7 jours)', valeur: actes7j, icone: Stethoscope },
            { libelle: 'Événements (30 jours)', valeur: evenements ? auditService.filtrer(evenements, { recherche: '', categorie: '', periode: 'mois' }).length : 0, icone: Activity },
          ].map(({ libelle, valeur, icone: Icone }) => (
            <div key={libelle} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <Icone className="h-5 w-5 text-brand-500" aria-hidden="true" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{libelle}</p>
              <p className="mt-1 font-marque text-2xl text-gray-900 dark:text-white">{evenements ? valeur : '…'}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center dark:border-gray-800 dark:bg-white/[0.03]">
          <label className="relative flex-1">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input className={`${champ} w-full pl-10`} placeholder="Rechercher une personne, une action, un patient…" value={filtres.recherche} onChange={(e) => setFiltres({ ...filtres, recherche: e.target.value })} />
          </label>
          <select className={champ} value={filtres.categorie} onChange={(e) => setFiltres({ ...filtres, categorie: e.target.value as CategorieJournal | '' })} aria-label="Catégorie">
            <option value="">Toutes les catégories</option>
            {auditService.categories.filter((c) => c !== 'Hôpital' || currentUserRole === 'admin-systeme').map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800" role="group" aria-label="Période">
            {PERIODES.map(([p, libelle]) => (
              <button key={p} type="button" onClick={() => setFiltres({ ...filtres, periode: p })} aria-pressed={filtres.periode === p}
                className={`rounded-lg px-3 py-1.5 text-sm ${filtres.periode === p ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{libelle}</button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {erreur ? <p className="p-10 text-center text-sm text-gray-500">Le journal n’a pas pu être chargé. Vérifiez la connexion puis actualisez.</p>
            : !evenements ? <div className="space-y-3 p-6">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>
            : filtres_.length === 0 ? <p className="p-10 text-center text-sm text-gray-500">Aucun événement pour ces critères.</p>
            : (
              <>
                {groupes.map(({ jour, liste }) => (
                  <div key={jour}>
                    <p className="sticky top-0 border-b border-gray-100 bg-gray-50/90 px-5 py-2 text-xs font-medium uppercase tracking-wider text-gray-500 backdrop-blur first-letter:uppercase dark:border-gray-800 dark:bg-gray-900/90">{titreJour(liste[0].date)}</p>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {liste.map((e) => {
                        const { icone: Icone, teinte } = ICONES[e.categorie];
                        return (
                          <li key={e.id} className="flex items-start gap-4 px-5 py-3.5">
                            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${teinte}`}><Icone className="h-4 w-4" aria-hidden="true" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-medium">{e.acteur}</span>
                                <span className="text-gray-500"> : {e.action.toLowerCase()}</span>
                                {e.cible && <span className="text-gray-500"> ({e.cible})</span>}
                              </p>
                              {e.details && <p className="mt-0.5 truncate text-xs text-gray-500">{e.details}</p>}
                            </div>
                            <time dateTime={e.date} className="shrink-0 font-marque text-xs text-gray-500">{estJourSeul(e.date) ? '' : new Date(e.date).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' })}</time>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                {filtres_.length > nb && (
                  <div className="border-t border-gray-100 p-4 text-center dark:border-gray-800">
                    <button type="button" onClick={() => setNb((n) => n + PAR_PAGE)} className="rounded-xl px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5">
                      Afficher plus ({filtres_.length - nb} restants)
                    </button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </>
  );
};

export default AuditLogPage;
