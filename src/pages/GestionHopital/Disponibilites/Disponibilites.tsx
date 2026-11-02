import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CalendarClock, DoorOpen, RefreshCw, X } from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Modal } from "../../../components/ui/modal";
import apiClient from "../../../api/apiConfig";
import { lireTout } from "../../../api/listes";
import { useAuth } from "../../../context/AuthContext";
import { useUser } from "../../../context/UserContext";
import {
  COULEURS_ETAT, ETATS_LIT_MANUELS, ETATS_SALLE_MANUELS, LIBELLES_LIT, LIBELLES_SALLE,
  etatLit, etatSalle, reservationsActives, type AdmissionActive, type EtatLit, type EtatSalle, type Reservation,
} from "./etats";

interface Chambre { id: number; numero: string; etage: number; type_chambre: string }
interface Lit { id: number; numero_lit: string; statut?: string; chambre: number }
interface Admission extends AdmissionActive { id: number; patient: number }
interface Salle { id: number; nom: string; code?: string; capacite?: number; statut?: string; type_salle?: number }
interface TypeSalle { id: number; nom: string }
interface Patient { patient_id: number; nom: string; prenom: string }

// Une source refusée par le serveur (403) n’empêche pas d’afficher les autres.
type Source<T> = { donnees: T[]; refuse: boolean };
const lire = async <T,>(chemin: string, params: Record<string, unknown> = {}): Promise<Source<T>> => {
  try { return { donnees: await lireTout<T>(chemin, params, { sansCache: true, maxPages: 50 }), refuse: false }; }
  catch (e) { const statut = (e as { response?: { status?: number } }).response?.status; if (statut === 403) return { donnees: [], refuse: true }; throw e; }
};

const heure = (iso: string) => new Date(iso).toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" });
const jour = (iso: string) => { const d = new Date(iso); return d.toDateString() === new Date().toDateString() ? "aujourd’hui" : d.toLocaleDateString("fr-HT", { weekday: "short", day: "numeric", month: "short" }); };
const champ = "h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

/**
 * Lits et salles : qui est libre, maintenant. Le secrétariat indique quand un lit ou une salle est libre,
 * réservé, en nettoyage ou hors service ; un lit avec une hospitalisation en cours est « Occupé » tout seul.
 */
export default function Disponibilites() {
  const { user } = useAuth();
  const { permissions } = useUser();
  const peutGerer = permissions.canGererDisponibilites;

  const [chambres, setChambres] = useState<Source<Chambre> | null>(null);
  const [lits, setLits] = useState<Source<Lit> | null>(null);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [salles, setSalles] = useState<Source<Salle> | null>(null);
  const [types, setTypes] = useState<Record<number, string>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [majLe, setMajLe] = useState<Date | null>(null);
  const [erreur, setErreur] = useState("");
  const [litChoisi, setLitChoisi] = useState<Lit | null>(null);
  const [salleChoisie, setSalleChoisie] = useState<Salle | null>(null);
  const [etage, setEtage] = useState<number | "tous">("tous");
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const [ch, li, ad, pa, sa, ty, re] = await Promise.all([
        lire<Chambre>("/hospitalisation/chambres/", { tenant: user?.hopital_id }),
        lire<Lit>("/hospitalisation/lits/"),
        lire<Admission>("/hospitalisation/admissions/", { statut: "hospitalise" }),
        lire<Patient>("/patients/"),
        lire<Salle>("/salles-medicales/salles/"),
        lire<TypeSalle>("/salles-medicales/type-salles/"),
        lire<Reservation>("/salles-medicales/reservations/"),
      ]);
      const ids = new Set(ch.donnees.map((c) => c.id));
      setChambres(ch);
      setLits({ ...li, donnees: li.donnees.filter((l) => ids.has(l.chambre)) });
      setAdmissions(ad.donnees);
      setPatients(Object.fromEntries(pa.donnees.map((p) => [p.patient_id, `${p.prenom} ${p.nom}`])));
      // Ordre stable (par nom) : le serveur ne renvoie pas toujours les salles dans le même ordre.
      setSalles({ ...sa, donnees: [...sa.donnees].sort((a, b) => a.nom.localeCompare(b.nom, "fr")) });
      setTypes(Object.fromEntries(ty.donnees.map((t) => [t.id, t.nom])));
      setReservations(re.donnees);
      setMajLe(new Date());
      setErreur("");
    } catch {
      setErreur("Les disponibilités n’ont pas pu être mises à jour. Nouvel essai dans une minute.");
    }
  }, [user?.hopital_id]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, 60 * 1000);
    return () => clearInterval(id);
  }, [charger]);

  // ---- Lits ----
  const etages = useMemo(() => [...new Set((chambres?.donnees ?? []).map((c) => c.etage))].sort((a, b) => a - b), [chambres]);
  const etatsLits = useMemo(() => new Map((lits?.donnees ?? []).map((l) => [l.id, etatLit(l, admissions)])), [lits, admissions]);
  const compteLits = (e: EtatLit) => [...etatsLits.values()].filter((x) => x.etat === e).length;

  const changerLit = async (lit: Lit, statut: EtatLit) => {
    setEnvoi(true);
    try {
      await apiClient.patch(`/hospitalisation/lits/${lit.id}/`, { statut });
      setLits((s) => s && { ...s, donnees: s.donnees.map((l) => (l.id === lit.id ? { ...l, statut } : l)) });
      setLitChoisi(null);
    } catch {
      setErreur(`Le lit ${lit.numero_lit} n’a pas pu être mis à jour.`);
    } finally { setEnvoi(false); }
  };

  // ---- Salles ----
  const etatsSalles = useMemo(() => new Map((salles?.donnees ?? []).map((s) => [s.id, etatSalle(s, reservations)])), [salles, reservations]);
  const sallesDispo = [...etatsSalles.values()].filter((x) => x.etat === "disponible").length;

  const changerSalle = async (salle: Salle, statut: EtatSalle) => {
    setEnvoi(true);
    try {
      await apiClient.patch(`/salles-medicales/salles/${salle.id}/`, { statut });
      setSalles((s) => s && { ...s, donnees: s.donnees.map((x) => (x.id === salle.id ? { ...x, statut } : x)) });
    } catch {
      setErreur(`La salle ${salle.nom} n’a pas pu être mise à jour.`);
    } finally { setEnvoi(false); }
  };

  const [creneau, setCreneau] = useState({ motif: "Nettoyage", date: new Date().toISOString().slice(0, 10), debut: "", fin: "" });
  const bloquer = async (e: FormEvent) => {
    e.preventDefault();
    if (!salleChoisie || !creneau.debut || !creneau.fin) return;
    const debut = new Date(`${creneau.date}T${creneau.debut}`), fin = new Date(`${creneau.date}T${creneau.fin}`);
    if (fin <= debut) { setErreur("L’heure de fin doit suivre l’heure de début."); return; }
    setEnvoi(true);
    try {
      await apiClient.post("/salles-medicales/reservations/", { salle: salleChoisie.id, utilisateur: user?.utilisateur_id, motif: creneau.motif, statut: "confirmee", date_debut: debut.toISOString(), date_fin: fin.toISOString() });
      setCreneau((c) => ({ ...c, debut: "", fin: "" }));
      setSalleChoisie(null);
      await charger();
    } catch {
      setErreur("Le créneau n’a pas pu être enregistré.");
    } finally { setEnvoi(false); }
  };
  const annuler = async (r: Reservation) => {
    setEnvoi(true);
    try { await apiClient.patch(`/salles-medicales/reservations/${r.id}/`, { statut: "annulee" }); await charger(); }
    catch { setErreur("Le créneau n’a pas pu être annulé."); }
    finally { setEnvoi(false); }
  };

  const chambresAffichees = (chambres?.donnees ?? []).filter((c) => etage === "tous" || c.etage === etage).sort((a, b) => a.etage - b.etage || a.numero.localeCompare(b.numero, "fr", { numeric: true }));
  const totalLits = lits?.donnees.length ?? 0;

  return (
    <>
      <PageMeta title="Lits et salles | TRIMED" description="Les lits et les salles disponibles, en temps réel." />
      <PageBreadcrumb pageTitle="Lits et salles" />
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-marque text-xl text-gray-900 sm:text-2xl dark:text-white">Lits et salles</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {peutGerer ? "Indiquez quand un lit ou une salle est libre ou indisponible : toute l’équipe le voit aussitôt." : "Les disponibilités, telles que le secrétariat les tient à jour."}
              {majLe && <span className="text-gray-400"> Mis à jour à {majLe.toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" })}.</span>}
            </p>
          </div>
          <button type="button" onClick={charger} className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualiser</button>
        </div>

        {erreur && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{erreur}</p>}

        {/* Résumé */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Lits libres", lits?.refuse ? "—" : `${compteLits("libre")} / ${totalLits}`, "text-trimed-vert-fonce"],
            ["Lits occupés", lits?.refuse ? "—" : compteLits("occupe"), "text-brand-600"],
            ["En nettoyage", lits?.refuse ? "—" : compteLits("nettoyage"), "text-sky-600"],
            ["Hors service", lits?.refuse ? "—" : compteLits("hors_service"), "text-gray-500"],
            ["Salles disponibles", salles?.refuse ? "—" : `${sallesDispo} / ${salles?.donnees.length ?? 0}`, "text-trimed-vert-fonce"],
            ["Créneaux à venir", salles?.refuse ? "—" : reservations.filter((r) => (r.statut ?? "confirmee") === "confirmee" && new Date(r.date_fin) > new Date()).length, "text-amber-600"],
          ].map(([libelle, valeur, couleur]) => (
            <div key={libelle as string} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-xs text-gray-500 dark:text-gray-400">{libelle}</p>
              <p className={`mt-1 font-marque text-xl ${couleur}`}>{chambres ? valeur : "…"}</p>
            </div>
          ))}
        </div>

        {/* Lits */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white"><BedDouble className="h-5 w-5 text-brand-500" aria-hidden="true" /> Lits</h2>
            {etages.length > 1 && (
              <div className="flex rounded-xl bg-gray-100 p-1 text-sm dark:bg-gray-800" role="group" aria-label="Étage">
                {(["tous", ...etages] as (number | "tous")[]).map((e) => (
                  <button key={e} type="button" onClick={() => setEtage(e)} aria-pressed={etage === e} className={`rounded-lg px-3 py-1 ${etage === e ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{e === "tous" ? "Tous" : `Étage ${e}`}</button>
                ))}
              </div>
            )}
          </div>
          {!lits ? <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            : lits.refuse ? <p className="py-6 text-sm text-gray-500">Les lits apparaîtront ici dès que l’équipe TRIMED aura ouvert leur accès à votre rôle.</p>
            : chambresAffichees.length === 0 ? <p className="py-6 text-sm text-gray-500">Aucune chambre déclarée. L’administrateur les ajoute dans « Paramètres de l’hôpital ».</p>
            : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {chambresAffichees.map((c) => (
                  <div key={c.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                    <p className="font-marque text-sm text-gray-900 dark:text-white">Chambre {c.numero} <span className="font-texte text-xs text-gray-500">(étage {c.etage})</span></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lits.donnees.filter((l) => l.chambre === c.id).map((l) => {
                        const { etat, automatique } = etatsLits.get(l.id)!;
                        const admission = admissions.find((a) => a.lit === l.id && a.statut === "hospitalise");
                        return (
                          <button key={l.id} type="button" disabled={!peutGerer && !automatique} onClick={() => setLitChoisi(l)}
                            title={automatique ? `Hospitalisé : ${patients[admission?.patient ?? 0] ?? "patient"}` : LIBELLES_LIT[etat]}
                            className={`min-w-[5.5rem] rounded-lg px-2.5 py-2 text-left text-xs transition-opacity disabled:cursor-default ${COULEURS_ETAT[etat]} ${peutGerer || automatique ? "hover:opacity-90" : ""}`}>
                            <span className="block font-semibold">{l.numero_lit}</span>
                            <span className="block opacity-90">{LIBELLES_LIT[etat]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>

        {/* Salles */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white"><DoorOpen className="h-5 w-5 text-brand-500" aria-hidden="true" /> Salles médicales</h2>
          {!salles ? <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            : salles.refuse ? <p className="py-6 text-sm text-gray-500">Les salles apparaîtront ici dès que l’équipe TRIMED aura ouvert leur accès à votre rôle.</p>
            : salles.donnees.length === 0 ? <p className="py-6 text-sm text-gray-500">Aucune salle médicale enregistrée.</p>
            : (
              <ul className="grid gap-4 md:grid-cols-2">
                {salles.donnees.map((s) => {
                  const { etat, automatique, enCours } = etatsSalles.get(s.id)!;
                  const aVenir = reservationsActives(s.id, reservations).filter((r) => r !== enCours).slice(0, 3);
                  return (
                    <li key={s.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900 dark:text-white">{s.nom}</p>
                          <p className="text-xs text-gray-500">{[types[s.type_salle ?? 0], s.capacite ? `${s.capacite} places` : null].filter(Boolean).join(", ")}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${COULEURS_ETAT[etat]}`}>{LIBELLES_SALLE[etat]}</span>
                      </div>
                      {enCours && <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{enCours.motif} jusqu’à {heure(enCours.date_fin)}</p>}
                      {aVenir.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {aVenir.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-300">
                              <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />{r.motif}, {jour(r.date_debut)} de {heure(r.date_debut)} à {heure(r.date_fin)}</span>
                              {peutGerer && <button type="button" onClick={() => annuler(r)} disabled={envoi} className="rounded p-1 text-gray-400 hover:text-red-500" aria-label="Annuler ce créneau"><X className="h-3.5 w-3.5" /></button>}
                            </li>
                          ))}
                        </ul>
                      )}
                      {peutGerer && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <select className={`${champ} h-9 text-xs`} value={automatique ? "" : etat} disabled={automatique || envoi} onChange={(e) => changerSalle(s, e.target.value as EtatSalle)} aria-label={`État de ${s.nom}`}>
                            {automatique && <option value="">Créneau en cours</option>}
                            {ETATS_SALLE_MANUELS.map((x) => <option key={x} value={x}>{LIBELLES_SALLE[x]}</option>)}
                          </select>
                          <button type="button" onClick={() => setSalleChoisie(s)} className="h-9 rounded-xl border border-gray-200 px-3 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5">Prévoir une indisponibilité</button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
        </section>
      </div>

      {/* Changer l’état d’un lit */}
      <Modal isOpen={!!litChoisi} onClose={() => setLitChoisi(null)} className="max-w-[440px] p-6">
        {litChoisi && (() => {
          const { etat, automatique } = etatsLits.get(litChoisi.id) ?? { etat: "libre" as EtatLit, automatique: false };
          const admission = admissions.find((a) => a.lit === litChoisi.id && a.statut === "hospitalise");
          return (
            <div>
              <h2 className="font-marque text-lg text-gray-900 dark:text-white">Lit {litChoisi.numero_lit}</h2>
              {automatique ? (
                <>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Occupé par {patients[admission?.patient ?? 0] ?? "un patient hospitalisé"}. Le lit se libère à la sortie du patient, enregistrée dans Hospitalisation.</p>
                  {permissions.canGererHospitalisation && <Link to="/hospitalisation" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Ouvrir Hospitalisation</Link>}
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-gray-500">État actuel : {LIBELLES_LIT[etat]}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {ETATS_LIT_MANUELS.map((x) => (
                      <button key={x} type="button" disabled={envoi || x === etat} onClick={() => changerLit(litChoisi, x)} className={`rounded-xl px-3 py-2.5 text-sm font-medium disabled:opacity-40 ${COULEURS_ETAT[x]}`}>{LIBELLES_LIT[x]}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Prévoir une indisponibilité de salle */}
      <Modal isOpen={!!salleChoisie} onClose={() => setSalleChoisie(null)} className="max-w-[460px] p-6">
        {salleChoisie && (
          <form onSubmit={bloquer}>
            <h2 className="font-marque text-lg text-gray-900 dark:text-white">{salleChoisie.nom}</h2>
            <p className="mt-1 text-sm text-gray-500">La salle sera indiquée indisponible à toute l’équipe pendant ce créneau.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs text-gray-500">Motif
                <select className={`${champ} mt-1 w-full`} value={creneau.motif} onChange={(e) => setCreneau({ ...creneau, motif: e.target.value })}>
                  {["Nettoyage", "Maintenance", "Intervention", "Réservée"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label className="col-span-2 text-xs text-gray-500">Date
                <input type="date" required className={`${champ} mt-1 w-full`} value={creneau.date} onChange={(e) => setCreneau({ ...creneau, date: e.target.value })} />
              </label>
              <label className="text-xs text-gray-500">De
                <input type="time" required className={`${champ} mt-1 w-full`} value={creneau.debut} onChange={(e) => setCreneau({ ...creneau, debut: e.target.value })} />
              </label>
              <label className="text-xs text-gray-500">À
                <input type="time" required className={`${champ} mt-1 w-full`} value={creneau.fin} onChange={(e) => setCreneau({ ...creneau, fin: e.target.value })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSalleChoisie(null)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">Fermer</button>
              <button type="submit" disabled={envoi} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{envoi ? "Enregistrement…" : "Enregistrer le créneau"}</button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
