import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { caisseApi, type Rapport } from '../../../api/caisseApi';
import { alerte, boutonSecondaire, carte, champBase, messageErreur } from './ui';

const RAPPORTS = {
  journal_ventes: 'Journal des ventes',
  journal_encaissements: 'Journal des encaissements',
  recettes: 'Recettes par catégorie et par mode',
  creances: 'Créances (factures non soldées)',
} as const;
type NomRapport = keyof typeof RAPPORTS;

const jour = (d: Date) => d.toLocaleDateString('en-CA');
const ENTETES: Record<string, string> = {
  numero: 'Numéro', date: 'Date', patient: 'Patient', sous_total: 'Sous-total', remise: 'Remise', part_assurance: 'Assurance',
  part_patient: 'Part patient', paye: 'Payé', statut: 'Statut', avoir: 'Avoir', recu: 'Reçu', facture: 'Facture', mode: 'Mode',
  devise: 'Devise', montant_devise: 'Montant', taux: 'Taux', montant_htg: 'HTG', monnaie_rendue_htg: 'Monnaie rendue',
  caissier: 'Caissier', remboursement: 'Remboursement', reste_du: 'Reste dû', jours: 'Jours', tranche: 'Ancienneté',
  rubrique: 'Rubrique', detail: 'Détail',
};

export default function Rapports() {
  const maintenant = new Date();
  const [nom, setNom] = useState<NomRapport>('journal_encaissements');
  const [du, setDu] = useState(jour(new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)));
  const [au, setAu] = useState(jour(maintenant));
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    setRapport(null); setErreur('');
    caisseApi.rapport(nom, nom === 'creances' ? {} : { du, au }).then(setRapport).catch((e) => setErreur(messageErreur(e, 'Rapport indisponible.')));
  }, [nom, du, au]);

  return (
    <div className={carte}>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <select className={`${champBase} w-72`} value={nom} onChange={(e) => setNom(e.target.value as NomRapport)}>
          {Object.entries(RAPPORTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {nom !== 'creances' && (
          <>
            <label className="text-xs text-gray-500">Du<input type="date" className={`${champBase} mt-1 w-44`} value={du} onChange={(e) => setDu(e.target.value)} /></label>
            <label className="text-xs text-gray-500">Au<input type="date" className={`${champBase} mt-1 w-44`} value={au} onChange={(e) => setAu(e.target.value)} /></label>
          </>
        )}
        <button type="button" className={boutonSecondaire} onClick={() => caisseApi.telechargerCsv(nom, nom === 'creances' ? {} : { du, au }).catch((e) => setErreur(messageErreur(e, 'Export impossible.')))}>
          <Download className="h-4 w-4" aria-hidden="true" /> Exporter pour Excel
        </button>
      </div>
      {erreur && <p role="alert" className={alerte}>{erreur}</p>}
      {!rapport && !erreur && <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}
      {rapport && (rapport.lignes.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">Rien sur cette période.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">{rapport.colonnes.map((c) => <th key={c} className="py-2 pr-3 font-medium">{ENTETES[c] ?? c}</th>)}</tr></thead>
            <tbody>{rapport.lignes.map((l, i) => <tr key={i} className="border-b border-gray-100 dark:border-gray-800">{rapport.colonnes.map((c) => <td key={c} className="py-1.5 pr-3">{String(l[c] ?? '')}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
