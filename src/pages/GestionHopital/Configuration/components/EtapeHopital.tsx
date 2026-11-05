import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import hospitalApi from '../../../../api/hospitalApi';
import { CONTACT } from '../../../index/portail/contenu';
import { enListe } from '../etat';

interface Hopital {
  tenant_id: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email_professionnel?: string;
  directeur?: string;
  nombre_de_lits?: number;
  type_abonnement?: string;
}

const ABONNEMENTS: Record<string, string> = { basic: 'Essentiel', standard: 'Standard', premium: 'Premium' };

// Étape 1 : l’identité de l’hôpital, telle qu’enregistrée à l’inscription.
// Elle se corrige par l’équipe TRIMED (le serveur réserve cette modification aux administrateurs TRIMED).
export function EtapeHopital({ tenantId, nomConnu }: { tenantId: number; nomConnu?: string }) {
  const [hopital, setHopital] = useState<Hopital | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    hospitalApi.tenants.getAll().then((res) => {
      if (annule) return;
      if (res.success) setHopital(enListe<Hopital>(res.data).find((h) => h.tenant_id === tenantId) ?? null);
      setChargement(false);
    });
    return () => { annule = true; };
  }, [tenantId]);

  const lignes: [string, string | number | undefined][] = [
    ['Nom', hopital?.nom ?? nomConnu],
    ['Adresse', hopital?.adresse],
    ['Téléphone', hopital?.telephone],
    ['Courriel', hopital?.email_professionnel],
    ['Direction', hopital?.directeur],
    ['Nombre de lits déclaré', hopital?.nombre_de_lits],
    ['Abonnement', hopital?.type_abonnement ? ABONNEMENTS[hopital.type_abonnement] ?? hopital.type_abonnement : undefined],
  ];

  const sujet = encodeURIComponent(`Correction des informations de ${hopital?.nom ?? nomConnu ?? 'mon hôpital'}`);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Vérifiez les informations de votre établissement. Elles apparaissent sur les documents et dans l’espace de votre équipe.
      </p>

      <dl className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
        {lignes.map(([libelle, valeur]) => (
          <div key={libelle} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-6">
            <dt className="w-52 shrink-0 text-sm text-gray-500 dark:text-gray-400">{libelle}</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              {chargement ? <span className="inline-block h-4 w-40 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /> : (valeur || <span className="font-normal text-gray-400">Non renseigné</span>)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 rounded-2xl bg-trimed-brume p-5 text-sm text-trimed-encre sm:flex-row sm:items-center sm:justify-between dark:bg-white/5 dark:text-gray-300">
        <p>Une information est fausse ou manquante ? L’équipe TRIMED la corrige pour vous.</p>
        <a
          href={`mailto:${CONTACT.email}?subject=${sujet}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-trimed-indigo/20 bg-white px-4 py-2 font-medium text-trimed-indigo hover:bg-trimed-indigo hover:text-white dark:bg-gray-900"
        >
          <Mail className="h-4 w-4" aria-hidden="true" /> Demander une correction
        </a>
      </div>
    </div>
  );
}
