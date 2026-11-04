import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Building, FileStack, UserCheck } from 'lucide-react';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { useUser } from '../../../context/UserContext';
import { assurancesApi, type Assureur, type Convention } from '../../../api/assurancesApi';
import { moduleAbsent } from '../../../api/caisseApi';
import Bordereaux from './Bordereaux';
import Conventions from './Conventions';
import Couvertures from './Couvertures';

type Onglet = 'patients' | 'bordereaux' | 'conventions';

/** Tiers payant : couvertures des patients, accords et pièces, bordereaux aux assureurs, conventions. */
export default function Assurances() {
  const { permissions } = useUser();
  const [onglet, setOnglet] = useState<Onglet>('patients');
  const [assureurs, setAssureurs] = useState<Assureur[]>([]);
  const [conventions, setConventions] = useState<Convention[]>([]);
  const [absent, setAbsent] = useState(false);

  const charger = useCallback(() => {
    assurancesApi.assureurs().then(setAssureurs).catch((e) => { if (moduleAbsent(e)) setAbsent(true); });
    assurancesApi.conventions().then(setConventions).catch(() => setConventions([]));
  }, []);
  useEffect(() => { charger(); }, [charger]);

  const onglets: { cle: Onglet; libelle: string; icone: ReactNode }[] = [
    { cle: 'patients', libelle: 'Patients assurés', icone: <UserCheck className="h-4 w-4" /> },
    { cle: 'bordereaux', libelle: 'Bordereaux', icone: <FileStack className="h-4 w-4" /> },
    { cle: 'conventions', libelle: 'Assureurs et conventions', icone: <Building className="h-4 w-4" /> },
  ];

  return (
    <div>
      <PageMeta title="Assurances | TRIMED" description="Tiers payant et réclamations aux assureurs" />
      <PageBreadcrumb pageTitle="Assurances" />
      {absent ? (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          Le module des assurances sera disponible dès la mise à jour du serveur.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
            {onglets.map((o) => (
              <button key={o.cle} type="button" onClick={() => setOnglet(o.cle)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${onglet === o.cle ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {o.icone} {o.libelle}
              </button>
            ))}
          </div>
          {onglet === 'patients' && <Couvertures conventions={conventions} />}
          {onglet === 'bordereaux' && <Bordereaux assureurs={assureurs} />}
          {onglet === 'conventions' && <Conventions assureurs={assureurs} conventions={conventions} peutConfigurer={permissions.canConfigurerCaisse} onChanged={charger} />}
        </div>
      )}
    </div>
  );
}
