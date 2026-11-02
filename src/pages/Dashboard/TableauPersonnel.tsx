import { Link } from "react-router-dom";
import { AlertTriangle, BedDouble, CalendarClock, CalendarPlus2, ClipboardList, DoorOpen, FileText, FlaskConical, Pill, Stethoscope, UserPlus, Users, Wallet } from "lucide-react";
import { etatSalle } from "../GestionHopital/Disponibilites/etats";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { useDonneesPersonnel, type DonneesPersonnel, type RolePersonnel } from "./tableau/donneesPersonnel";
import { parMois, prochains, tauxOccupation } from "./tableau/calculs";
import { Anneau, COULEURS, GraphiqueBarres, Jauge } from "./tableau/Graphiques";
import { Accueil, Carte, Chiffre, COULEURS_STATUTS, dateLongue, ListeRendezVous, Raccourcis, Squelette, TEINTES, Vide } from "./tableau/elements";
import { dateLocale } from "../../utils/dates";

const estAujourdhui = (iso: string) => dateLocale(iso).toDateString() === new Date().toDateString();
const depuisJours = (iso: string, n: number) => dateLocale(iso).getTime() >= Date.now() - n * 864e5;
// Accord simple : chaque mot du groupe prend un « s » au pluriel, sauf les mots invariables.
const INVARIABLES = new Set(["rendez-vous", "à", "venir", "en", "de"]);
const pluriel = (n: number, groupe: string) => `${n} ${n > 1 ? groupe.split(" ").map((m) => (INVARIABLES.has(m) || m.endsWith("s") ? m : `${m}s`)).join(" ") : groupe}`;
const FORMES: Record<string, string> = { comprime: "Comprimés", capsule: "Gélules", sirop: "Sirops", suspension: "Suspensions", poudre: "Poudres", creme: "Crèmes", pommade: "Pommades", gel: "Gels", solution: "Solutions", injectable: "Injectables", suppositoire: "Suppositoires", patch: "Patchs", aerosol: "Aérosols", autre: "Autres" };

function StockASurveiller({ d }: { d: DonneesPersonnel }) {
  if (!d.stockFaible.length) return <Vide texte="Aucun médicament sous le seuil de réapprovisionnement." />;
  return (
    <ul className="space-y-3">
      {d.stockFaible.slice(0, 8).map((m) => {
        const pct = m.stock_minimum ? Math.min(100, Math.round((m.stock_actuel / m.stock_minimum) * 100)) : 0;
        return (
          <li key={m.medicament_id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-gray-900 dark:text-white">
                {m.stock_actuel === 0 && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" aria-label="Rupture" />}
                <span className="truncate">{m.nom}</span>
              </span>
              <span className="shrink-0 font-marque text-xs text-gray-600 dark:text-gray-300">{m.stock_actuel} / {m.stock_minimum}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800"><div className={`h-1.5 rounded-full ${m.stock_actuel === 0 ? "bg-red-500" : "bg-orange-400"}`} style={{ width: `${Math.max(pct, 3)}%` }} /></div>
          </li>
        );
      })}
    </ul>
  );
}

function ListeSimple({ elements, vide }: { elements: { cle: string | number; titre: string; detail?: string; date?: string; badge?: { texte: string; couleur: string } }[]; vide: string }) {
  if (!elements.length) return <Vide texte={vide} />;
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {elements.map((e) => (
        <li key={e.cle} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{e.titre}</p>
            {e.detail && <p className="truncate text-xs text-gray-500">{e.detail}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {e.badge && <span className="rounded-full px-2.5 py-1 text-xs text-white" style={{ background: e.badge.couleur }}>{e.badge.texte}</span>}
            {e.date && <span className="text-xs text-gray-500">{dateLongue(e.date)}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

const grille = "grid grid-cols-12 gap-4 md:gap-6";
const chiffres = "grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-4";

// Tableau de bord du médecin : son agenda, ses consultations, ses examens en attente.
function VueMedecin({ d }: { d: DonneesPersonnel }) {
  const aujourdhui = d.rendezVous.filter((r) => estAujourdhui(r.date_heure) && !/annul/i.test(r.statut_nom || ""));
  const aVenir = prochains(d.rendezVous.filter((r) => !/annul/i.test(r.statut_nom || "")), (r) => r.date_heure, 6);
  const mensuel = parMois(d.consultations.map((c) => c.date_consultation), 6);
  const enAttente = d.examens.filter((x) => !x.date_resultat);
  return (
    <>
      <div className={chiffres}>
        <Chiffre libelle="Mes rendez-vous aujourd’hui" valeur={aujourdhui.length} detail={pluriel(aVenir.length, "rendez-vous à venir")} icone={CalendarClock} teinte={TEINTES.vert} lien="/rendezvous" />
        <Chiffre libelle="Mes consultations ce mois" valeur={mensuel.compte[mensuel.compte.length - 1]} detail={`${d.consultations.length} au total`} icone={Stethoscope} teinte={TEINTES.indigo} lien="/consultation" />
        <Chiffre libelle="Mes ordonnances (30 jours)" valeur={d.ordonnances.filter((o) => depuisJours(o.date_ordonnance, 30)).length} icone={FileText} teinte={TEINTES.orange} lien="/ordonnance" />
        <Chiffre libelle="Examens sans résultat" valeur={enAttente.length} detail={pluriel(d.examens.length, "examen prescrit")} icone={FlaskConical} teinte={TEINTES.violet} lien="/examen" />
      </div>
      <div className={grille}>
        <Carte titre="Mon agenda" className="col-span-12 xl:col-span-7" action={<Link to="/calendar" className="text-sm text-brand-600 dark:text-brand-300">Calendrier</Link>}>
          <ListeRendezVous liste={aVenir} vide="Aucun rendez-vous à venir dans votre agenda." sansMedecin />
        </Carte>
        <Carte titre="Actions rapides" className="col-span-12 md:col-span-6 xl:col-span-5">
          <Raccourcis liens={[{ libelle: "Consultation", lien: "/consultation", icone: Stethoscope }, { libelle: "Ordonnance", lien: "/ordonnance", icone: FileText }, { libelle: "Examen", lien: "/examen", icone: FlaskConical }, { libelle: "Patients", lien: "/patient", icone: Users }]} />
        </Carte>
        <Carte titre="Mes consultations par mois" className="col-span-12 md:col-span-6 xl:col-span-5">
          <GraphiqueBarres libelles={mensuel.libelles} valeurs={mensuel.compte} nom="Consultations" hauteur={230} />
        </Carte>
        <Carte titre="Mes dernières consultations" className="col-span-12 xl:col-span-7" action={<Link to="/consultation" className="text-sm text-brand-600 dark:text-brand-300">Tout voir</Link>}>
          <ListeSimple vide="Aucune consultation enregistrée." elements={d.consultations.slice(0, 6).map((c) => ({ cle: c.consultation_id, titre: `${c.patient_prenom ?? ""} ${c.patient_nom ?? ""}`, detail: c.motif, date: c.date_consultation }))} />
        </Carte>
      </div>
    </>
  );
}

// Tableau de bord de l’infirmier : patients hospitalisés, lits, examens en attente, stock.
function VueInfirmier({ d }: { d: DonneesPersonnel }) {
  const occupes = d.admissions.length;
  const aujourdhui = d.rendezVous.filter((r) => estAujourdhui(r.date_heure));
  const enAttente = d.examens.filter((x) => !x.date_resultat);
  return (
    <>
      <div className={chiffres}>
        <Chiffre libelle="Patients hospitalisés" valeur={occupes} icone={BedDouble} teinte={TEINTES.violet} lien="/hospitalisation" />
        <Chiffre libelle="Lits libres" valeur={Math.max(0, d.lits.length - occupes)} detail={`sur ${d.lits.length} lits`} icone={BedDouble} teinte={TEINTES.vert} lien="/hospitalisation" />
        <Chiffre libelle="Rendez-vous aujourd’hui" valeur={d.statsRdv?.aujourd_hui ?? aujourdhui.length} icone={CalendarClock} teinte={TEINTES.indigo} lien="/rendezvous" />
        <Chiffre libelle="Médicaments à réapprovisionner" valeur={d.stockFaible.length} icone={Pill} teinte={TEINTES.orange} lien="/medicament" />
      </div>
      <div className={grille}>
        <Carte titre="Occupation des lits" className="col-span-12 md:col-span-6 xl:col-span-4">
          {d.lits.length ? <Jauge valeur={tauxOccupation(occupes, d.lits.length)} libelle="des lits occupés" /> : <Vide texte="Aucun lit déclaré pour l’hôpital." />}
        </Carte>
        <Carte titre="Patients hospitalisés" className="col-span-12 md:col-span-6 xl:col-span-8" action={<Link to="/hospitalisation" className="text-sm text-brand-600 dark:text-brand-300">Hospitalisation</Link>}>
          <ListeSimple vide="Aucun patient hospitalisé en ce moment." elements={d.admissions.slice(0, 8).map((a) => ({ cle: a.id, titre: d.nomsPatients[a.patient] ?? `Patient n° ${a.patient}`, detail: a.motif, date: a.date_admission }))} />
        </Carte>
        <Carte titre="Examens en attente de résultat" className="col-span-12 xl:col-span-6" action={<Link to="/examen" className="text-sm text-brand-600 dark:text-brand-300">Examens</Link>}>
          <ListeSimple vide="Tous les examens ont leur résultat." elements={enAttente.slice(0, 6).map((x) => ({ cle: x.examen_id, titre: x.nom_examen, detail: `${x.patient_prenom ?? ""} ${x.patient_nom ?? ""}`.trim(), date: x.date_examen }))} />
        </Carte>
        <Carte titre="Médicaments à surveiller" className="col-span-12 xl:col-span-6" action={<Link to="/medicament" className="text-sm text-brand-600 dark:text-brand-300">Stock</Link>}>
          <StockASurveiller d={d} />
        </Carte>
      </div>
    </>
  );
}

// Tableau de bord du secrétariat : l’agenda de l’hôpital et l’accueil des patients.
function VueSecretaire({ d }: { d: DonneesPersonnel }) {
  const statuts = Object.entries(d.statsRdv?.par_statut ?? {}).filter(([, n]) => n > 0);
  const aVenir = prochains(d.rendezVous.filter((r) => !/annul/i.test(r.statut_nom || "")), (r) => r.date_heure, 8);
  return (
    <>
      <div className={chiffres}>
        <Chiffre libelle="Rendez-vous aujourd’hui" valeur={d.statsRdv?.aujourd_hui ?? "—"} icone={CalendarClock} teinte={TEINTES.vert} lien="/rendezvous" />
        <Chiffre libelle="Cette semaine" valeur={d.statsRdv?.cette_semaine ?? "—"} icone={ClipboardList} teinte={TEINTES.indigo} lien="/calendar" />
        <Chiffre libelle="Patients" valeur={d.nbPatients} icone={Users} teinte={TEINTES.violet} lien="/patient" />
        <Chiffre libelle="Salles disponibles" valeur={d.salles.length ? `${d.salles.filter((s) => etatSalle(s, d.reservations).etat === "disponible").length} / ${d.salles.length}` : "—"} detail={`${d.nbMedecins} médecins dans l’équipe`} icone={DoorOpen} teinte={TEINTES.orange} lien="/disponibilites" />
      </div>
      <div className={grille}>
        <Carte titre="Prochains rendez-vous" className="col-span-12 xl:col-span-7" action={<Link to="/rendezvous" className="text-sm text-brand-600 dark:text-brand-300">Tout voir</Link>}>
          <ListeRendezVous liste={aVenir} vide="Aucun rendez-vous à venir." />
        </Carte>
        <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-5">
          <Carte titre="Accueil">
            <Raccourcis liens={[{ libelle: "Nouveau patient", lien: "/patient", icone: UserPlus }, { libelle: "Rendez-vous", lien: "/rendezvous", icone: CalendarPlus2 }, { libelle: "Lits et salles", lien: "/disponibilites", icone: DoorOpen }, { libelle: "Calendrier", lien: "/calendar", icone: CalendarClock }]} />
          </Carte>
          <Carte titre="Rendez-vous par statut">
            {statuts.length ? <Anneau libelles={statuts.map(([s]) => s)} valeurs={statuts.map(([, n]) => n)} couleurs={statuts.map(([s]) => COULEURS_STATUTS[s] ?? COULEURS.gris)} centre="rendez-vous" hauteur={230} /> : <Vide texte="Aucun rendez-vous pour l’instant." />}
          </Carte>
        </div>
      </div>
    </>
  );
}

// Tableau de bord du personnel (pharmacie, stock).
function VuePersonnel({ d }: { d: DonneesPersonnel }) {
  const s = d.statsStock;
  const formes = Object.entries(s?.repartition_formes ?? {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const teintesFormes = [COULEURS.indigo, COULEURS.vert, COULEURS.orange, "#8b5cf6", "#0ea5e9", COULEURS.rouge, COULEURS.encre, COULEURS.gris];
  return (
    <>
      <div className={chiffres}>
        <Chiffre libelle="Médicaments" valeur={s?.total_medicaments ?? "—"} icone={Pill} teinte={TEINTES.indigo} lien="/medicament" />
        <Chiffre libelle="En rupture" valeur={s?.medicaments_rupture ?? "—"} icone={AlertTriangle} teinte={TEINTES.rouge} lien="/medicament" />
        <Chiffre libelle="À réapprovisionner" valeur={s?.medicaments_stock_faible ?? d.stockFaible.length} icone={ClipboardList} teinte={TEINTES.orange} lien="/medicament" />
        <Chiffre libelle="Valeur du stock" valeur={s ? `${Math.round(s.valeur_stock_total).toLocaleString("fr-HT")} HTG` : "—"} icone={Wallet} teinte={TEINTES.vert} lien="/medicament" />
      </div>
      <div className={grille}>
        <Carte titre="Médicaments à surveiller" className="col-span-12 xl:col-span-7" action={<Link to="/medicament" className="text-sm text-brand-600 dark:text-brand-300">Stock</Link>}>
          <StockASurveiller d={d} />
        </Carte>
        <Carte titre="Stock par forme" className="col-span-12 xl:col-span-5">
          {formes.length ? <Anneau libelles={formes.map(([f]) => FORMES[f] ?? f)} valeurs={formes.map(([, n]) => n)} couleurs={teintesFormes} centre="médicaments" /> : <Vide texte="Aucun médicament enregistré." />}
        </Carte>
      </div>
    </>
  );
}

// Espace du patient : ses rendez-vous, consultations, ordonnances et examens, en langage simple.
function VuePatient({ d }: { d: DonneesPersonnel }) {
  const aVenir = prochains(d.rendezVous.filter((r) => !/annul/i.test(r.statut_nom || "")), (r) => r.date_heure, 5);
  const prochain = aVenir[0];
  return (
    <>
      <div className={chiffres}>
        <Chiffre libelle="Prochain rendez-vous" valeur={prochain ? new Date(prochain.date_heure).toLocaleDateString("fr-HT", { day: "numeric", month: "short" }) : "Aucun"} detail={prochain ? `à ${new Date(prochain.date_heure).toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" })}` : undefined} icone={CalendarClock} teinte={TEINTES.vert} lien="/home" />
        <Chiffre libelle="Mes consultations" valeur={d.consultations.length} icone={Stethoscope} teinte={TEINTES.indigo} lien="/home" />
        <Chiffre libelle="Mes ordonnances" valeur={d.ordonnances.length} icone={FileText} teinte={TEINTES.orange} lien="/home" />
        <Chiffre libelle="Mes examens" valeur={d.examens.length} detail={(() => { const n = d.examens.filter((x) => x.date_resultat).length; return `${n} résultat${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}`; })()} icone={FlaskConical} teinte={TEINTES.violet} lien="/home" />
      </div>
      <div className={grille}>
        <Carte titre="Mes prochains rendez-vous" className="col-span-12 xl:col-span-6">
          <ListeRendezVous liste={aVenir} vide="Vous n’avez pas de rendez-vous à venir." sansPatient />
        </Carte>
        <Carte titre="Mes examens" className="col-span-12 xl:col-span-6">
          <ListeSimple vide="Aucun examen pour l’instant." elements={d.examens.slice(0, 5).map((x) => ({ cle: x.examen_id, titre: x.nom_examen, date: x.date_examen, badge: x.date_resultat ? { texte: "Résultat disponible", couleur: COULEURS.vert } : { texte: "En attente", couleur: COULEURS.gris } }))} />
        </Carte>
        <Carte titre="Mes consultations" className="col-span-12 xl:col-span-6">
          <ListeSimple vide="Aucune consultation pour l’instant." elements={d.consultations.slice(0, 5).map((c) => ({ cle: c.consultation_id, titre: c.motif || "Consultation", detail: c.medecin_nom ? `Dr ${c.medecin_prenom ?? ""} ${c.medecin_nom}` : undefined, date: c.date_consultation }))} />
        </Carte>
        <Carte titre="Mes ordonnances" className="col-span-12 xl:col-span-6">
          <ListeSimple vide="Aucune ordonnance pour l’instant." elements={d.ordonnances.slice(0, 5).map((o) => ({ cle: o.ordonnance_id, titre: o.nb_prescriptions ? pluriel(o.nb_prescriptions, "médicament") : "Ordonnance", detail: o.medecin_nom ? `Dr ${o.medecin_prenom ?? ""} ${o.medecin_nom}` : undefined, date: o.date_ordonnance }))} />
        </Carte>
      </div>
    </>
  );
}

function phrase(role: RolePersonnel, d: DonneesPersonnel) {
  const rdvAuj = d.rendezVous.filter((r) => estAujourdhui(r.date_heure) && !/annul/i.test(r.statut_nom || "")).length;
  switch (role) {
    case "medecin": return rdvAuj ? `Vous avez ${pluriel(rdvAuj, "rendez-vous")} aujourd’hui.` : "Aucun rendez-vous aujourd’hui dans votre agenda.";
    case "infirmier": return d.admissions.length ? `${pluriel(d.admissions.length, "patient")} hospitalisé${d.admissions.length > 1 ? "s" : ""} en ce moment.` : "Aucun patient hospitalisé en ce moment.";
    case "secretaire": return d.statsRdv?.aujourd_hui ? `${pluriel(d.statsRdv.aujourd_hui, "rendez-vous")} prévu${d.statsRdv.aujourd_hui > 1 ? "s" : ""} aujourd’hui.` : "Aucun rendez-vous prévu aujourd’hui.";
    case "personnel": return d.statsStock?.medicaments_rupture ? `${pluriel(d.statsStock.medicaments_rupture, "médicament")} en rupture : à commander en priorité.` : d.stockFaible.length ? `${pluriel(d.stockFaible.length, "médicament")} à réapprovisionner.` : "Le stock est en ordre.";
    case "patient": return rdvAuj ? "Vous avez un rendez-vous aujourd’hui." : "Votre dossier est à jour. Le gardien veille sur vos données.";
  }
}

const SOUS_TITRES: Record<RolePersonnel, string> = { medecin: "Votre agenda et vos patients.", infirmier: "Les soins et l’hospitalisation.", secretaire: "L’accueil et les rendez-vous.", personnel: "La pharmacie et le stock.", patient: "Votre espace santé." };

/** Tableaux de bord du personnel et du patient, avec les données réelles de chacun. */
export default function TableauPersonnel({ role }: { role: RolePersonnel }) {
  const { user } = useAuth();
  const { donnees: d, erreur, actualiser } = useDonneesPersonnel(role, user?.hopital_id || 0);
  const prenom = (user?.nom_complet || "").replace(/^Dr\.?\s+/i, "").split(" ")[0];
  return (
    <>
      <PageMeta title="Tableau de bord | TRIMED" description={SOUS_TITRES[role]} />
      <div className="space-y-5 md:space-y-6">
        <Accueil prenom={prenom} phrase={d ? phrase(role, d) : erreur ? "Le serveur ne répond pas pour l’instant." : SOUS_TITRES[role]} onActualiser={actualiser} />
        {!d ? (
          <div className="space-y-5">
            <div className={chiffres}>{[0, 1, 2, 3].map((i) => <Squelette key={i} h="h-36" />)}</div>
            <Squelette h="h-72" />
          </div>
        ) : role === "medecin" ? <VueMedecin d={d} />
          : role === "infirmier" ? <VueInfirmier d={d} />
          : role === "secretaire" ? <VueSecretaire d={d} />
          : role === "personnel" ? <VuePersonnel d={d} />
          : <VuePatient d={d} />}
      </div>
    </>
  );
}
