import { useState, type FormEvent } from 'react';
import GenericCrudManager, { type CrudColumn, type CrudField } from '../shared/GenericCrudManager';
import { assurancesApi, TYPES_JUSTIFICATIF, type Assureur, type Convention } from '../../../api/assurancesApi';
import { crud, LIBELLES_CATEGORIE, montant, type Categorie } from '../../../api/caisseApi';
import { alerte, bouton, boutonSecondaire, carte, champ, champBase, info, messageErreur, titreCarte } from '../Caisse/ui';
import { bornes, REGLES } from '../../../utils/contraintes';

const assureursApi = crud('/assurances/assureurs/', 'Assureur');
const TYPES = [{ value: 'prive', label: 'Assurance privée' }, { value: 'mutuelle', label: 'Mutuelle' }, { value: 'employeur', label: 'Employeur' }, { value: 'public', label: 'Organisme public' }];
const CHAMPS: CrudField[] = [
  { key: 'nom', label: 'Nom', type: 'text', required: true, maxLength: 150 },
  { key: 'type_assureur', label: 'Type', type: 'select', required: true, options: TYPES },
  { key: 'telephone', label: 'Téléphone', type: 'text', maxLength: 50 },
  { key: 'email', label: 'Courriel', type: 'text', maxLength: 254 },
  { key: 'delai_paiement_jours', label: 'Délai de paiement (jours)', type: 'number' },
];
const COLONNES: CrudColumn[] = [
  { key: 'nom', label: 'Nom' },
  { key: 'type_assureur', label: 'Type', render: (r) => TYPES.find((t) => t.value === r.type_assureur)?.label ?? r.type_assureur },
  { key: 'delai_paiement_jours', label: 'Délai (jours)' },
];
const CATEGORIES = Object.keys(LIBELLES_CATEGORIE) as Categorie[];

type Brouillon = Omit<Convention, 'id' | 'assureur_nom' | 'assureur'> & { id?: number; assureur: string; codes: string };
const vide = (): Brouillon => ({ assureur: '', reference: '', date_debut: new Date().toLocaleDateString('en-CA'), date_fin: null, actif: true, taux_par_categorie: {},
  plafond_par_facture: null, plafond_annuel: null, categories_accord_prealable: [], codes_exclus: [], documents_requis: ['carte_assurance'], codes: '' });

export default function Conventions({ assureurs, conventions, peutConfigurer, onChanged }: { assureurs: Assureur[]; conventions: Convention[]; peutConfigurer: boolean; onChanged: () => void }) {
  const [form, setForm] = useState<Brouillon | null>(null);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const basculer = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setErreur('');
    const { id, codes, ...reste } = form;
    const donnees = { ...reste, assureur: Number(form.assureur), codes_exclus: codes.split(',').map((c) => c.trim()).filter(Boolean),
      plafond_par_facture: form.plafond_par_facture || null, plafond_annuel: form.plafond_annuel || null, date_fin: form.date_fin || null };
    try {
      if (id) await assurancesApi.modifierConvention(id, donnees as never); else await assurancesApi.creerConvention(donnees as never);
      setMessage('Convention enregistrée.'); setForm(null); onChanged();
    } catch (err) { setErreur(messageErreur(err, "La convention n'a pas été enregistrée.")); }
  };

  return (
    <div className="space-y-5">
      <section className={carte}>
        <h2 className={`${titreCarte} mb-3`}>Assureurs</h2>
        <GenericCrudManager api={assureursApi} fields={CHAMPS} columns={COLONNES} singular="Assureur" canEdit={peutConfigurer} onChanged={onChanged} />
      </section>
      <section className={carte}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className={titreCarte}>Conventions</h2>
          {peutConfigurer && !form && <button type="button" className={bouton} onClick={() => setForm(vide())} disabled={assureurs.length === 0}>Nouvelle convention</button>}
        </div>
        {message && <p role="status" className={`${info} mb-3`}>{message}</p>}
        {conventions.length === 0 && !form && <p className="text-sm text-gray-500">Aucune convention.</p>}
        <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
          {conventions.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span><strong>{c.assureur_nom}</strong>{c.reference ? `, ${c.reference}` : ''} : {Object.entries(c.taux_par_categorie).map(([k, v]) => `${LIBELLES_CATEGORIE[k as Categorie] ?? k} ${v} %`).join(', ') || 'aucun taux'}{c.plafond_par_facture ? `, plafond ${montant(c.plafond_par_facture)} par facture` : ''}{c.actif ? '' : ' (inactive)'}</span>
              {peutConfigurer && <button type="button" className="text-brand-600 hover:underline" onClick={() => setForm({ ...c, assureur: String(c.assureur), codes: c.codes_exclus.join(', ') })}>Modifier</button>}
            </li>
          ))}
        </ul>
        {form && (
          <form onSubmit={enregistrer} className="mt-4 space-y-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
            {erreur && <p role="alert" className={alerte}>{erreur}</p>}
            <div className="grid gap-2 sm:grid-cols-4">
              <select className={champ} value={form.assureur} onChange={(e) => setForm({ ...form, assureur: e.target.value })} required>
                <option value="">Assureur</option>{assureurs.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
              </select>
              <input className={champ} placeholder="Référence du contrat" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              <label className="text-xs text-gray-500">Début<input type="date" className={`${champ} mt-1`} {...bornes(REGLES.debutContrat, 'date')} value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} /></label>
              <label className="text-xs text-gray-500">Fin (facultatif)<input type="date" className={`${champ} mt-1`} {...bornes(REGLES.finContrat, 'date')} min={form.date_debut || bornes(REGLES.finContrat, 'date').min} value={form.date_fin ?? ''} onChange={(e) => setForm({ ...form, date_fin: e.target.value || null })} /></label>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm text-gray-700 dark:text-gray-300">Taux de prise en charge (%) et accord préalable</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <span className="w-36 shrink-0">{LIBELLES_CATEGORIE[c]}</span>
                    <input className={`${champBase} h-9 w-20`} inputMode="decimal" value={form.taux_par_categorie[c] ?? ''} onChange={(e) => setForm({ ...form, taux_par_categorie: { ...form.taux_par_categorie, [c]: e.target.value === '' ? undefined : Number(e.target.value) } })} />
                    <input type="checkbox" title="Accord préalable exigé" checked={form.categories_accord_prealable.includes(c)} onChange={() => setForm({ ...form, categories_accord_prealable: basculer(form.categories_accord_prealable, c) })} />
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Case cochée : un accord préalable de l'assureur est exigé pour cette catégorie.</p>
            </fieldset>
            <div className="grid gap-2 sm:grid-cols-3">
              <input className={champ} inputMode="decimal" placeholder="Plafond par facture (HTG)" value={form.plafond_par_facture ?? ''} onChange={(e) => setForm({ ...form, plafond_par_facture: e.target.value || null })} />
              <input className={champ} inputMode="decimal" placeholder="Plafond annuel par assuré (HTG)" value={form.plafond_annuel ?? ''} onChange={(e) => setForm({ ...form, plafond_annuel: e.target.value || null })} />
              <input className={champ} placeholder="Codes d'actes exclus (ECHO, IRM…)" value={form.codes} onChange={(e) => setForm({ ...form, codes: e.target.value })} />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm text-gray-700 dark:text-gray-300">Pièces exigées pour réclamer</legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {Object.entries(TYPES_JUSTIFICATIF).filter(([v]) => v !== 'autre').map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2"><input type="checkbox" checked={form.documents_requis.includes(v)} onChange={() => setForm({ ...form, documents_requis: basculer(form.documents_requis, v) })} /> {l}</label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} /> Convention active</label>
            <div className="flex justify-end gap-2"><button type="button" className={boutonSecondaire} onClick={() => setForm(null)}>Annuler</button><button type="submit" className={bouton}>Enregistrer</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
