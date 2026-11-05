import { useState, type FormEvent } from 'react';
import GenericCrudManager, { type CrudColumn, type CrudField } from '../shared/GenericCrudManager';
import { caisseApi, crud, LIBELLES_CATEGORIE, montant, type TauxChange } from '../../../api/caisseApi';
import { alerte, bouton, carte, champBase, info, messageErreur, titreCarte } from './ui';

const CATEGORIES = Object.entries(LIBELLES_CATEGORIE).map(([value, label]) => ({ value, label }));
const TYPES_CHAMBRE = [{ value: '', label: 'Toutes' }, { value: 'privee', label: 'Privée' }, { value: 'semi_privee', label: 'Semi-privée' }, { value: 'collective', label: 'Collective' }];
const actesApi = crud('/caisse/actes/', 'Tarif');

const CHAMPS: CrudField[] = [
  { key: 'code', label: 'Code', type: 'text', required: true, maxLength: 20, placeholder: 'Ex. : NFS, GEN-EXAMEN' },
  { key: 'libelle', label: 'Libellé', type: 'text', required: true, maxLength: 150 },
  { key: 'categorie', label: 'Catégorie', type: 'select', required: true, options: CATEGORIES },
  { key: 'prix', label: 'Prix (HTG)', type: 'number', required: true },
  { key: 'type_chambre', label: 'Type de chambre (journées)', type: 'select', options: TYPES_CHAMBRE },
  { key: 'compte_comptable', label: 'Compte comptable', type: 'text', maxLength: 20 },
  { key: 'date_debut', label: 'Valable à partir du', type: 'date' },
];
const COLONNES: CrudColumn[] = [
  { key: 'code', label: 'Code' },
  { key: 'libelle', label: 'Libellé' },
  { key: 'categorie', label: 'Catégorie', render: (r) => LIBELLES_CATEGORIE[r.categorie as keyof typeof LIBELLES_CATEGORIE] ?? r.categorie },
  { key: 'prix', label: 'Prix', render: (r) => montant(r.prix) },
  { key: 'date_debut', label: 'Depuis' },
];

export default function Tarifs({ peutConfigurer, taux, onTaux }: { peutConfigurer: boolean; taux: TauxChange[]; onTaux: () => void }) {
  const [saisie, setSaisie] = useState({ devise: 'USD', taux: '' });
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(''); setMessage('');
    try { await caisseApi.ajouterTaux(saisie.devise, saisie.taux); setMessage(`Taux du jour enregistré : 1 ${saisie.devise} = ${saisie.taux} HTG.`); setSaisie({ ...saisie, taux: '' }); onTaux(); }
    catch (err) { setErreur(messageErreur(err, "Le taux n'a pas été enregistré (un taux existe peut-être déjà pour aujourd'hui).")); }
  };
  const derniers = [...new Map(taux.map((t) => [t.devise, t])).values()];

  return (
    <div className="space-y-5">
      <section className={carte}>
        <h2 className={`${titreCarte} mb-1`}>Taux de change du jour</h2>
        <p className="mb-3 text-xs text-gray-500">Gourdes pour une unité de devise (taux de référence BRH ou taux pratiqué par l'hôpital).</p>
        {derniers.length > 0 && <p className="mb-3 text-sm">{derniers.map((t) => `1 ${t.devise} = ${t.taux} HTG (${t.date})`).join(', ')}</p>}
        {message && <p role="status" className={`${info} mb-3`}>{message}</p>}
        {erreur && <p role="alert" className={`${alerte} mb-3`}>{erreur}</p>}
        <form onSubmit={enregistrer} className="flex flex-wrap gap-2">
          <select className={`${champBase} w-28`} value={saisie.devise} onChange={(e) => setSaisie({ ...saisie, devise: e.target.value })}>
            {['USD', 'EUR', 'CAD', 'DOP'].map((d) => <option key={d}>{d}</option>)}
          </select>
          <input className={`${champBase} w-40`} inputMode="decimal" placeholder="Taux (HTG)" value={saisie.taux} onChange={(e) => setSaisie({ ...saisie, taux: e.target.value })} required />
          <button type="submit" className={bouton}>Enregistrer</button>
        </form>
      </section>
      <section className={carte}>
        <h2 className={`${titreCarte} mb-1`}>Catalogue des tarifs</h2>
        <p className="mb-4 text-xs text-gray-500">
          Consultation sans spécialité et journée sans type de chambre servent de tarif général. Pour les examens et les autres actes,
          le libellé doit être celui saisi par le médecin, sinon un code commençant par GEN sert de tarif par défaut.
        </p>
        <GenericCrudManager api={actesApi} fields={CHAMPS} columns={COLONNES} singular="Tarif" canEdit={peutConfigurer} emptyLabel="Aucun tarif : ajoutez au moins la consultation générale." />
      </section>
    </div>
  );
}
