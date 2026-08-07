import React, { useEffect, useState } from 'react';
import { collectAllPages } from '../../../api/paginationHelper';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { getApiErrorMessage, isCanceledError } from '../../../utils/apiErrorHandler';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'date' | 'datetime';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  /** Longueur max pour les champs texte (contrainte backend). */
  maxLength?: number;
  /** Champ non modifiable après création (ex: rattachement structurel). */
  lockOnEdit?: boolean;
}

export interface CrudColumn {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface CrudApi {
  getAll: (params?: any, opts?: { signal?: AbortSignal }) => Promise<any>;
  create: (data: any) => Promise<any>;
  update: (id: number, data: any) => Promise<any>;
  delete: (id: number) => Promise<any>;
}

interface GenericCrudManagerProps {
  api: CrudApi;
  fields: CrudField[];
  columns: CrudColumn[];
  singular: string;
  getParams?: any;
  /** Valeurs injectées à la création (ex: { tenant: tenantId }). */
  injectOnCreate?: Record<string, any>;
  canEdit: boolean;
  /** Appelé après create/update/delete réussi (pour rafraîchir les listes liées). */
  onChanged?: () => void;
  /** Incrémenter pour forcer un rechargement depuis le parent. */
  refreshSignal?: number;
  emptyLabel?: string;
}

const extractResults = async (rawData: any, signal?: AbortSignal): Promise<any[]> => {
  if (rawData?.results && Array.isArray(rawData.results)) {
    return rawData.next ? await collectAllPages(rawData, signal) : rawData.results;
  }
  if (Array.isArray(rawData)) return rawData;
  if (Array.isArray(rawData?.data)) return rawData.data;
  return [];
};

const GenericCrudManager: React.FC<GenericCrudManagerProps> = ({
  api, fields, columns, singular, getParams, injectOnCreate, canEdit, onChanged, refreshSignal, emptyLabel,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null); // row or {} for create
  const [deleting, setDeleting] = useState<any | null>(null);
  const [notif, setNotif] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false, message: '', type: 'success',
  });

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => setNotif({ isOpen: true, message, type });

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal, JSON.stringify(getParams)]);

  const load = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const res = await api.getAll(getParams, { signal });
      if (signal?.aborted) return;
      if (!res.success) throw new Error(res.message || 'Erreur de chargement');
      const results = await extractResults(res.data, signal);
      if (signal?.aborted) return;
      setItems(results);
    } catch (e) {
      if (signal?.aborted || isCanceledError(e)) return;
      showMsg(getApiErrorMessage(e), 'error');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const id = deleting.id;
    const res = await api.delete(id);
    if (res.success) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      showMsg(`${singular} supprimé(e) avec succès.`);
      onChanged?.();
    } else {
      showMsg(res.message || "Une erreur s'est produite.", 'error');
    }
    setDeleting(null);
  };

  const handleSaved = async () => {
    setEditing(null);
    await load();
    onChanged?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {items.length} {singular.toLowerCase()}{items.length > 1 ? 's' : ''}
        </p>
        {canEdit && (
          <button
            onClick={() => setEditing({})}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/[0.05] min-h-[300px]">
        {isLoading ? (
          <TableSkeleton rows={5} columns={columns.length + 1} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="font-medium">{emptyLabel || `Aucun(e) ${singular.toLowerCase()}`}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">
                {columns.map((c) => <th key={c.key} className="px-5 py-3">{c.label}</th>)}
                {canEdit && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-white/[0.03] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-3 text-sm">
                      {c.render ? c.render(row) : (row[c.key] ?? '—')}
                    </td>
                  ))}
                  {canEdit && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditing(row)} title="Modifier" className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleting(row)} title="Supprimer" className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <CrudFormModal
          singular={singular}
          fields={fields}
          initial={editing}
          isEdit={!!editing.id}
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            const isEdit = !!editing.id;
            const payload = { ...values, ...(isEdit ? {} : (injectOnCreate || {})) };
            const res = isEdit ? await api.update(editing.id, payload) : await api.create(payload);
            if (res.success) {
              showMsg(`${singular} ${isEdit ? 'mis(e) à jour' : 'enregistré(e)'} avec succès.`);
              await handleSaved();
              return null;
            }
            return res;
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        title={`Supprimer ${singular.toLowerCase()}`}
        entityId={deleting?.id}
      />

      <NotificationToast
        isOpen={notif.isOpen}
        onClose={() => setNotif((p) => ({ ...p, isOpen: false }))}
        message={notif.message}
        type={notif.type}
      />
    </div>
  );
};

// ---------- Form modal ----------
const CrudFormModal: React.FC<{
  singular: string;
  fields: CrudField[];
  initial: any;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => Promise<any | null>; // returns error result or null on success
}> = ({ singular, fields, initial, isEdit, onClose, onSubmit }) => {
  const buildInitial = () => {
    const v: Record<string, any> = {};
    for (const f of fields) {
      let raw = initial[f.key];
      if (f.type === 'datetime' && typeof raw === 'string' && raw.length >= 16) raw = raw.slice(0, 16);
      if (f.type === 'date' && typeof raw === 'string' && raw.length >= 10) raw = raw.slice(0, 10);
      v[f.key] = raw ?? '';
    }
    return v;
  };
  const [values, setValues] = useState<Record<string, any>>(buildInitial());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setVal = (k: string, val: any) => setValues((prev) => ({ ...prev, [k]: val }));

  const submit = async () => {
    setError('');
    setFieldErrors({});
    // validation front (UX)
    for (const f of fields) {
      if (f.required && (values[f.key] === '' || values[f.key] === null || values[f.key] === undefined)) {
        setError(`Le champ "${f.label}" est obligatoire.`);
        return;
      }
    }
    // build payload with type coercion
    const payload: Record<string, any> = {};
    for (const f of fields) {
      if (isEdit && f.lockOnEdit) continue;
      let val = values[f.key];
      if (val === '' || val === undefined || val === null) {
        if (f.required) continue; // required already validated
        continue; // omit empty optional fields
      }
      if (f.type === 'number' || (f.type === 'select' && typeof f.options?.[0]?.value === 'number')) {
        val = Number(val);
      }
      payload[f.key] = val;
    }
    setSaving(true);
    try {
      const res = await onSubmit(payload);
      if (res) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setError(res.message || 'Une erreur est survenue.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            {isEdit ? `Modifier ${singular.toLowerCase()}` : `Ajouter ${singular.toLowerCase()}`}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-medium">{error}</div>
        )}

        <div className="space-y-4">
          {fields.map((f) => {
            const disabled = isEdit && f.lockOnEdit;
            const base = `w-full px-4 py-3 rounded-xl border ${fieldErrors[f.key] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 dark:text-white disabled:opacity-60`;
            return (
              <div key={f.key}>
                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">
                  {f.label}{f.required ? ' *' : ''}
                </label>
                {f.type === 'textarea' ? (
                  <textarea value={values[f.key]} onChange={(e) => setVal(f.key, e.target.value)} rows={3} placeholder={f.placeholder} disabled={disabled} className={base} />
                ) : f.type === 'select' ? (
                  <select value={values[f.key]} onChange={(e) => setVal(f.key, e.target.value)} disabled={disabled} className={base}>
                    <option value="">— Sélectionner —</option>
                    {(f.options || []).map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.type === 'datetime' ? 'datetime-local' : f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                    value={values[f.key]}
                    onChange={(e) => setVal(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    maxLength={f.type === 'text' ? f.maxLength : undefined}
                    disabled={disabled}
                    className={base}
                  />
                )}
                {fieldErrors[f.key] && <p className="text-xs text-red-500 mt-1">{fieldErrors[f.key]}</p>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300">Annuler</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericCrudManager;
