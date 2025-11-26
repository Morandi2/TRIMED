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

interface GestionAbonnementsProps {
  tenantId: number;
}

export const GestionAbonnements: React.FC<GestionAbonnementsProps> = ({ _tenantId }) => {
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
  const [currentPage, _setCurrentPage] = useState(1);
  const [showAbonnementModal, setShowAbonnementModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [editingAbonnement, setEditingAbonnement] = useState<Abonnement | null>(null);
  const [selectedAbonnementId, setSelectedAbonnementId] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const [statuts, setStatuts] = useState<AbonnementStatut[]>([]);
  const [methodes, setMethodes] = useState<PaiementMethode[]>([]);
  const [statutsPaiement, setStatutsPaiement] = useState<PaiementStatut[]>([]);

  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
    setStatuts(abonnementService.obtenirStatutsAbonnement());
    setMethodes(abonnementService.obtenirMethodesPaiement());
    setStatutsPaiement(abonnementService.obtenirStatutsPaiement());
  }, [tenantId]);

  const loadData = () => {
    const data = abonnementService.obtenirTousAbonnements(_tenantId);
    const statistics = abonnementService.obtenirStatistiques(_tenantId);
    setAbonnements(data);
    setStats(statistics);
  };

  const handleSaveAbonnement = (formData: AbonnementFormData) => {
    let result;
    
    if (editingAbonnement) {
      result = abonnementService.modifierAbonnement(editingAbonnement.abonnement_id, formData);
    } else {
      result = abonnementService.creerAbonnement(formData);
    }

    if (result.success) {
      loadData();
      setShowAbonnementModal(false);
      setEditingAbonnement(null);
    } else {
      console.error('Erreur:', result.errors);
    }
  };

  const handleSavePaiement = (formData: PaiementFormData) => {
    const result = abonnementService.creerPaiement(formData);

    if (result.success) {
      loadData();
      setShowPaiementModal(false);
      setSelectedAbonnementId(0);
    } else {
      console.error('Erreur:', result.errors);
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

  const confirmDelete = () => {
    if (deletingId) {
      const result = abonnementService.supprimerAbonnement(deletingId);
      if (result.success) {
        loadData();
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

  const _totalPages = Math.ceil(filteredAbonnements.length / itemsPerPage);
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
      currency: 'EUR'
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
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Abonnements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.actif}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expirés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expire}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatMontant(stats.revenus_total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Abonnements
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez les abonnements et les paiements des clients
            </p>
          </div>

          <button 
            onClick={() => setShowAbonnementModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Nouvel Abonnement
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par ID..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            >
              <option value="Tous">Tous les statuts</option>
              {statuts.map(statut => (
                <option key={statut.statut_id} value={statut.statut_id.toString()}>{statut.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  ID
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Tenant
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Plan
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Période
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Statut
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentAbonnements.map((abonnement) => (
                <TableRow key={abonnement.abonnement_id}>
                  <TableCell className="py-3">
                    <p className="font-medium text-black text-sm dark:text-white/90">
                      {abonnement.abonnement_id}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-black text-sm dark:text-white/90">
                      {abonnement.tenant_id}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-black text-sm dark:text-white/90">
                      Plan {abonnement.plan_id}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-black text-sm dark:text-white/90">
                        {formatDate(abonnement.date_debut)}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        au {formatDate(abonnement.date_fin)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatutColor(abonnement.statut_id)}>
                      {getStatutNom(abonnement.statut_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(abonnement)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleAddPaiement(abonnement.abonnement_id)}
                        className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(abonnement.abonnement_id)}
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

          {filteredAbonnements.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun abonnement trouvé</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Aucun abonnement ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Abonnement */}
      <AbonnementModal
        isOpen={showAbonnementModal}
        onClose={() => {
          setShowAbonnementModal(false);
          setEditingAbonnement(null);
        }}
        onSave={handleSaveAbonnement}
        abonnement={editingAbonnement}
        statuts={statuts}
      />

      {/* Modal Paiement */}
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
              Êtes-vous sûr de vouloir supprimer cet abonnement ? Cette action est irréversible.
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
    </div>
  );
};