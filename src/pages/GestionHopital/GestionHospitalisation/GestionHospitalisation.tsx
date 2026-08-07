import React, { useEffect, useMemo, useState } from 'react';
import hospitalApi from '../../../api/hospitalApi';
import { patientService } from '../GestionPatients/services/PatientService';
import { useUser } from '../../../context/UserContext';
import GenericCrudManager, { CrudField, CrudColumn } from '../shared/GenericCrudManager';
import { BedDouble, DoorClosed, ClipboardList } from 'lucide-react';

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
  { value: 'disponible', label: 'Disponible' },
  { value: 'occupee', label: 'Occupée' },
  { value: 'maintenance', label: 'Maintenance' },
];
const STATUT_LIT = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'occupe', label: 'Occupé' },
  { value: 'maintenance', label: 'Maintenance' },
];
const STATUT_ADMISSION = [
  { value: 'hospitalise', label: 'Hospitalisé' },
  { value: 'sorti', label: 'Sorti' },
  { value: 'transfere', label: 'Transféré' },
];

const labelFromOptions = (opts: { value: any; label: string }[], v: any) =>
  opts.find((o) => String(o.value) === String(v))?.label ?? (v ?? '—');

const extract = (data: any): any[] =>
  data?.results && Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];

const GestionHospitalisation: React.FC<Props> = ({ tenantId, hopitalNom }) => {
  const { permissions } = useUser();
  const canEdit = permissions.canManageSystem || permissions.canEditConsultations;
  const [tab, setTab] = useState<'chambres' | 'lits' | 'admissions'>('chambres');

  const [chambres, setChambres] = useState<any[]>([]);
  const [lits, setLits] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [refKey, setRefKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [chRes, litRes] = await Promise.all([
        hospitalApi.hospitalisation.chambres.getAll({ tenant: tenantId }).catch(() => ({ success: false })),
        hospitalApi.hospitalisation.lits.getAll().catch(() => ({ success: false })),
      ]);
      if (!alive) return;
      setChambres((chRes as any).success ? extract((chRes as any).data) : []);
      setLits((litRes as any).success ? extract((litRes as any).data) : []);
      patientService.obtenirPatientsParHopital(tenantId).then((p) => alive && setPatients(p)).catch(() => {});
    })();
    return () => { alive = false; };
  }, [tenantId, refKey]);

  const bumpRef = () => setRefKey((k) => k + 1);

  const chambreOptions = useMemo(
    () => chambres.map((c) => ({ value: c.id, label: `Chambre ${c.numero} (étage ${c.etage})` })),
    [chambres]
  );
  const litOptions = useMemo(
    () => lits.map((l) => ({ value: l.id, label: `Lit ${l.numero}` })),
    [lits]
  );
  const patientOptions = useMemo(
    () => patients.map((p) => ({ value: p.patient_id, label: `${p.prenom || ''} ${p.nom || ''}`.trim() || `Patient #${p.patient_id}` })),
    [patients]
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
    { key: 'statut', label: 'Statut', render: (r) => labelFromOptions(STATUT_LIT, r.statut) },
  ];

  // ---- Admissions ----
  const admissionFields: CrudField[] = [
    { key: 'patient', label: 'Patient', type: 'select', required: true, options: patientOptions },
    { key: 'lit', label: 'Lit', type: 'select', required: true, options: litOptions },
    { key: 'motif', label: "Motif d'admission", type: 'text', required: true },
    { key: 'statut', label: 'Statut', type: 'select', options: STATUT_ADMISSION },
    { key: 'date_sortie', label: 'Date de sortie', type: 'datetime' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ];
  const admissionColumns: CrudColumn[] = [
    { key: 'patient', label: 'Patient', render: (r) => labelFromOptions(patientOptions, r.patient) },
    { key: 'lit', label: 'Lit', render: (r) => labelFromOptions(litOptions, r.lit) },
    { key: 'motif', label: 'Motif' },
    { key: 'statut', label: 'Statut', render: (r) => labelFromOptions(STATUT_ADMISSION, r.statut) },
    { key: 'date_admission', label: 'Admis le', render: (r) => r.date_admission ? new Date(r.date_admission).toLocaleDateString('fr-FR') : '—' },
  ];

  const tabs = [
    { key: 'chambres' as const, label: 'Chambres', icon: <DoorClosed className="h-4 w-4" /> },
    { key: 'lits' as const, label: 'Lits', icon: <BedDouble className="h-4 w-4" /> },
    { key: 'admissions' as const, label: 'Admissions', icon: <ClipboardList className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen pb-12 space-y-8">
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm text-black dark:text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <BedDouble className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Hospitalisation</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || 'Portail Hospitalier'}</span>
        </p>
      </div>

      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm p-6 text-black dark:text-white">
        <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-white/[0.05]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors ${
                tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'chambres' && (
          <GenericCrudManager
            api={hospitalApi.hospitalisation.chambres}
            fields={chambreFields}
            columns={chambreColumns}
            singular="Chambre"
            getParams={{ tenant: tenantId }}
            injectOnCreate={{ tenant: tenantId }}
            canEdit={canEdit}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
        {tab === 'lits' && (
          <GenericCrudManager
            api={hospitalApi.hospitalisation.lits}
            fields={litFields}
            columns={litColumns}
            singular="Lit"
            canEdit={canEdit}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
        {tab === 'admissions' && (
          <GenericCrudManager
            api={hospitalApi.hospitalisation.admissions}
            fields={admissionFields}
            columns={admissionColumns}
            singular="Admission"
            canEdit={canEdit}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
      </div>
    </div>
  );
};

export default GestionHospitalisation;
