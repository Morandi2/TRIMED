import React, { useEffect, useMemo, useState } from 'react';
import hospitalApi from '../../../api/hospitalApi';
import { useUser } from '../../../context/UserContext';
import GenericCrudManager, { CrudField, CrudColumn } from '../shared/GenericCrudManager';
import { BedDouble, DoorClosed, ClipboardList } from 'lucide-react';
import { LIBELLES_LIT, normaliserEtatLit, type EtatLit } from '../Disponibilites/etats';
import Admissions from './Admissions';

const ETATS_LIT: EtatLit[] = ['libre', 'occupe', 'reserve', 'nettoyage', 'hors_service'];

interface Props {
  tenantId: number;
  hopitalNom?: string;
}

const TYPE_CHAMBRE = [
  { value: 'privee', label: 'Privée' },
  { value: 'semi_privee', label: 'Semi-privée' },
  { value: 'collective', label: 'Collective' },
];
const STATUT_CHAMBRE = [
  { value: 'libre', label: 'Libre' },
  { value: 'disponible', label: 'Libre' },
  { value: 'occupee', label: 'Occupée' },
  { value: 'maintenance', label: 'Maintenance' },
];
// Même vocabulaire que la page « Lits et salles » (Disponibilites/etats.ts).
const STATUT_LIT = ETATS_LIT.map((e) => ({ value: e, label: LIBELLES_LIT[e] }));

const labelFromOptions = (opts: { value: any; label: string }[], v: any) =>
  opts.find((o) => String(o.value) === String(v))?.label ?? (v ?? '—');

const extract = (data: any): any[] =>
  data?.results && Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];

const GestionHospitalisation: React.FC<Props> = ({ tenantId, hopitalNom }) => {
  const { permissions } = useUser();
  // Le secrétariat tient les hospitalisations ; la configuration des chambres et des lits reste à la direction.
  const peutConfigurer = permissions.canConfigurerHopital;
  const [tab, setTab] = useState<'chambres' | 'lits' | 'admissions'>('admissions');

  const [chambres, setChambres] = useState<any[]>([]);
  const [refKey, setRefKey] = useState(0);

  useEffect(() => {
    if (!peutConfigurer) return;
    let alive = true;
    (async () => {
      const chRes = await hospitalApi.hospitalisation.chambres.getAll({ tenant: tenantId }).catch(() => ({ success: false }));
      if (!alive) return;
      setChambres((chRes as any).success ? extract((chRes as any).data) : []);
    })();
    return () => { alive = false; };
  }, [tenantId, refKey, peutConfigurer]);

  const bumpRef = () => setRefKey((k) => k + 1);

  const chambreOptions = useMemo(
    () => chambres.map((c) => ({ value: c.id, label: `Chambre ${c.numero} (étage ${c.etage})` })),
    [chambres]
  );

  // ---- Chambres ----
  const chambreFields: CrudField[] = [
    { key: 'numero', label: 'Numéro', type: 'text', required: true, maxLength: 10 },
    { key: 'etage', label: 'Étage', type: 'number', required: true },
    { key: 'type_chambre', label: 'Type', type: 'select', required: true, options: TYPE_CHAMBRE },
    { key: 'capacite', label: 'Capacité', type: 'number', required: true },
    { key: 'statut', label: 'Statut', type: 'select', options: STATUT_CHAMBRE },
  ];
  const chambreColumns: CrudColumn[] = [
    { key: 'numero', label: 'Numéro' },
    { key: 'etage', label: 'Étage' },
    { key: 'type_chambre', label: 'Type', render: (r) => labelFromOptions(TYPE_CHAMBRE, r.type_chambre) },
    { key: 'capacite', label: 'Capacité' },
    { key: 'statut', label: 'Statut', render: (r) => labelFromOptions(STATUT_CHAMBRE, r.statut) },
  ];

  // ---- Lits ----
  const litFields: CrudField[] = [
    { key: 'numero_lit', label: 'Numéro', type: 'text', required: true, maxLength: 5 },
    { key: 'chambre', label: 'Chambre', type: 'select', required: true, options: chambreOptions },
    { key: 'statut', label: 'Statut', type: 'select', options: STATUT_LIT },
  ];
  const litColumns: CrudColumn[] = [
    { key: 'numero_lit', label: 'Numéro' },
    { key: 'chambre', label: 'Chambre', render: (r) => labelFromOptions(chambreOptions, r.chambre) },
    { key: 'statut', label: 'Statut', render: (r) => LIBELLES_LIT[normaliserEtatLit(r.statut)] },
  ];

  const tabs = [
    { key: 'admissions' as const, label: 'Patients hospitalisés', icon: <ClipboardList className="h-4 w-4" /> },
    ...(peutConfigurer ? [
      { key: 'chambres' as const, label: 'Chambres', icon: <DoorClosed className="h-4 w-4" /> },
      { key: 'lits' as const, label: 'Lits', icon: <BedDouble className="h-4 w-4" /> },
    ] : []),
  ];

  return (
    <div className="min-h-screen pb-12 space-y-8">
      <div className="relative p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-white/20 dark:border-white/10 shadow-sm text-black dark:text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-500 rounded-xl">
            <BedDouble className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-marque text-xl sm:text-2xl">Hospitalisation</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          {hopitalNom || "Votre hôpital"}
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-white/[0.02] border border-white/20 dark:border-white/10 shadow-sm p-6 text-black dark:text-white">
        {tabs.length > 1 && <div className="flex gap-2 mb-6 overflow-x-auto border-b border-gray-100 dark:border-white/[0.05]">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${
                tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>}

        {tab === 'chambres' && peutConfigurer && (
          <GenericCrudManager
            api={hospitalApi.hospitalisation.chambres}
            fields={chambreFields}
            columns={chambreColumns}
            singular="Chambre"
            getParams={{ tenant: tenantId }}
            injectOnCreate={{ tenant: tenantId }}
            canEdit={peutConfigurer}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
        {tab === 'lits' && peutConfigurer && (
          <GenericCrudManager
            api={hospitalApi.hospitalisation.lits}
            fields={litFields}
            columns={litColumns}
            singular="Lit"
            canEdit={peutConfigurer}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
        {tab === 'admissions' && <Admissions tenantId={tenantId} peutGerer={permissions.canGererHospitalisation} />}
      </div>
    </div>
  );
};

export default GestionHospitalisation;
