import { useCallback, useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { utilisateurService } from '../../GestionUtilisateur/services/UtilisateurService';
import { UtilisateurModal } from '../../GestionUtilisateur/components/UtilisateurModal';
import type { Utilisateur, UtilisateurFormData } from '../../GestionUtilisateur/types/UtilisateurTypes';

const ROLE_PATIENT = 7;

// Étape 3 : les comptes du personnel. L’administrateur de l’hôpital ne peut créer que des
// comptes de personnel (médecin, infirmier, secrétaire, personnel), jamais d’administrateur.
export function EtapeEquipe({ tenantId }: { tenantId: number }) {
  const [membres, setMembres] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [ouvert, setOuvert] = useState(false);
  const [erreursServeur, setErreursServeur] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState<string>();
  const [message, setMessage] = useState('');

  const tousLesRoles = utilisateurService.obtenirRoles();
  const nomRole = (id: number) => tousLesRoles.find((r) => r.role_id === id)?.nom ?? 'Personnel';

  const charger = useCallback(async () => {
    try {
      const liste = await utilisateurService.obtenirTousUtilisateurs(tenantId);
      setMembres(liste.filter((u) => u.role_id !== ROLE_PATIENT));
    } catch {
      setErreur('Impossible de charger l’équipe pour le moment.');
    } finally {
      setChargement(false);
    }
  }, [tenantId]);

  useEffect(() => { charger(); }, [charger]);

  const enregistrer = async (donnees: UtilisateurFormData) => {
    setErreursServeur({});
    setErreur(undefined);
    const res = await utilisateurService.creerUtilisateur(donnees, tenantId);
    if (res.success) {
      setOuvert(false);
      setMessage(`Compte créé pour ${donnees.nom_complet}. Transmettez-lui son mot de passe provisoire en main propre.`);
      await charger();
    } else {
      setErreursServeur(res.fieldErrors ?? {});
      setErreur(res.message);
    }
  };

  // Effectif par rôle, dans l’ordre du formulaire
  const effectifs = tousLesRoles
    .map((r) => ({ nom: r.nom, n: membres.filter((m) => m.role_id === r.role_id).length }))
    .filter((r) => r.n > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Créez un compte pour chaque membre de l’équipe. Chacun ne verra que ce que son rôle permet.
        </p>
        <button
          type="button"
          onClick={() => { setMessage(''); setOuvert(true); }}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-trimed-indigo px-4 text-sm font-medium text-white hover:bg-trimed-indigo-fonce"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Ajouter un membre
        </button>
      </div>

      {message && <p role="status" className="rounded-xl bg-trimed-brume px-4 py-3 text-sm text-trimed-vert-fonce dark:bg-white/5 dark:text-trimed-menthe">{message}</p>}
      {erreur && !ouvert && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{erreur}</p>}

      {effectifs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {effectifs.map((r) => (
            <span key={r.nom} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
              {r.nom} <span className="font-marque text-gray-900 dark:text-white">{r.n}</span>
            </span>
          ))}
        </div>
      )}

      {chargement ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : membres.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800">
          Aucun membre pour l’instant.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {membres.map((m) => (
            <li key={m.utilisateur_id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{m.nom_complet}</p>
                <p className="truncate text-xs text-gray-500">{m.email}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-600 dark:text-gray-300">{nomRole(m.role_id)}</span>
            </li>
          ))}
        </ul>
      )}

      <UtilisateurModal
        isOpen={ouvert}
        onClose={() => { setOuvert(false); setErreursServeur({}); setErreur(undefined); }}
        onSave={enregistrer}
        serverErrors={erreursServeur}
        generalError={erreur}
        roles={utilisateurService.obtenirRolesAttribuables()}
        tousLesRoles={tousLesRoles}
        statuts={utilisateurService.obtenirStatuts()}
      />
    </div>
  );
}
