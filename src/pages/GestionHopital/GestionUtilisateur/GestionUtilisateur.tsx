import React, { useState, useEffect } from 'react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { getApiErrorMessage, isCanceledError } from '../../../utils/apiErrorHandler';
import { utilisateurService } from './services/UtilisateurService';
import { UtilisateurModal } from './components/UtilisateurModal';
import { UtilisateurViewModal } from './components/UtilisateurViewModal';
import { 
  Utilisateur, 
  UtilisateurFormData, 
  UtilisateurFilters,
  UtilisateurStats,
  UtilisateurRole,
  UtilisateurStatut
} from './types/UtilisateurTypes';
import Badge from '../../../components/ui/badge/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { 
  User, 
  Shield, 
  CheckCircle,
  Stethoscope,
  Plus, 
  Search, 
  Filter,
  Eye,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Layout
} from 'lucide-react';

interface GestionUtilisateurProps {
  tenantId: number;
}

export const GestionUtilisateur: React.FC<GestionUtilisateurProps> = ({ tenantId }) => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [stats, setStats] = useState<UtilisateurStats>({
    total: 0,
    actif: 0,
    inactif: 0,
    admin: 0,
    medecin: 0,
    infirmier: 0
  });
  const [filters, setFilters] = useState<UtilisateurFilters>({
    searchTerm: '',
    role: 'Tous',
    statut: 'Tous'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUtilisateur, setEditingUtilisateur] = useState<Utilisateur | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const [roles, setRoles] = useState<UtilisateurRole[]>([]);
  const [statuts, setStatuts] = useState<UtilisateurStatut[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUtilisateur, setViewingUtilisateur] = useState<Utilisateur | null>(null);

  const itemsPerPage = 8;
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    setRoles(utilisateurService.obtenirRoles());
    setStatuts(utilisateurService.obtenirStatuts());
    return () => controller.abort();
  }, [tenantId]);

  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await utilisateurService.obtenirTousUtilisateurs(tenantId, signal);
      const statistics = await utilisateurService.obtenirStatistiques(tenantId);
      if (signal?.aborted) return;
      setUtilisateurs(data);
      setStats(statistics);
    } catch (error) {
      if (signal?.aborted || isCanceledError(error)) return;
      setSuccessMessage(`Erreur : ${getApiErrorMessage(error)}`);
      setShowSuccessModal(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const handleSave = async (formData: UtilisateurFormData) => {
    setLoading(true);
    setServerErrors({});
    setGeneralError(null);
    let result;
    
    try {
      if (editingUtilisateur) {
        result = await utilisateurService.modifierUtilisateur(editingUtilisateur.utilisateur_id, formData, editingUtilisateur.email);
      } else {
        result = await utilisateurService.creerUtilisateur(formData, tenantId);
      }

      if (result.success) {
        await loadData();
        setShowModal(false);
        setEditingUtilisateur(null);
        setSuccessMessage(editingUtilisateur ? 'Utilisateur modifié avec succès!' : 'Utilisateur créé avec succès!');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        if (result.fieldErrors) setServerErrors(result.fieldErrors);
        if (result.message) setGeneralError(result.message);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setGeneralError('Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (utilisateur: Utilisateur) => {
    setEditingUtilisateur(utilisateur);
    setShowModal(true);
  };

  const handleView = (utilisateur: Utilisateur) => {
    setViewingUtilisateur(utilisateur);
    setShowViewModal(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      setLoading(true);
      try {
        const result = await utilisateurService.supprimerUtilisateur(deletingId);
        if (result.success) {
          await loadData();
          setSuccessMessage('Utilisateur supprimé avec succès!');
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 3000);
        }
      } finally {
        setLoading(false);
      }
    }
    setShowDeleteModal(false);
    setDeletingId(undefined);
  };

  const filteredUtilisateurs = utilisateurs.filter(user => {
    // 1. Filtrage par terme de recherche (Case-insensitive)
    const searchLow = filters.searchTerm.toLowerCase();
    const matchesSearch = !filters.searchTerm || 
                         user.nom_complet.toLowerCase().includes(searchLow) ||
                         user.email.toLowerCase().includes(searchLow);
    
    // 2. Filtrage par rôle (Comparaison robuste de chaînes/nombres)
    const matchesRole = filters.role === 'Tous' || String(user.role_id) === String(filters.role);
    
    // 3. Filtrage par statut
    const matchesStatut = filters.statut === 'Tous' || String(user.statut_id) === String(filters.statut);
    
    return matchesSearch && matchesRole && matchesStatut;
  });

  const totalPages = Math.ceil(filteredUtilisateurs.length / itemsPerPage);
  const currentUtilisateurs = filteredUtilisateurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur': return 'error';
      case 'Médecin': return 'success';
      case 'Infirmier': return 'info';
      case 'Réceptionniste': return 'warning';
      default: return 'primary';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Actif': return 'success';
      case 'Inactif': return 'warning';
      case 'Suspendu': return 'error';
      default: return 'primary';
    }
  };

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium Glassmorphism */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Gestion Utilisateurs
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Sécurité & Contrôle d'Accès
            </p>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-5 w-5" />
            Ajouter Utilisateur
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Comptes', value: stats.total, icon: User, color: 'blue', sub: 'inscrits' },
          { label: 'Utilisateurs Actifs', value: stats.actif, icon: CheckCircle, color: 'emerald', sub: 'en ligne' },
          { label: 'Médecins', value: stats.medecin, icon: Stethoscope, color: 'purple', sub: 'soignants' },
          { label: 'Administrateurs', value: stats.admin, icon: Shield, color: 'rose', sub: 'sécurité' }
        ].map((stat, i) => (
          <div key={i} className="group p-6 rounded-3xl bg-white/40 dark:bg-white/[0.03] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
             <div className="flex items-center justify-between relative z-10">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mt-1">{stat.value}</p>
               </div>
               <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                 <stat.icon className="w-6 h-6" />
               </div>
             </div>
             <div className="mt-4 flex items-center gap-2 relative z-10">
               <span className={`text-[10px] font-black text-${stat.color}-600 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 px-2 py-0.5 rounded-lg border border-${stat.color}-100 dark:border-${stat.color}-900/30 uppercase tracking-widest`}>
                 {stat.sub}
               </span>
             </div>
             <div className={`absolute -right-4 -bottom-4 p-8 opacity-5 text-${stat.color}-500 group-hover:scale-125 transition-transform duration-500`}>
               <stat.icon className="w-24 h-24" />
             </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <Layout className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-transparent border-none text-xs font-black focus:ring-0 outline-none uppercase tracking-tight"
                >
                  <option value="Tous">Tous les rôles</option>
                  {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.nom}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                  className="bg-transparent border-none text-xs font-black focus:ring-0 outline-none uppercase tracking-tight"
                >
                  <option value="Tous">Tous les statuts</option>
                  {statuts.map(s => <option key={s.statut_id} value={s.statut_id}>{s.nom}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/20 dark:bg-black/10 backdrop-blur-sm">
              <TableSkeleton rows={5} columns={3} />
            </div>
          )}
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Utilisateur</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Contact</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rôle & Statut</TableCell>
                <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {currentUtilisateurs.map((user) => (
                <TableRow key={user.utilisateur_id} className="group hover:bg-white/60 dark:hover:bg-white/[0.03] transition-all">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black shadow-sm border border-indigo-100 dark:border-indigo-900/30 transition-transform group-hover:scale-110">
                        {user.nom_complet.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black uppercase tracking-tight">{user.nom_complet}</span>
                        <span className="text-[10px] font-bold text-gray-400 italic">ID#{user.utilisateur_id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-indigo-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 italic">
                        <Phone className="w-3 h-3 text-gray-300" />
                        {user.telephone || 'Non renseigné'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex flex-col items-center gap-2">
                      <Badge size="sm" color={getRoleColor(roles.find(r => r.role_id === user.role_id)?.nom || '')}>
                        {roles.find(r => r.role_id === user.role_id)?.nom}
                      </Badge>
                      <Badge size="sm" color={getStatutColor(statuts.find(s => s.statut_id === user.statut_id)?.nom || '')}>
                        {statuts.find(s => s.statut_id === user.statut_id)?.nom}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-2 transition-all duration-300">
                      <button onClick={() => handleView(user)} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user.utilisateur_id)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUtilisateurs.length === 0 && !loading && (
            <div className="py-24 text-center">
               <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                 <User className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aucun utilisateur</h3>
               <p className="text-gray-500 dark:text-gray-400 italic font-medium">L'annuaire des personnels est vide.</p>
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
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UtilisateurModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUtilisateur(null);
          setServerErrors({});
          setGeneralError(null);
        }}
        onSave={handleSave}
        serverErrors={serverErrors}
        generalError={generalError || undefined}
        utilisateur={editingUtilisateur}
        roles={roles}
        statuts={statuts}
      />

      <UtilisateurViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingUtilisateur(null);
        }}
        utilisateur={viewingUtilisateur}
        roles={roles}
        statuts={statuts}
      />

      {/* Confirm Delete */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setDeletingId(undefined); }}
        title="Supprimer Compte"
        message={`Cette action supprimera l'utilisateur #${deletingId}. Confirmer ?`}
      />

      {/* Modern Success Modal */}
      <NotificationToast
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        type={successMessage.toLowerCase().includes('erreur') ? 'error' : 'success'}
      />
    </div>
  );
};