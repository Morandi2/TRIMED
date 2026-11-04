import { Printer, X } from 'lucide-react';
import { LIBELLES_MODE, montant, nombre, type Facture, type Paiement } from '../../../api/caisseApi';
import { dateHeure } from './ui';

interface Props {
  facture: Facture;
  hopital: string;
  /** Reçu d'un paiement ; sinon, la facture complète. */
  recu?: Paiement | null;
  onClose: () => void;
}

/** Facture ou reçu, prêts à imprimer (ou à enregistrer en PDF depuis la boîte d'impression). */
export default function Impression({ facture, hopital, recu, onClose }: Props) {
  const lignes = (facture.elements ?? []).filter((e) => e.statut !== 'annule');
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-white">
      <div className="flex items-center justify-between border-b bg-gray-100 p-4 print:hidden">
        <h2 className="text-lg font-semibold text-gray-800">{recu ? 'Reçu' : 'Facture'} {recu ? recu.numero_recu : facture.numero}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white"><Printer className="h-4 w-4" aria-hidden="true" /> Imprimer</button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white"><X className="h-4 w-4" aria-hidden="true" /> Fermer</button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-8 text-sm text-black">
        <div className="mb-6 flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-xl font-bold">{hopital}</p>
            <p className="text-gray-600">{recu ? 'Reçu de paiement' : facture.est_avoir ? 'Avoir' : 'Facture'}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">N° {recu ? recu.numero_recu : facture.numero || 'brouillon'}</p>
            <p>{dateHeure(recu ? recu.date : facture.date_emission ?? facture.cree_le)}</p>
          </div>
        </div>
        <p className="mb-4"><strong>Patient :</strong> {facture.patient_nom}{recu ? <>, facture {facture.numero}</> : null}</p>

        {recu ? (
          <table className="mb-6 w-full">
            <tbody>
              <tr><td className="py-1">Mode</td><td className="text-right">{LIBELLES_MODE[recu.mode]}{recu.reference ? ` (${recu.reference})` : ''}</td></tr>
              <tr><td className="py-1">Montant reçu</td><td className="text-right">{montant(recu.montant_devise, recu.devise)}{recu.devise !== 'HTG' ? `, au taux de ${nombre(recu.taux)} HTG` : ''}</td></tr>
              <tr><td className="py-1">Porté au crédit de la facture</td><td className="text-right">{montant(recu.montant_htg)}</td></tr>
              {nombre(recu.monnaie_rendue_htg) > 0 && <tr><td className="py-1">Monnaie rendue</td><td className="text-right">{montant(recu.monnaie_rendue_htg)}</td></tr>}
              <tr className="border-t"><td className="py-1 font-semibold">Reste à payer</td><td className="text-right font-semibold">{montant(facture.reste_du)}</td></tr>
            </tbody>
          </table>
        ) : (
          <table className="mb-6 w-full border-collapse">
            <thead><tr className="border-b text-left"><th className="py-2">Désignation</th><th className="py-2 text-right">Qté</th><th className="py-2 text-right">Prix</th><th className="py-2 text-right">Montant</th></tr></thead>
            <tbody>
              {lignes.map((e) => (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="py-1.5">{e.libelle}</td><td className="text-right">{nombre(e.quantite)}</td>
                  <td className="text-right">{montant(e.prix_unitaire)}</td><td className="text-right">{montant(e.montant)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3} className="pt-3 text-right">Sous-total</td><td className="pt-3 text-right">{montant(facture.sous_total)}</td></tr>
              {nombre(facture.remise_montant) > 0 && <tr><td colSpan={3} className="text-right">Remise ({facture.remise_motif})</td><td className="text-right">- {montant(facture.remise_montant)}</td></tr>}
              {nombre(facture.part_assurance) > 0 && <tr><td colSpan={3} className="text-right">Part de l'assurance</td><td className="text-right">- {montant(facture.part_assurance)}</td></tr>}
              <tr className="font-semibold"><td colSpan={3} className="text-right">À la charge du patient</td><td className="text-right">{montant(facture.total)}</td></tr>
              <tr><td colSpan={3} className="text-right">Déjà payé</td><td className="text-right">{montant(facture.montant_paye)}</td></tr>
              <tr className="font-semibold"><td colSpan={3} className="text-right">Reste à payer</td><td className="text-right">{montant(facture.reste_du)}</td></tr>
            </tfoot>
          </table>
        )}
        <p className="mt-10 text-center text-xs text-gray-500">Document émis par TRIMED. Conservez ce document.</p>
      </div>
    </div>
  );
}
