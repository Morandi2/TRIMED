import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { FileCheck2, Printer, Receipt, ShieldCheck, Undo2 } from 'lucide-react';
import { Modal } from '../../../components/ui/modal';
import apiClient from '../../../api/apiConfig';
import {
  caisseApi, calculerMonnaie, LIBELLES_MODE, LIBELLES_STATUT, montant, nombre,
  type Facture, type ModePaiement, type Paiement, type TauxChange,
} from '../../../api/caisseApi';
import Impression from './Impression';
import { alerte, bouton, boutonSecondaire, champ, dateHeure, info, messageErreur } from './ui';

interface Couverture { id: number; numero_carte: string; assureur_nom: string; valide: boolean }
interface PriseEnCharge { part_assurance: string; documents_manquants: string[]; details: { libelle: string; taux: string; montant: string; motif_exclusion: string }[] }

interface Props {
  factureId: number;
  hopital: string;
  devises: string[];
  taux: TauxChange[];
  peutAdministrer: boolean;
  onClose: () => void;
  onChanged: () => void;
}

const PIECES: Record<string, string> = {
  carte_assurance: "carte d'assurance", piece_identite: "pièce d'identité", lettre_prise_en_charge: 'lettre de prise en charge',
  ordonnance: 'ordonnance', rapport_medical: 'rapport médical', resultat_examen: "résultat d'examen", formulaire_assureur: "formulaire de l'assureur",
};

export default function FactureDetail({ factureId, hopital, devises, taux, peutAdministrer, onClose, onChanged }: Props) {
  const [facture, setFacture] = useState<Facture | null>(null);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [couvertures, setCouvertures] = useState<Couverture[]>([]);
  const [priseEnCharge, setPriseEnCharge] = useState<PriseEnCharge | null>(null);
  const [impression, setImpression] = useState<{ recu: Paiement | null } | null>(null);

  const charger = useCallback(async () => {
    try { setFacture(await caisseApi.facture(factureId)); } catch (e) { setErreur(messageErreur(e, 'Facture introuvable.')); }
  }, [factureId]);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => {
    if (!facture || facture.statut !== 'brouillon') return;
    apiClient.get('/assurances/couvertures/', { params: { patient: facture.patient, actif: true } })
      .then((r) => setCouvertures((r.data.results ?? r.data) as Couverture[])).catch(() => setCouvertures([]));
  }, [facture?.patient, facture?.statut]); // eslint-disable-line react-hooks/exhaustive-deps

  const agir = async (action: () => Promise<unknown>, succes: string) => {
    setEnvoi(true); setErreur(''); setMessage('');
    try { await action(); setMessage(succes); await charger(); onChanged(); } catch (e) { setErreur(messageErreur(e, "L'opération n'a pas abouti.")); } finally { setEnvoi(false); }
  };

  // ---- Remise et assurance (brouillon) ----
  const [remise, setRemise] = useState({ montant: '', motif: '' });
  const appliquerCouverture = (id: number) => agir(async () => {
    const r = await apiClient.post('/assurances/prise-en-charge/', { facture: factureId, couverture: id });
    setPriseEnCharge(r.data as PriseEnCharge);
  }, "Part de l'assurance calculée.");

  // ---- Paiement ----
  const [paiement, setPaiement] = useState<{ mode: ModePaiement; devise: string; montant: string; reference: string }>({ mode: 'especes', devise: 'HTG', montant: '', reference: '' });
  const tauxDevise = useMemo(() => (paiement.devise === 'HTG' ? 1 : nombre(taux.find((t) => t.devise === paiement.devise)?.taux)), [paiement.devise, taux]);
  const apercu = facture ? calculerMonnaie(nombre(facture.reste_du), nombre(paiement.montant), tauxDevise) : null;
  const encaisser = async (e: FormEvent) => {
    e.preventDefault();
    if (!facture) return;
    setEnvoi(true); setErreur(''); setMessage('');
    try {
      const recu = await caisseApi.encaisser({ facture: facture.id, mode: paiement.mode, devise: paiement.devise, montant_devise: paiement.montant, reference: paiement.reference });
      setPaiement({ ...paiement, montant: '', reference: '' });
      await charger(); onChanged();
      setMessage(`Paiement enregistré, reçu ${recu.numero_recu}.`);
      setImpression({ recu });
    } catch (err) { setErreur(messageErreur(err, "Le paiement n'a pas été enregistré.")); } finally { setEnvoi(false); }
  };

  const [motif, setMotif] = useState('');
  if (!facture) {
    return <Modal isOpen onClose={onClose} className="max-w-[720px] p-6"><p className="text-sm text-gray-500">{erreur || 'Chargement…'}</p></Modal>;
  }
  if (impression) {
    return <Impression facture={facture} hopital={hopital} recu={impression.recu} onClose={() => setImpression(null)} />;
  }
  const lignes = (facture.elements ?? []).filter((e) => e.statut !== 'annule');
  const aPayer = facture.statut === 'emise' || facture.statut === 'partiellement_payee';

  return (
    <Modal isOpen onClose={onClose} className="max-w-[760px] p-6">
      <div className="max-h-[80vh] space-y-5 overflow-y-auto pr-1">
        {/* pr-12 : laisse la place au bouton de fermeture de la fenêtre */}
        <div className="flex flex-wrap items-start justify-between gap-3 pr-12">
          <div>
            <h2 className="font-marque text-lg text-gray-900 dark:text-white">{facture.numero || 'Facture en préparation'}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{facture.patient_nom}, {LIBELLES_STATUT[facture.statut].toLowerCase()}{facture.date_emission ? `, émise le ${dateHeure(facture.date_emission)}` : ''}</p>
          </div>
          <button type="button" onClick={() => setImpression({ recu: null })} className={boutonSecondaire}><Printer className="h-4 w-4" aria-hidden="true" /> Imprimer</button>
        </div>

        {message && <p role="status" className={info}>{message}</p>}
        {erreur && <p role="alert" className={alerte}>{erreur}</p>}

        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700"><th className="py-2 font-medium">Désignation</th><th className="py-2 text-right font-medium">Qté</th><th className="py-2 text-right font-medium">Montant</th></tr></thead>
          <tbody>
            {lignes.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 text-gray-800 dark:text-gray-200">{e.libelle}{nombre(e.prix_unitaire) === 0 && <span className="ml-2 rounded bg-amber-100 px-1.5 text-xs text-amber-800">tarif à définir</span>}</td>
                <td className="py-2 text-right">{nombre(e.quantite)}</td>
                <td className="py-2 text-right">{montant(e.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto grid max-w-sm grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-gray-500">Sous-total</dt><dd className="text-right">{montant(facture.sous_total)}</dd>
          {nombre(facture.remise_montant) > 0 && <><dt className="text-gray-500">Remise</dt><dd className="text-right">- {montant(facture.remise_montant)}</dd></>}
          {nombre(facture.part_assurance) > 0 && <><dt className="text-gray-500">Part de l'assurance</dt><dd className="text-right">- {montant(facture.part_assurance)}</dd></>}
          <dt className="font-medium text-gray-900 dark:text-white">Part du patient</dt><dd className="text-right font-medium">{montant(facture.total)}</dd>
          <dt className="text-gray-500">Payé</dt><dd className="text-right">{montant(facture.montant_paye)}</dd>
          <dt className="font-semibold text-gray-900 dark:text-white">Reste à payer</dt><dd className="text-right font-semibold">{montant(facture.reste_du)}</dd>
        </dl>

        {facture.statut === 'brouillon' && (
          <div className="space-y-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
            {couvertures.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Assurance du patient</p>
                <div className="flex flex-wrap gap-2">
                  {couvertures.map((c) => (
                    <button key={c.id} type="button" disabled={envoi || !c.valide} onClick={() => appliquerCouverture(c.id)} className={boutonSecondaire}>
                      {c.assureur_nom}, carte {c.numero_carte}{c.valide ? '' : ' (expirée)'}
                    </button>
                  ))}
                </div>
                {priseEnCharge && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {priseEnCharge.details.filter((d) => d.motif_exclusion).map((d) => <p key={d.libelle}>{d.libelle} : {d.motif_exclusion.toLowerCase()}</p>)}
                    {priseEnCharge.documents_manquants.length > 0 && <p className="text-amber-700">Pièces à fournir pour la réclamation : {priseEnCharge.documents_manquants.map((p) => PIECES[p] ?? p).join(', ')}.</p>}
                  </div>
                )}
              </div>
            )}
            <form className="grid gap-2 sm:grid-cols-[140px_1fr_auto]" onSubmit={(e) => { e.preventDefault(); agir(() => caisseApi.remise(facture.id, remise.montant, remise.motif), 'Remise appliquée.'); }}>
              <input className={champ} inputMode="decimal" placeholder="Remise (HTG)" value={remise.montant} onChange={(e) => setRemise({ ...remise, montant: e.target.value })} />
              <input className={champ} placeholder="Motif de la remise" value={remise.motif} onChange={(e) => setRemise({ ...remise, motif: e.target.value })} />
              <button type="submit" disabled={envoi || !remise.montant || !remise.motif} className={boutonSecondaire}>Appliquer</button>
            </form>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" disabled={envoi} onClick={() => agir(() => caisseApi.annulerFacture(facture.id, 'Brouillon abandonné'), 'Brouillon abandonné.')} className={boutonSecondaire}>Abandonner</button>
              <button type="button" disabled={envoi || lignes.length === 0} onClick={() => agir(() => caisseApi.emettre(facture.id), 'Facture émise.')} className={bouton}><FileCheck2 className="h-4 w-4" aria-hidden="true" /> Émettre la facture</button>
            </div>
          </div>
        )}

        {aPayer && (
          <form onSubmit={encaisser} className="space-y-3 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"><Receipt className="h-4 w-4" aria-hidden="true" /> Encaisser</p>
            <div className="grid gap-2 sm:grid-cols-4">
              <select className={champ} value={paiement.mode} onChange={(e) => setPaiement({ ...paiement, mode: e.target.value as ModePaiement })}>
                {Object.entries(LIBELLES_MODE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select className={champ} value={paiement.devise} onChange={(e) => setPaiement({ ...paiement, devise: e.target.value })}>
                {devises.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input className={champ} inputMode="decimal" placeholder={`Montant (${paiement.devise})`} value={paiement.montant} onChange={(e) => setPaiement({ ...paiement, montant: e.target.value })} required />
              <input className={champ} placeholder="Référence (MonCash, chèque…)" value={paiement.reference} onChange={(e) => setPaiement({ ...paiement, reference: e.target.value })} />
            </div>
            {paiement.devise !== 'HTG' && !tauxDevise && <p className="text-sm text-amber-700">Aucun taux du jour pour {paiement.devise} : saisissez-le dans l'onglet Tarifs.</p>}
            {apercu && nombre(paiement.montant) > 0 && tauxDevise > 0 && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {paiement.devise !== 'HTG' && <>Soit {montant(apercu.recu)} au taux de {tauxDevise}. </>}
                Porté au crédit : {montant(apercu.applique)}.{apercu.monnaie > 0 && <strong> Monnaie à rendre : {montant(apercu.monnaie)}.</strong>}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" className={boutonSecondaire} onClick={() => setPaiement({ ...paiement, devise: 'HTG', montant: facture.reste_du })}>Reste dû en gourdes</button>
              <button type="submit" disabled={envoi || !paiement.montant} className={bouton}>{envoi ? 'Enregistrement…' : 'Encaisser'}</button>
            </div>
          </form>
        )}

        {(facture.paiements ?? []).length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Paiements</p>
            <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
              {(facture.paiements ?? []).map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{p.numero_recu}, {LIBELLES_MODE[p.mode]}, {montant(p.montant_devise, p.devise)}{p.est_remboursement ? ' (remboursement)' : ''}, {dateHeure(p.date)}</span>
                  <span className="flex gap-2">
                    <button type="button" className="text-brand-600 hover:underline" onClick={() => setImpression({ recu: p })}>Reçu</button>
                    {peutAdministrer && !p.est_remboursement && (
                      <button type="button" className="inline-flex items-center gap-1 text-red-600 hover:underline" disabled={envoi || !motif}
                        onClick={() => agir(() => caisseApi.rembourser(p.id, motif), 'Remboursement enregistré.')}><Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> Rembourser</button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(aPayer || facture.statut === 'payee') && (
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <input className={`${champ} max-w-sm`} placeholder="Motif (annulation ou remboursement)" value={motif} onChange={(e) => setMotif(e.target.value)} />
            <button type="button" disabled={envoi || !motif || nombre(facture.montant_paye) !== 0} className={boutonSecondaire}
              onClick={() => agir(() => caisseApi.annulerFacture(facture.id, motif), 'Facture annulée par un avoir.')}>Annuler par un avoir</button>
          </div>
        )}
      </div>
    </Modal>
  );
}
