import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, KeyRound, LogIn, Mail, ShieldCheck } from "lucide-react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import apiClient from "../api/apiConfig";
import { lireOuNull } from "../api/listes";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { LIBELLES_ROLES } from "../types/userRoles";

interface Profil { nom_complet?: string; email?: string; cree_le?: string; derniere_connexion?: string | null; last_login?: string | null }

const dateHeure = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("fr-HT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

// Mon profil : les vraies informations du compte connecté, et le nom modifiable.
export default function UserProfiles() {
  const { user, checkAuthStatus } = useAuth();
  const { currentUserRole } = useUser();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [nom, setNom] = useState(user?.nom_complet ?? "");
  const [etat, setEtat] = useState<"" | "envoi" | "ok" | "erreur">("");

  // La fiche du compte (dates). La route « profile » du serveur répond 500 : on lit la fiche par son identifiant.
  useEffect(() => {
    if (!user?.utilisateur_id) return;
    lireOuNull<Profil>(`/comptes/utilisateurs/${user.utilisateur_id}/`).then(setProfil);
  }, [user?.utilisateur_id]);

  useEffect(() => setNom(user?.nom_complet ?? ""), [user?.nom_complet]);

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    const propre = nom.trim().replace(/\s+/g, " ");
    if (propre.length < 3) { setEtat("erreur"); return; }
    setEtat("envoi");
    try {
      await apiClient.patch(`/comptes/utilisateurs/${user?.utilisateur_id}/`, { nom_complet: propre });
      const donnees = JSON.parse(localStorage.getItem("user_data") || "{}");
      localStorage.setItem("user_data", JSON.stringify({ ...donnees, nom_complet: propre }));
      checkAuthStatus();
      setEtat("ok");
    } catch {
      setEtat("erreur");
    }
  };

  const initiale = (user?.nom_complet || user?.email || "?").replace(/^Dr\.?\s+/i, "").charAt(0).toUpperCase();
  const infos = [
    { icone: Mail, libelle: "Adresse e-mail", valeur: user?.email || "—" },
    { icone: ShieldCheck, libelle: "Rôle", valeur: LIBELLES_ROLES[currentUserRole] },
    { icone: Building2, libelle: "Établissement", valeur: currentUserRole === "admin-systeme" ? "Équipe TRIMED" : user?.hopital_nom || "—" },
    { icone: LogIn, libelle: "Dernière connexion", valeur: dateHeure(profil?.derniere_connexion ?? profil?.last_login) },
    { icone: CalendarDays, libelle: "Compte créé le", valeur: dateHeure(profil?.cree_le) },
  ];

  return (
    <>
      <PageMeta title="Mon profil | TRIMED" description="Les informations de votre compte TRIMED." />
      <PageBreadcrumb pageTitle="Mon profil" />
      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 font-marque text-3xl text-white">{initiale}</span>
          <h1 className="mt-4 font-marque text-lg text-gray-900 dark:text-white">{user?.nom_complet || user?.email}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{LIBELLES_ROLES[currentUserRole]}</p>
          <ul className="mt-6 space-y-3 text-left">
            {infos.map(({ icone: Icone, libelle, valeur }) => (
              <li key={libelle} className="flex items-start gap-3">
                <Icone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{libelle}</p>
                  <p className="break-words text-sm text-gray-900 dark:text-white">{valeur}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Votre nom</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Il apparaît sur les consultations, les ordonnances et dans le journal d’activité.</p>
            <form onSubmit={enregistrer} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Nom complet</span>
                <input value={nom} onChange={(e) => { setNom(e.target.value); setEtat(""); }} maxLength={120}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </label>
              <button type="submit" disabled={etat === "envoi" || nom.trim() === (user?.nom_complet ?? "")} className="h-11 rounded-xl bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40">
                {etat === "envoi" ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>
            {etat === "ok" && <p role="status" className="mt-3 text-sm text-trimed-vert-fonce dark:text-trimed-menthe">Votre nom est enregistré.</p>}
            {etat === "erreur" && <p role="alert" className="mt-3 text-sm text-red-600">Le nom n’a pas pu être enregistré (3 caractères au moins). Réessayez.</p>}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white"><KeyRound className="h-4 w-4 text-brand-500" aria-hidden="true" /> Mot de passe</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Pour changer de mot de passe, l’équipe TRIMED vérifie votre identité puis vous remet un mot de passe provisoire.</p>
            <Link to="/forgot-password" className="mt-4 inline-flex rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5">Comment obtenir un nouveau mot de passe</Link>
          </section>
        </div>
      </div>
    </>
  );
}
