import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, type LucideIcon } from "lucide-react";
import Symbole from "../../../components/brand/Symbole";
import { dateLocale } from "../../../utils/dates";
import { COULEURS } from "./Graphiques";
import type { RendezVousL } from "./donnees";

// Éléments communs aux tableaux de bord (hôpital et personnel).

export const COULEURS_STATUTS: Record<string, string> = { Planifié: COULEURS.indigo, Confirmé: COULEURS.vert, Terminé: COULEURS.encre, Annulé: COULEURS.rouge, Reporté: COULEURS.orange };

export const heure = (iso: string) => new Date(iso).toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" });
export const jourCourt = (iso: string) => {
  const d = dateLocale(iso), auj = new Date();
  const demain = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() + 1);
  if (d.toDateString() === auj.toDateString()) return "Aujourd’hui";
  if (d.toDateString() === demain.toDateString()) return "Demain";
  return d.toLocaleDateString("fr-HT", { weekday: "short", day: "numeric", month: "short" });
};
export const dateLongue = (iso: string) => dateLocale(iso).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" });

export function Carte({ titre, action, children, className = "" }: { titre: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{titre}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Chiffre({ libelle, valeur, detail, icone: Icone, teinte, lien }: { libelle: string; valeur: string | number; detail?: ReactNode; icone: LucideIcon; teinte: string; lien: string }) {
  return (
    <Link to={lien} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${teinte}`}><Icone className="h-5 w-5" aria-hidden="true" /></span>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{libelle}</p>
      <p className="mt-1 font-marque text-2xl text-gray-900 dark:text-white">{valeur}</p>
      {detail && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</p>}
    </Link>
  );
}

export const TEINTES = {
  indigo: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
  vert: "bg-trimed-brume text-trimed-vert-fonce dark:bg-trimed-vert/15 dark:text-trimed-menthe",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
  violet: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  rouge: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300",
};

export const Vide = ({ texte }: { texte: string }) => <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{texte}</p>;
export const Squelette = ({ h }: { h: string }) => <div className={`${h} animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800`} />;

/** Accueil du robot gardien : salutation, date et résumé de la journée. */
export function Accueil({ prenom, phrase, onActualiser }: { prenom?: string; phrase: string; onActualiser?: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-trimed-brume p-6 sm:p-7 dark:border-gray-800 dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <Symbole taille={72} vivant titre="" className="h-16 w-16 shrink-0 drop-shadow-[0_12px_24px_rgba(39,32,255,0.25)] sm:h-[72px] sm:w-[72px]" />
          <div>
            <p className="text-sm text-brand-600 first-letter:uppercase dark:text-brand-300">{new Date().toLocaleDateString("fr-HT", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="font-marque text-xl text-gray-900 sm:text-2xl dark:text-white">Bonjour{prenom ? `, ${prenom}` : ""}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{phrase}</p>
          </div>
        </div>
        {onActualiser && (
          <button type="button" onClick={onActualiser} className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:self-center dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualiser
          </button>
        )}
      </div>
    </section>
  );
}

/** Liste de rendez-vous : jour, heure, patient, médecin, statut. */
export function ListeRendezVous({ liste, vide, sansPatient = false, sansMedecin = false }: { liste: RendezVousL[]; vide: string; sansPatient?: boolean; sansMedecin?: boolean }) {
  if (!liste.length) return <Vide texte={vide} />;
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {liste.map((r) => (
        <li key={r.rendez_vous_id} className="flex items-center gap-4 py-3">
          <div className="w-20 shrink-0 text-center">
            <p className="text-xs text-gray-500">{jourCourt(r.date_heure)}</p>
            <p className="font-marque text-base text-gray-900 dark:text-white">{heure(r.date_heure)}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{sansPatient ? (r.type_nom || r.motif || "Rendez-vous") : `${r.patient_prenom ?? ""} ${r.patient_nom ?? ""}`}</p>
            <p className="truncate text-xs text-gray-500">
              {[!sansPatient && (r.type_nom || r.motif), !sansMedecin && r.medecin_nom && `Dr ${r.medecin_prenom ?? ""} ${r.medecin_nom}`].filter(Boolean).join(", ") || r.motif}
            </p>
          </div>
          {r.statut_nom && <span className="shrink-0 rounded-full px-2.5 py-1 text-xs text-white" style={{ background: COULEURS_STATUTS[r.statut_nom] ?? r.statut_couleur ?? COULEURS.gris }}>{r.statut_nom}</span>}
        </li>
      ))}
    </ul>
  );
}

/** Raccourcis vers les actions courantes d’un rôle. */
export function Raccourcis({ liens }: { liens: { libelle: string; lien: string; icone: LucideIcon }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {liens.map(({ libelle, lien, icone: Icone }) => (
        <Link key={lien + libelle} to={lien} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3.5 text-sm font-medium text-gray-800 hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-white/5">
          <Icone className="h-5 w-5 shrink-0 text-brand-500" aria-hidden="true" /> {libelle}
        </Link>
      ))}
    </div>
  );
}
