import React, { useState, useEffect } from 'react';
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
import { MedicamentStats } from './components/MedicamentStats';
import {
  Medicament,
  MouvementStock,
  MedicamentFilters,
  TypeMouvement,
  STATUTS_MEDICAMENT,
  FORMES_PHARMACEUTIQUES
} from './types/MedicamentTypes';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  History, 
  AlertCircle, 
  Eye, 
  Pencil, 
  Trash, 
  PlusCircle, 
  MinusCircle, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
  Activity
} from 'lucide-react';
import { DeleteConfirmModal, NotificationToast, TableSkeleton } from '../../../components/shared';

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
  const [isLoading, setIsLoading] = useState(true);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'success' });

  const itemsPerPage = 10;

  useEffect(() => {
    const init = async () => {
      await medicamentService.loadCategories(tenantId);
      await loadData();
    };
    init();
  }, [tenantId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [medicamentsData, statsData, alertesData] = await Promise.all([
        medicamentService.obtenirTousMedicaments({ tenant: tenantId }),
        medicamentService.obtenirStatistiques(tenantId),
        medicamentService.obtenirAlertes(tenantId)
      ]);

      setMedicaments(medicamentsData as unknown as Medicament[]);
      setStats(statsData);
      setAlertes(alertesData as unknown as Medicament[]);
      
      // Load movements if on movements tab
      if (activeTab === 'mouvements') {
        const mvts = await medicamentService.obtenirMouvements(tenantId);
        setMouvements(mvts);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedicaments = (Array.isArray(medicaments) ? medicaments : []).filter(medicament => {
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

  const totalPages = Math.ceil(filteredMedicaments.length / itemsPerPage);
  const currentItems = filteredMedicaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleMouvement = (medicament: Medicament, type: TypeMouvement) => {
    setSelectedMedicament(medicament);
    setSelectedMouvementType(type);
    setModalType("mouvement");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMedicament(null);
  };

  return (
    <div className="min-h-screen pb-12 space-y-8">
      {/* Header Premium */}
      <div className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Pharmacie & Stocks
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Filiale: <span className="text-gray-700 dark:text-gray-200">{hopitalNom || "Hôpital Santé Plus"}</span>
            </p>
          </div>

          <button 
            onClick={() => { setSelectedMedicament(null); setModalType("add"); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Ajouter Médicament
          </button>
        </div>
      </div>

      <MedicamentStats medicaments={medicaments} />

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl rounded-2xl w-fit">
        {[
          { id: "stock", name: "Inventaire", icon: <Package className="w-4 h-4" /> },
          { id: "mouvements", name: "Historique", icon: <History className="w-4 h-4" /> },
          { id: "alertes", name: "Alertes Critiques", icon: <AlertCircle className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 dark:text-gray-400'
            }`}
          >
            {tab.icon}
            {tab.name}
            {tab.id === 'alertes' && alertes.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-lg bg-red-500 text-[10px] font-black text-white italic">
                {alertes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-sm overflow-hidden text-black dark:text-white">
        {activeTab === "stock" && (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, substance active, code..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filters.forme_pharmaceutique}
                      onChange={(e) => setFilters(prev => ({ ...prev, forme_pharmaceutique: e.target.value }))}
                      className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none uppercase tracking-tight"
                    >
                      <option value="Tous">Toutes les formes</option>
                      {FORMES_PHARMACEUTIQUES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <select
                      value={filters.statut}
                      onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                      className="bg-transparent border-none text-sm font-bold focus:ring-0 outline-none uppercase tracking-tight"
                    >
                      <option value="Tous">Tous les niveaux</option>
                      {STATUTS_MEDICAMENT.map(s => <option key={s} value={s}>{s}</option>)}
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
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Identité</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Stockage</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Péremption</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Finance</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                    {currentItems.map((medicament) => {
                      const level = medicament.statut_stock?.niveau || 'normal';
                      return (
                        <TableRow key={medicament.medicament_id} className="group hover:bg-white/60 dark:hover:bg-white/[0.03] transition-all">
                          <TableCell className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/30 transition-transform group-hover:scale-110">
                                <Package className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-tight">{medicament.nom}</span>
                                <span className="text-[10px] font-bold text-gray-400 italic">DCI: {medicament.dci || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-6">
                            <div className="flex flex-col gap-2 w-32">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                <span className={level === 'rupture' ? 'text-red-500' : level === 'faible' ? 'text-orange-500' : 'text-emerald-500'}>
                                  {medicament.stock_actuel} unités
                                </span>
                                <span className="text-gray-400">Min: {medicament.stock_minimum}</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-700 ${level === 'rupture' ? 'bg-red-500' : level === 'faible' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(100, (medicament.stock_actuel / (medicament.stock_minimum * 3 || 10)) * 100)}%` }}
                                ></div>
                              </div>
                              <Badge variant="light" size="sm" color={level === 'rupture' ? 'error' : level === 'faible' ? 'warning' : 'success'}>
                                {level.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm font-black italic">
                                {(medicament as any).date_peremption ? new Date((medicament as any).date_peremption).toLocaleDateString('fr-FR') : '—'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-6">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {Number(medicament.prix_unitaire).toLocaleString('fr-FR')} HTG
                            </span>
                          </TableCell>
                          <TableCell className="py-5 px-6 text-right">
                            <div className="flex justify-end gap-2 transition-all duration-300">
                              <Tooltip text="Entrée Stock">
                                <button onClick={() => handleMouvement(medicament, "Entrée")} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all"><PlusCircle className="w-4 h-4" /></button>
                              </Tooltip>
                              <Tooltip text="Sortie Stock">
                                <button onClick={() => handleMouvement(medicament, "Sortie")} className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all"><MinusCircle className="w-4 h-4" /></button>
                              </Tooltip>
                              <Tooltip text="Modifier">
                                <button onClick={() => handleEdit(medicament)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Pencil className="w-4 h-4" /></button>
                              </Tooltip>
                              <Tooltip text="Supprimer">
                                <button onClick={() => handleDeleteClick(medicament)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash className="w-4 h-4" /></button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination Premium */}
            {totalPages > 1 && !isLoading && (
              <div className="p-6 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/30 dark:bg-transparent flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">
                  Items { (currentPage-1)*itemsPerPage + 1 } - { Math.min(currentPage*itemsPerPage, filteredMedicaments.length) } sur {filteredMedicaments.length}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-600/20">
                    {currentPage} / {totalPages}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "mouvements" && (
          <div className="p-0">
            <div className="p-6 border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                Historique des Mouvements
              </h3>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temps Réel</div>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                    <TableRow>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date & Heure</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Médicament</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Type</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Quantité</TableCell>
                      <TableCell isHeader className="py-4 px-6 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Auteur</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mouvements.length > 0 ? mouvements.map((mvt) => (
                      <TableRow key={mvt.mouvement_id} className="hover:bg-white/60 dark:hover:bg-white/[0.03]">
                        <TableCell className="py-4 px-6 font-medium text-xs">
                          {new Date(mvt.date_mouvement).toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell className="py-4 px-6 font-black uppercase text-xs tracking-tight">
                          {medicaments.find(m => m.medicament_id === mvt.medicament)?.nom || 'Inconnu'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge color={mvt.type_mouvement === 'Entrée' ? 'success' : 'warning'} size="sm">
                            {mvt.type_mouvement.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 font-black italic text-emerald-600">
                          {mvt.type_mouvement === 'Entrée' ? '+' : '-'}{mvt.quantite}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-xs font-bold text-gray-500">
                          Utilisateur #{mvt.cree_par}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-20 text-center">
                          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">Aucun mouvement enregistré.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}

        {activeTab === "alertes" && (
          <div className="p-0">
             <div className="p-6 border-b border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Alertes Critiques
              </h3>
              <Badge color="error" size="sm" variant="light">{alertes.length} CRITIQUE</Badge>
            </div>
            <div className="p-6">
              {alertes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alertes.map(alerte => (
                    <div key={alerte.medicament_id} className="p-5 rounded-[2rem] bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 text-red-600 shadow-sm">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black uppercase text-sm tracking-tight">{alerte.nom}</h4>
                          <span className="text-[10px] font-bold text-red-600/70">{alerte.statut_stock?.message || 'Niveau critique'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end border-t border-red-100 dark:border-red-900/20 pt-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Actuel</p>
                          <p className="text-2xl font-black text-red-600">{alerte.stock_actuel}</p>
                        </div>
                        <button 
                          onClick={() => handleMouvement(alerte, "Entrée")}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Réapprovisionner
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500/20 mb-4" />
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">Tout est en ordre</h3>
                  <p className="text-gray-500 dark:text-gray-400">Aucune alerte de stock ou péremption détectée.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals Section */}
      {(modalType === "add" || modalType === "edit") && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-4xl h-[90vh] overflow-hidden shadow-2xl border border-white/10">
            <MedicamentProgressForm
              tenantId={tenantId}
              onSave={async (formData, isModifying) => {
                const result = isModifying && selectedMedicament 
                  ? await medicamentService.modifierMedicament(selectedMedicament.medicament_id, formData, tenantId)
                  : await medicamentService.creerMedicament(formData, tenantId);
                
                if (result.success) {
                  setNotification({ isOpen: true, title: 'Opération Réussie', message: 'L\'inventaire a été mis à jour.', type: 'success' });
                  await loadData();
                  closeModal();
                } else {
                  setNotification({ isOpen: true, title: 'Erreur', message: result.errors?.join(', ') || 'Échec de l\'opération', type: 'error' });
                }
              }}
              onClose={closeModal}
              medicamentId={selectedMedicament?.medicament_id}
            />
          </div>
        </div>
      )}

      {/* Shared Modals & Toast */}
      <DeleteConfirmModal
        isOpen={modalType === 'delete'}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
        title="Supprimer Médicament"
        message={`Voulez-vous vraiment retirer "${selectedMedicament?.nom}" de l'inventaire ?`}
        entityName="Médicament"
        entityId={selectedMedicament?.medicament_id}
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
}

// Logic for Mouvements and Alertes would follow similar pattern in separate components or here.