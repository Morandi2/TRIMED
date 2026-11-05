import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRightLeft, BedDouble, LogOut, Plus, RefreshCw, Search } from "lucide-react";
import { Modal } from "../../../components/ui/modal";
import apiClient from "../../../api/apiConfig";
import { lireTout } from "../../../api/listes";
import { etatLit, LIBELLES_LIT } from "../Disponibilites/etats";
import { synchroniserLits } from "../Disponibilites/synchronisation";

interface Chambre { id: number; numero: string; etage: number }
interface Lit { id: number; numero_lit: string; statut?: string; chambre: number }
interface Admission {
  id: number; patient: number; lit: number; motif?: string; notes?: string; statut: string; date_admission: string; date_sortie?: string | null;
  // Champs ajoutés côté serveur avec les visites (absents tant que le serveur n'est pas à jour).
  medecin_responsable?: number | null; origine?: string; mouvements?: { lit: number; numero_lit: string; date_debut: string; date_fin: string | null }[];
}
interface Medecin { medecin_id: number; nom: string; prenom: string }
const ORIGINES: Record<string, string> = { consultation: 'Consultation', urgence: 'Urgence', transfert: 'Transfert d’un autre établissement', programmee: 'Admission programmée' };
interface Patient { patient_id: number; nom: string; prenom: string; numero_dossier_medical?: string }

const champ = "h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
const dateHeure = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("fr-HT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const jours = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5));
const s = (n: number) => (n > 1 ? "s" : "");
const pourChampDate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const LIT_PRIS = "Ce lit vient d’être attribué à un autre patient. Choisissez-en un autre.";
const admissionsActives = () => lireTout<Admission>("/hospitalisation/admissions/", { statut: "hospitalise" }, { sansCache: true });

type Fenetre = { type: "admission" } | { type: "sortie"; admission: Admission } | { type: "lit"; admission: Admission } | null;

/**
 * Hospitalisations : qui est hospitalisé, dans quel lit, depuis quand. Le secrétariat admet, fait sortir et
 * change de lit ; seuls les lits libres sont proposés. Le statut des lits suit automatiquement.
 */
export default function Admissions({ tenantId, peutGerer }: { tenantId: number; peutGerer: boolean }) {
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [lits, setLits] = useState<Lit[]>([]);
  const [admissions, setAdmissions] = useState<Admission[] | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [erreur, setErreur] = useState("");
  const [indisponible, setIndisponible] = useState(false);
  const [message, setMessage] = useState("");
  const [fenetre, setFenetre] = useState<Fenetre>(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const [ch, li, ad, pa, me] = await Promise.all([
        lireTout<Chambre>("/hospitalisation/chambres/", { tenant: tenantId }, { sansCache: true }).catch(() => [] as Chambre[]),
        lireTout<Lit>("/hospitalisation/lits/", {}, { sansCache: true, maxPages: 50 }).catch(() => [] as Lit[]),
        lireTout<Admission>("/hospitalisation/admissions/", { ordering: "-date_admission" }, { sansCache: true, maxPages: 20 }),
        lireTout<Patient>("/patients/").catch(() => [] as Patient[]),
        lireTout<Medecin>("/medical/medecins/").catch(() => [] as Medecin[]),
      ]);
      const ids = new Set(ch.map((c) => c.id));
      setChambres(ch);
      setLits(li.filter((l) => ids.has(l.chambre)));
      setAdmissions(ad);
      setPatients(pa);
      setMedecins(me);
      setErreur("");
      setIndisponible(false);
    } catch (e) {
      const statut = (e as { response?: { status?: number } }).response?.status;
      setAdmissions([]);
      setIndisponible(true);
      setErreur(statut === 403 ? "Votre rôle n’a pas encore accès aux hospitalisations sur le serveur. L’équipe TRIMED doit ouvrir cet accès." : "Les hospitalisations n’ont pas pu être chargées. Réessayez dans un instant.");
    }
  }, [tenantId]);

  useEffect(() => { charger(); }, [charger]);

  const nomMedecin = (id: number) => { const m = medecins.find((x) => x.medecin_id === id); return m ? `${m.prenom} ${m.nom}` : `n° ${id}`; };
  const nomPatient = (id: number) => { const p = patients.find((x) => x.patient_id === id); return p ? `${p.prenom} ${p.nom}` : `Patient n° ${id}`; };
  const libelleLit = (id: number) => {
    const l = lits.find((x) => x.id === id); if (!l) return `Lit n° ${id}`;
    const c = chambres.find((x) => x.id === l.chambre);
    return c ? `Lit ${l.numero_lit}, chambre ${c.numero} (étage ${c.etage})` : `Lit ${l.numero_lit}`;
  };

  const enCours = useMemo(() => (admissions ?? []).filter((a) => a.statut === "hospitalise"), [admissions]);
  const sorties = useMemo(() => (admissions ?? []).filter((a) => a.statut !== "hospitalise").slice(0, 10), [admissions]);
  // Lits proposés : libres d’abord, puis réservés ; jamais un lit occupé, en nettoyage ou hors service.
  const litsProposes = useMemo(() => lits
    .map((l) => ({ l, e: etatLit(l, enCours).etat }))
    .filter((x) => x.e === "libre" || x.e === "reserve")
    .sort((a, b) => (a.e === b.e ? a.l.numero_lit.localeCompare(b.l.numero_lit, "fr", { numeric: true }) : a.e === "libre" ? -1 : 1)), [lits, enCours]);
  const nbLibres = litsProposes.filter((x) => x.e === "libre").length;
  const patientsLibres = useMemo(() => patients.filter((p) => !enCours.some((a) => a.patient === p.patient_id)), [patients, enCours]);

  const apres = async (texte: string) => {
    setFenetre(null);
    setMessage(texte);
    await synchroniserLits(tenantId);
    await charger();
  };

  // ---- Nouvelle admission ----
  const [form, setForm] = useState({ patient: "", lit: "", motif: "", notes: "", recherche: "", medecin: "", origine: "" });
  const admettre = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.patient || !form.lit || !form.motif.trim()) { setErreur("Choisissez le patient, le lit et le motif."); return; }
    const patient = Number(form.patient), lit = Number(form.lit);
    setEnvoi(true); setErreur("");
    try {
      // Vérification juste avant l’enregistrement : le lit a pu être pris entre-temps.
      const actives = await admissionsActives();
      if (actives.some((a) => a.lit === lit)) { setErreur(LIT_PRIS); await charger(); return; }
      if (actives.some((a) => a.patient === patient)) { setErreur("Ce patient est déjà hospitalisé."); await charger(); return; }
      await apiClient.post("/hospitalisation/admissions/", {
        patient, lit, motif: form.motif.trim(), notes: form.notes.trim(), statut: "hospitalise",
        ...(form.medecin ? { medecin_responsable: Number(form.medecin) } : {}), ...(form.origine ? { origine: form.origine } : {}),
      });
      setForm({ patient: "", lit: "", motif: "", notes: "", recherche: "", medecin: "", origine: "" });
      await apres(`${nomPatient(patient)} est hospitalisé(e) : ${libelleLit(lit).toLowerCase()}.`);
    } catch {
      setErreur("L’admission n’a pas pu être enregistrée.");
    } finally { setEnvoi(false); }
  };

  // ---- Sortie ----
  const [sortie, setSortie] = useState({ statut: "sorti", date: pourChampDate(new Date()) });
  const faireSortir = async (e: FormEvent, a: Admission) => {
    e.preventDefault();
    setEnvoi(true); setErreur("");
    try {
      await apiClient.patch(`/hospitalisation/admissions/${a.id}/`, { statut: sortie.statut, date_sortie: new Date(sortie.date).toISOString() });
      await apres(`${nomPatient(a.patient)} : sortie enregistrée. Le lit passe en nettoyage.`);
    } catch {
      setErreur("La sortie n’a pas pu être enregistrée.");
    } finally { setEnvoi(false); }
  };

  // ---- Changement de lit ----
  const [nouveauLit, setNouveauLit] = useState("");
  const changerLit = async (e: FormEvent, a: Admission) => {
    e.preventDefault();
    if (!nouveauLit) return;
    const lit = Number(nouveauLit);
    setEnvoi(true); setErreur("");
    try {
      if ((await admissionsActives()).some((x) => x.lit === lit)) { setErreur(LIT_PRIS); await charger(); return; }
      await apiClient.patch(`/hospitalisation/admissions/${a.id}/`, { lit });
      setNouveauLit("");
      await apres(`${nomPatient(a.patient)} change de lit : ${libelleLit(lit).toLowerCase()}.`);
    } catch {
      setErreur("Le changement de lit n’a pas pu être enregistré.");
    } finally { setEnvoi(false); }
  };

  const optionsLits = (sauf?: number) => litsProposes.filter((x) => x.l.id !== sauf).map(({ l, e }) => (
    <option key={l.id} value={l.id}>{libelleLit(l.id)}{e === "reserve" ? ` (${LIBELLES_LIT.reserve.toLowerCase()})` : ""}</option>
  ));
  const patientsFiltres = patientsLibres.filter((p) => !form.recherche || `${p.prenom} ${p.nom} ${p.numero_dossier_medical ?? ""}`.toLowerCase().includes(form.recherche.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {admissions === null ? "Chargement…" : indisponible ? "" : `${enCours.length} patient${s(enCours.length)} hospitalisé${s(enCours.length)}, ${nbLibres} lit${s(nbLibres)} libre${s(nbLibres)}.`}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={charger} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualiser</button>
          {peutGerer && !indisponible && <button type="button" onClick={() => { setErreur(""); setFenetre({ type: "admission" }); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-3.5 text-sm font-medium text-white hover:bg-brand-600"><Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle admission</button>}
        </div>
      </div>

      {message && <p role="status" className="rounded-xl bg-trimed-brume px-4 py-3 text-sm text-trimed-vert-fonce dark:bg-white/5 dark:text-trimed-menthe">{message}</p>}
      {erreur && !fenetre && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{erreur}</p>}

      {admissions === null ? <div className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
        : indisponible ? null
        : enCours.length === 0 ? <p className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800">Aucun patient hospitalisé en ce moment.</p>
        : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-white/[0.03]">
            {enCours.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><BedDouble className="h-5 w-5" aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{nomPatient(a.patient)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{libelleLit(a.lit)}</p>
                    {(a.medecin_responsable || a.origine) && <p className="text-xs text-gray-500">{a.medecin_responsable ? `Dr ${nomMedecin(a.medecin_responsable)}` : ""}{a.medecin_responsable && a.origine ? ", " : ""}{a.origine ? (ORIGINES[a.origine] ?? a.origine).toLowerCase() : ""}</p>}
                    {(a.mouvements?.length ?? 0) > 1 && <p className="text-xs text-gray-500">Lits successifs : {a.mouvements!.map((m) => m.numero_lit).join(" puis ")}</p>}
                    <p className="text-xs text-gray-500">Admis le {dateHeure(a.date_admission)}, depuis {jours(a.date_admission)} jour{jours(a.date_admission) > 1 ? "s" : ""}{a.motif ? `. ${a.motif}` : ""}</p>
                  </div>
                </div>
                {peutGerer && (
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => { setErreur(""); setNouveauLit(""); setFenetre({ type: "lit", admission: a }); }} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"><ArrowRightLeft className="h-4 w-4" aria-hidden="true" /> Changer de lit</button>
                    <button type="button" onClick={() => { setErreur(""); setSortie({ statut: "sorti", date: pourChampDate(new Date()) }); setFenetre({ type: "sortie", admission: a }); }} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600"><LogOut className="h-4 w-4" aria-hidden="true" /> Sortie</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

      {sorties.length > 0 && (
        <details className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">Sorties récentes ({sorties.length})</summary>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {sorties.map((a) => (
              <li key={a.id}>{nomPatient(a.patient)}, {libelleLit(a.lit).toLowerCase()} : admis le {dateHeure(a.date_admission)}, {a.statut === "transfere" ? "transféré" : "sorti"} le {dateHeure(a.date_sortie) || "?"}.</li>
            ))}
          </ul>
        </details>
      )}

      {/* Nouvelle admission */}
      <Modal isOpen={fenetre?.type === "admission"} onClose={() => setFenetre(null)} className="max-w-[520px] p-6">
        <form onSubmit={admettre} className="space-y-4">
          <h2 className="font-marque text-lg text-gray-900 dark:text-white">Nouvelle admission</h2>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Patient
            <span className="relative mt-1.5 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input className={`${champ} pl-9`} placeholder="Rechercher par nom ou dossier" value={form.recherche} onChange={(e) => setForm({ ...form, recherche: e.target.value })} />
            </span>
            <select className={`${champ} mt-2`} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
              <option value="">Choisir un patient ({patientsFiltres.length})</option>
              {patientsFiltres.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.prenom} {p.nom}{p.numero_dossier_medical ? `, dossier ${p.numero_dossier_medical}` : ""}</option>)}
            </select>
          </label>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Lit
            <select className={`${champ} mt-1.5`} value={form.lit} onChange={(e) => setForm({ ...form, lit: e.target.value })} required>
              <option value="">{litsProposes.length ? "Choisir un lit libre" : "Aucun lit libre"}</option>
              {optionsLits()}
            </select>
          </label>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Motif
            <input className={`${champ} mt-1.5`} value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} placeholder="Ex. : observation après chirurgie" required maxLength={200} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-gray-700 dark:text-gray-300">Médecin responsable
              <select className={`${champ} mt-1.5`} value={form.medecin} onChange={(e) => setForm({ ...form, medecin: e.target.value })}>
                <option value="">Non précisé</option>
                {medecins.map((m) => <option key={m.medecin_id} value={m.medecin_id}>Dr {m.prenom} {m.nom}</option>)}
              </select>
            </label>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Origine
              <select className={`${champ} mt-1.5`} value={form.origine} onChange={(e) => setForm({ ...form, origine: e.target.value })}>
                <option value="">Non précisée</option>
                {Object.entries(ORIGINES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm text-gray-700 dark:text-gray-300">Notes (facultatif)
            <textarea className={`${champ} mt-1.5 h-20 py-2`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          {erreur && <p role="alert" className="text-sm text-red-600">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setFenetre(null)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">Annuler</button>
            <button type="submit" disabled={envoi || !litsProposes.length} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{envoi ? "Enregistrement…" : "Admettre"}</button>
          </div>
        </form>
      </Modal>

      {/* Sortie */}
      <Modal isOpen={fenetre?.type === "sortie"} onClose={() => setFenetre(null)} className="max-w-[460px] p-6">
        {fenetre?.type === "sortie" && (
          <form onSubmit={(e) => faireSortir(e, fenetre.admission)} className="space-y-4">
            <h2 className="font-marque text-lg text-gray-900 dark:text-white">Sortie de {nomPatient(fenetre.admission.patient)}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{libelleLit(fenetre.admission.lit)}. Le lit passera en nettoyage.</p>
            <fieldset className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <label className="flex items-center gap-2"><input type="radio" name="statut" checked={sortie.statut === "sorti"} onChange={() => setSortie({ ...sortie, statut: "sorti" })} /> Sortie (retour à domicile)</label>
              <label className="flex items-center gap-2"><input type="radio" name="statut" checked={sortie.statut === "transfere"} onChange={() => setSortie({ ...sortie, statut: "transfere" })} /> Transfert vers un autre établissement</label>
            </fieldset>
            <label className="block text-sm text-gray-700 dark:text-gray-300">Date et heure
              <input type="datetime-local" className={`${champ} mt-1.5`} value={sortie.date} min={pourChampDate(new Date(fenetre.admission.date_admission))} max={pourChampDate(new Date(Date.now() + 60000))} onChange={(e) => setSortie({ ...sortie, date: e.target.value })} required />
            </label>
            {erreur && <p role="alert" className="text-sm text-red-600">{erreur}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFenetre(null)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">Annuler</button>
              <button type="submit" disabled={envoi} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{envoi ? "Enregistrement…" : "Enregistrer la sortie"}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Changement de lit */}
      <Modal isOpen={fenetre?.type === "lit"} onClose={() => setFenetre(null)} className="max-w-[460px] p-6">
        {fenetre?.type === "lit" && (
          <form onSubmit={(e) => changerLit(e, fenetre.admission)} className="space-y-4">
            <h2 className="font-marque text-lg text-gray-900 dark:text-white">Changer de lit</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{nomPatient(fenetre.admission.patient)}, actuellement {libelleLit(fenetre.admission.lit).toLowerCase()}. L’ancien lit passera en nettoyage.</p>
            <select className={champ} value={nouveauLit} onChange={(e) => setNouveauLit(e.target.value)} required>
              <option value="">{litsProposes.length ? "Choisir un lit libre" : "Aucun lit libre"}</option>
              {optionsLits(fenetre.admission.lit)}
            </select>
            {erreur && <p role="alert" className="text-sm text-red-600">{erreur}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFenetre(null)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">Annuler</button>
              <button type="submit" disabled={envoi || !nouveauLit} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{envoi ? "Enregistrement…" : "Changer de lit"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
