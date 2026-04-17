import React, { useState, useEffect } from 'react';
import { paiementService } from './services/PaiementService';
import { PaiementModal } from './components/PaiementModal';
import {
  Paiement,
  PaiementFormData,
  PaiementFilters,
  PaiementStats,
  MethodePaiement,
  StatutPaiement
} from './types/PaiementTypes';
import Badge from '../../../components/ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Wallet, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  CreditCard,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  AlertTriangle,
  X,
  FileText,
  Activity
} from 'lucide-react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';

interface GestionPaiementsProps {
  tenantId: number;
}

export const GestionPaiements: React.FC<GestionPaiementsProps> = ({ tenantId }) => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [stats, setStats] = useState<PaiementStats>({
    total: 0,
    paye: 0,
    en_attente: 0,
    rembourse: 0,
    montant_total: 0,
    montant_mois: 0
  });
  const [filters, setFilters] = useState<PaiementFilters>({
    searchTerm: '',
    statut: 'Tous',
    methode: 'Tous',
    dateDebut: '',
    dateFin: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState<Paiement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const [methodes, setMethodes] = useState<MethodePaiement[]>([]);
  const [statuts, setStatuts] = useState<StatutPaiement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const itemsPerPage = 8;

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await loadData();
        setMethodes(paiementService.obtenirMethodesPaiement());
        setStatuts(paiementService.obtenirStatutsPaiement());
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [tenantId]);

  const loadData = async () => {
    try {
      const data = await paiementService.obtenirTousPaiements(tenantId);
      const statistics = await paiementService.obtenirStatistiques(tenantId);
      setPaiements(data);
      setStats(statistics);
    } catch (error) {
      console.error('Erreur chargement données paiements:', error);
    }
  };

  const handleSave = async (formData: PaiementFormData) => {
    let result;
    if (editingPaiement) {
      result = await paiementService.modifierPaiement(editingPaiement.paiement_id, formData);
    } else {
      result = await paiementService.creerPaiement(formData, tenantId);
    }

    if (result.success) {
      await loadData();
      setShowModal(false);
      setEditingPaiement(null);
    }
  };

  const handleEdit = (paiement: Paiement) => {
    setEditingPaiement(paiement);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await paiementService.supprimerPaiement(deletingId);
      if (result.success) {
        setNotification({
          isOpen: true,
          title: 'Suppression réussie',
          message: `La transaction #${deletingId} a été supprimée.`,
          type: 'success'
        });
        await loadData();
      } else {
        setNotification({
          isOpen: true,
          title: 'Erreur',
          message: result.errors?.join(', ') || 'Échec de la suppression',
          type: 'error'
        });
      }
    }
    setShowDeleteModal(false);
    setDeletingId(undefined);
  };

  const filteredPaiements = paiements.filter(paiement => {
    const matchesSearch = (paiement.paiement_id?.toString() || '').includes(filters.searchTerm) ||
      (paiement.patient_id?.toString() || '').includes(filters.searchTerm) ||
      (paiement.reference && paiement.reference.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesStatut = filters.statut === 'Tous' || (paiement.statut || '') === filters.statut;
    const matchesMethode = filters.methode === 'Tous' || (paiement.methode_paiement || '') === filters.methode;
    
    return matchesSearch && matchesStatut && matchesMethode;
  });

  const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
  const currentPaiements = filteredPaiements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'HTG'
    }).format(montant);
  };

  const getStatutColor = (statut: string): any => {
    const s = statut?.toLowerCase();
    if (s.includes('payé')) return 'success';
    if (s.includes('attente')) return 'warning';
    if (s.includes('bourse')) return 'error';
    return 'primary';
  };

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium Glassmorphism */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-600 rounded-xl shadow-lg shadow-amber-600/20">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Gestion des Paiements
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Comptabilité & Facturation
            </p>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Ajouter Paiement
          </button>
        </div>
      </div>

      {/* Stats Section with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Transaction', value: stats.total, icon: FileText, color: 'blue', sub: 'opérations' },
          { label: 'Payés', value: stats.paye, icon: CheckCircle, color: 'emerald', sub: 'succès' },
          { label: 'En attente', value: stats.en_attente, icon: Clock, color: 'orange', sub: 'à traiter' },
          { label: 'Recettes Totales', value: formatMontant(stats.montant_total), icon: DollarSign, color: 'indigo', sub: 'HTG' }
        ].map((stat, i) => (
          <div key={i} className="group p-6 rounded-3xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-${stat.color}-500`}>
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
                  <span className={`text-[10px] font-black text-${stat.color}-600 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 px-2 py-0.5 rounded-lg border border-${stat.color}-100 dark:border-${stat.color}-900/30 uppercase`}>{stat.sub}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par ID client, référence..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl text-black dark:text-white">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                  className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none uppercase tracking-tight"
                >
                  <option value="Tous">Tous les statuts</option>
                  {statuts.map(s => <option key={s.statut_id} value={s.nom}>{s.nom}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl text-black dark:text-white">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.methode}
                  onChange={(e) => setFilters(prev => ({ ...prev, methode: e.target.value }))}
                  className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none uppercase tracking-tight"
                >
                  <option value="Tous">Toutes les méthodes</option>
                  {methodes.map(m => <option key={m.methode_id} value={m.nom}>{m.nom}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : (
            <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Transaction</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Patient</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Montant</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Méthode</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Status</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {currentPaiements.map((paiement) => (
                <TableRow key={paiement.paiement_id} className="group hover:bg-white/60 dark:hover:bg-white/[0.03] transition-all">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 dark:border-amber-900/30 transition-transform group-hover:scale-110">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-tight">#{paiement.paiement_id}</span>
                        <span className="text-[10px] font-bold text-gray-400 italic">{paiement.reference || 'REF-GEN'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-sm font-bold uppercase">Patient ID: {paiement.patient_id}</span>
                  </TableCell>
                  <TableCell className="py-5 px-6 font-black text-gray-900 dark:text-white italic">
                    {formatMontant(paiement.montant)}
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      {paiement.methode_paiement}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-center">
                    <Badge size="sm" color={getStatutColor(paiement.statut || '')}>
                      {paiement.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-2 transition-all duration-300">
                      <button 
                        onClick={() => handleEdit(paiement)}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(paiement.paiement_id)}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPaiements.length === 0 && !isLoading && (
            <div className="py-24 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                <DollarSign className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aucun paiement</h3>
              <p className="text-gray-500 dark:text-gray-400 italic font-medium">L'historique des transactions est vide.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
               Page {currentPage} sur {totalPages}
            </p>
            <div className="flex gap-2">
               <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PaiementModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPaiement(null);
        }}
        onSave={handleSave}
        paiement={editingPaiement}
        methodes={methodes}
        statuts={statuts}
      />

      {/* Shared Modals & Toast */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer Transaction"
        message={`Cette opération annulera le paiement #${deletingId}. Confirmer ?`}
        entityName="Paiement"
        entityId={deletingId}
      />

      <NotificationToast
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};