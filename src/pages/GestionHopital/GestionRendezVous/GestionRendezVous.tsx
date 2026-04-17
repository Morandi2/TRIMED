import React, { useState, useEffect } from 'react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { rendezVousService } from './services/RendezVousService';
import { RendezVousProgressForm } from './components/RendezVousProgressForm';
import { 
  RendezVous, 
  RendezVousFormData, 
  RendezVousFilters,
  RendezVousStats as IRendezVousStats,
  RendezVousType,
  RendezVousStatut
} from './types/RendezVousTypes';
import Badge from '../../../components/ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { RendezVousStats } from './components/RendezVousStats';
import { 
  Plus, 
  Search, 
  Calendar, 
  Filter,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  CalendarDays
} from 'lucide-react';

interface GestionRendezVousProps {
  tenantId: number;
  hopitalNom?: string;
}

// Define the correct Badge color type based on what the component expects
type BadgeColor = "primary" | "warning" | "success" | "info" | "error" | "light";

export const GestionRendezVous: React.FC<GestionRendezVousProps> = ({ tenantId, hopitalNom }) => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [stats, setStats] = useState<IRendezVousStats>({
    total: 0,
    programme: 0,
    confirme: 0,
    termine: 0,
    annule: 0,
    aujourdhui: 0,
    cette_semaine: 0
  });
  const [filters, setFilters] = useState<RendezVousFilters>({
    searchTerm: '',
    statut: 'Tous',
    medecin: 'Tous',
    type: 'Tous',
    date: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRendezVous, setEditingRendezVous] = useState<RendezVous | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const [types, setTypes] = useState<RendezVousType[]>([]);
  const [statuts, setStatuts] = useState<RendezVousStatut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 8;

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          rendezVousService.loadMetadata(tenantId),
          rendezVousService.loadCache(tenantId)
        ]);
        setTypes(rendezVousService.obtenirTypes());
        setStatuts(rendezVousService.obtenirStatuts());
        await loadData();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [tenantId]);

  const loadData = async () => {
    const data = await rendezVousService.obtenirTousRendezVous({ tenant: tenantId });
    const statistics = await rendezVousService.obtenirStatistiques(tenantId);
    setRendezVous(data as any);
    setStats(statistics);
  };

  const handleSave = async (formData: RendezVousFormData, isModifying: boolean) => {
    let result;
    if (editingRendezVous) {
      result = await rendezVousService.modifierRendezVous(editingRendezVous.rendez_vous_id || (editingRendezVous as any).id, formData, tenantId);
    } else {
      result = await rendezVousService.creeRendezVous(formData, tenantId);
    }

    if (result.success) {
      await loadData();
      setShowModal(false);
      setEditingRendezVous(null);
      showSuccess(isModifying ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès');
    } else {
      showSuccess('Erreur: ' + (result.errors?.join(', ') || 'Action échouée'), true);
    }
  };

  const handleEdit = (rdv: RendezVous) => {
    setEditingRendezVous(rdv);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await rendezVousService.supprimerRendezVous(deletingId);
      if (result.success) {
        await loadData();
        showSuccess('Rendez-vous supprimé avec succès');
      } else {
        showSuccess('Erreur lors de la suppression', true);
      }
    }
    setShowDeleteModal(false);
    setDeletingId(undefined);
  };

  const showSuccess = (message: string, isError: boolean = false) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const filteredRendezVous = rendezVous.filter(rdv => {
    const searchLow = filters.searchTerm.toLowerCase();
    const rdvId = String(rdv.rendez_vous_id || (rdv as any).id || '');
    const patientId = String(rdv.patient_id || '');
    const medecinId = String(rdv.medecin_id || '');
    const motif = (rdv.motif || '').toLowerCase();
    const patientNom = (rdv.patient_nom || '').toLowerCase();
    const medecinNom = (rdv.medecin_nom || '').toLowerCase();

    const matchesSearch = !filters.searchTerm || 
                         rdvId.includes(searchLow) ||
                         patientId.includes(searchLow) ||
                         medecinId.includes(searchLow) ||
                         motif.includes(searchLow) ||
                         patientNom.includes(searchLow) ||
                         medecinNom.includes(searchLow);

    const matchesStatut = filters.statut === 'Tous' || String(rdv.statut_id) === filters.statut;
    const matchesType = filters.type === 'Tous' || String(rdv.type_id) === filters.type;
    const matchesDate = !filters.date || (rdv.date_heure && rdv.date_heure.split('T')[0] === filters.date);
    
    return matchesSearch && matchesStatut && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredRendezVous.length / itemsPerPage);
  const currentRendezVous = filteredRendezVous.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatutColor = (statut: string): BadgeColor => {
    switch (statut?.toLowerCase()) {
      case 'planifié': return 'warning';
      case 'confirmé': return 'success';
      case 'terminé': return 'info';
      case 'annulé': return 'error';
      default: return 'light';
    }
  };

  const getTypeColor = (type: string): BadgeColor => {
    const t = (type || '').toLowerCase();
    if (t.includes('urgenc')) return 'error';
    if (t.includes('tele')) return 'info';
    if (t.includes('contr')) return 'warning';
    return 'primary';
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header Premium */}
      <div className="relative mb-10 p-8 rounded-[2rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Rendez-vous
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || "Hôpital"}</span>
            </p>
          </div>

          <button 
            onClick={() => { setEditingRendezVous(null); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Ajouter Rendez-vous
          </button>
        </div>
      </div>

      <RendezVousStats stats={stats} />

      {/* Main Content Container */}
      <div className="rounded-[2rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher un patient, un médecin ou un motif..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-black dark:text-white"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none text-black dark:text-white"
                >
                  <option value="Tous">Tous les statuts</option>
                  {statuts.map(s => <option key={s.statut_id} value={String(s.statut_id)}>{s.nom}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none cursor-pointer text-black dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader className="py-4 px-6 text-theme-xs font-black text-gray-500 uppercase tracking-widest">Aperçu</TableCell>
                <TableCell isHeader className="py-4 px-6 text-theme-xs font-black text-gray-500 uppercase tracking-widest text-left">Bénéficiaire</TableCell>
                <th className="px-6 py-4 text-theme-xs font-black text-gray-500 uppercase tracking-widest text-left">Praticien Responsable</th>
                <TableCell isHeader className="py-4 px-6 text-theme-xs font-black text-gray-500 uppercase tracking-widest">Détails Du Motif</TableCell>
                <TableCell isHeader className="py-4 px-6 text-theme-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
                {currentRendezVous.map((rdv) => (
                  <TableRow key={rdv.rendez_vous_id} className="group hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors">
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                          <CalendarDays className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-theme-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">#{rdv.rendez_vous_id}</span>
                          <span className="text-theme-xs text-gray-500 italic uppercase">{formatDate(rdv.date_heure)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-theme-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{rdv.patient_nom}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-theme-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{rdv.medecin_nom}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="space-y-2">
                        <p className="text-theme-sm text-gray-700 dark:text-gray-300 line-clamp-1 italic font-medium">"{rdv.motif || 'Aucun motif'}"</p>
                        <div className="flex gap-2">
                          <Badge size="sm" color={getStatutColor(rdv.statut_nom || '')}>{rdv.statut_nom}</Badge>
                          <Badge variant="light" size="sm" color={getTypeColor(rdv.type_nom || '')}>{rdv.type_nom}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 transition-all">
                        <button 
                          onClick={() => handleEdit(rdv)}
                          className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(rdv.rendez_vous_id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {filteredRendezVous.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucun rendez-vous</h3>
              <p className="text-gray-500 dark:text-gray-400">Essayez de changer vos filtres ou créez-en un nouveau.</p>
            </div>
          )}

          {isLoading && (
            <TableSkeleton rows={5} columns={4} />
          )}
        </div>

        {/* Pagination Premium */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
              Affichage de {currentRendezVous.length} sur {filteredRendezVous.length} rendez-vous
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-600/20">
                {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal RendezVous Progress */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden h-[90vh]">
            <RendezVousProgressForm
              tenantId={tenantId}
              onSave={handleSave}
              onClose={() => { setShowModal(false); setEditingRendezVous(null); }}
              rendezVousId={editingRendezVous?.rendez_vous_id}
            />
          </div>
        </div>
      )}

      {/* Modern Confirm Delete Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setDeletingId(undefined); }}
        title="Supprimer le rendez-vous"
        message={`Êtes-vous sûr de vouloir supprimer le rendez-vous #${deletingId} ? Cette action est irréversible.`}
      />

      {/* Stylish Success Notification */}
      <NotificationToast
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        type={successMessage.toLowerCase().includes('erreur') ? 'error' : 'success'}
      />
    </div>
  );
};