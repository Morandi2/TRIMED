import React, { useState, useEffect } from 'react';
import { abonnementService } from './services/AbonnementService';
import { AbonnementModal } from './components/AbonnementModal';
import { PaiementModal } from './components/PaiementModal';
import {
  Abonnement,
  AbonnementFormData,
  AbonnementFilters,
  AbonnementStats,
  AbonnementStatut,
  PaiementFormData,
  PaiementMethode,
  PaiementStatut
} from './types/AbonnementTypes';
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
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash, 
  Pencil, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  FileText
} from 'lucide-react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';

interface GestionAbonnementsProps {
  tenantId: number;
}

export const GestionAbonnements: React.FC<GestionAbonnementsProps> = ({ tenantId }) => {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [stats, setStats] = useState<AbonnementStats>({
    total: 0,
    actif: 0,
    expire: 0,
    suspendu: 0,
    revenus_mois: 0,
    revenus_total: 0
  });
  const [filters, setFilters] = useState<AbonnementFilters>({
    searchTerm: '',
    statut: 'Tous',
    dateDebut: '',
    dateFin: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAbonnementModal, setShowAbonnementModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [editingAbonnement, setEditingAbonnement] = useState<Abonnement | null>(null);
  const [selectedAbonnementId, setSelectedAbonnementId] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const [statuts, setStatuts] = useState<AbonnementStatut[]>([]);
  const [methodes, setMethodes] = useState<PaiementMethode[]>([]);
  const [statutsPaiement, setStatutsPaiement] = useState<PaiementStatut[]>([]);
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
        setStatuts(abonnementService.obtenirStatutsAbonnement());
        setMethodes(abonnementService.obtenirMethodesPaiement());
        setStatutsPaiement(abonnementService.obtenirStatutsPaiement());
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [tenantId]);

  const loadData = async () => {
    const data = await abonnementService.obtenirTousAbonnements(tenantId);
    const statistics = await abonnementService.obtenirStatistiques(tenantId);
    setAbonnements(data);
    setStats(statistics);
  };

  const handleSaveAbonnement = async (formData: AbonnementFormData) => {
    let result;
    if (editingAbonnement) {
      result = await abonnementService.modifierAbonnement(editingAbonnement.abonnement_id, formData);
    } else {
      result = await abonnementService.creerAbonnement(formData);
    }

    if (result.success) {
      setNotification({
        isOpen: true,
        title: 'Opération réussie',
        message: editingAbonnement ? 'Abonnement mis à jour.' : 'Abonnement créé avec succès.',
        type: 'success'
      });
      await loadData();
      setShowAbonnementModal(false);
      setEditingAbonnement(null);
    } else {
      setNotification({
        isOpen: true,
        title: 'Erreur',
        message: result.message || 'Échec de l\'opération',
        type: 'error'
      });
    }
  };

  const handleSavePaiement = async (formData: PaiementFormData) => {
    const result = await abonnementService.creerPaiement(formData);
    if (result.success) {
      setNotification({
        isOpen: true,
        title: 'Paiement enregistré',
        message: 'Le paiement a été ajouté à l\'abonnement.',
        type: 'success'
      });
      await loadData();
      setShowPaiementModal(false);
      setSelectedAbonnementId(0);
    } else {
      setNotification({
        isOpen: true,
        title: 'Erreur',
        message: result.message || 'Échec de l\'enregistrement du paiement',
        type: 'error'
      });
    }
  };

  const handleEdit = (abonnement: Abonnement) => {
    setEditingAbonnement(abonnement);
    setShowAbonnementModal(true);
  };

  const handleAddPaiement = (abonnementId: number) => {
    setSelectedAbonnementId(abonnementId);
    setShowPaiementModal(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await abonnementService.supprimerAbonnement(deletingId);
      if (result.success) {
        setNotification({
          isOpen: true,
          title: 'Abonnement supprimé',
          message: 'L\'abonnement a été retiré du système.',
          type: 'success'
        });
        await loadData();
      } else {
        setNotification({
          isOpen: true,
          title: 'Erreur',
          message: result.message || 'Échec de la suppression',
          type: 'error'
        });
      }
    }
    setShowDeleteModal(false);
    setDeletingId(undefined);
  };

  const filteredAbonnements = abonnements.filter(abonnement => {
    const matchesSearch = abonnement.abonnement_id.toString().includes(filters.searchTerm) ||
      abonnement.tenant_id.toString().includes(filters.searchTerm);
    const matchesStatut = filters.statut === 'Tous' || abonnement.statut_id.toString() === filters.statut;
    const matchesDateDebut = !filters.dateDebut || abonnement.date_debut >= filters.dateDebut;
    const matchesDateFin = !filters.dateFin || abonnement.date_fin <= filters.dateFin;

    return matchesSearch && matchesStatut && matchesDateDebut && matchesDateFin;
  });

  const totalPages = Math.ceil(filteredAbonnements.length / itemsPerPage);
  const currentAbonnements = filteredAbonnements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'HTG'
    }).format(montant);
  };

  const getStatutColor = (statutId: number) => {
    switch (statutId) {
      case 1: return 'success'; // Actif
      case 2: return 'error';   // Expiré
      case 3: return 'warning'; // Suspendu
      default: return 'primary';
    }
  };

  const getStatutNom = (statutId: number) => {
    const statut = statuts.find(s => s.statut_id === statutId);
    return statut?.nom || 'Inconnu';
  };

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium Glassmorphism */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Gestion des Abonnements
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Souscriptions & Licences Clients
            </p>
          </div>

          <button 
            onClick={() => { setEditingAbonnement(null); setShowAbonnementModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Nouvel Abonnement
          </button>
        </div>
      </div>

      {/* Stats Section with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Actifs', value: stats.actif, icon: ShieldCheck, color: 'emerald', sub: 'licences vivantes' },
          { label: 'En Danger', value: stats.expire, icon: AlertCircle, color: 'red', sub: 'expirés' },
          { label: 'Revenus Mois', value: formatMontant(stats.revenus_mois), icon: TrendingUp, color: 'indigo', sub: 'HTG' },
          { label: 'Revenu Total', value: formatMontant(stats.revenus_total), icon: DollarSign, color: 'purple', sub: 'HTG' }
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
                  <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
                  <span className={`text-[10px] font-black text-${stat.color}-600 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 px-2 py-0.5 rounded-lg border border-${stat.color}-100 dark:border-${stat.color}-900/30 uppercase`}>{stat.sub}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par ID client, Tenant ID..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                  className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none uppercase tracking-tight"
                >
                  <option value="Tous">Tous les statuts</option>
                  {statuts.map(s => <option key={s.statut_id} value={s.statut_id.toString()}>{s.nom}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <TableSkeleton rows={8} columns={5} />
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Souscription</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Tenant Info</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-left">Période Validité</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Statut</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                {currentAbonnements.map((abonnement) => (
                  <TableRow key={abonnement.abonnement_id} className="group hover:bg-white/60 dark:hover:bg-white/[0.03] transition-all">
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/30 transition-transform group-hover:scale-110">
                          <PlusCircle className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase tracking-tight">ID #{abonnement.abonnement_id}</span>
                          <span className="text-[10px] font-bold text-gray-400 italic">Plan ID: {abonnement.plan_id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black">T</div>
                        <span className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase">Tenant #{abonnement.tenant_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Du {formatDate(abonnement.date_debut)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Au {formatDate(abonnement.date_fin)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-center">
                      <Badge size="sm" color={getStatutColor(abonnement.statut_id)}>
                        {getStatutNom(abonnement.statut_id)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 px-6 text-right">
                      <div className="flex justify-end gap-2 transition-all duration-300">
                        <button 
                          onClick={() => handleAddPaiement(abonnement.abonnement_id)}
                          title="Ajouter Paiement"
                          className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(abonnement)}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(abonnement.abonnement_id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {currentAbonnements.length === 0 && !isLoading && (
            <div className="py-24 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                <CreditCard className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aucun abonnement</h3>
              <p className="text-gray-500 dark:text-gray-400 italic font-medium">La liste des souscriptions est vide.</p>
            </div>
          )}
        </div>

        {/* Pagination Premium */}
        {totalPages > 1 && !isLoading && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
               Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/20">
                {currentPage}
              </div>
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

      {/* Modals Section */}
      <AbonnementModal
        isOpen={showAbonnementModal}
        onClose={() => {
          setShowAbonnementModal(false);
          setEditingAbonnement(null);
        }}
        onSave={handleSaveAbonnement}
        abonnement={editingAbonnement}
        statuts={statuts}
        tenantId={tenantId}
      />

      <PaiementModal
        isOpen={showPaiementModal}
        onClose={() => {
          setShowPaiementModal(false);
          setSelectedAbonnementId(0);
        }}
        onSave={handleSavePaiement}
        abonnementId={selectedAbonnementId}
        tenantId={tenantId}
        methodes={methodes}
        statuts={statutsPaiement}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer Abonnement"
        message="Voulez-vous vraiment supprimer cet abonnement ? Cette action est irréversible."
        entityName="Abonnement"
        entityId={deletingId}
      />

      <NotificationToast
        isOpen={notification.isOpen}
        message={`${notification.title} — ${notification.message}`}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};