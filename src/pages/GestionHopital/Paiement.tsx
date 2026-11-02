import { useEffect, useState } from "react";
import { Check, Mail, Phone } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { enListe, lireOuNull } from "../../api/listes";
import { CONTACT, TARIFS } from "../index/portail/contenu";

interface Hopital { tenant_id: number; nom: string; type_abonnement?: string; statut?: string; cree_le?: string }

const NOMS: Record<string, string> = { basic: "Basic", standard: "Standard", premium: "Premium" };
const STATUTS: Record<string, string> = { actif: "Actif", inactif: "Inactif", suspendu: "Suspendu", en_attente: "En attente" };

// Abonnement de l’hôpital à TRIMED : formule en cours (lue sur le serveur), tarifs et moyens de paiement.
// Le règlement se fait auprès de l’équipe TRIMED ; aucun paiement n’est simulé ici.
export default function Paiement() {
  const { user } = useAuth();
  const [hopital, setHopital] = useState<Hopital | null>(null);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    let annule = false;
    lireOuNull("/tenants/tenants/").then((d) => {
      if (annule) return;
      setHopital(enListe<Hopital>(d).find((h) => h.tenant_id === user?.hopital_id) ?? null);
      setCharge(true);
    });
    return () => { annule = true; };
  }, [user?.hopital_id]);

  const formule = hopital?.type_abonnement ? NOMS[hopital.type_abonnement] : undefined;
  const sujet = encodeURIComponent(`Abonnement TRIMED de ${hopital?.nom ?? user?.hopital_nom ?? "mon hôpital"}`);

  return (
    <>
      <PageMeta title="Abonnement | TRIMED" description="La formule TRIMED de votre hôpital et les moyens de paiement." />
      <div className="space-y-6">
        <div>
          <h1 className="font-marque text-xl text-gray-900 sm:text-2xl dark:text-white">Abonnement</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">La formule TRIMED de {hopital?.nom ?? user?.hopital_nom ?? "votre hôpital"}.</p>
        </div>

        <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-3 dark:border-gray-800 dark:bg-white/[0.03]">
          {[
            ["Formule", charge ? formule ?? "Non renseignée" : "…"],
            ["Statut", charge ? (hopital?.statut ? STATUTS[hopital.statut] ?? hopital.statut : "Non renseigné") : "…"],
            ["Client depuis le", charge ? (hopital?.cree_le ? new Date(hopital.cree_le).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" }) : "—") : "…"],
          ].map(([libelle, valeur]) => (
            <div key={libelle}>
              <p className="text-sm text-gray-500 dark:text-gray-400">{libelle}</p>
              <p className="mt-1 font-marque text-lg text-gray-900 dark:text-white">{valeur}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">Les formules</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {TARIFS.formules.map((f) => {
              const actuelle = f.nom === formule;
              return (
                <div key={f.nom} className={`rounded-2xl border bg-white p-6 dark:bg-white/[0.03] ${actuelle ? "border-brand-500 ring-2 ring-brand-500/15" : "border-gray-200 dark:border-gray-800"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-marque text-lg text-gray-900 dark:text-white">{f.nom}</p>
                    {actuelle && <span className="rounded-full bg-brand-500 px-2.5 py-1 text-xs text-white">Votre formule</span>}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{f.public}</p>
                  <p className="mt-4 font-marque text-2xl text-gray-900 dark:text-white">{f.prix} <span className="font-texte text-sm text-gray-500">HTG / mois</span></p>
                  <ul className="mt-4 space-y-2">
                    {f.points.map((p) => <li key={p} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-trimed-vert" aria-hidden="true" />{p}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{TARIFS.note}</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Régler ou changer de formule</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">L’équipe TRIMED vous envoie la facture et confirme chaque paiement (MonCash, virement ou dépôt bancaire).</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`mailto:${CONTACT.email}?subject=${sujet}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"><Mail className="h-4 w-4" aria-hidden="true" /> {CONTACT.email}</a>
            {CONTACT.telephones.map((t) => (
              <a key={t} href={`tel:${t.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"><Phone className="h-4 w-4" aria-hidden="true" /> {t}</a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
