import { useState, type FormEvent } from 'react';
import { caisseApi, LIBELLES_CATEGORIE, type Categorie, type ParametresCaisse } from '../../../api/caisseApi';
import { alerte, bouton, carte, champBase, info, messageErreur, titreCarte } from './ui';

const DEVISES = ['HTG', 'USD', 'EUR', 'CAD', 'DOP'];

export default function Reglages({ parametres, onChanged }: { parametres: ParametresCaisse; onChanged: (p: ParametresCaisse) => void }) {
  const [form, setForm] = useState(parametres);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const basculer = <T,>(liste: T[], valeur: T) => (liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur]);

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(''); setMessage('');
    try { const p = await caisseApi.modifierParametres({ ...form, devises_acceptees: [...new Set(['HTG', ...form.devises_acceptees])] }); onChanged(p); setForm(p); setMessage('Réglages enregistrés.'); }
    catch (err) { setErreur(messageErreur(err, "Les réglages n'ont pas été enregistrés.")); }
  };

  return (
    <form onSubmit={enregistrer} className={`${carte} max-w-2xl space-y-5`}>
      <h2 className={titreCarte}>Réglages de la caisse</h2>
      {message && <p role="status" className={info}>{message}</p>}
      {erreur && <p role="alert" className={alerte}>{erreur}</p>}
      <label className="block text-sm text-gray-700 dark:text-gray-300">Préfixe des numéros (factures, reçus)
        <input className={`${champBase} mt-1 w-40 uppercase`} maxLength={10} value={form.prefixe} onChange={(e) => setForm({ ...form, prefixe: e.target.value.toUpperCase() })} placeholder="JCC" />
      </label>
      <fieldset className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <legend className="mb-1">Payé avant le service</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {(Object.keys(LIBELLES_CATEGORIE) as Categorie[]).map((c) => (
            <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={form.categories_payees_avant.includes(c)} onChange={() => setForm({ ...form, categories_payees_avant: basculer(form.categories_payees_avant, c) })} /> {LIBELLES_CATEGORIE[c]}</label>
          ))}
        </div>
        <label className="flex items-start gap-2 pt-1">
          <input type="checkbox" className="mt-1" checked={form.paiement_bloquant} onChange={(e) => setForm({ ...form, paiement_bloquant: e.target.checked })} />
          <span>Bloquer la consultation tant que le ticket n'est pas payé (sinon, simple rappel à la caisse).</span>
        </label>
      </fieldset>
      <label className="block text-sm text-gray-700 dark:text-gray-300">Remise maximale accordée par le secrétariat (%)
        <input className={`${champBase} mt-1 w-32`} inputMode="decimal" value={form.remise_max_pourcent} onChange={(e) => setForm({ ...form, remise_max_pourcent: e.target.value })} />
      </label>
      <fieldset className="text-sm text-gray-700 dark:text-gray-300">
        <legend className="mb-1">Devises acceptées</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {DEVISES.map((d) => (
            <label key={d} className="flex items-center gap-2"><input type="checkbox" disabled={d === 'HTG'} checked={d === 'HTG' || form.devises_acceptees.includes(d)} onChange={() => setForm({ ...form, devises_acceptees: basculer(form.devises_acceptees, d) })} /> {d}</label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-end"><button type="submit" className={bouton}>Enregistrer</button></div>
    </form>
  );
}
