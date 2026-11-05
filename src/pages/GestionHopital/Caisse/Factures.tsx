import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { caisseApi, LIBELLES_STATUT, montant, type Facture, type StatutFacture } from '../../../api/caisseApi';
import { carte, champ, champBase, dateHeure } from './ui';

export default function Factures({ onOuvrir, version }: { onOuvrir: (id: number) => void; version: number }) {
  const [factures, setFactures] = useState<Facture[] | null>(null);
  const [recherche, setRecherche] = useState('');
  const [statut, setStatut] = useState<StatutFacture | ''>('');

  useEffect(() => {
    let annule = false;
    const minuterie = setTimeout(() => {
      caisseApi.factures({ ...(recherche ? { search: recherche } : {}), ...(statut ? { statut } : {}) })
        .then((f) => { if (!annule) setFactures(f); }).catch(() => { if (!annule) setFactures([]); });
    }, 300);
    return () => { annule = true; clearTimeout(minuterie); };
  }, [recherche, statut, version]);

  return (
    <div className={carte}>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input className={`${champ} pl-9`} placeholder="Numéro ou nom du patient" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
        </span>
        <select className={`${champBase} w-52`} value={statut} onChange={(e) => setStatut(e.target.value as StatutFacture | '')}>
          <option value="">Tous les statuts</option>
          {Object.entries(LIBELLES_STATUT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {factures === null ? <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" /> : factures.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Aucune facture.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
              <th className="py-2 font-medium">Numéro</th><th className="py-2 font-medium">Patient</th><th className="py-2 font-medium">Date</th>
              <th className="py-2 font-medium">Statut</th><th className="py-2 text-right font-medium">Part patient</th><th className="py-2 text-right font-medium">Reste</th>
            </tr></thead>
            <tbody>
              {factures.map((f) => (
                <tr key={f.id} onClick={() => onOuvrir(f.id)} className="cursor-pointer border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]">
                  <td className="py-2 font-medium text-gray-900 dark:text-white">{f.numero || 'Brouillon'}{f.est_avoir ? ' (avoir)' : ''}</td>
                  <td className="py-2">{f.patient_nom}</td>
                  <td className="py-2">{dateHeure(f.date_emission ?? f.cree_le)}</td>
                  <td className="py-2">{LIBELLES_STATUT[f.statut]}</td>
                  <td className="py-2 text-right">{montant(f.total)}</td>
                  <td className="py-2 text-right">{montant(f.reste_du)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
