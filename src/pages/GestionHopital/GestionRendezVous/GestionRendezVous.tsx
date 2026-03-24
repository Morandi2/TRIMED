import React, { useState, useEffect } from 'react';
import { rendezVousService } from './services/RendezVousService';
import { RendezVousProgressForm } from './components/RendezVousProgressForm';
import { 
  RendezVous, 
  RendezVousFormData, 
  RendezVousFilters,
  RendezVousStats,
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

interface GestionRendezVousProps {
  tenantId: number;
  hopitalNom?: string;
}

export const GestionRendezVous: React.FC<GestionRendezVousProps> = ({ tenantId, hopitalNom }) => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [stats, setStats] = useState<RendezVousStats>({
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

  const itemsPerPage = 10;

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        rendezVousService.loadMetadata(tenantId),
        rendezVousService.loadCache(tenantId)
      ]);
      setTypes(rendezVousService.obtenirTypes());
      setStatuts(rendezVousService.obtenirStatuts());
      await loadData();
    };
    init();
  }, [tenantId]);

  const loadData = async () => {
    const data = await rendezVousService.obtenirTousRendezVous({ tenant: tenantId });
    const statistics = await rendezVousService.obtenirStatistiques(tenantId);
    setRendezVous(data);
    setStats(statistics);
    console.log('Données chargées:', data);
    console.log('Statistiques:', statistics);
  };

  const handleSave = async (formData: RendezVousFormData, isModifying: boolean) => {
    console.log('Données reçues dans handleSave:', formData);
    
    let result;
    
    if (editingRendezVous) {
      result = await rendezVousService.modifierRendezVous(editingRendezVous.rendez_vous_id, formData);
    } else {
      result = await rendezVousService.creerRendezVous(formData);
    }

    console.log('Résultat sauvegarde:', result);

    if (result.success) {
      await loadData(); // Recharger les données
      setShowModal(false); // Fermer le modal
      setEditingRendezVous(null);
      showSuccess(isModifying ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès');
    } else {
      console.error('Erreur:', result.errors);
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
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const filteredRendezVous = rendezVous.filter(rdv => {
    const matchesSearch = rdv.rendez_vous_id.toString().includes(filters.searchTerm) ||
                         rdv.patient_id.toString().includes(filters.searchTerm) ||
                         rdv.medecin_id.toString().includes(filters.searchTerm) ||
                         (rdv.motif && rdv.motif.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesStatut = filters.statut === 'Tous' || rdv.statut_id.toString() === filters.statut;
    const matchesType = filters.type === 'Tous' || rdv.type_id?.toString() === filters.type;
    const matchesDate = !filters.date || rdv.date_heure.split('T')[0] === filters.date;
    
    return matchesSearch && matchesStatut && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredRendezVous.length / itemsPerPage);
  const currentRendezVous = filteredRendezVous.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const typeOptions = ['Tous', ...types.map(t => t.type_id.toString())];
  const statutOptions = ['Tous', ...statuts.map(s => s.statut_id.toString())];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Confirmé': return 'success';
      case 'Programmé': return 'info';
      case 'En cours': return 'warning';
      case 'Terminé': return 'primary';
      case 'Annulé': return 'error';
      case 'Reporté': return 'warning';
      default: return 'primary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgence': return 'error';
      case 'Téléconsultation': return 'info';
      case 'Contrôle': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          <div className="text-sm text-blue-900">Total</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-700">{stats.programme}</div>
          <div className="text-sm text-yellow-900">Programmé</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">{stats.confirme}</div>
          <div className="text-sm text-green-900">Confirmé</div>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-700">{stats.termine}</div>
          <div className="text-sm text-gray-900">Terminé</div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Rendez-vous - {hopitalNom || "Mon Hôpital"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Planifiez et gérez les rendez-vous des patients
            </p>
          </div>

          <div className="relative group">
            <button 
              onClick={() => {
                setEditingRendezVous(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ajouter un Rendez-vous
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par ID, motif..."
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
              {statutOptions.map(statut => (
                <option key={statut} value={statut}>
                  {statut === 'Tous' ? 'Tous' : statuts.find(s => s.statut_id.toString() === statut)?.nom}
                </option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'Tous' ? 'Tous' : types.find(t => t.type_id.toString() === type)?.nom}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
            />
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
                  Patient
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Médecin
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Date & Heure
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Motif
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Statut
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Type
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentRendezVous.map((rdv) => (
                <TableRow key={rdv.rendez_vous_id}>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-black text-sm dark:text-white/90">
                        {rdv.rendez_vous_id}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {formatDate(rdv.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-black text-sm dark:text-white/90">
                      {rdv.patient_nom || rendezVousService.obtenirNomPatient(rdv.patient_id || (rdv as any).patient)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-black text-sm dark:text-white/90">
                      {rdv.medecin_nom || rendezVousService.obtenirNomMedecin(rdv.medecin_id || (rdv as any).medecin)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-black text-sm dark:text-white/90">
                        {formatDate(rdv.date_heure)}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {formatTime(rdv.date_heure)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-black text-sm dark:text-white/90 truncate max-w-xs">
                      {rdv.motif || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getStatutColor(rdv.statut_nom || (statuts.find(s => s.statut_id === (rdv.statut_id || (rdv as any).statut))?.nom) || '')}>
                      {rdv.statut_nom || statuts.find(s => s.statut_id === (rdv.statut_id || (rdv as any).statut))?.nom || 'Non spécifié'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={getTypeColor(rdv.type_nom || (types.find(t => t.type_id === (rdv.type_id || (rdv as any).type))?.nom) || '')}>
                      {rdv.type_nom || types.find(t => t.type_id === (rdv.type_id || (rdv as any).type))?.nom || 'Non spécifié'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(rdv)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(rdv.rendez_vous_id)}
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

          {filteredRendezVous.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun rendez-vous trouvé</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Aucun rendez-vous ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal RendezVous Progress */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl h-[95vh]">
            <RendezVousProgressForm
              tenantId={tenantId}
              onSave={handleSave}
              onClose={() => {
                setShowModal(false);
                setEditingRendezVous(null);
              }}
              rendezVousId={editingRendezVous?.rendez_vous_id}
              onSuccess={(message) => {
                console.log('Success callback:', message);
              }}
            />
          </div>
        </div>
      )}

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
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
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
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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