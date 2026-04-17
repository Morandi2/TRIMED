import React, { useState, useEffect } from "react";
import { Medecin, medecinService, MedecinFormData, Specialite } from './services/MedecinService';
import { MedecinModal } from './components/MedecinModal';
import { MedecinTable } from './components/MedecinTable';
import { MedecinStats } from './components/MedecinStats';
import { MedecinViewModal } from './components/MedecinViewModal';
import { MedecinPrintPage } from './components/MedecinPrintPage';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Users2
} from 'lucide-react';

interface GestionMedecinsProps {
  tenantId: number;
  hopitalNom?: string;
}

const GestionMedecins: React.FC<GestionMedecinsProps> = ({ tenantId, hopitalNom }) => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'ancien' | 'nom_az' | 'nom_za' | 'specialite'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [showPrintPage, setShowPrintPage] = useState(false);
  const [printMedecin, setPrintMedecin] = useState<Medecin | null>(null);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const medecinsPerPage = 8;
  const hopitalId = tenantId;

  useEffect(() => {
    loadMedecins();
    loadSpecialites();
  }, [hopitalId]);

  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalType]);

  const loadMedecins = async () => {
    setIsLoading(true);
    try {
      const medecinsData = await medecinService.obtenirMedecinsParHopital(hopitalId);
      setMedecins(medecinsData);
    } catch (e) {
      console.error('[GestionMedecins] Erreur chargement:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecialites = async () => {
    const specialitesData = await medecinService.obtenirSpecialites();
    setSpecialites(specialitesData);
  };

  const handleCreateMedecin = async (formData: MedecinFormData, isModifying: boolean) => {
    let result;
    
    if (successModal.isOpen) return; 

    if (isModifying && selectedMedecin) {
      result = await medecinService.modifierMedecin(selectedMedecin.medecin_id, formData);
    } else {
      result = await medecinService.creerMedecin(formData, hopitalId);
    }
    
    if (result.success) {
      await loadMedecins();
      
      if (!isModifying) {
        setCurrentPage(1);
      }

      setModalType(null);
      setSelectedMedecin(null);
      
      setSuccessModal({
        isOpen: true,
        title: 'Opération réussie',
        message: isModifying ? 'Le médecin a été modifié avec succès.' : 'Le médecin a été enregistré avec succès.',
        type: 'success'
      });
    } else {
      setSuccessModal({
        isOpen: true,
        title: 'Erreur',
        message: result.errors?.[0] || "Une erreur s'est produite lors de l'opération.",
        type: 'error'
      });
    }
  };

  const handleEditMedecin = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setModalType("edit");
  };

  const handleViewMedecin = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setModalType("view");
  };

  const handlePrintMedecin = (medecin: Medecin) => {
    setPrintMedecin(medecin);
    setShowPrintPage(true);
  };

  const handleDeleteClick = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setModalType("delete");
  };

  const handleDeleteConfirm = async () => {
    if (selectedMedecin) {
      const success = await medecinService.supprimerMedecin(selectedMedecin.medecin_id);
      if (success) {
        await loadMedecins();
        setSuccessModal({
          isOpen: true,
          title: 'Suppression réussie',
          message: 'Le médecin a été supprimé avec succès.',
          type: 'success'
        });
      } else {
        setSuccessModal({
          isOpen: true,
          title: 'Erreur',
          message: 'Une erreur s\'est produite lors de la suppression.',
          type: 'error'
        });
      }
      setModalType(null);
      setSelectedMedecin(null);
    }
  };

  const handleAddMedecin = () => {
    setSelectedMedecin(null);
    setModalType("add");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMedecin(null);
  };

  const filteredMedecins = medecins.filter(medecin => {
    if (!medecin) return false;
    return `${medecin?.nom || ""} ${medecin?.prenom || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medecin?.numero_matricule_professionnel || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medecin?.telephone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medecin?.email_professionnel || "").toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedMedecins = [...filteredMedecins].sort((a, b) => {
    if (sortBy === 'recent' || sortBy === 'ancien') {
      const dA = a.cree_le ? new Date(a.cree_le).getTime() : 0;
      const dB = b.cree_le ? new Date(b.cree_le).getTime() : 0;
      const validA = !isNaN(dA) && dA > 0 ? dA : 0;
      const validB = !isNaN(dB) && dB > 0 ? dB : 0;

      if (validA === 0 && validB === 0) {
        return sortBy === 'recent' 
          ? (b.medecin_id || 0) - (a.medecin_id || 0)
          : (a.medecin_id || 0) - (b.medecin_id || 0);
      }

      const diff = sortBy === 'recent' ? validB - validA : validA - validB;
      
      if (diff === 0) {
        return sortBy === 'recent'
          ? (b.medecin_id || 0) - (a.medecin_id || 0)
          : (a.medecin_id || 0) - (b.medecin_id || 0);
      }
      return diff;
    } else if (sortBy === 'nom_az') {
      return `${a?.nom || ''} ${a?.prenom || ''}`.localeCompare(`${b?.nom || ''} ${b?.prenom || ''}`);
    } else if (sortBy === 'nom_za') {
      return `${b?.nom || ''} ${b?.prenom || ''}`.localeCompare(`${a?.nom || ''} ${a?.prenom || ''}`);
    } else if (sortBy === 'specialite') {
      const spA = medecinService.obtenirNomSpecialite(a.specialite_principale_id, specialites);
      const spB = medecinService.obtenirNomSpecialite(b.specialite_principale_id, specialites);
      return spA.localeCompare(spB);
    }
    return 0;
  });

  const _totalPages = Math.ceil(sortedMedecins.length / medecinsPerPage);
  const currentMedecins = sortedMedecins.slice((currentPage - 1) * medecinsPerPage, currentPage * medecinsPerPage);

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium Glassmorphism */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Gestion des Médecins
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || "Portail Médical Professionnel"}</span>
            </p>
          </div>
          <button
            onClick={handleAddMedecin}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-xl shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Ajouter Médecin
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <MedecinStats medecins={medecins} specialites={specialites} />

      {/* Main Content Container */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité ou matricule..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl text-black dark:text-white">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
                  className="bg-transparent border-none text-xs font-black focus:ring-0 outline-none uppercase tracking-tight"
                >
                  <option value="recent">Plus récent</option>
                  <option value="ancien">Plus ancien</option>
                  <option value="nom_az">Nom A → Z</option>
                  <option value="nom_za">Nom Z → A</option>
                  <option value="specialite">Spécialité</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                <Users2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {filteredMedecins.length} PRATICIENS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <MedecinTable
              medecins={currentMedecins}
              currentPage={currentPage}
              medecinsPerPage={medecinsPerPage}
              onViewMedecin={handleViewMedecin}
              onEditMedecin={handleEditMedecin}
              onDeleteMedecin={handleDeleteClick}
              specialites={specialites}
            />
          )}
        </div>

        {/* Improved Pagination */}
        {_totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
             <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
              Affichage de {currentMedecins.length} sur {filteredMedecins.length} praticiens
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.min(5, _totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (_totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > _totalPages) pageNum = _totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-white dark:bg-white/5 text-gray-400 hover:text-blue-600 border border-gray-100 dark:border-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, _totalPages))}
                disabled={currentPage === _totalPages}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Utility Components */}
      {(modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <MedecinModal
              hopitalId={hopitalId}
              onSave={handleCreateMedecin}
              onClose={closeModal}
              medecinId={modalType === "edit" && selectedMedecin ? selectedMedecin.medecin_id : undefined}
            />
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={modalType === 'delete' && !!selectedMedecin}
        onConfirm={handleDeleteConfirm}
        onCancel={closeModal}
        title="Supprimer le médecin"
        entityName={selectedMedecin ? `Dr. ${selectedMedecin.prenom} ${selectedMedecin.nom}` : undefined}
        entityId={selectedMedecin?.medecin_id}
      />

      {modalType === "view" && selectedMedecin && (
        <MedecinViewModal
          medecin={selectedMedecin}
          onClose={closeModal}
          hopitalNom={hopitalNom || ""}
          onPrint={handlePrintMedecin}
        />
      )}
      
      {/* Page d'impression */}
      {showPrintPage && printMedecin && (
        <MedecinPrintPage
          medecin={printMedecin}
          hopitalNom={hopitalNom || ""}
          onClose={() => {
            setShowPrintPage(false);
            setPrintMedecin(null);
          }}
        />
      )}
      
      {/* Modal de succès/erreur */}
      <NotificationToast
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        message={successModal.message}
        type={successModal.type === 'error' ? 'error' : 'success'}
      />
    </div>
  );
};

export default GestionMedecins;