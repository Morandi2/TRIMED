import React, { useState, useEffect } from 'react';
import { examenService, Examen, ExamenFormData, ExamenType, EXAMEN_TYPES } from './services/ExamenService';
import { patientService } from '../GestionPatients/services/PatientService';
import { consultationService } from '../GestionConsultations/services/ConsultationService';
import { useUser } from '../../../context/UserContext';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { getApiErrorMessage, isCanceledError } from '../../../utils/apiErrorHandler';
import { FlaskConical, Plus, Search, ChevronLeft, ChevronRight, FileText, Trash2, X } from 'lucide-react';

interface GestionExamensProps {
  tenantId: number;
  hopitalNom?: string;
}

const TYPE_LABEL: Record<string, string> = EXAMEN_TYPES.reduce((acc, t) => { acc[t.value] = t.label; return acc; }, {} as Record<string, string>);

const GestionExamens: React.FC<GestionExamensProps> = ({ tenantId, hopitalNom }) => {
  const { permissions } = useUser();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'attente' | 'resultat'>('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [prescrireOpen, setPrescrireOpen] = useState(false);
  const [resultatExamen, setResultatExamen] = useState<Examen | null>(null);
  const [deleteExamen, setDeleteExamen] = useState<Examen | null>(null);

  const [notif, setNotif] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false, message: '', type: 'success',
  });

  const itemsPerPage = 8;
  const canEdit = permissions.canEditConsultations;

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => setNotif({ isOpen: true, message, type });

  useEffect(() => {
    const controller = new AbortController();
    const init = async () => {
      setIsLoading(true);
      try {
        await examenService.loadReferentiels(tenantId);
        await charger(controller.signal);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    init();
    consultationService.obtenirConsultationsParTenant(tenantId).then((c) => setConsultations(c as any)).catch(() => {});
    patientService.obtenirPatientsParHopital(tenantId).then(setPatients).catch(() => {});
    return () => controller.abort();
  }, [tenantId]);

  const charger = async (signal?: AbortSignal) => {
    try {
      const data = await examenService.obtenirExamensParTenant(tenantId, signal);
      if (signal?.aborted) return;
      setExamens(data);
    } catch (e) {
      if (signal?.aborted || isCanceledError(e)) return;
      showMsg(getApiErrorMessage(e), 'error');
    }
  };

  const hasResult = (ex: Examen) => !!(ex.resultat && ex.resultat.trim());

  const filtered = (Array.isArray(examens) ? examens : []).filter((ex) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      (ex.patient_nom || '').toLowerCase().includes(s) ||
      (ex.nom_examen || '').toLowerCase().includes(s) ||
      (TYPE_LABEL[ex.type_examen] || '').toLowerCase().includes(s) ||
      (ex.medecin_nom || '').toLowerCase().includes(s);
    const matchStatus = statusFilter === 'Tous' || (statusFilter === 'resultat' ? hasResult(ex) : !hasResult(ex));
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: examens.length,
    attente: examens.filter((e) => !hasResult(e)).length,
    resultat: examens.filter((e) => hasResult(e)).length,
  };

  const handleDeleteConfirm = async () => {
    if (!deleteExamen) return;
    const res = await examenService.supprimerExamen(deleteExamen.examen_id);
    if (res.success) {
      await charger();
      showMsg("L'examen a été supprimé avec succès.");
    } else {
      showMsg(res.message || "Une erreur s'est produite.", 'error');
    }
    setDeleteExamen(null);
  };

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <FlaskConical className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Gestion des Examens</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || 'Portail Hospitalier'}</span>
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setPrescrireOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-600/20"
            >
              <Plus className="h-5 w-5" />
              Prescrire un examen
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-indigo-600' },
          { label: 'En attente', value: stats.attente, color: 'text-amber-600' },
          { label: 'Avec résultat', value: stats.resultat, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05] flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par patient, examen, catégorie ou médecin..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white font-medium placeholder:text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white font-medium"
          >
            <option value="Tous">Tous les examens</option>
            <option value="attente">En attente de résultat</option>
            <option value="resultat">Avec résultat</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : current.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FlaskConical className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">Aucun examen trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Examen</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Médecin</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current.map((ex) => (
                  <tr key={ex.examen_id} className="border-b border-gray-50 dark:border-white/[0.03] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-semibold">{ex.patient_nom || `Patient #${ex.patient_id}`}</td>
                    <td className="px-6 py-4">{ex.nom_examen || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{TYPE_LABEL[ex.type_examen] || ex.type_examen || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{ex.medecin_nom || (ex.medecin_prescripteur_id ? `#${ex.medecin_prescripteur_id}` : '—')}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {ex.date_examen ? new Date(ex.date_examen).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${hasResult(ex) ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {hasResult(ex) ? 'Résultat disponible' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <button
                            onClick={() => setResultatExamen(ex)}
                            title="Ajouter / modifier le résultat"
                            className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => setDeleteExamen(ex)}
                            title="Supprimer"
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
              {current.length} sur {filtered.length} examens
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 font-bold">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {prescrireOpen && (
        <PrescrireModal
          tenantId={tenantId}
          patients={patients}
          consultations={consultations}
          onClose={() => setPrescrireOpen(false)}
          onSaved={async () => { setPrescrireOpen(false); await charger(); showMsg('Examen prescrit avec succès.'); }}
          onError={(m) => showMsg(m, 'error')}
        />
      )}

      {resultatExamen && (
        <ResultatModal
          examen={resultatExamen}
          onClose={() => setResultatExamen(null)}
          onSaved={async () => { setResultatExamen(null); await charger(); showMsg('Résultat enregistré avec succès.'); }}
          onError={(m) => showMsg(m, 'error')}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteExamen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteExamen(null)}
        title="Supprimer l'examen"
        entityName={deleteExamen ? deleteExamen.nom_examen : undefined}
        entityId={deleteExamen?.examen_id}
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

// ---------- Prescrire Modal ----------
const PrescrireModal: React.FC<{
  tenantId: number;
  patients: any[];
  consultations: any[];
  onClose: () => void;
  onSaved: () => void;
  onError: (m: string) => void;
}> = ({ tenantId, patients, consultations, onClose, onSaved, onError }) => {
  const [consultationId, setConsultationId] = useState(0);
  const [form, setForm] = useState<ExamenFormData>({
    patient: 0, medecin_prescripteur: 0, nom_examen: '', type_examen: '', date_examen: new Date().toISOString().slice(0, 16),
  });
  const [saving, setSaving] = useState(false);

  // Sélectionner une consultation renseigne automatiquement patient + médecin.
  const onSelectConsultation = (id: number) => {
    setConsultationId(id);
    const c = consultations.find((x) => (x.consultation_id || x.id) === id);
    setForm((prev) => ({
      ...prev,
      consultation: id || undefined,
      patient: c?.patient_id || prev.patient,
      medecin_prescripteur: c?.medecin_id || prev.medecin_prescripteur,
    }));
  };

  const submit = async () => {
    if (!form.patient || !form.nom_examen.trim() || !form.date_examen) {
      onError("Patient, nom de l'examen et date sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const res = await examenService.prescrireExamen(
        { ...form, date_examen: new Date(form.date_examen).toISOString(), consultation: consultationId || undefined },
        tenantId
      );
      if (res.success) onSaved();
      else {
        const fe = res.fieldErrors ? Object.entries(res.fieldErrors).map(([k, v]) => `${k}: ${v}`).join(' · ') : '';
        onError(fe || res.message || 'Erreur lors de la prescription.');
      }
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Prescrire un examen</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Consultation (optionnel)</label>
            <select value={consultationId} onChange={(e) => onSelectConsultation(Number(e.target.value))} className={inputCls}>
              <option value={0}>— Aucune / prescription directe —</option>
              {consultations.map((c) => {
                const id = c.consultation_id || c.id;
                const date = c.date_consultation ? new Date(c.date_consultation).toLocaleDateString('fr-FR') : '';
                return <option key={id} value={id}>{`#${id} — ${c.patient_nom || 'Patient'}${date ? ' (' + date + ')' : ''}`}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Patient *</label>
            <select value={form.patient} onChange={(e) => setForm({ ...form, patient: Number(e.target.value) })} className={inputCls}>
              <option value={0}>— Sélectionner —</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>{`${p.prenom || ''} ${p.nom || ''}`.trim() || `Patient #${p.patient_id}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Nom de l'examen *</label>
            <input type="text" value={form.nom_examen} onChange={(e) => setForm({ ...form, nom_examen: e.target.value })} placeholder="Ex: Radiographie thoracique, NFS..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Catégorie</label>
            <select value={form.type_examen} onChange={(e) => setForm({ ...form, type_examen: e.target.value as ExamenType })} className={inputCls}>
              <option value="">— Sélectionner —</option>
              {EXAMEN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Date de l'examen *</label>
            <input type="datetime-local" value={form.date_examen} onChange={(e) => setForm({ ...form, date_examen: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300">Annuler</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Prescrire'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Résultat Modal ----------
const ResultatModal: React.FC<{
  examen: Examen;
  onClose: () => void;
  onSaved: () => void;
  onError: (m: string) => void;
}> = ({ examen, onClose, onSaved, onError }) => {
  const [resultat, setResultat] = useState(examen.resultat || '');
  const [notes, setNotes] = useState(examen.notes || '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!resultat.trim()) {
      onError('Le résultat ne peut pas être vide.');
      return;
    }
    setSaving(true);
    try {
      const res = await examenService.ajouterResultat(examen.examen_id, resultat, notes || undefined);
      if (res.success) onSaved();
      else onError(res.message || "Erreur lors de l'enregistrement du résultat.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Résultat d'examen</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {examen.nom_examen} — {examen.patient_nom || `Patient #${examen.patient_id}`}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Résultat *</label>
            <textarea value={resultat} onChange={(e) => setResultat(e.target.value)} rows={5} placeholder="Saisir le résultat de l'examen..." className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Notes (optionnel)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes complémentaires..." className={inputCls} />
          </div>
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

export default GestionExamens;
