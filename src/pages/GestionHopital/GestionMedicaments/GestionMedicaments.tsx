import { useState, useEffect } from 'react';
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { medicamentService } from './services/MedicamentService';
import { MedicamentProgressForm } from './components/MedicamentProgressForm';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MouvementModal } from './components/MouvementModal';
import { MedicamentStats } from './components/MedicamentStats';
import {
  Medicament,
  MouvementStock,
  MedicamentFilters,
  TypeMouvement,
  STATUTS_MEDICAMENT,
  FORMES_PHARMACEUTIQUES
} from './types/MedicamentTypes';

type MedicamentStatsType = {
  total: number;
  disponible: number;
  rupture: number;
  stock_bas: number;
  perime: number;
  valeur_stock: number;
};

// Composant Tooltip
const Tooltip = ({
  children,
  text
}: {
  children: React.ReactNode;
  text: string;
}) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-[99999] min-w-max">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

interface GestionMedicamentsProps {
  tenantId: number;
  hopitalNom?: string;
}

export default function GestionMedicaments({ tenantId, hopitalNom }: GestionMedicamentsProps) {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [mouvements, setMouvements] = useState<MouvementStock[]>([]);
  const [stats, setStats] = useState<MedicamentStatsType>({
    total: 0,
    disponible: 0,
    rupture: 0,
    stock_bas: 0,
    perime: 0,
    valeur_stock: 0
  });
  const [alertes, setAlertes] = useState<Medicament[]>([]);

  const [activeTab, setActiveTab] = useState<"stock" | "mouvements" | "alertes">("stock");
  const [filters, setFilters] = useState<MedicamentFilters>({
    searchTerm: "",
    categorie: "Tous",
    statut: "Tous",
    forme_pharmaceutique: "Tous"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | "mouvement" | null>(null);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [selectedMouvementType, setSelectedMouvementType] = useState<TypeMouvement>("Entrée");

  // Nouvo eta pou notifikasyon
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const itemsPerPage = 10;

  // Charger les données
  useEffect(() => {
    const init = async () => {
      await medicamentService.loadCategories(tenantId);
      await loadData();
    };
    init();
  }, [tenantId]);

  const loadData = async () => {
    const [medicamentsData, statsData, alertesData] = await Promise.all([
      medicamentService.obtenirTousMedicaments({ tenant: tenantId }),
      medicamentService.obtenirStatistiques(tenantId),
      medicamentService.obtenirAlertes(tenantId)
    ]);

    setMedicaments(medicamentsData);
    // Note: mouvementsData could be separate but for now we focus on medicaments
    setStats(statsData);
    setAlertes(alertesData);
  };

  // Empêcher le scroll du body quand un modal est ouvert
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

  // Filtrage des médicaments
  const safeMedicaments = Array.isArray(medicaments) ? medicaments : [];
  const filteredMedicaments = safeMedicaments.filter(medicament => {
    if (!medicament) return false;
    const matchesSearch =
      (medicament.nom?.toLowerCase() || "").includes(filters.searchTerm.toLowerCase()) ||
      (medicament.code_atc?.toLowerCase() || "").includes(filters.searchTerm.toLowerCase()) ||
      (medicament.dci?.toLowerCase() || "").includes(filters.searchTerm.toLowerCase()) ||
      (medicament.description?.toLowerCase() || "").includes(filters.searchTerm.toLowerCase());

    const matchesStatut = filters.statut === "Tous" || 
      (filters.statut === "Rupture" && medicament.statut_stock?.niveau === 'rupture') ||
      (filters.statut === "Stock bas" && medicament.statut_stock?.niveau === 'faible') ||
      (filters.statut === "Disponible" && medicament.statut_stock?.niveau === 'normal');

    const matchesForme = filters.forme_pharmaceutique === "Tous" || medicament.forme_pharmaceutique === filters.forme_pharmaceutique;

    return matchesSearch && matchesStatut && matchesForme;
  });

  // Pagination
  const _totalPages = Math.ceil(filteredMedicaments.length / itemsPerPage);
  const currentItems = filteredMedicaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gestion des actions
  const handleEdit = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setModalType("edit");
  };

  const handleView = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setModalType("view");
  };

  const handleDeleteClick = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setModalType("delete");
  };

  const handleDeleteConfirm = async () => {
    if (selectedMedicament) {
      const result = await medicamentService.supprimerMedicament(selectedMedicament.medicament_id);
      if (result.success) {
        setNotification({
          isOpen: true,
          title: 'Suppression réussie',
          message: `Le médicament "${selectedMedicament.nom}" a été supprimé avec succès.`,
          type: 'success'
        });
        await loadData();
        setModalType(null);
        setSelectedMedicament(null);
      } else {
        setNotification({
          isOpen: true,
          title: 'Erreur',
          message: result.errors?.join(', ') || 'Une erreur est survenue lors de la suppression',
          type: 'error'
        });
      }
    }
  };

  const handleAddMedicament = () => {
    setSelectedMedicament(null);
    setModalType("add");
  };

  const handleMouvement = (medicament: Medicament, type: TypeMouvement) => {
    setSelectedMedicament(medicament);
    setSelectedMouvementType(type);
    setModalType("mouvement");
  };

  const handleSaveMedicament = async () => {
    await loadData();
    closeModal();
  };

  const handleSaveMouvement = async () => {
    if (selectedMedicament) {
      setNotification({
        isOpen: true,
        title: 'Mouvement enregistré',
        message: `Mouvement de stock pour "${selectedMedicament.nom}" a été enregistré avec succès.`,
        type: 'success'
      });
    }
    await loadData();
    closeModal();
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMedicament(null);
  };

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (modalType) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [modalType]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

        {/* En-tête avec titre et boutons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Médicaments - {hopitalNom || "Mon Hôpital"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez le stock, les mouvements et les alertes des médicaments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Ajouter un médicament">
              <button
                onClick={handleAddMedicament}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Ajouter un Médicament
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Seksyon Estatistik */}
        <MedicamentStats medicaments={medicaments} />

        {/* Navigation par onglets */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "stock", name: "Stock", count: medicaments.length },
              { id: "mouvements", name: "Mouvements", count: mouvements.length },
              { id: "alertes", name: "Alertes", count: alertes.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-theme-sm font-medium ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 rounded-full px-2 py-1 text-xs ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, code, substance active..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-theme-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
              />
              <svg className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={filters.forme_pharmaceutique}
              onChange={(e) => setFilters(prev => ({ ...prev, forme_pharmaceutique: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              <option value="Tous">Toutes formes</option>
              {FORMES_PHARMACEUTIQUES.map(forme => (
                <option key={forme} value={forme}>{forme}</option>
              ))}
            </select>

            <select
              value={filters.statut}
              onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              <option value="Tous">Tous statuts</option>
              {STATUTS_MEDICAMENT.map(statut => (
                <option key={statut} value={statut}>{statut}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "stock" && (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Code
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Médicament
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Stock
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Péremption
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Prix
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {currentItems.map((medicament) => (
                  <TableRow key={medicament.medicament_id}>
                    <TableCell className="py-3">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {medicament.code_atc || '-'}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.nom}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {medicament.dosage_standard} • {medicament.forme_pharmaceutique}
                          </span>
                          {medicament.dci && (
                            <Badge size="sm" color="light">
                              {medicament.dci}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.stock_actuel}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                          <div
                            className={`h-2 rounded-full ${medicament.statut_stock?.niveau === 'rupture' ? 'bg-red-500' :
                              medicament.statut_stock?.niveau === 'faible' ? 'bg-orange-500' :
                                'bg-green-500'
                              }`}
                            style={{
                              width: `${Math.min(100, (medicament.stock_actuel / (medicament.stock_minimum * 2 || 100)) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          Min: {medicament.stock_minimum}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        size="sm"
                        color={
                          medicament.statut_stock?.niveau === 'normal' ? "success" :
                            medicament.statut_stock?.niveau === 'faible' ? "warning" :
                              medicament.statut_stock?.niveau === 'rupture' ? "error" : "light"
                        }
                      >
                        {medicament.statut_stock?.message || 'Inconnu'}
                      </Badge>
                      {medicament.necessite_ordonnance && (
                        <span className="ml-1">
                          <Badge size="sm" color="info">
                            Ordonnance
                          </Badge>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.created_at ? new Date(medicament.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.prix_unitaire ? parseFloat(medicament.prix_unitaire).toFixed(2) : '0.00'} €
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Tooltip text="Voir les détails">
                          <button
                            onClick={() => handleView(medicament)}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Modifier">
                          <button
                            onClick={() => handleEdit(medicament)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Entrée stock">
                          <button
                            onClick={() => handleMouvement(medicament, "Entrée" as TypeMouvement)}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Sortie stock">
                          <button
                            onClick={() => handleMouvement(medicament, "Sortie" as TypeMouvement)}
                            className="rounded p-1.5 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Supprimer">
                          <button
                            onClick={() => handleDeleteClick(medicament)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {_totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, _totalPages))}
                    disabled={currentPage === _totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredMedicaments.length)}
                      </span> sur <span className="font-medium">{filteredMedicaments.length}</span> médicaments
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Précédent</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {Array.from({ length: _totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === page
                            ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, _totalPages))}
                        disabled={currentPage === _totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Suivant</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "mouvements" && (
          <MouvementsTable mouvements={mouvements} medicaments={medicaments} />
        )}

        {activeTab === "alertes" && (
          <AlertesTable alertes={alertes} />
        )}
      </div>

      {/* Modal Medicament */}
      {(modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 h-[90vh] overflow-hidden">
            <MedicamentProgressForm
              tenantId={tenantId}
              onSave={async (formData, isModifying) => {
                if (isModifying && selectedMedicament) {
                  const result = await medicamentService.modifierMedicament(selectedMedicament.medicament_id, formData, tenantId);
                  if (result.success) {
                    setNotification({
                      isOpen: true,
                      title: 'Modification réussie',
                      message: 'Le médicament a été modifié avec succès.',
                      type: 'success'
                    });
                    await handleSaveMedicament();
                  } else {
                    setNotification({
                      isOpen: true,
                      title: 'Erreur',
                      message: result.errors?.join(', ') || 'Une erreur est survenue lors de la modification',
                      type: 'error'
                    });
                  }
                } else {
                  const result = await medicamentService.creerMedicament(formData, tenantId);
                  if (result.success) {
                    setNotification({
                      isOpen: true,
                      title: 'Création réussie',
                      message: 'Le médicament a été créé avec succès.',
                      type: 'success'
                    });
                    await handleSaveMedicament();
                  } else {
                    setNotification({
                      isOpen: true,
                      title: 'Erreur',
                      message: result.errors?.join(', ') || 'Une erreur est survenue lors de la création',
                      type: 'error'
                    });
                  }
                }
              }}
              onClose={closeModal}
              medicamentId={selectedMedicament?.medicament_id}
            />
          </div>
        </div>
      )}

      {modalType === "mouvement" && selectedMedicament && (
        <MouvementStockModal
          medicament={selectedMedicament}
          type={selectedMouvementType}
          onSave={handleSaveMouvement}
          onClose={closeModal}
        />
      )}

      {modalType === "delete" && selectedMedicament && (
        <DeleteModal
          medicament={selectedMedicament}
          onConfirm={handleDeleteConfirm}
          onClose={closeModal}
        />
      )}

      {modalType === "view" && selectedMedicament && (
        <ViewModal
          medicament={selectedMedicament}
          onClose={closeModal}
        />
      )}

      {/* Modal Notifikasyon - Itilize DeleteModal ki deja egziste a */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${notification.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                {notification.type === 'success' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600 dark:text-green-400">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600 dark:text-red-400">
                    <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {notification.title}
                </h3>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {notification.message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNotification({ isOpen: false, title: '', message: '', type: 'success' })}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour la table des mouvements
function MouvementsTable({ mouvements, medicaments }: { mouvements: MouvementStock[], medicaments: Medicament[] }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Référence
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Médicament
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Type
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Quantité
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Stock Avant/Après
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Date & Heure
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Utilisateur
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Motif
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {mouvements.map((mouvement) => {
            const medicament = medicaments.find(m => m.medicament_id === mouvement.medicament_id);
            return (
              <TableRow key={mouvement.mouvement_id}>
                <TableCell className="py-3">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {mouvement.reference}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {medicament?.nom} {medicament?.dosage_standard}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={
                      mouvement.type === "Entrée" ? "success" :
                        mouvement.type === "Sortie" ? "error" :
                          "warning"
                    }
                  >
                    {mouvement.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <p className={`font-medium text-theme-sm ${mouvement.type === "Entrée" ? 'text-green-600' :
                    mouvement.type === "Sortie" ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                    {mouvement.type === "Entrée" ? '+' : mouvement.type === "Sortie" ? '-' : ''}{mouvement.quantite}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {mouvement.stock_avant} → {mouvement.stock_apres}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <div>
                    <p className="text-gray-800 text-theme-sm dark:text-white/90">
                      {new Date(mouvement.date_mouvement).toLocaleDateString('fr-FR')}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {mouvement.heure_mouvement}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {mouvement.utilisateur}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {mouvement.motif}
                  </p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Composant pour la table des alertes
function AlertesTable({ alertes }: { alertes: Medicament[] }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Médicament
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Type Alerte
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Détails
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Priorité
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {alertes.map((medicament) => {
            const isPerime = medicament.date_peremption ? new Date(medicament.date_peremption) < new Date() : false;
            const isBientotPerime = medicament.date_peremption ? new Date(medicament.date_peremption) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;
            const isStockBas = medicament.statut === "Stock bas";
            const isRupture = medicament.statut === "Rupture";

            let typeAlerte = "";
            let priorite = "";
            let details = "";

            if (isPerime) {
              typeAlerte = "Péremption dépassée";
              priorite = "Haute";
              details = `Périmé depuis le ${medicament.date_peremption ? new Date(medicament.date_peremption).toLocaleDateString('fr-FR') : 'N/A'}`;
            } else if (isBientotPerime) {
              typeAlerte = "Péremption proche";
              priorite = "Moyenne";
              details = `Péremption le ${medicament.date_peremption ? new Date(medicament.date_peremption).toLocaleDateString('fr-FR') : 'N/A'}`;
            } else if (isRupture) {
              typeAlerte = "Rupture de stock";
              priorite = "Haute";
              details = `Stock: ${medicament.stock_actuel} (Min: ${medicament.stock_minimum})`;
            } else if (isStockBas) {
              typeAlerte = "Stock bas";
              priorite = "Moyenne";
              details = `Stock: ${medicament.stock_actuel} (Min: ${medicament.stock_minimum})`;
            }

            return (
              <TableRow key={medicament.medicament_id}>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {medicament.nom}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {medicament.dosage_standard} • {medicament.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={priorite === "Haute" ? "error" : "warning"}
                  >
                    {typeAlerte}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {details}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={priorite === "Haute" ? "error" : "warning"}
                  >
                    {priorite}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                    Commander
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Modal components (simplified versions)
function DeleteModal({ medicament, onConfirm, onClose }: { medicament: Medicament, onConfirm: () => void, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600 dark:text-red-400">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmer la suppression
            </h3>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer le médicament <strong>{medicament.nom}</strong> ({medicament.code}) ? Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal pou mouvement stock
function MouvementStockModal({
  medicament,
  type,
  onSave,
  onClose
}: {
  medicament: Medicament;
  type: TypeMouvement;
  onSave: () => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    quantite: 1,
    motif: '',
    reference: '',
    prix_unitaire: type === "Entrée" ? medicament.prix_achat || 0 : medicament.prix_vente || 0,
    date_peremption: medicament.date_peremption || '',
    lot_number: medicament.lot_number || '',
    fournisseur: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantite > 0 && formData.motif.trim()) {
      console.log('Mouvement de stock:', {
        medicament_id: medicament.medicament_id,
        type,
        ...formData
      });
      onSave();
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${type === "Entrée"
              ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
              }`}>
              {type === "Entrée" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6V18M12 18L7 13M12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {type === "Entrée" ? "Entrée de Stock" : "Sortie de Stock"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {medicament.nom} - {medicament.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations du médicament */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-2">Informations du stock</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Stock actuel:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {medicament.stock_actuel} {medicament.unite_stock}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Stock après:</span>
                  <p className={`font-medium ${type === "Entrée"
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-600 dark:text-orange-400"
                    }`}>
                    {type === "Entrée"
                      ? (medicament.stock_actuel || 0) + formData.quantite
                      : (medicament.stock_actuel || 0) - formData.quantite
                    } {medicament.unite_stock}
                  </p>
                </div>
              </div>
            </div>

            {/* Champs obligatoires */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantité <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={type === "Sortie" ? medicament.stock_actuel : undefined}
                  value={formData.quantite}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantite: parseInt(e.target.value) || 1 }))}
                  className={inputClass}
                  placeholder="Quantité"
                />
                {type === "Sortie" && formData.quantite > (medicament.stock_actuel || 0) && (
                  <p className="text-red-500 text-xs mt-1">
                    Stock insuffisant. Maximum: {medicament.stock_actuel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motif <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.motif}
                  onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Sélectionner un motif...</option>
                  {type === "Entrée" ? [
                    <option key="achat" value="Achat">Achat</option>,
                    <option key="don" value="Don">Don</option>,
                    <option key="retour" value="Retour">Retour patient</option>,
                    <option key="inventaire" value="Inventaire">Correction d'inventaire</option>,
                    <option key="autre" value="Autre">Autre</option>
                  ] : [
                    <option key="vente" value="Vente">Vente</option>,
                    <option key="prescription" value="Prescription">Prescription</option>,
                    <option key="perime" value="Périmé">Médicament périmé</option>,
                    <option key="perte" value="Perte">Perte/Casse</option>,
                    <option key="inventaire" value="Inventaire">Correction d'inventaire</option>,
                    <option key="autre" value="Autre">Autre</option>
                  ]}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className={inputClass}
                  placeholder="Numéro de facture, bon de commande..."
                />
              </div>
            </div>

            {/* Champs spécifiques pour entrée */}
            {type === "Entrée" && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-800 dark:text-white/90">Informations d'achat</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix unitaire (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prix_unitaire}
                    onChange={(e) => setFormData(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Numéro de lot
                    </label>
                    <input
                      type="text"
                      value={formData.lot_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, lot_number: e.target.value }))}
                      className={inputClass}
                      placeholder="Ex: LOT2024001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date péremption
                    </label>
                    <input
                      type="date"
                      value={formData.date_peremption}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_peremption: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={formData.fournisseur}
                    onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
                    className={inputClass}
                    placeholder="Nom du fournisseur"
                  />
                </div>

                {formData.prix_unitaire > 0 && formData.quantite > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Coût total: <span className="font-medium">{(formData.quantite * formData.prix_unitaire).toFixed(2)} €</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={formData.quantite <= 0 || !formData.motif.trim() || (type === "Sortie" && formData.quantite > (medicament.stock_actuel || 0))}
              className={`px-4 py-2.5 rounded-lg text-white font-medium transition-colors ${type === "Entrée"
                ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed"
                }`}
            >
              Confirmer {type}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ medicament, onClose }: { medicament: Medicament, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Détails du Médicament
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Informations générales */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Générales</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.code}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.nom}</p>
                </div>
                {medicament.nom_commercial && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nom commercial:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.nom_commercial}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Forme et dosage:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {medicament.forme_pharmaceutique} • {medicament.dosage_standard}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Substance active:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.substance_active}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">DCI:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.dci}</p>
                </div>
              </div>
            </div>

            {/* Informations stock */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Gestion du Stock</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stock actuel:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {medicament.stock_actuel} {medicament.unite_stock}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Seuils:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Min: {medicament.stock_minimum} | Max: {medicament.stock_maximum}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conditionnement:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {medicament.conditionnement || "Non spécifié"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                  <Badge
                    size="sm"
                    color={
                      medicament.statut === "Disponible" ? "success" :
                        medicament.statut === "Stock bas" ? "warning" :
                          medicament.statut === "Rupture" ? "error" :
                            medicament.statut === "Périmé" ? "error" : "light"
                    }
                  >
                    {medicament.statut}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}