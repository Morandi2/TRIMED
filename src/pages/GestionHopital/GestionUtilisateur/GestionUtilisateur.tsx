import React, { useState, useEffect } from 'react';
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

  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    setRoles(utilisateurService.obtenirRoles());
    setStatuts(utilisateurService.obtenirStatuts());
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await utilisateurService.obtenirTousUtilisateurs(tenantId);
      const statistics = await utilisateurService.obtenirStatistiques(tenantId);
      setUtilisateurs(data);
      setStats(statistics);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
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
      } else {
        if (result.fieldErrors) {
          setServerErrors(result.fieldErrors);
        }
        
        if (result.message) {
          setGeneralError(result.message);
        }
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
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
      } finally {
        setLoading(false);
      }
    }
    setShowDeleteModal(false);
    setDeletingId(undefined);
  };

  const filteredUtilisateurs = utilisateurs.filter(user => {
    const matchesSearch = user.nom_complet.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesRole = filters.role === 'Tous' || user.role_id.toString() === filters.role;
    const matchesStatut = filters.statut === 'Tous' || user.statut_id.toString() === filters.statut;
    
    return matchesSearch && matchesRole && matchesStatut;
  });

  const _totalPages = Math.ceil(filteredUtilisateurs.length / itemsPerPage);
  const currentUtilisateurs = filteredUtilisateurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const roleOptions = ['Tous', ...roles.map(r => r.role_id.toString())];
  const statutOptions = ['Tous', ...statuts.map(s => s.statut_id.toString())];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

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
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.actif}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Médecins</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.medecin}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.admin}</p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Utilisateurs
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez les comptes utilisateurs et leurs permissions
            </p>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Nouvel Utilisateur
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role === 'Tous' ? 'Tous les rôles' : roles.find(r => r.role_id.toString() === role)?.nom}
                </option>
              ))}
            </select>

            <select
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            >
              {statutOptions.map(statut => (
                <option key={statut} value={statut}>
                  {statut === 'Tous' ? 'Tous les statuts' : statuts.find(s => s.statut_id.toString() === statut)?.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="relative overflow-x-auto">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          )}
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Utilisateur
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Téléphone
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Rôle
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Statut
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Créé le
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentUtilisateurs.map((user) => (
                <TableRow key={user.utilisateur_id}>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-black text-sm dark:text-white/90">
                        {user.nom_complet}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        ID: {user.utilisateur_id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-black text-sm dark:text-white/90">
                      {user.email}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-black text-sm dark:text-white/90">
                      {user.telephone || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getRoleColor(roles.find(r => r.role_id === user.role_id)?.nom || '')}>
                      {roles.find(r => r.role_id === user.role_id)?.nom}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatutColor(statuts.find(s => s.statut_id === user.statut_id)?.nom || '')}>
                      {statuts.find(s => s.statut_id === user.statut_id)?.nom}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-black text-sm dark:text-white/90">
                      {formatDate(user.created_at)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleView(user)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Voir les détails"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.utilisateur_id)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUtilisateurs.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Aucun utilisateur ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Utilisateur */}
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

      {/* Modal Consultation Utilisateur */}
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

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600 dark:text-red-400">
                  <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Confirmer la suppression
                </h3>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600 dark:text-green-400">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Succès
                </h3>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {successMessage}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};