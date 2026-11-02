import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertCircle, Building2, Clock, ShieldCheck, Users } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiConfig";
import { tenantService, type Tenant } from "../../services/admin/tenantService";

const PLANS: Record<string, string> = { basic: "Essentiel", standard: "Standard", premium: "Premium" };
const dateCourte = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" }) : "");

// Portail de l’équipe TRIMED : chiffres réels de la plateforme (hôpitaux, comptes, vérifications en attente).
export default function TrimedAdminDashboard() {
  const [hopitaux, setHopitaux] = useState<Tenant[]>([]);
  const [nbUtilisateurs, setNbUtilisateurs] = useState<number | null>(null);
  const [etat, setEtat] = useState<"chargement" | "ok" | "erreur">("chargement");

  useEffect(() => {
    let annule = false;
    Promise.all([
      tenantService.getAllTenants(),
      apiClient.get("/comptes/utilisateurs/").then((r) => r.data?.count ?? (r.data?.results ?? r.data ?? []).length).catch(() => null),
    ])
      .then(([liste, nb]) => { if (!annule) { setHopitaux(liste); setNbUtilisateurs(nb); setEtat("ok"); } })
      .catch(() => { if (!annule) setEtat("erreur"); });
    return () => { annule = true; };
  }, []);

  const aVerifier = hopitaux.filter((h) => h.statut_verification_document === "en_attente").length;
  const actifs = hopitaux.filter((h) => h.statut === "actif").length;
  const valeur = (n: number | null) => (etat === "chargement" ? "…" : n ?? "—");

  const stats = [
    { name: "Hôpitaux", value: valeur(hopitaux.length), icon: Building2, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    { name: "Hôpitaux actifs", value: valeur(actifs), icon: Activity, color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
    { name: "Documents à vérifier", value: valeur(aVerifier), icon: Clock, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" },
    { name: "Comptes utilisateurs", value: valeur(nbUtilisateurs), icon: Users, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  ];

  const recents = [...hopitaux].sort((a, b) => (b.cree_le || "").localeCompare(a.cree_le || "")).slice(0, 5);

  return (
    <>
      <PageMeta title="Admin TRIMED" description="Portail de l’équipe TRIMED : hôpitaux, comptes et vérifications." />

      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 p-8 shadow-2xl shadow-brand-500/20">
          <div className="absolute right-0 top-0 h-full w-1/2 translate-x-20 skew-x-12 bg-white/10" />
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Bienvenue, équipe TRIMED</h1>
              <p className="max-w-xl text-brand-100 opacity-90">Les hôpitaux de la plateforme, leurs comptes et les inscriptions à vérifier.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/20 px-4 py-2 text-sm font-medium text-white">
              {etat === "erreur"
                ? <><AlertCircle className="h-4 w-4 text-orange-200" /> Serveur injoignable</>
                : <><Activity className="h-4 w-4 text-green-300" /> {etat === "ok" ? "Serveur joignable" : "Connexion au serveur…"}</>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className={`inline-flex rounded-xl p-3 ${stat.color}`}><Icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Dernières inscriptions</h2>
              <Link to="/admin/tenants" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Voir tout</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {etat === "chargement" && <p className="p-6 text-sm text-gray-500">Chargement…</p>}
              {etat === "erreur" && <p className="p-6 text-sm text-gray-500">La liste des hôpitaux n’a pas pu être chargée.</p>}
              {etat === "ok" && recents.length === 0 && <p className="p-6 text-sm text-gray-500">Aucun hôpital inscrit pour l’instant.</p>}
              {recents.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-brand-500 dark:bg-gray-800"><Building2 className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 dark:text-white">{h.nom}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Plan {PLANS[h.type_abonnement] ?? h.type_abonnement} · inscrit le {dateCourte(h.cree_le)}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    h.statut_verification_document === "en_attente" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : h.statut === "actif" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                    {h.statut_verification_document === "en_attente" ? "À vérifier" : h.statut === "actif" ? "Actif" : h.statut === "suspendu" ? "Suspendu" : "Inactif"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-6 font-bold text-gray-900 dark:text-white">Raccourcis</h2>
            <div className="space-y-3">
              <Link to="/admin/tenants" className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:hover:bg-brand-900/10">
                <span className="flex items-center gap-3 text-sm font-medium text-gray-900 dark:text-white">
                  <span className="rounded-lg bg-brand-100 p-2 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"><Building2 className="h-5 w-5" /></span>
                  Gérer les hôpitaux
                </span>
                {aVerifier > 0 && <span className="rounded-md bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">{aVerifier} à vérifier</span>}
              </Link>
              <Link to="/admin/audit-logs" className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-900 hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-800 dark:text-white dark:hover:bg-purple-900/10">
                <span className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"><ShieldCheck className="h-5 w-5" /></span>
                Journal d’audit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
