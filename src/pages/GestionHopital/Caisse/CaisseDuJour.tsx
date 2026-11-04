import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { LockKeyhole, LockKeyholeOpen, PlusCircle, Wallet } from 'lucide-react';
import { Modal } from '../../../components/ui/modal';
import apiClient from '../../../api/apiConfig';
import {
  caisseApi, LIBELLES_CATEGORIE, LIBELLES_MODE, LIBELLES_STATUT, montant, nombre,
  type ActeTarif, type ElementFacturable, type Facture, type ModePaiement, type SessionCaisse, type TauxChange,
} from '../../../api/caisseApi';
import { alerte, bouton, boutonSecondaire, carte, champ, champBase, dateHeure, info, messageErreur, titreCarte, usePatients } from './ui';

interface Props {
  devises: string[];
  taux: TauxChange[];
  onOuvrirFacture: (id: number) => void;
  version: number;
}

export default function CaisseDuJour({ devises, taux, onOuvrirFacture, version }: Props) {
  const { patients, nom } = usePatients();
  const [session, setSession] = useState<SessionCaisse | null | undefined>(undefined);
  const [elements, setElements] = useState<ElementFacturable[]>([]);
  const [aPayer, setAPayer] = useState<Facture[]>([]);
  const [actes, setActes] = useState<ActeTarif[]>([]);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    const [s, el, fa] = await Promise.all([
      caisseApi.sessionCourante().catch(() => null),
      caisseApi.elements({ statut: 'a_facturer' }).catch(() => []),
      caisseApi.factures({ statut: 'emise' }).then(async (emises) => [...emises, ...await caisseApi.factures({ statut: 'partiellement_payee' })]).catch(() => []),
    ]);
    setSession(s); setElements(el.filter((e) => e.facture === null)); setAPayer(fa);
  }, []);
  useEffect(() => { charger(); }, [charger, version]);
  useEffect(() => { caisseApi.actes({ actif: true }).then(setActes).catch(() => setActes([])); }, []);

  const agir = async (action: () => Promise<unknown>, succes: string) => {
    setEnvoi(true); setErreur(''); setMessage('');
    try { await action(); setMessage(succes); await charger(); } catch (e) { setErreur(messageErreur(e, "L'opération n'a pas abouti.")); } finally { setEnvoi(false); }
  };

  // Soins non facturés, regroupés par patient et par visite
  const groupes = useMemo(() => {
    const parCle = new Map<string, { patient: number; visite: number | null; elements: ElementFacturable[] }>();
    for (const e of elements) {
      const cle = `${e.patient}-${e.visite ?? 0}`;
      if (!parCle.has(cle)) parCle.set(cle, { patient: e.patient, visite: e.visite, elements: [] });
      parCle.get(cle)!.elements.push(e);
    }
    return [...parCle.values()];
  }, [elements]);

  const preparer = async (patient: number, visite: number | null) => {
    setEnvoi(true); setErreur('');
    try { const f = await caisseApi.creerFacture(patient, visite); onOuvrirFacture(f.id); await charger(); }
    catch (e) { setErreur(messageErreur(e, "La facture n'a pas pu être préparée.")); } finally { setEnvoi(false); }
  };

  // ---- Session ----
  const [fond, setFond] = useState('');
  const [fermeture, setFermeture] = useState(false);
  const [declares, setDeclares] = useState<Record<string, string>>({});
  const [bilan, setBilan] = useState<SessionCaisse | null>(null);
  const fermer = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setEnvoi(true); setErreur('');
    try { setBilan(await caisseApi.fermerSession(session.id, declares)); setFermeture(false); setDeclares({}); await charger(); }
    catch (err) { setErreur(messageErreur(err, "La caisse n'a pas pu être fermée.")); } finally { setEnvoi(false); }
  };

  // ---- Ticket d'accueil ou acte ajouté, et acompte ----
  const [ajout, setAjout] = useState({ patient: '', acte: '', quantite: '1', recherche: '' });
  const [acompte, setAcompte] = useState<{ patient: string; montant: string; mode: ModePaiement; devise: string }>({ patient: '', montant: '', mode: 'especes', devise: 'HTG' });
  const filtres = patients.filter((p) => !ajout.recherche || `${p.prenom} ${p.nom} ${p.numero_dossier_medical ?? ''}`.toLowerCase().includes(ajout.recherche.toLowerCase()));
  const verserAcompte = (e: FormEvent) => {
    e.preventDefault();
    agir(async () => {
      const r = await apiClient.get('/visites/', { params: { patient: acompte.patient, statut: 'en_cours' } });
      const visite = ((r.data.results ?? r.data) as { visite_id: number }[])[0];
      if (!visite) {
        const texte = "Ce patient n'a pas de visite en cours (admission ou consultation du jour).";
        throw Object.assign(new Error(texte), { response: { data: texte } });
      }
      await caisseApi.encaisser({ visite: visite.visite_id, mode: acompte.mode, devise: acompte.devise, montant_devise: acompte.montant });
      setAcompte({ ...acompte, montant: '' });
    }, 'Acompte encaissé : il sera déduit de la facture de la visite.');
  };

  const attendu = session?.en_cours?.attendu ?? {};
  return (
    <div className="space-y-5">
      {message && <p role="status" className={info}>{message}</p>}
      {erreur && <p role="alert" className={alerte}>{erreur}</p>}

      <section className={carte}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={`${titreCarte} flex items-center gap-2`}>{session ? <LockKeyholeOpen className="h-5 w-5 text-trimed-vert" aria-hidden="true" /> : <LockKeyhole className="h-5 w-5 text-gray-400" aria-hidden="true" />} Ma caisse</h2>
          {session === undefined ? <span className="text-sm text-gray-500">Chargement…</span> : session ? (
            <button type="button" className={boutonSecondaire} onClick={() => { setBilan(null); setFermeture(true); }}>Fermer la caisse</button>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); agir(() => caisseApi.ouvrirSession(fond || '0'), 'Caisse ouverte.'); }}>
              <input className={`${champBase} w-40`} inputMode="decimal" placeholder="Fond de caisse (HTG)" value={fond} onChange={(e) => setFond(e.target.value)} />
              <button type="submit" disabled={envoi} className={bouton}>Ouvrir la caisse</button>
            </form>
          )}
        </div>
        {session && (
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <p className="text-gray-600 dark:text-gray-400">Ouverte le {dateHeure(session.ouverte_le)}, fond {montant(session.fond_initial)}</p>
            <p>Espèces attendues : {Object.entries(attendu).map(([d, m]) => montant(m, d)).join(', ') || montant(session.fond_initial)}</p>
            <p>Par mode : {Object.entries(session.en_cours?.par_mode ?? {}).map(([m, v]) => `${LIBELLES_MODE[m as ModePaiement] ?? m} ${montant(v)}`).join(', ') || 'aucun encaissement'}</p>
          </div>
        )}
        {bilan && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm dark:bg-white/[0.04]">
            <p className="font-medium">Caisse fermée le {dateHeure(bilan.fermee_le)}</p>
            {Object.keys(bilan.attendu).map((d) => (
              <p key={d}>{d} : attendu {montant(bilan.attendu[d], d)}, compté {montant(bilan.montants_declares[d], d)}, écart <strong className={nombre(bilan.ecarts[d]) === 0 ? 'text-trimed-vert-fonce' : 'text-red-600'}>{montant(bilan.ecarts[d], d)}</strong></p>
            ))}
          </div>
        )}
      </section>

      <section className={carte}>
        <h2 className={`${titreCarte} mb-3`}>Soins à facturer</h2>
        {groupes.length === 0 ? <p className="text-sm text-gray-500">Aucun soin en attente de facturation.</p> : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {groupes.map((g) => (
              <li key={`${g.patient}-${g.visite}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{nom(g.patient)}</p>
                  <p className="text-xs text-gray-500">{g.elements.map((e) => `${LIBELLES_CATEGORIE[e.categorie]} ${montant(e.montant)}`).join(', ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{montant(g.elements.reduce((s, e) => s + nombre(e.montant), 0))}</span>
                  <button type="button" disabled={envoi} onClick={() => preparer(g.patient, g.visite)} className={bouton}>Préparer la facture</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={carte}>
        <h2 className={`${titreCarte} mb-3`}>Factures à encaisser</h2>
        {aPayer.length === 0 ? <p className="text-sm text-gray-500">Aucune facture en attente de paiement.</p> : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {aPayer.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => onOuvrirFacture(f.id)} className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                  <span><span className="font-medium text-gray-900 dark:text-white">{f.numero}</span> <span className="text-sm text-gray-600 dark:text-gray-400">{f.patient_nom}, {LIBELLES_STATUT[f.statut].toLowerCase()}</span></span>
                  <span className="text-sm font-medium">reste {montant(f.reste_du)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={carte}>
          <h2 className={`${titreCarte} mb-1 flex items-center gap-2`}><PlusCircle className="h-5 w-5" aria-hidden="true" /> Ticket ou acte à ajouter</h2>
          <p className="mb-3 text-xs text-gray-500">Une consultation ajoutée ici est un ticket d'accueil : la consultation du médecin s'y rattachera.</p>
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); agir(() => caisseApi.ajouterElement(Number(ajout.patient), Number(ajout.acte), Number(ajout.quantite) || 1), 'Acte ajouté aux soins à facturer.'); }}>
            <input className={champ} placeholder="Rechercher un patient" value={ajout.recherche} onChange={(e) => setAjout({ ...ajout, recherche: e.target.value })} />
            <select className={champ} value={ajout.patient} onChange={(e) => setAjout({ ...ajout, patient: e.target.value })} required>
              <option value="">Patient ({filtres.length})</option>
              {filtres.slice(0, 200).map((p) => <option key={p.patient_id} value={p.patient_id}>{p.prenom} {p.nom}{p.numero_dossier_medical ? `, ${p.numero_dossier_medical}` : ''}</option>)}
            </select>
            <div className="grid grid-cols-[1fr_90px] gap-2">
              <select className={champ} value={ajout.acte} onChange={(e) => setAjout({ ...ajout, acte: e.target.value })} required>
                <option value="">{actes.length ? 'Acte du catalogue' : 'Catalogue vide (onglet Tarifs)'}</option>
                {actes.map((a) => <option key={a.id} value={a.id}>{a.libelle}, {montant(a.prix)}</option>)}
              </select>
              <input className={champ} inputMode="numeric" value={ajout.quantite} onChange={(e) => setAjout({ ...ajout, quantite: e.target.value })} aria-label="Quantité" />
            </div>
            <div className="flex justify-end"><button type="submit" disabled={envoi} className={bouton}>Ajouter</button></div>
          </form>
        </section>

        <section className={carte}>
          <h2 className={`${titreCarte} mb-1 flex items-center gap-2`}><Wallet className="h-5 w-5" aria-hidden="true" /> Acompte (dépôt)</h2>
          <p className="mb-3 text-xs text-gray-500">Versé pendant la visite (souvent à l'admission), il est déduit de la facture finale.</p>
          <form className="space-y-2" onSubmit={verserAcompte}>
            <select className={champ} value={acompte.patient} onChange={(e) => setAcompte({ ...acompte, patient: e.target.value })} required>
              <option value="">Patient</option>
              {patients.slice(0, 300).map((p) => <option key={p.patient_id} value={p.patient_id}>{p.prenom} {p.nom}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <input className={champ} inputMode="decimal" placeholder="Montant" value={acompte.montant} onChange={(e) => setAcompte({ ...acompte, montant: e.target.value })} required />
              <select className={champ} value={acompte.devise} onChange={(e) => setAcompte({ ...acompte, devise: e.target.value })}>{devises.map((d) => <option key={d}>{d}</option>)}</select>
              <select className={champ} value={acompte.mode} onChange={(e) => setAcompte({ ...acompte, mode: e.target.value as ModePaiement })}>{Object.entries(LIBELLES_MODE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
            {acompte.devise !== 'HTG' && !taux.some((t) => t.devise === acompte.devise) && <p className="text-xs text-amber-700">Saisissez d'abord le taux du jour pour {acompte.devise}.</p>}
            <div className="flex justify-end"><button type="submit" disabled={envoi || !session} className={bouton}>Encaisser l'acompte</button></div>
          </form>
        </section>
      </div>

      <Modal isOpen={fermeture} onClose={() => setFermeture(false)} className="max-w-[460px] p-6">
        <form onSubmit={fermer} className="space-y-4">
          <h2 className="font-marque text-lg text-gray-900 dark:text-white">Fermer la caisse</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Comptez les espèces du tiroir, par devise. L'écart avec le montant attendu sera enregistré.</p>
          {[...new Set(['HTG', ...devises, ...Object.keys(attendu)])].map((d) => (
            <label key={d} className="block text-sm text-gray-700 dark:text-gray-300">Espèces comptées ({d})
              <input className={`${champ} mt-1`} inputMode="decimal" value={declares[d] ?? ''} onChange={(e) => setDeclares({ ...declares, [d]: e.target.value })} placeholder="0" />
            </label>
          ))}
          {erreur && <p role="alert" className="text-sm text-red-600">{erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className={boutonSecondaire} onClick={() => setFermeture(false)}>Annuler</button>
            <button type="submit" disabled={envoi} className={bouton}>Fermer la caisse</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
