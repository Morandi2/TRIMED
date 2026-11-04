import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { assurancesApi, STATUTS_BORDEREAU, TYPES_JUSTIFICATIF, type Assureur, type Bordereau } from '../../../api/assurancesApi';
import { montant, nombre } from '../../../api/caisseApi';
import { alerte, bouton, boutonSecondaire, carte, champBase, info, jourFr, messageErreur, titreCarte } from '../Caisse/ui';

const jour = (d: Date) => d.toLocaleDateString('en-CA');

export default function Bordereaux({ assureurs }: { assureurs: Assureur[] }) {
  const [bordereaux, setBordereaux] = useState<Bordereau[]>([]);
  const [creances, setCreances] = useState<Record<string, string>[]>([]);
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [erreur, setErreur] = useState('');
  const [manquants, setManquants] = useState<Record<string, string[]> | null>(null);
  const [message, setMessage] = useState('');
  const maintenant = new Date();
  const [creation, setCreation] = useState({ assureur: '', debut: jour(new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1)), fin: jour(new Date(maintenant.getFullYear(), maintenant.getMonth(), 0)) });
  const [reponse, setReponse] = useState<Record<number, { montant: string; motif: string; refacturer: boolean }>>({});
  const [reglement, setReglement] = useState({ montant: '', reference: '' });

  const charger = useCallback(async () => {
    const [b, c] = await Promise.all([assurancesApi.bordereaux().catch(() => []), assurancesApi.creances().then((r) => r.lignes).catch(() => [])]);
    setBordereaux(b); setCreances(c);
  }, []);
  useEffect(() => { charger(); }, [charger]);

  const agir = async (action: () => Promise<unknown>, succes: string) => {
    setErreur(''); setMessage(''); setManquants(null);
    try { await action(); setMessage(succes); await charger(); }
    catch (e) {
      const pieces = (e as { response?: { data?: { documents_manquants?: Record<string, string[]> } } })?.response?.data?.documents_manquants;
      if (pieces) setManquants(pieces); else setErreur(messageErreur(e, "L'opération n'a pas abouti."));
    }
  };
  const creer = (e: FormEvent) => { e.preventDefault(); agir(() => assurancesApi.creerBordereau(Number(creation.assureur), creation.debut, creation.fin), 'Bordereau préparé.'); };
  const actif = bordereaux.find((b) => b.id === ouvert);

  return (
    <div className="space-y-5">
      {message && <p role="status" className={info}>{message}</p>}
      {erreur && <p role="alert" className={alerte}>{erreur}</p>}
      {manquants && (
        <div role="alert" className={alerte}>
          <p className="font-medium">Pièces manquantes, envoi impossible :</p>
          {Object.entries(manquants).map(([numero, pieces]) => <p key={numero}>{numero} : {pieces.map((p) => TYPES_JUSTIFICATIF[p] ?? p).join(', ')}</p>)}
        </div>
      )}

      <section className={carte}>
        <h2 className={`${titreCarte} mb-3`}>Préparer un bordereau</h2>
        <form onSubmit={creer} className="flex flex-wrap items-end gap-2">
          <select className={`${champBase} w-64`} value={creation.assureur} onChange={(e) => setCreation({ ...creation, assureur: e.target.value })} required>
            <option value="">Assureur</option>
            {assureurs.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
          </select>
          <label className="text-xs text-gray-500">Factures émises du<input type="date" className={`${champBase} mt-1 w-44`} value={creation.debut} onChange={(e) => setCreation({ ...creation, debut: e.target.value })} /></label>
          <label className="text-xs text-gray-500">au<input type="date" className={`${champBase} mt-1 w-44`} value={creation.fin} onChange={(e) => setCreation({ ...creation, fin: e.target.value })} /></label>
          <button type="submit" className={bouton}>Préparer</button>
        </form>
      </section>

      <section className={carte}>
        <h2 className={`${titreCarte} mb-3`}>Bordereaux</h2>
        {bordereaux.length === 0 ? <p className="text-sm text-gray-500">Aucun bordereau.</p> : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {bordereaux.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => setOuvert(ouvert === b.id ? null : b.id)} className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left">
                  <span><span className="font-medium text-gray-900 dark:text-white">{b.numero}</span> <span className="text-sm text-gray-600 dark:text-gray-400">{b.assureur_nom}, du {jourFr(b.periode_debut)} au {jourFr(b.periode_fin)}, {STATUTS_BORDEREAU[b.statut].toLowerCase()}</span></span>
                  <span className="text-sm">réclamé {montant(b.montant_reclame)}, payé {montant(b.montant_paye)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actif && (
        <section className={`${carte} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={titreCarte}>{actif.numero}, {actif.assureur_nom}</h2>
            {actif.statut === 'prepare' && <button type="button" className={bouton} onClick={() => agir(() => assurancesApi.envoyerBordereau(actif.id), 'Bordereau envoyé.')}><Send className="h-4 w-4" aria-hidden="true" /> Marquer comme envoyé</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700"><th className="py-2">Facture</th><th className="py-2">Patient</th><th className="py-2 text-right">Réclamé</th><th className="py-2">Réponse de l'assureur</th></tr></thead>
              <tbody>
                {actif.lignes.map((l) => {
                  const r = reponse[l.id] ?? { montant: l.montant_reclame, motif: '', refacturer: true };
                  return (
                    <tr key={l.id} className="border-b border-gray-100 align-top dark:border-gray-800">
                      <td className="py-2">{l.facture_numero}</td><td className="py-2">{l.patient_nom}</td><td className="py-2 text-right">{montant(l.montant_reclame)}</td>
                      <td className="py-2">
                        {l.statut !== 'en_attente' ? (
                          <span>{l.statut === 'acceptee' ? 'Acceptée' : l.statut === 'rejetee' ? 'Rejetée' : 'Acceptée en partie'} : {montant(l.montant_accepte)}{l.motif_rejet ? `, ${l.motif_rejet}` : ''}{l.refacture_au_patient ? ', refacturée au patient' : ''}</span>
                        ) : actif.statut === 'prepare' ? <span className="text-gray-500">En attente d'envoi</span> : (
                          <div className="flex flex-wrap items-center gap-2">
                            <input className={`${champBase} h-9 w-28`} inputMode="decimal" value={r.montant} onChange={(e) => setReponse({ ...reponse, [l.id]: { ...r, montant: e.target.value } })} aria-label="Montant accepté" />
                            {nombre(r.montant) < nombre(l.montant_reclame) && (
                              <>
                                <input className={`${champBase} h-9 w-48`} placeholder="Motif du rejet" value={r.motif} onChange={(e) => setReponse({ ...reponse, [l.id]: { ...r, motif: e.target.value } })} />
                                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={r.refacturer} onChange={(e) => setReponse({ ...reponse, [l.id]: { ...r, refacturer: e.target.checked } })} /> refacturer au patient</label>
                              </>
                            )}
                            <button type="button" className={`${boutonSecondaire} h-9`} onClick={() => agir(() => assurancesApi.statuer(actif.id, l.id, r.montant, r.motif, r.refacturer), 'Réponse enregistrée.')}>Valider</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {actif.statut !== 'prepare' && actif.statut !== 'paye' && (
            <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); agir(() => assurancesApi.reglement(actif.id, reglement.montant, reglement.reference), 'Règlement enregistré.').then(() => setReglement({ montant: '', reference: '' })); }}>
              <span className="text-sm text-gray-700 dark:text-gray-300">Règlement reçu :</span>
              <input className={`${champBase} w-36`} inputMode="decimal" placeholder="Montant (HTG)" value={reglement.montant} onChange={(e) => setReglement({ ...reglement, montant: e.target.value })} required />
              <input className={`${champBase} w-48`} placeholder="Référence du virement" value={reglement.reference} onChange={(e) => setReglement({ ...reglement, reference: e.target.value })} />
              <button type="submit" className={bouton}>Enregistrer</button>
            </form>
          )}
          {actif.reglements.length > 0 && <p className="text-sm text-gray-600 dark:text-gray-400">Règlements : {actif.reglements.map((r) => `${montant(r.montant)} le ${jourFr(r.date)}${r.reference ? ` (${r.reference})` : ''}`).join(', ')}</p>}
        </section>
      )}

      {creances.length > 0 && (
        <section className={carte}>
          <h2 className={`${titreCarte} mb-3`}>Ce que doivent les assureurs</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700"><th className="py-2">Assureur</th><th className="py-2 text-right">Pas encore réclamé</th><th className="py-2 text-right">Réclamé</th><th className="py-2 text-right">Accepté</th><th className="py-2 text-right">Payé</th><th className="py-2 text-right">Reste dû</th></tr></thead>
            <tbody>{creances.map((c) => (
              <tr key={c.assureur} className="border-b border-gray-100 dark:border-gray-800"><td className="py-2">{c.assureur}</td><td className="text-right">{montant(c.non_reclame)}</td><td className="text-right">{montant(c.reclame)}</td><td className="text-right">{montant(c.accepte)}</td><td className="text-right">{montant(c.paye)}</td><td className="text-right font-medium">{montant(c.reste_du)}</td></tr>
            ))}</tbody>
          </table>
        </section>
      )}
    </div>
  );
}
