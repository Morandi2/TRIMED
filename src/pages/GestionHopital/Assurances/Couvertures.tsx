import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Download, Upload } from 'lucide-react';
import apiClient from '../../../api/apiConfig';
import { assurancesApi, TYPES_JUSTIFICATIF, type AccordPrealable, type Convention, type Couverture, type Justificatif } from '../../../api/assurancesApi';
import { montant } from '../../../api/caisseApi';
import { alerte, bouton, boutonSecondaire, carte, champ, champBase, dateHeure, info, messageErreur, titreCarte, usePatients } from '../Caisse/ui';
import { bornes, REGLES } from '../../../utils/contraintes';

const STATUTS_ACCORD = { en_attente: 'En attente', accorde: 'Accordé', refuse: 'Refusé' } as const;

/** Assurance d'un patient : couvertures, accords préalables et pièces justificatives. */
export default function Couvertures({ conventions }: { conventions: Convention[] }) {
  const { patients, nom } = usePatients();
  const [patient, setPatient] = useState('');
  const [recherche, setRecherche] = useState('');
  const [couvertures, setCouvertures] = useState<Couverture[]>([]);
  const [accords, setAccords] = useState<AccordPrealable[]>([]);
  const [pieces, setPieces] = useState<Justificatif[]>([]);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  const charger = useCallback(async () => {
    if (!patient) { setCouvertures([]); setAccords([]); setPieces([]); return; }
    const c = await assurancesApi.couvertures({ patient }).catch(() => []);
    setCouvertures(c);
    const a = (await Promise.all(c.map((x) => assurancesApi.accords({ couverture: x.id }).catch(() => [])))).flat();
    setAccords(a);
    setPieces(await assurancesApi.justificatifs({ patient }).catch(() => []));
  }, [patient]);
  useEffect(() => { charger(); }, [charger]);

  const agir = async (action: () => Promise<unknown>, succes: string) => {
    setErreur(''); setMessage('');
    try { await action(); setMessage(succes); await charger(); } catch (e) { setErreur(messageErreur(e, "L'opération n'a pas abouti.")); }
  };

  const [nouvelle, setNouvelle] = useState({ convention: '', numero_carte: '', principal: 'true', nom_assure_principal: '', lien_avec_assure: '', date_fin: '' });
  const ajouter = (e: FormEvent) => {
    e.preventDefault();
    agir(() => apiClient.post('/assurances/couvertures/', {
      patient: Number(patient), convention: Number(nouvelle.convention), numero_carte: nouvelle.numero_carte,
      est_assure_principal: nouvelle.principal === 'true', nom_assure_principal: nouvelle.nom_assure_principal,
      lien_avec_assure: nouvelle.lien_avec_assure, ...(nouvelle.date_fin ? { date_fin: nouvelle.date_fin } : {}),
    }), 'Couverture enregistrée.').then(() => setNouvelle({ ...nouvelle, numero_carte: '', nom_assure_principal: '', lien_avec_assure: '', date_fin: '' }));
  };
  const [demande, setDemande] = useState({ couverture: '', objet: '', montant: '' });
  const [repAccord, setRepAccord] = useState<Record<number, { numero: string; montant: string; expiration: string }>>({});
  const [piece, setPiece] = useState<{ type: string; fichier: File | null }>({ type: 'carte_assurance', fichier: null });
  const envoyerPiece = (e: FormEvent) => {
    e.preventDefault();
    if (!piece.fichier) return;
    const form = new FormData();
    form.append('patient', patient); form.append('type_document', piece.type); form.append('fichier', piece.fichier);
    if (couvertures[0]) form.append('couverture', String(couvertures[0].id));
    agir(() => assurancesApi.envoyerJustificatif(form), 'Pièce enregistrée.').then(() => setPiece({ ...piece, fichier: null }));
  };

  const filtres = patients.filter((p) => !recherche || `${p.prenom} ${p.nom} ${p.numero_dossier_medical ?? ''}`.toLowerCase().includes(recherche.toLowerCase()));
  return (
    <div className="space-y-5">
      <section className={carte}>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={champ} placeholder="Rechercher un patient" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          <select className={champ} value={patient} onChange={(e) => setPatient(e.target.value)}>
            <option value="">Choisir le patient ({filtres.length})</option>
            {filtres.slice(0, 200).map((p) => <option key={p.patient_id} value={p.patient_id}>{p.prenom} {p.nom}{p.numero_dossier_medical ? `, ${p.numero_dossier_medical}` : ''}</option>)}
          </select>
        </div>
      </section>
      {message && <p role="status" className={info}>{message}</p>}
      {erreur && <p role="alert" className={alerte}>{erreur}</p>}

      {patient && (
        <>
          <section className={carte}>
            <h2 className={`${titreCarte} mb-3`}>Couvertures de {nom(Number(patient))}</h2>
            {couvertures.length === 0 ? <p className="mb-3 text-sm text-gray-500">Aucune couverture enregistrée.</p> : (
              <ul className="mb-4 space-y-1 text-sm">
                {couvertures.map((c) => <li key={c.id}>{c.assureur_nom}, carte {c.numero_carte}, {c.est_assure_principal ? 'assuré principal' : `ayant droit de ${c.nom_assure_principal || '?'} (${c.lien_avec_assure || 'lien non précisé'})`}{c.date_fin ? `, jusqu'au ${c.date_fin}` : ''} <span className={c.valide ? 'text-trimed-vert-fonce' : 'text-red-600'}>{c.valide ? 'valide' : 'expirée'}</span></li>)}
              </ul>
            )}
            <form onSubmit={ajouter} className="grid gap-2 sm:grid-cols-3">
              <select className={champ} value={nouvelle.convention} onChange={(e) => setNouvelle({ ...nouvelle, convention: e.target.value })} required>
                <option value="">Assureur (convention)</option>
                {conventions.filter((c) => c.actif).map((c) => <option key={c.id} value={c.id}>{c.assureur_nom}{c.reference ? `, ${c.reference}` : ''}</option>)}
              </select>
              <input className={champ} placeholder="Numéro de carte" value={nouvelle.numero_carte} onChange={(e) => setNouvelle({ ...nouvelle, numero_carte: e.target.value })} required />
              <select className={champ} value={nouvelle.principal} onChange={(e) => setNouvelle({ ...nouvelle, principal: e.target.value })}>
                <option value="true">Assuré principal</option><option value="false">Ayant droit</option>
              </select>
              {nouvelle.principal === 'false' && (
                <>
                  <input className={champ} placeholder="Nom de l'assuré principal" value={nouvelle.nom_assure_principal} onChange={(e) => setNouvelle({ ...nouvelle, nom_assure_principal: e.target.value })} />
                  <input className={champ} placeholder="Lien (conjoint, enfant…)" value={nouvelle.lien_avec_assure} onChange={(e) => setNouvelle({ ...nouvelle, lien_avec_assure: e.target.value })} />
                </>
              )}
              <label className="text-xs text-gray-500">Valable jusqu'au (facultatif)<input type="date" className={`${champ} mt-1`} {...bornes(REGLES.expirationCarte, 'date')} value={nouvelle.date_fin} onChange={(e) => setNouvelle({ ...nouvelle, date_fin: e.target.value })} /></label>
              <div className="flex items-end"><button type="submit" className={bouton}>Ajouter la couverture</button></div>
            </form>
          </section>

          {couvertures.length > 0 && (
            <section className={carte}>
              <h2 className={`${titreCarte} mb-3`}>Accords préalables</h2>
              <ul className="mb-4 space-y-2 text-sm">
                {accords.map((a) => {
                  const r = repAccord[a.id] ?? { numero: '', montant: '', expiration: '' };
                  return (
                    <li key={a.id} className="rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
                      <p>{a.objet}{a.montant_estime ? `, estimé ${montant(a.montant_estime)}` : ''}, demandé le {dateHeure(a.date_demande)} : <strong>{STATUTS_ACCORD[a.statut]}</strong>{a.numero_accord ? ` (n° ${a.numero_accord})` : ''}</p>
                      {a.statut === 'en_attente' && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <input className={`${champBase} h-9 w-40`} placeholder="N° d'accord" value={r.numero} onChange={(e) => setRepAccord({ ...repAccord, [a.id]: { ...r, numero: e.target.value } })} />
                          <input className={`${champBase} h-9 w-36`} placeholder="Montant accordé" inputMode="decimal" value={r.montant} onChange={(e) => setRepAccord({ ...repAccord, [a.id]: { ...r, montant: e.target.value } })} />
                          <input type="date" aria-label="Expiration" className={`${champBase} h-9 w-44`} {...bornes(REGLES.expirationCarte, 'date')} value={r.expiration} onChange={(e) => setRepAccord({ ...repAccord, [a.id]: { ...r, expiration: e.target.value } })} />
                          <button type="button" className={`${bouton} h-9`} onClick={() => agir(() => assurancesApi.repondreAccord(a.id, { statut: 'accorde', numero_accord: r.numero, ...(r.montant ? { montant_accorde: r.montant } : {}), ...(r.expiration ? { date_expiration: r.expiration } : {}) }), 'Accord enregistré.')}>Accordé</button>
                          <button type="button" className={`${boutonSecondaire} h-9`} onClick={() => agir(() => assurancesApi.repondreAccord(a.id, { statut: 'refuse' }), 'Refus enregistré.')}>Refusé</button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <form className="grid gap-2 sm:grid-cols-[1fr_2fr_140px_auto]" onSubmit={(e) => { e.preventDefault(); agir(() => assurancesApi.demanderAccord({ couverture: Number(demande.couverture || couvertures[0].id), objet: demande.objet, ...(demande.montant ? { montant_estime: demande.montant } : {}) }), 'Demande enregistrée.').then(() => setDemande({ couverture: '', objet: '', montant: '' })); }}>
                <select className={champ} value={demande.couverture} onChange={(e) => setDemande({ ...demande, couverture: e.target.value })}>
                  {couvertures.map((c) => <option key={c.id} value={c.id}>{c.assureur_nom}</option>)}
                </select>
                <input className={champ} placeholder="Objet (hospitalisation, chirurgie…)" value={demande.objet} onChange={(e) => setDemande({ ...demande, objet: e.target.value })} required />
                <input className={champ} placeholder="Estimation" inputMode="decimal" value={demande.montant} onChange={(e) => setDemande({ ...demande, montant: e.target.value })} />
                <button type="submit" className={boutonSecondaire}>Demander</button>
              </form>
            </section>
          )}

          <section className={carte}>
            <h2 className={`${titreCarte} mb-3`}>Pièces justificatives</h2>
            {pieces.length > 0 && (
              <ul className="mb-4 divide-y divide-gray-100 text-sm dark:divide-gray-800">
                {pieces.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2">
                    <span>{TYPES_JUSTIFICATIF[p.type_document] ?? p.type_document}, {p.nom_fichier}, {dateHeure(p.ajoute_le)}</span>
                    <button type="button" className="inline-flex items-center gap-1 text-brand-600 hover:underline" onClick={() => assurancesApi.telechargerJustificatif(p).catch((e) => setErreur(messageErreur(e, 'Téléchargement impossible.')))}><Download className="h-4 w-4" aria-hidden="true" /> Télécharger</button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={envoyerPiece} className="flex flex-wrap items-center gap-2">
              <select className={`${champBase} w-64`} value={piece.type} onChange={(e) => setPiece({ ...piece, type: e.target.value })}>
                {Object.entries(TYPES_JUSTIFICATIF).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setPiece({ ...piece, fichier: e.target.files?.[0] ?? null })} className="text-sm" />
              <button type="submit" disabled={!piece.fichier} className={bouton}><Upload className="h-4 w-4" aria-hidden="true" /> Enregistrer la pièce</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
