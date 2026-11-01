import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { BedDouble, Plus } from 'lucide-react';
import hospitalApi from '../../../../api/hospitalApi';
import { toutesLesPages } from '../etat';

interface Chambre { id: number; numero: string; etage: number; type_chambre: string; capacite: number }
interface Lit { id: number; numero_lit: string; chambre: number; statut?: string }

const TYPES: Record<string, string> = { privee: 'Privée', semi_privee: 'Semi-privée', collective: 'Collective' };
const LETTRES = 'ABCDEFGHIJKL';
const MAX_LITS = LETTRES.length;

// Numéro de lit (5 caractères au plus côté serveur) : « 101-A », sinon la lettre seule.
const numeroLit = (chambre: string, i: number) => {
  const complet = `${chambre}-${LETTRES[i]}`;
  return complet.length <= 5 ? complet : LETTRES[i];
};

const champ = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-trimed-indigo focus:ring-2 focus:ring-trimed-indigo/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

// Étape 2 : les chambres et leurs lits, utilisés par le module Hospitalisation.
export function EtapeChambres({ tenantId }: { tenantId: number }) {
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [lits, setLits] = useState<Lit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [form, setForm] = useState({ numero: '', etage: '0', type_chambre: 'collective', lits: '2' });

  const charger = useCallback(async () => {
    const [rc, rl] = await Promise.all([
      toutesLesPages<Chambre>(hospitalApi.hospitalisation.chambres.getAll, { tenant: tenantId }),
      toutesLesPages<Lit>(hospitalApi.hospitalisation.lits.getAll),
    ]);
    if (rc.success) setChambres(rc.data.sort((a, b) => a.etage - b.etage || a.numero.localeCompare(b.numero, 'fr', { numeric: true })));
    if (rl.success) setLits(rl.data);
    if (!rc.success) setErreur(rc.message || 'Impossible de charger les chambres.');
    setChargement(false);
  }, [tenantId]);

  useEffect(() => { charger(); }, [charger]);

  const ajouter = async (e: FormEvent) => {
    e.preventDefault();
    setErreur('');
    const numero = form.numero.trim();
    const nbLits = Number(form.lits);
    if (!numero) return setErreur('Indiquez le numéro de la chambre.');
    if (chambres.some((c) => c.numero.toLowerCase() === numero.toLowerCase())) return setErreur(`La chambre ${numero} existe déjà.`);
    if (!(nbLits >= 1 && nbLits <= MAX_LITS)) return setErreur(`Une chambre compte de 1 à ${MAX_LITS} lits.`);

    setEnvoi(true);
    const res = await hospitalApi.hospitalisation.chambres.create({ numero, etage: Number(form.etage) || 0, type_chambre: form.type_chambre, capacite: nbLits, tenant: tenantId });
    if (!res.success) {
      setEnvoi(false);
      return setErreur(res.message || 'La chambre n’a pas pu être créée.');
    }
    const idChambre = res.data?.id;
    let litsManquants = 0;
    for (let i = 0; i < nbLits; i++) {
      const rl = await hospitalApi.hospitalisation.lits.create({ numero_lit: numeroLit(numero, i), chambre: idChambre });
      if (!rl.success) litsManquants++;
    }
    if (litsManquants) setErreur(`La chambre est créée, mais ${litsManquants} lit(s) n’ont pas pu être ajoutés. Réessayez depuis le module Hospitalisation.`);
    setForm((f) => ({ ...f, numero: '' }));
    await charger();
    setEnvoi(false);
  };

  const litsDe = (id: number) => lits.filter((l) => l.chambre === id);
  const totalLits = chambres.reduce((n, c) => n + litsDe(c.id).length, 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Déclarez vos chambres et leurs lits. Ils servent aux admissions : l’équipe voit d’un coup d’œil les lits libres.
      </p>

      <form onSubmit={ajouter} className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 p-4 sm:grid-cols-[1fr_0.7fr_1.2fr_0.7fr_auto] dark:border-gray-800">
        <label className="text-xs text-gray-500 dark:text-gray-400">Numéro
          <input className={`${champ} mt-1`} value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="101" maxLength={10} />
        </label>
        <label className="text-xs text-gray-500 dark:text-gray-400">Étage
          <input className={`${champ} mt-1`} type="number" min={-2} max={50} value={form.etage} onChange={(e) => setForm({ ...form, etage: e.target.value })} />
        </label>
        <label className="text-xs text-gray-500 dark:text-gray-400">Type
          <select className={`${champ} mt-1`} value={form.type_chambre} onChange={(e) => setForm({ ...form, type_chambre: e.target.value })}>
            {Object.entries(TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-500 dark:text-gray-400">Lits
          <input className={`${champ} mt-1`} type="number" min={1} max={MAX_LITS} value={form.lits} onChange={(e) => setForm({ ...form, lits: e.target.value })} />
        </label>
        <button type="submit" disabled={envoi} className="col-span-2 mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-trimed-indigo px-4 text-sm font-medium text-white hover:bg-trimed-indigo-fonce disabled:opacity-50 sm:col-span-1">
          <Plus className="h-4 w-4" aria-hidden="true" /> {envoi ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>

      {erreur && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{erreur}</p>}

      <div>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          {chargement ? 'Chargement…' : `${chambres.length} chambre${chambres.length > 1 ? 's' : ''} · ${totalLits} lit${totalLits > 1 ? 's' : ''}`}
        </p>
        {!chargement && chambres.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800">
            <BedDouble className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            Aucune chambre pour l’instant. Ajoutez la première ci-dessus.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {chambres.map((c) => {
              const ls = litsDe(c.id);
              return (
                <li key={c.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-baseline justify-between">
                    <p className="font-marque text-base text-gray-900 dark:text-white">Chambre {c.numero}</p>
                    <p className="text-xs text-gray-500">Étage {c.etage} · {TYPES[c.type_chambre] ?? c.type_chambre}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {ls.length ? ls.map((l) => (
                      <span key={l.id} className="inline-flex items-center gap-1 rounded-lg bg-trimed-brume px-2 py-1 text-xs text-trimed-encre dark:bg-white/5 dark:text-gray-300">
                        <BedDouble className="h-3.5 w-3.5" aria-hidden="true" /> {l.numero_lit}
                      </span>
                    )) : <span className="text-xs text-gray-400">Aucun lit</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
