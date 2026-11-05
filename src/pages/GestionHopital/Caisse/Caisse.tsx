import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { BarChart3, FileText, Settings2, Tags, Wallet } from 'lucide-react';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { caisseApi, moduleAbsent, type ParametresCaisse, type TauxChange } from '../../../api/caisseApi';
import CaisseDuJour from './CaisseDuJour';
import FactureDetail from './FactureDetail';
import Factures from './Factures';
import Rapports from './Rapports';
import Reglages from './Reglages';
import Tarifs from './Tarifs';

type Onglet = 'jour' | 'factures' | 'tarifs' | 'rapports' | 'reglages';

/** Caisse des patients : factures, encaissements, sessions, tarifs et rapports. */
export default function Caisse() {
  const { user } = useAuth();
  const { permissions } = useUser();
  const [onglet, setOnglet] = useState<Onglet>('jour');
  const [parametres, setParametres] = useState<ParametresCaisse | null>(null);
  const [absent, setAbsent] = useState(false);
  const [taux, setTaux] = useState<TauxChange[]>([]);
  const [facture, setFacture] = useState<number | null>(null);
  const [version, setVersion] = useState(0);

  const chargerTaux = useCallback(() => { caisseApi.taux().then(setTaux).catch(() => setTaux([])); }, []);
  useEffect(() => {
    caisseApi.parametres().then(setParametres).catch((e) => { if (moduleAbsent(e)) setAbsent(true); });
    chargerTaux();
  }, [chargerTaux]);

  const onglets: { cle: Onglet; libelle: string; icone: ReactNode; visible: boolean }[] = [
    { cle: 'jour', libelle: 'Caisse du jour', icone: <Wallet className="h-4 w-4" />, visible: true },
    { cle: 'factures', libelle: 'Factures', icone: <FileText className="h-4 w-4" />, visible: true },
    { cle: 'tarifs', libelle: 'Tarifs et taux', icone: <Tags className="h-4 w-4" />, visible: true },
    { cle: 'rapports', libelle: 'Rapports', icone: <BarChart3 className="h-4 w-4" />, visible: true },
    { cle: 'reglages', libelle: 'Réglages', icone: <Settings2 className="h-4 w-4" />, visible: permissions.canConfigurerCaisse },
  ];
  const devises = parametres?.devises_acceptees?.length ? parametres.devises_acceptees : ['HTG'];

  return (
    <div>
      <PageMeta title="Caisse | TRIMED" description="Facturation des patients et encaissements" />
      <PageBreadcrumb pageTitle="Caisse" />
      {absent ? (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          La caisse sera disponible dès la mise à jour du serveur.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
            {onglets.filter((o) => o.visible).map((o) => (
              <button key={o.cle} type="button" onClick={() => setOnglet(o.cle)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${onglet === o.cle ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {o.icone} {o.libelle}
              </button>
            ))}
          </div>
          {onglet === 'jour' && <CaisseDuJour devises={devises} taux={taux} onOuvrirFacture={setFacture} version={version} />}
          {onglet === 'factures' && <Factures onOuvrir={setFacture} version={version} />}
          {onglet === 'tarifs' && <Tarifs peutConfigurer={permissions.canConfigurerCaisse} taux={taux} onTaux={chargerTaux} />}
          {onglet === 'rapports' && <Rapports />}
          {onglet === 'reglages' && parametres && <Reglages parametres={parametres} onChanged={setParametres} />}
        </div>
      )}
      {facture !== null && (
        <FactureDetail factureId={facture} hopital={user?.hopital_nom || 'Hôpital'} devises={devises} taux={taux}
          peutAdministrer={permissions.canConfigurerCaisse} onClose={() => setFacture(null)} onChanged={() => setVersion((v) => v + 1)} />
      )}
    </div>
  );
}
