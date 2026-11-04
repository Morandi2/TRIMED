import { useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { caisseApi } from '../../../../api/caisseApi';
import { messageErreur } from '../../Caisse/ui';

interface Props { patient: number; ordonnance: number; prescription?: number; medicament: number; quantite?: number }

/** Délivrance par la pharmacie : le stock baisse et le médicament rejoint les soins à facturer. */
export default function Delivrance({ patient, ordonnance, prescription, medicament, quantite }: Props) {
  const [nombre, setNombre] = useState(String(quantite ?? 1));
  const [etat, setEtat] = useState<{ ok: boolean; texte: string } | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const delivrer = async () => {
    setEnvoi(true); setEtat(null);
    try {
      await caisseApi.delivrer({ patient, medicament, quantite: Number(nombre), ordonnance, ...(prescription ? { prescription } : {}) });
      setEtat({ ok: true, texte: 'Délivré : stock mis à jour, ajouté aux soins à facturer.' });
    } catch (e) {
      setEtat({ ok: false, texte: messageErreur(e, "La délivrance n'a pas été enregistrée.") });
    } finally { setEnvoi(false); }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
      <input aria-label="Quantité à délivrer" inputMode="numeric" value={nombre} onChange={(e) => setNombre(e.target.value)}
        className="h-9 w-20 rounded-lg border border-gray-200 px-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
      <button type="button" disabled={envoi || etat?.ok || !(Number(nombre) > 0)} onClick={delivrer}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
        <PackageCheck className="h-4 w-4" aria-hidden="true" /> {envoi ? 'Enregistrement…' : 'Délivrer'}
      </button>
      {etat && <span role={etat.ok ? 'status' : 'alert'} className={`text-xs ${etat.ok ? 'text-trimed-vert-fonce' : 'text-red-600'}`}>{etat.texte}</span>}
    </div>
  );
}
