import React, { useEffect, useMemo, useState } from 'react';
import hospitalApi from '../../../api/hospitalApi';
import { utilisateurService } from '../GestionUtilisateur/services/UtilisateurService';
import { useUser } from '../../../context/UserContext';
import GenericCrudManager, { CrudField, CrudColumn } from '../shared/GenericCrudManager';
import { DoorOpen, Tag, CalendarClock } from 'lucide-react';

interface Props {
  tenantId: number;
  hopitalNom?: string;
}

const STATUT_SALLE = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'occupee', label: 'Occupée' },
  { value: 'maintenance', label: 'Maintenance' },
];
const STATUT_RESERVATION = [
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'annulee', label: 'Annulée' },
  { value: 'terminee', label: 'Terminée' },
];

const labelFromOptions = (opts: { value: any; label: string }[], v: any) =>
  opts.find((o) => String(o.value) === String(v))?.label ?? (v ?? '—');

const extract = (data: any): any[] =>
  data?.results && Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];

const GestionSallesMedicales: React.FC<Props> = ({ tenantId, hopitalNom }) => {
  const { permissions } = useUser();
  const canEdit = permissions.canManageSystem || permissions.canEditConsultations;
  const [tab, setTab] = useState<'types' | 'salles' | 'reservations'>('salles');

  const [typeSalles, setTypeSalles] = useState<any[]>([]);
  const [salles, setSalles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [refKey, setRefKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [typeRes, salleRes] = await Promise.all([
        hospitalApi.sallesMedicales.typeSalles.getAll({ tenant: tenantId }).catch(() => ({ success: false })),
        hospitalApi.sallesMedicales.salles.getAll({ tenant: tenantId }).catch(() => ({ success: false })),
      ]);
      if (!alive) return;
      setTypeSalles((typeRes as any).success ? extract((typeRes as any).data) : []);
      setSalles((salleRes as any).success ? extract((salleRes as any).data) : []);
      utilisateurService.obtenirTousUtilisateurs(tenantId).then((u) => alive && setUsers(u as any)).catch(() => {});
    })();
    return () => { alive = false; };
  }, [tenantId, refKey]);

  const bumpRef = () => setRefKey((k) => k + 1);

  const typeOptions = useMemo(() => typeSalles.map((t) => ({ value: t.id, label: t.nom })), [typeSalles]);
  const salleOptions = useMemo(() => salles.map((s) => ({ value: s.id, label: s.nom })), [salles]);
  const userOptions = useMemo(
    () => users.map((u: any) => ({ value: u.utilisateur_id, label: u.nom_complet || `${u.prenom || ''} ${u.nom || ''}`.trim() || `Utilisateur #${u.utilisateur_id}` })),
    [users]
  );

  // ---- Types de salle ----
  const typeFields: CrudField[] = [{ key: 'nom', label: 'Nom du type', type: 'text', required: true }];
  const typeColumns: CrudColumn[] = [{ key: 'nom', label: 'Nom' }];

  // ---- Salles ----
  const salleFields: CrudField[] = [
    { key: 'nom', label: 'Nom de la salle', type: 'text', required: true },
    { key: 'code', label: 'Code', type: 'text', required: true, placeholder: 'Ex: SALLE-01' },
    { key: 'type_salle', label: 'Type de salle', type: 'select', required: true, options: typeOptions },
    { key: 'capacite', label: 'Capacité', type: 'number', required: true },
    { key: 'statut', label: 'Statut', type: 'select', options: STATUT_SALLE },
  ];
  const salleColumns: CrudColumn[] = [
    { key: 'nom', label: 'Nom' },
    { key: 'code', label: 'Code' },
    { key: 'type_salle', label: 'Type', render: (r) => labelFromOptions(typeOptions, r.type_salle) },
    { key: 'capacite', label: 'Capacité' },
    { key: 'statut', label: 'Statut', render: (r) => labelFromOptions(STATUT_SALLE, r.statut) },
  ];

  // ---- Réservations ----
  const reservationFields: CrudField[] = [
    { key: 'salle', label: 'Salle', type: 'select', required: true, options: salleOptions },
    { key: 'utilisateur', label: 'Utilisateur', type: 'select', required: true, options: userOptions },
    { key: 'motif', label: 'Motif', type: 'text', required: true },
    { key: 'date_debut', label: 'Début', type: 'datetime', required: true },
    { key: 'date_fin', label: 'Fin', type: 'datetime', required: true },
    { key: 'statut', label: 'Statut', type: 'select', options: STATUT_RESERVATION },
  ];
  const reservationColumns: CrudColumn[] = [
    { key: 'salle', label: 'Salle', render: (r) => labelFromOptions(salleOptions, r.salle) },
    { key: 'motif', label: 'Motif' },
    { key: 'utilisateur', label: 'Utilisateur', render: (r) => labelFromOptions(userOptions, r.utilisateur) },
    { key: 'date_debut', label: 'Début', render: (r) => r.date_debut ? new Date(r.date_debut).toLocaleString('fr-FR') : '—' },
    { key: 'date_fin', label: 'Fin', render: (r) => r.date_fin ? new Date(r.date_fin).toLocaleString('fr-FR') : '—' },
    { key: 'statut', label: 'Statut', render: (r) => labelFromOptions(STATUT_RESERVATION, r.statut) },
  ];

  const tabs = [
    { key: 'salles' as const, label: 'Salles', icon: <DoorOpen className="h-4 w-4" /> },
    { key: 'types' as const, label: 'Types de salle', icon: <Tag className="h-4 w-4" /> },
    { key: 'reservations' as const, label: 'Réservations', icon: <CalendarClock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen pb-12 space-y-8">
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm text-black dark:text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <DoorOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Salles médicales</h1>
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

        {tab === 'salles' && (
          <GenericCrudManager
            api={hospitalApi.sallesMedicales.salles}
            fields={salleFields}
            columns={salleColumns}
            singular="Salle"
            getParams={{ tenant: tenantId }}
            injectOnCreate={{ tenant: tenantId }}
            canEdit={canEdit}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
        {tab === 'types' && (
          <GenericCrudManager
            api={hospitalApi.sallesMedicales.typeSalles}
            fields={typeFields}
            columns={typeColumns}
            singular="Type de salle"
            getParams={{ tenant: tenantId }}
            injectOnCreate={{ tenant: tenantId }}
            canEdit={canEdit}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
        {tab === 'reservations' && (
          <GenericCrudManager
            api={hospitalApi.sallesMedicales.reservations}
            fields={reservationFields}
            columns={reservationColumns}
            singular="Réservation"
            canEdit={canEdit}
            onChanged={bumpRef}
            refreshSignal={refKey}
          />
        )}
      </div>
    </div>
  );
};

export default GestionSallesMedicales;
