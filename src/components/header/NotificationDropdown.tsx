import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bell, Building2, CalendarClock, Pill, X } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { enListe, lireOuNull } from "../../api/listes";
import { useUser } from "../../context/UserContext";

interface Notification { cle: string; titre: string; detail: string; lien: string; icone: typeof Bell; teinte: string }

const CLE_VUES = "trimed-notifications-vues";
const INTERVALLE = 5 * 60 * 1000;

const vues = (): string[] => { try { return JSON.parse(localStorage.getItem(CLE_VUES) || "[]"); } catch { return []; } };

// Notifications tirées des données du serveur, selon le rôle : rendez-vous du jour, stock des médicaments,
// et pour l’équipe TRIMED, les documents d’hôpitaux à vérifier. Actualisées toutes les 5 minutes.
export default function NotificationDropdown() {
  const { currentUserRole, permissions } = useUser();
  const [ouvert, setOuvert] = useState(false);
  const [liste, setListe] = useState<Notification[] | null>(null);
  const [nouvelles, setNouvelles] = useState(false);

  const charger = useCallback(async () => {
    const n: Notification[] = [];
    const jour = new Date().toISOString().slice(0, 10);
    if (currentUserRole === "admin-systeme") {
      const hopitaux = enListe<{ tenant_id: number; nom: string; statut_verification_document?: string }>(await lireOuNull("/tenants/tenants/"));
      const aVerifier = hopitaux.filter((h) => h.statut_verification_document === "en_attente");
      if (aVerifier.length) n.push({ cle: `verif-${aVerifier.map((h) => h.tenant_id).join("-")}`, titre: `${aVerifier.length} hôpital${aVerifier.length > 1 ? "aux" : ""} à vérifier`, detail: aVerifier.map((h) => h.nom).slice(0, 3).join(", "), lien: "/admin/tenants", icone: Building2, teinte: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" });
    } else {
      if (permissions.canViewRendezVous) {
        const s = await lireOuNull<{ aujourd_hui: number; cette_semaine: number }>("/rendez-vous/statistiques/");
        if (s?.aujourd_hui) n.push({ cle: `rdv-${jour}-${s.aujourd_hui}`, titre: `${s.aujourd_hui} rendez-vous aujourd’hui`, detail: `${s.cette_semaine} au total cette semaine`, lien: "/rendezvous", icone: CalendarClock, teinte: "bg-trimed-brume text-trimed-vert-fonce dark:bg-trimed-vert/15 dark:text-trimed-menthe" });
      }
      if (permissions.canViewMedicaments) {
        const faibles = enListe<{ medicament_id: number; nom: string; stock_actuel: number }>(await lireOuNull("/medicaments/stock_faible/"));
        const ruptures = faibles.filter((m) => m.stock_actuel === 0);
        if (ruptures.length) n.push({ cle: `rupt-${ruptures.map((m) => m.medicament_id).join("-")}`, titre: `${ruptures.length} médicament${ruptures.length > 1 ? "s" : ""} en rupture`, detail: ruptures.map((m) => m.nom).slice(0, 3).join(", "), lien: "/medicament", icone: AlertTriangle, teinte: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300" });
        const bas = faibles.filter((m) => m.stock_actuel > 0);
        if (bas.length) n.push({ cle: `bas-${bas.map((m) => `${m.medicament_id}:${m.stock_actuel}`).join("-")}`, titre: `${bas.length} médicament${bas.length > 1 ? "s" : ""} à réapprovisionner`, detail: bas.map((m) => `${m.nom} (${m.stock_actuel})`).slice(0, 3).join(", "), lien: "/medicament", icone: Pill, teinte: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" });
      }
    }
    setListe(n);
    const dejaVues = new Set(vues());
    setNouvelles(n.some((x) => !dejaVues.has(x.cle)));
  }, [currentUserRole, permissions.canViewMedicaments, permissions.canViewRendezVous]);

  useEffect(() => {
    charger();
    const id = window.setInterval(charger, INTERVALLE);
    return () => clearInterval(id);
  }, [charger]);

  const basculer = () => {
    const prochain = !ouvert;
    setOuvert(prochain);
    if (prochain && liste) {
      try { localStorage.setItem(CLE_VUES, JSON.stringify(liste.map((x) => x.cle))); } catch { /* stockage indisponible */ }
      setNouvelles(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={basculer}
        aria-label={nouvelles ? "Notifications (nouvelles)" : "Notifications"}
      >
        {nouvelles && (
          <span className="absolute right-0 top-0.5 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
        )}
        <Bell className="h-5 w-5" aria-hidden="true" />
      </button>
      <Dropdown
        isOpen={ouvert}
        onClose={() => setOuvert(false)}
        className="absolute -right-[240px] mt-[17px] flex max-h-[480px] w-[330px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg sm:w-[361px] lg:right-0 dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <h5 className="text-base font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
          <button type="button" onClick={() => setOuvert(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <ul className="flex flex-col overflow-y-auto">
          {liste === null ? <li className="px-2 py-6 text-center text-sm text-gray-500">Chargement…</li>
            : liste.length === 0 ? <li className="px-2 py-8 text-center text-sm text-gray-500">Rien à signaler pour l’instant.</li>
            : liste.map((x) => {
                const Icone = x.icone;
                return (
                  <li key={x.cle}>
                    <Link to={x.lien} onClick={() => setOuvert(false)} className="flex gap-3 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-white/5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${x.teinte}`}><Icone className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-800 dark:text-white/90">{x.titre}</span>
                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{x.detail}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
        </ul>
      </Dropdown>
    </div>
  );
}
