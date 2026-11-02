import { Link } from "react-router-dom";
import { AlertTriangle, BedDouble, CalendarClock, ClipboardList, RefreshCw, Stethoscope, Users } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import Symbole from "../../components/brand/Symbole";
import { useAuth } from "../../context/AuthContext";
import { useDonneesTableau, type DonneesTableau } from "./tableau/donnees";
import { parJour, parMois, prochains, repartitionAges, tauxOccupation, TRANCHES_AGE, variation } from "./tableau/calculs";
import { Anneau, BarresHorizontales, COULEURS, GraphiqueActivite, GraphiqueBarres, Jauge } from "./tableau/Graphiques";

const COULEURS_STATUTS: Record<string, string> = { Planifié: COULEURS.indigo, Confirmé: COULEURS.vert, Terminé: COULEURS.encre, Annulé: COULEURS.rouge, Reporté: COULEURS.orange };
const heure = (iso: string) => new Date(iso).toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" });
const jourCourt = (iso: string) => {
  const d = new Date(iso), auj = new Date();
  const demain = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() + 1);
  if (d.toDateString() === auj.toDateString()) return "Aujourd’hui";
  if (d.toDateString() === demain.toDateString()) return "Demain";
  return d.toLocaleDateString("fr-HT", { weekday: "short", day: "numeric", month: "short" });
};

function Carte({ titre, action, children, className = "" }: { titre: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
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

function Chiffre({ libelle, valeur, detail, icone: Icone, teinte, lien }: { libelle: string; valeur: string | number; detail?: React.ReactNode; icone: typeof Users; teinte: string; lien: string }) {
  return (
    <Link to={lien} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${teinte}`}><Icone className="h-5 w-5" aria-hidden="true" /></span>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{libelle}</p>
      <p className="mt-1 font-marque text-2xl text-gray-900 dark:text-white">{valeur}</p>
      {detail && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</p>}
    </Link>
  );
}

const Vide = ({ texte }: { texte: string }) => <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">{texte}</p>;
const Squelette = ({ h }: { h: string }) => <div className={`${h} animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800`} />;

// Phrase du robot gardien : ce qui demande l’attention aujourd’hui, sinon un mot rassurant.
function phraseDuGardien(d: DonneesTableau) {
  const points: string[] = [];
  const rdv = d.statsRdv?.aujourd_hui ?? 0;
  if (rdv) points.push(`${rdv} rendez-vous aujourd’hui`);
  const ruptures = d.statsMedicaments?.medicaments_rupture ?? 0;
  if (ruptures) points.push(`${ruptures} médicament${ruptures > 1 ? "s" : ""} en rupture`);
  else if (d.stockFaible.length) points.push(`${d.stockFaible.length} médicament${d.stockFaible.length > 1 ? "s" : ""} à réapprovisionner`);
  return points.length ? `À surveiller : ${points.join(" · ")}.` : "Tout est en ordre. Les dossiers sont à leur place.";
}

// Tableau de bord de l’hôpital (propriétaire et administrateur de l’hôpital), calculé à partir des
// vraies données du serveur : listes, statistiques des rendez-vous et du stock.
export default function Home() {
  const { user } = useAuth();
  const { donnees: d, erreur, actualiser } = useDonneesTableau(user?.hopital_id || 0);
  const prenom = (user?.nom_complet || "").split(" ")[0];

  const activite = d ? parJour(d.consultations.map((c) => c.date_consultation), 30) : null;
  const activiteRdv = d ? parJour(d.rendezVous.map((r) => r.date_heure), 30) : null;
  const mensuel = d ? parMois(d.consultations.map((c) => c.date_consultation), 12) : null;
  const ceMois = mensuel ? mensuel.compte[mensuel.compte.length - 1] : 0, moisPasse = mensuel ? mensuel.compte[mensuel.compte.length - 2] : 0;
  const evolution = variation(ceMois, moisPasse);
  const occupes = d ? d.admissions.filter((a) => a.statut === "hospitalise").length : 0;
  const totalLits = d?.lits.length ?? 0;
  const ages = d ? repartitionAges(d.patients.map((p) => p.age)) : [];
  const femmes = d?.patients.filter((p) => p.sexe === "F").length ?? 0;
  const hommes = d?.patients.filter((p) => p.sexe === "M").length ?? 0;
  const statuts = Object.entries(d?.statsRdv?.par_statut ?? {}).filter(([, n]) => n > 0);
  const medecins = Object.entries(d?.statsRdv?.par_medecin ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const aVenir = d ? prochains(d.rendezVous.filter((r) => !/annul/i.test(r.statut_nom || "")), (r) => r.date_heure, 6) : [];

  return (
    <>
      <PageMeta title="Tableau de bord | TRIMED" description="L’activité de l’hôpital en un coup d’œil." />

      <div className="space-y-5 md:space-y-6">
        {/* Accueil du robot gardien */}
        <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-trimed-brume p-6 sm:p-7 dark:border-gray-800 dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Symbole taille={72} vivant titre="" className="h-16 w-16 shrink-0 drop-shadow-[0_12px_24px_rgba(39,32,255,0.25)] sm:h-[72px] sm:w-[72px]" />
              <div>
                <p className="text-sm text-brand-600 first-letter:uppercase dark:text-brand-300">{new Date().toLocaleDateString("fr-HT", { weekday: "long", day: "numeric", month: "long" })}</p>
                <h1 className="font-marque text-xl text-gray-900 sm:text-2xl dark:text-white">Bonjour{prenom ? `, ${prenom}` : ""}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{d ? phraseDuGardien(d) : erreur ? "Le serveur ne répond pas pour l’instant." : "Le gardien rassemble les chiffres du jour…"}</p>
              </div>
            </div>
            <button type="button" onClick={actualiser} className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:self-center dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualiser
            </button>
          </div>
        </section>

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4">
          <Chiffre libelle="Patients" valeur={d ? d.patients.length : "…"} detail={d ? `${femmes} femmes · ${hommes} hommes` : undefined} icone={Users} teinte="bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" lien="/patient" />
          <Chiffre libelle="Rendez-vous aujourd’hui" valeur={d ? d.statsRdv?.aujourd_hui ?? "—" : "…"} detail={d?.statsRdv ? `${d.statsRdv.cette_semaine} cette semaine` : undefined} icone={CalendarClock} teinte="bg-trimed-brume text-trimed-vert-fonce dark:bg-trimed-vert/15 dark:text-trimed-menthe" lien="/rendezvous" />
          <Chiffre libelle="Consultations ce mois" valeur={d ? ceMois : "…"} detail={d ? (evolution === null || ceMois === 0 ? `${moisPasse} le mois dernier` : `${evolution >= 0 ? "+" : ""}${evolution} % par rapport au mois dernier`) : undefined} icone={Stethoscope} teinte="bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" lien="/consultation" />
          <Chiffre libelle="Lits occupés" valeur={d ? `${occupes} / ${totalLits}` : "…"} detail={d ? `${tauxOccupation(occupes, totalLits)} % d’occupation` : undefined} icone={BedDouble} teinte="bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300" lien="/hospitalisation" />
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <Carte titre="Activité des 30 derniers jours" className="col-span-12 xl:col-span-8">
            {activite && activiteRdv
              ? <GraphiqueActivite jours={activite.jours} series={[{ name: "Consultations", data: activite.compte }, { name: "Rendez-vous", data: activiteRdv.compte }]} />
              : <Squelette h="h-[280px]" />}
          </Carte>

          <Carte titre="Occupation des lits" className="col-span-12 md:col-span-6 xl:col-span-4" action={<Link to="/hospitalisation" className="text-sm text-brand-600 dark:text-brand-300">Voir</Link>}>
            {!d ? <Squelette h="h-[250px]" />
              : totalLits === 0 ? <Vide texte="Aucun lit déclaré. Ajoutez vos chambres dans « Paramètres de l’hôpital »." />
              : <>
                  <Jauge valeur={tauxOccupation(occupes, totalLits)} libelle="des lits occupés" />
                  <div className="mt-2 grid grid-cols-2 gap-3 text-center text-sm">
                    <div className="rounded-xl bg-gray-50 py-2.5 dark:bg-white/5"><p className="font-marque text-lg text-gray-900 dark:text-white">{occupes}</p><p className="text-xs text-gray-500">occupés</p></div>
                    <div className="rounded-xl bg-gray-50 py-2.5 dark:bg-white/5"><p className="font-marque text-lg text-gray-900 dark:text-white">{totalLits - occupes}</p><p className="text-xs text-gray-500">libres</p></div>
                  </div>
                </>}
          </Carte>

          <Carte titre="Consultations par mois" className="col-span-12 md:col-span-6 xl:col-span-7">
            {mensuel ? <GraphiqueBarres libelles={mensuel.libelles} valeurs={mensuel.compte} nom="Consultations" /> : <Squelette h="h-[260px]" />}
          </Carte>

          <Carte titre="Rendez-vous par statut" className="col-span-12 md:col-span-6 xl:col-span-5">
            {!d ? <Squelette h="h-[250px]" />
              : statuts.length === 0 ? <Vide texte="Aucun rendez-vous pour l’instant." />
              : <Anneau libelles={statuts.map(([s]) => s)} valeurs={statuts.map(([, n]) => n)} couleurs={statuts.map(([s]) => COULEURS_STATUTS[s] ?? COULEURS.gris)} centre="rendez-vous" />}
          </Carte>

          <Carte titre="Prochains rendez-vous" className="col-span-12 xl:col-span-7" action={<Link to="/rendezvous" className="text-sm text-brand-600 dark:text-brand-300">Tout voir</Link>}>
            {!d ? <Squelette h="h-48" />
              : aVenir.length === 0 ? <Vide texte="Aucun rendez-vous à venir." />
              : <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {aVenir.map((r) => (
                    <li key={r.rendez_vous_id} className="flex items-center gap-4 py-3">
                      <div className="w-20 shrink-0 text-center">
                        <p className="text-xs text-gray-500">{jourCourt(r.date_heure)}</p>
                        <p className="font-marque text-base text-gray-900 dark:text-white">{heure(r.date_heure)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{r.patient_prenom} {r.patient_nom}</p>
                        <p className="truncate text-xs text-gray-500">{r.type_nom || r.motif || "Rendez-vous"} · Dr {r.medecin_prenom} {r.medecin_nom}</p>
                      </div>
                      {r.statut_nom && <span className="shrink-0 rounded-full px-2.5 py-1 text-xs text-white" style={{ background: COULEURS_STATUTS[r.statut_nom] ?? r.statut_couleur ?? COULEURS.gris }}>{r.statut_nom}</span>}
                    </li>
                  ))}
                </ul>}
          </Carte>

          <Carte titre="Patients par âge" className="col-span-12 md:col-span-6 xl:col-span-5" action={<Link to="/patient" className="text-sm text-brand-600 dark:text-brand-300">Dossiers</Link>}>
            {!d ? <Squelette h="h-[240px]" />
              : d.patients.length === 0 ? <Vide texte="Aucun patient enregistré." />
              : <BarresHorizontales libelles={TRANCHES_AGE} valeurs={ages} nom="Patients" couleur={COULEURS.indigo} />}
          </Carte>

          <Carte titre="Médicaments à surveiller" className="col-span-12 md:col-span-6" action={<Link to="/medicament" className="text-sm text-brand-600 dark:text-brand-300">Stock</Link>}>
            {!d ? <Squelette h="h-40" />
              : d.stockFaible.length === 0 ? <Vide texte="Aucun médicament sous le seuil de réapprovisionnement." />
              : <ul className="space-y-3">
                  {d.stockFaible.slice(0, 6).map((m) => {
                    const pct = m.stock_minimum ? Math.min(100, Math.round((m.stock_actuel / m.stock_minimum) * 100)) : 0;
                    return (
                      <li key={m.medicament_id}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 text-gray-900 dark:text-white">
                            {m.stock_actuel === 0 && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" aria-label="Rupture" />}
                            <span className="truncate">{m.nom} <span className="text-xs text-gray-500">{m.dosage_standard}</span></span>
                          </span>
                          <span className="shrink-0 font-marque text-xs text-gray-600 dark:text-gray-300">{m.stock_actuel} / {m.stock_minimum}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800"><div className={`h-1.5 rounded-full ${m.stock_actuel === 0 ? "bg-red-500" : "bg-orange-400"}`} style={{ width: `${Math.max(pct, 3)}%` }} /></div>
                      </li>
                    );
                  })}
                </ul>}
          </Carte>

          <Carte titre="Médecins les plus sollicités" className="col-span-12 md:col-span-6" action={<span className="flex items-center gap-1 text-xs text-gray-500"><ClipboardList className="h-3.5 w-3.5" aria-hidden="true" /> rendez-vous</span>}>
            {!d ? <Squelette h="h-[240px]" />
              : medecins.length === 0 ? <Vide texte="Pas encore de rendez-vous par médecin." />
              : <BarresHorizontales libelles={medecins.map(([m]) => m)} valeurs={medecins.map(([, n]) => n)} nom="Rendez-vous" hauteur={Math.max(180, medecins.length * 42)} />}
          </Carte>
        </div>
      </div>
    </>
  );
}
