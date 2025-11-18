import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useState, useEffect } from "react";

// Interface TypeScript pou done medikaman
interface Medicament {
  id: number;
  code: string;
  nom: string;
  nomCommercial?: string;
  formePharmaceutique: "Comprimé" | "Gélule" | "Sirop" | "Injectable" | "Crème" | "Pommade" | "Suppositoire" | "Collyre" | "Aérosol" | "Autre";
  dosage: string;
  laboratoire: string;
  categorieTherapeutique: string;
  substanceActive: string;
  dci: string; // Dénomination Commune Internationale
  
  // Gestion stock
  stockActuel: number;
  stockMinimum: number;
  stockMaximum: number;
  uniteStock: "Boîte" | "Flacon" | "Ampoule" | "Tube" | "Sachet" | "Unité";
  quantiteParUnite: number;
  
  // Informations supplémentaires
  conditionnement: string;
  codeCIP?: string;
  prixAchat: number;
  prixVente: number;
  tva: number;
  
  // Dates importantes
  datePeremption: string;
  dateFabrication?: string;
  dateEntreeStock: string;
  
  // Statut et contrôle
  statut: "Disponible" | "Rupture" | "Stock bas" | "Périmé" | "Retiré";
  besoinOrdonnance: boolean;
  classeTherapeutique: "Classe A" | "Classe B" | "Classe C" | "Stupéfiant";
  conditionsConservation: "Ambiance" | "Frigo" | "Congélateur" | "Protégé lumière";
  
  // Sécurité
  lotNumber?: string;
  numeroAutorisation?: string;
  paysFabrication: string;
  
  // Historique
  dernierMouvement?: string;
  quantiteDernierMouvement?: number;
  typeDernierMouvement?: "Entrée" | "Sortie" | "Ajustement";
}

// Interface pour mouvements stock
interface MouvementStock {
  id: number;
  medicamentId: number;
  type: "Entrée" | "Sortie" | "Ajustement" | "Inventaire";
  quantite: number;
  dateMouvement: string;
  heureMouvement: string;
  reference: string;
  motif: string;
  utilisateur: string;
  stockAvant: number;
  stockApres: number;
  coutUnitaire?: number;
  total?: number;
  destination?: string; // Pour les sorties
  fournisseur?: string; // Pour les entrées
  numeroLot?: string;
  datePeremption?: string;
}

// Types et constantes
const FORMES_PHARMACEUTIQUES = [
  "Comprimé", "Gélule", "Sirop", "Injectable", "Crème", 
  "Pommade", "Suppositoire", "Collyre", "Aérosol", "Autre"
] as const;

const UNITES_STOCK = [
  "Boîte", "Flacon", "Ampoule", "Tube", "Sachet", "Unité"
] as const;

const STATUTS_MEDICAMENT = [
  "Disponible", "Rupture", "Stock bas", "Périmé", "Retiré"
] as const;

const CLASSES_THERAPEUTIQUES = [
  "Classe A", "Classe B", "Classe C", "Stupéfiant"
] as const;

const CONDITIONS_CONSERVATION = [
  "Ambiance", "Frigo", "Congélateur", "Protégé lumière"
] as const;

const TYPES_MOUVEMENT = [
  "Entrée", "Sortie", "Ajustement", "Inventaire"
] as const;

// Catégories thérapeutiques communes
const CATEGORIES_THERAPEUTIQUES = [
  "Analgésique",
  "Antibiotique",
  "Antihypertenseur",
  "Antidiabétique",
  "Anti-inflammatoire",
  "Psychotrope",
  "Cardiovasculaire",
  "Digestif",
  "Dermatologique",
  "Vitamines",
  "Vaccins",
  "Autre"
];

// Données initiales medikaman
const initialMedicamentsData: Medicament[] = [
  {
    id: 1,
    code: "MED20240001",
    nom: "Paracétamol",
    nomCommercial: "Doliprane",
    formePharmaceutique: "Comprimé",
    dosage: "500 mg",
    laboratoire: "Sanofi",
    categorieTherapeutique: "Analgésique",
    substanceActive: "Paracétamol",
    dci: "Paracetamol",
    stockActuel: 150,
    stockMinimum: 50,
    stockMaximum: 500,
    uniteStock: "Boîte",
    quantiteParUnite: 20,
    conditionnement: "Boîte de 20 comprimés",
    codeCIP: "3400934567890",
    prixAchat: 2.50,
    prixVente: 3.50,
    tva: 10,
    datePeremption: "2024-12-15",
    dateFabrication: "2023-12-15",
    dateEntreeStock: "2024-01-20",
    statut: "Disponible",
    besoinOrdonnance: false,
    classeTherapeutique: "Classe A",
    conditionsConservation: "Ambiance",
    lotNumber: "LOT12345",
    numeroAutorisation: "AUT20240001",
    paysFabrication: "France",
    dernierMouvement: "2024-01-25",
    quantiteDernierMouvement: 50,
    typeDernierMouvement: "Entrée"
  },
  {
    id: 2,
    code: "MED20240002",
    nom: "Amoxicilline",
    nomCommercial: "Clamoxyl",
    formePharmaceutique: "Gélule",
    dosage: "500 mg",
    laboratoire: "GSK",
    categorieTherapeutique: "Antibiotique",
    substanceActive: "Amoxicilline",
    dci: "Amoxicillin",
    stockActuel: 45,
    stockMinimum: 30,
    stockMaximum: 200,
    uniteStock: "Boîte",
    quantiteParUnite: 12,
    conditionnement: "Boîte de 12 gélules",
    codeCIP: "3400934567891",
    prixAchat: 8.50,
    prixVente: 12.00,
    tva: 10,
    datePeremption: "2024-06-30",
    dateEntreeStock: "2024-01-15",
    statut: "Stock bas",
    besoinOrdonnance: true,
    classeTherapeutique: "Classe B",
    conditionsConservation: "Ambiance",
    lotNumber: "LOT12346",
    numeroAutorisation: "AUT20240002",
    paysFabrication: "France",
    dernierMouvement: "2024-01-20",
    quantiteDernierMouvement: 20,
    typeDernierMouvement: "Sortie"
  },
  {
    id: 3,
    code: "MED20240003",
    nom: "Insuline",
    nomCommercial: "Lantus",
    formePharmaceutique: "Injectable",
    dosage: "100 UI/ml",
    laboratoire: "Sanofi",
    categorieTherapeutique: "Antidiabétique",
    substanceActive: "Insuline glargine",
    dci: "Insulin glargine",
    stockActuel: 25,
    stockMinimum: 20,
    stockMaximum: 100,
    uniteStock: "Flacon",
    quantiteParUnite: 1,
    conditionnement: "Flacon de 10 ml",
    codeCIP: "3400934567892",
    prixAchat: 45.00,
    prixVente: 60.00,
    tva: 10,
    datePeremption: "2024-03-31",
    dateEntreeStock: "2024-01-10",
    statut: "Disponible",
    besoinOrdonnance: true,
    classeTherapeutique: "Classe C",
    conditionsConservation: "Frigo",
    lotNumber: "LOT12347",
    numeroAutorisation: "AUT20240003",
    paysFabrication: "Allemagne",
    dernierMouvement: "2024-01-18",
    quantiteDernierMouvement: 5,
    typeDernierMouvement: "Sortie"
  },
  {
    id: 4,
    code: "MED20240004",
    nom: "Morphine",
    formePharmaceutique: "Injectable",
    dosage: "10 mg/ml",
    laboratoire: "Aguettant",
    categorieTherapeutique: "Analgésique",
    substanceActive: "Chlorhydrate de morphine",
    dci: "Morphine hydrochloride",
    stockActuel: 8,
    stockMinimum: 5,
    stockMaximum: 50,
    uniteStock: "Ampoule",
    quantiteParUnite: 1,
    conditionnement: "Ampoule de 1 ml",
    codeCIP: "3400934567893",
    prixAchat: 12.00,
    prixVente: 15.00,
    tva: 10,
    datePeremption: "2024-09-30",
    dateEntreeStock: "2024-01-05",
    statut: "Stock bas",
    besoinOrdonnance: true,
    classeTherapeutique: "Stupéfiant",
    conditionsConservation: "Ambiance",
    lotNumber: "LOT12348",
    numeroAutorisation: "AUT20240004",
    paysFabrication: "France",
    dernierMouvement: "2024-01-22",
    quantiteDernierMouvement: 2,
    typeDernierMouvement: "Sortie"
  }
];

// Données initiales mouvements stock
const initialMouvementsData: MouvementStock[] = [
  {
    id: 1,
    medicamentId: 1,
    type: "Entrée",
    quantite: 100,
    dateMouvement: "2024-01-20",
    heureMouvement: "09:30",
    reference: "ENT20240001",
    motif: "Commande initiale",
    utilisateur: "Dr. Marie Laurent",
    stockAvant: 0,
    stockApres: 100,
    coutUnitaire: 2.50,
    total: 250.00,
    fournisseur: "Pharmacie Centrale",
    numeroLot: "LOT12345",
    datePeremption: "2024-12-15"
  },
  {
    id: 2,
    medicamentId: 1,
    type: "Sortie",
    quantite: 50,
    dateMouvement: "2024-01-25",
    heureMouvement: "14:15",
    reference: "SORT20240001",
    motif: "Dispensation consultation",
    utilisateur: "Inf. Sophie Martin",
    stockAvant: 100,
    stockApres: 50,
    destination: "Pharmacie interne"
  },
  {
    id: 3,
    medicamentId: 2,
    type: "Entrée",
    quantite: 65,
    dateMouvement: "2024-01-15",
    heureMouvement: "11:00",
    reference: "ENT20240002",
    motif: "Réapprovisionnement",
    utilisateur: "Dr. Jean Dubois",
    stockAvant: 0,
    stockApres: 65,
    coutUnitaire: 8.50,
    total: 552.50,
    fournisseur: "Grossiste Médical",
    numeroLot: "LOT12346",
    datePeremption: "2024-06-30"
  }
];

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

// Composant principal
export default function GestionMedicaments() {
  const [medicaments, setMedicaments] = useState<Medicament[]>(initialMedicamentsData);
  const [mouvements, setMouvements] = useState<MouvementStock[]>(initialMouvementsData);
  const [activeTab, setActiveTab] = useState<"stock" | "mouvements" | "alertes">("stock");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("Tous");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | "mouvement" | null>(null);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [selectedMouvementType, setSelectedMouvementType] = useState<"Entrée" | "Sortie" | "Ajustement">("Entrée");
  const itemsPerPage = 10;

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

  // Calcul des statistiques
  const stats = {
    total: medicaments.length,
    disponible: medicaments.filter(m => m.statut === "Disponible").length,
    rupture: medicaments.filter(m => m.statut === "Rupture").length,
    stockBas: medicaments.filter(m => m.statut === "Stock bas").length,
    perime: medicaments.filter(m => m.statut === "Périmé").length,
    valeurStock: medicaments.reduce((total, med) => total + (med.stockActuel * med.prixAchat), 0)
  };

  // Alertes automatiques
  const alertes = medicaments.filter(med => {
    const datePeremption = new Date(med.datePeremption);
    const aujourdhui = new Date();
    const trenteJours = new Date(aujourdhui.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return med.statut === "Stock bas" || 
           med.statut === "Rupture" || 
           med.statut === "Périmé" ||
           datePeremption < trenteJours;
  });

  // Filtrage des médicaments
  const filteredMedicaments = medicaments.filter(medicament => {
    const matchesSearch =
      medicament.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicament.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicament.nomCommercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicament.substanceActive.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = selectedCategorie === "Tous" || medicament.categorieTherapeutique === selectedCategorie;
    const matchesStatut = selectedStatut === "Tous" || medicament.statut === selectedStatut;

    return matchesSearch && matchesCategorie && matchesStatut;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMedicaments.length / itemsPerPage);
  const currentItems = filteredMedicaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Catégories et statuts uniques pour les filtres
  const categories = ["Tous", ...new Set(medicaments.map(med => med.categorieTherapeutique))];
  const statuts = ["Tous", ...new Set(medicaments.map(med => med.statut))];

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

  const handleDeleteConfirm = () => {
    if (selectedMedicament) {
      setMedicaments(medicaments.filter(med => med.id !== selectedMedicament.id));
      setModalType(null);
      setSelectedMedicament(null);
    }
  };

  const handleAddMedicament = () => {
    setSelectedMedicament(null);
    setModalType("add");
  };

  const handleMouvement = (medicament: Medicament, type: "Entrée" | "Sortie" | "Ajustement") => {
    setSelectedMedicament(medicament);
    setSelectedMouvementType(type);
    setModalType("mouvement");
  };

  const handleSaveMedicament = (medicamentData: Omit<Medicament, "id">) => {
    // Mettre à jour le statut basé sur le stock
    let statut: Medicament["statut"] = "Disponible";
    if (medicamentData.stockActuel <= 0) {
      statut = "Rupture";
    } else if (medicamentData.stockActuel <= medicamentData.stockMinimum) {
      statut = "Stock bas";
    }
    
    // Vérifier la date de péremption
    const datePeremption = new Date(medicamentData.datePeremption);
    if (datePeremption < new Date()) {
      statut = "Périmé";
    }

    const updatedData = { ...medicamentData, statut };

    if (modalType === "edit" && selectedMedicament) {
      // Modification
      setMedicaments(medicaments.map(medicament =>
        medicament.id === selectedMedicament.id ? { ...updatedData, id: selectedMedicament.id } : medicament
      ));
    } else {
      // Ajout
      const newMedicament = {
        ...updatedData,
        id: Math.max(...medicaments.map(m => m.id)) + 1,
        code: `MED${new Date().getFullYear()}${String(medicaments.length + 1).padStart(4, '0')}`,
        dateEntreeStock: new Date().toISOString().split('T')[0]
      };
      setMedicaments([...medicaments, newMedicament]);
    }
    setModalType(null);
    setSelectedMedicament(null);
  };

  const handleSaveMouvement = (mouvementData: Omit<MouvementStock, "id">) => {
    const newMouvement = {
      ...mouvementData,
      id: Math.max(...mouvements.map(m => m.id)) + 1,
      reference: `${mouvementData.type === 'Entrée' ? 'ENT' : mouvementData.type === 'Sortie' ? 'SORT' : 'AJUST'}${new Date().getFullYear()}${String(mouvements.length + 1).padStart(4, '0')}`
    };

    // Mettre à jour le stock du médicament
    setMedicaments(medicaments.map(med => {
      if (med.id === mouvementData.medicamentId) {
        const nouveauStock = mouvementData.type === 'Entrée' 
          ? med.stockActuel + mouvementData.quantite
          : mouvementData.type === 'Sortie'
          ? med.stockActuel - mouvementData.quantite
          : mouvementData.quantite;

        // Mettre à jour le statut
        let statut: Medicament["statut"] = "Disponible";
        if (nouveauStock <= 0) {
          statut = "Rupture";
        } else if (nouveauStock <= med.stockMinimum) {
          statut = "Stock bas";
        }

        return {
          ...med,
          stockActuel: nouveauStock,
          statut,
          dernierMouvement: new Date().toISOString().split('T')[0],
          quantiteDernierMouvement: mouvementData.quantite,
          typeDernierMouvement: mouvementData.type
        };
      }
      return med;
    }));

    setMouvements([...mouvements, newMouvement]);
    setModalType(null);
    setSelectedMedicament(null);
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
              Gestion des Médicaments
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez le stock, les mouvements et les alertes des médicaments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Nouveau médicament">
              <button
                onClick={handleAddMedicament}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Nouveau Médicament
              </button>
            </Tooltip>
          </div>
        </div>

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
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-theme-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 rounded-full px-2 py-1 text-xs ${
                    activeTab === tab.id
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

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Médicaments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.disponible}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Bas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stockBas}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rupture</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rupture}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Périmés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.perime}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.valeurStock.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, code, substance active..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-theme-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
              />
              <svg className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={selectedCategorie}
              onChange={(e) => setSelectedCategorie(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {categories.map(categorie => (
                <option key={categorie} value={categorie}>{categorie}</option>
              ))}
            </select>

            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {statuts.map(statut => (
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
                  <TableRow key={medicament.id}>
                    <TableCell className="py-3">
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {medicament.code}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.nom}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {medicament.dosage} • {medicament.formePharmaceutique}
                          </span>
                          {medicament.nomCommercial && (
                            <Badge size="sm" color="light">
                              {medicament.nomCommercial}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.stockActuel} {medicament.uniteStock}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              medicament.statut === "Rupture" ? 'bg-red-500' :
                              medicament.statut === "Stock bas" ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (medicament.stockActuel / medicament.stockMaximum) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          Min: {medicament.stockMinimum} | Max: {medicament.stockMaximum}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
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
                      {medicament.besoinOrdonnance && (
                        <Badge size="sm" color="info" className="ml-1">
                          Ordonnance
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="text-gray-800 text-theme-sm dark:text-white/90">
                          {new Date(medicament.datePeremption).toLocaleDateString('fr-FR')}
                        </p>
                        {new Date(medicament.datePeremption) < new Date() && (
                          <span className="text-red-500 text-theme-xs">Périmé</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="text-gray-800 text-theme-sm dark:text-white/90">
                          {medicament.prixVente.toFixed(2)} €
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          Achat: {medicament.prixAchat.toFixed(2)} €
                        </span>
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
                              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Modifier">
                          <button
                            onClick={() => handleEdit(medicament)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Entrée stock">
                          <button
                            onClick={() => handleMouvement(medicament, "Entrée")}
                            className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Sortie stock">
                          <button
                            onClick={() => handleMouvement(medicament, "Sortie")}
                            className="rounded p-1.5 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </Tooltip>
                        <Tooltip text="Supprimer">
                          <button
                            onClick={() => handleDeleteClick(medicament)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
            {totalPages > 1 && (
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
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

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
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

      {/* Modals overlay */}
      {modalType && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full ${modalType === 'delete' ? 'max-w-md' : 'max-w-4xl'} max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "add" || modalType === "edit" ? (
              <MedicamentModalContent
                medicament={selectedMedicament}
                onSave={handleSaveMedicament}
                onClose={closeModal}
                mode={modalType}
              />
            ) : modalType === "delete" && selectedMedicament ? (
              <DeleteModalContent
                medicament={selectedMedicament}
                onConfirm={handleDeleteConfirm}
                onClose={closeModal}
              />
            ) : modalType === "view" && selectedMedicament ? (
              <ViewModalContent
                medicament={selectedMedicament}
                onClose={closeModal}
              />
            ) : modalType === "mouvement" && selectedMedicament ? (
              <MouvementModalContent
                medicament={selectedMedicament}
                type={selectedMouvementType}
                onSave={handleSaveMouvement}
                onClose={closeModal}
              />
            ) : null}
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
            const medicament = medicaments.find(m => m.id === mouvement.medicamentId);
            return (
              <TableRow key={mouvement.id}>
                <TableCell className="py-3">
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {mouvement.reference}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {medicament?.nom} {medicament?.dosage}
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
                  <p className={`font-medium text-theme-sm ${
                    mouvement.type === "Entrée" ? 'text-green-600' :
                    mouvement.type === "Sortie" ? 'text-red-600' :
                    'text-orange-600'
                  }`}>
                    {mouvement.type === "Entrée" ? '+' : mouvement.type === "Sortie" ? '-' : ''}{mouvement.quantite}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-gray-800 text-theme-sm dark:text-white/90">
                    {mouvement.stockAvant} → {mouvement.stockApres}
                  </p>
                </TableCell>
                <TableCell className="py-3">
                  <div>
                    <p className="text-gray-800 text-theme-sm dark:text-white/90">
                      {new Date(mouvement.dateMouvement).toLocaleDateString('fr-FR')}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {mouvement.heureMouvement}
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
            const isPerime = new Date(medicament.datePeremption) < new Date();
            const isBientotPerime = new Date(medicament.datePeremption) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const isStockBas = medicament.statut === "Stock bas";
            const isRupture = medicament.statut === "Rupture";

            let typeAlerte = "";
            let priorite = "";
            let details = "";

            if (isPerime) {
              typeAlerte = "Péremption dépassée";
              priorite = "Haute";
              details = `Périmé depuis le ${new Date(medicament.datePeremption).toLocaleDateString('fr-FR')}`;
            } else if (isBientotPerime) {
              typeAlerte = "Péremption proche";
              priorite = "Moyenne";
              details = `Péremption le ${new Date(medicament.datePeremption).toLocaleDateString('fr-FR')}`;
            } else if (isRupture) {
              typeAlerte = "Rupture de stock";
              priorite = "Haute";
              details = `Stock: ${medicament.stockActuel} (Min: ${medicament.stockMinimum})`;
            } else if (isStockBas) {
              typeAlerte = "Stock bas";
              priorite = "Moyenne";
              details = `Stock: ${medicament.stockActuel} (Min: ${medicament.stockMinimum})`;
            }

            return (
              <TableRow key={medicament.id}>
                <TableCell className="py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {medicament.nom}
                    </p>
                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {medicament.dosage} • {medicament.code}
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

// Composant Modal pour ajouter/modifier un médicament
interface MedicamentModalProps {
  medicament: Medicament | null;
  onSave: (medicamentData: Omit<Medicament, "id">) => void;
  onClose: () => void;
  mode: "add" | "edit";
}

function MedicamentModalContent({ medicament, onSave, onClose, mode }: MedicamentModalProps) {
  const [formData, setFormData] = useState({
    code: medicament?.code || "",
    nom: medicament?.nom || "",
    nomCommercial: medicament?.nomCommercial || "",
    formePharmaceutique: medicament?.formePharmaceutique || "Comprimé",
    dosage: medicament?.dosage || "",
    laboratoire: medicament?.laboratoire || "",
    categorieTherapeutique: medicament?.categorieTherapeutique || "Analgésique",
    substanceActive: medicament?.substanceActive || "",
    dci: medicament?.dci || "",
    stockActuel: medicament?.stockActuel || 0,
    stockMinimum: medicament?.stockMinimum || 10,
    stockMaximum: medicament?.stockMaximum || 100,
    uniteStock: medicament?.uniteStock || "Boîte",
    quantiteParUnite: medicament?.quantiteParUnite || 1,
    conditionnement: medicament?.conditionnement || "",
    codeCIP: medicament?.codeCIP || "",
    prixAchat: medicament?.prixAchat || 0,
    prixVente: medicament?.prixVente || 0,
    tva: medicament?.tva || 10,
    datePeremption: medicament?.datePeremption || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateFabrication: medicament?.dateFabrication || "",
    dateEntreeStock: medicament?.dateEntreeStock || new Date().toISOString().split('T')[0],
    statut: medicament?.statut || "Disponible",
    besoinOrdonnance: medicament?.besoinOrdonnance || false,
    classeTherapeutique: medicament?.classeTherapeutique || "Classe A",
    conditionsConservation: medicament?.conditionsConservation || "Ambiance",
    lotNumber: medicament?.lotNumber || "",
    numeroAutorisation: medicament?.numeroAutorisation || "",
    paysFabrication: medicament?.paysFabrication || "",
    dernierMouvement: medicament?.dernierMouvement || "",
    quantiteDernierMouvement: medicament?.quantiteDernierMouvement || 0,
    typeDernierMouvement: medicament?.typeDernierMouvement || "Entrée"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du médicament est obligatoire";
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "Le dosage est obligatoire";
    }

    if (formData.stockActuel < 0) {
      newErrors.stockActuel = "Le stock ne peut pas être négatif";
    }

    if (formData.stockMinimum < 0) {
      newErrors.stockMinimum = "Le stock minimum ne peut pas être négatif";
    }

    if (formData.stockMaximum <= formData.stockMinimum) {
      newErrors.stockMaximum = "Le stock maximum doit être supérieur au stock minimum";
    }

    if (formData.prixAchat < 0) {
      newErrors.prixAchat = "Le prix d'achat ne peut pas être négatif";
    }

    if (formData.prixVente < formData.prixAchat) {
      newErrors.prixVente = "Le prix de vente doit être supérieur ou égal au prix d'achat";
    }

    if (!formData.datePeremption) {
      newErrors.datePeremption = "La date de péremption est obligatoire";
    } else {
      const peremption = new Date(formData.datePeremption);
      if (peremption < new Date()) {
        newErrors.datePeremption = "La date de péremption est déjà passée";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getFieldError = (fieldName: string) => {
    return errors[fieldName] ? (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "edit" ? "Modifier le Médicament" : "Nouveau Médicament"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations générales */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Informations Générales
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du médicament *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.nom ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {getFieldError('nom')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom commercial
                </label>
                <input
                  type="text"
                  value={formData.nomCommercial}
                  onChange={(e) => handleInputChange('nomCommercial', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Forme pharmaceutique *
                </label>
                <select
                  value={formData.formePharmaceutique}
                  onChange={(e) => handleInputChange('formePharmaceutique', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {FORMES_PHARMACEUTIQUES.map(forme => (
                    <option key={forme} value={forme}>{forme}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.dosage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {getFieldError('dosage')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Substance active *
                </label>
                <input
                  type="text"
                  value={formData.substanceActive}
                  onChange={(e) => handleInputChange('substanceActive', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DCI *
                </label>
                <input
                  type="text"
                  value={formData.dci}
                  onChange={(e) => handleInputChange('dci', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Gestion du stock */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Gestion du Stock
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock actuel *
                </label>
                <input
                  type="number"
                  value={formData.stockActuel}
                  onChange={(e) => handleInputChange('stockActuel', parseInt(e.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.stockActuel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="0"
                  required
                />
                {getFieldError('stockActuel')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock minimum *
                </label>
                <input
                  type="number"
                  value={formData.stockMinimum}
                  onChange={(e) => handleInputChange('stockMinimum', parseInt(e.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.stockMinimum ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="0"
                  required
                />
                {getFieldError('stockMinimum')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock maximum *
                </label>
                <input
                  type="number"
                  value={formData.stockMaximum}
                  onChange={(e) => handleInputChange('stockMaximum', parseInt(e.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.stockMaximum ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="1"
                  required
                />
                {getFieldError('stockMaximum')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unité de stock
                </label>
                <select
                  value={formData.uniteStock}
                  onChange={(e) => handleInputChange('uniteStock', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {UNITES_STOCK.map(unite => (
                    <option key={unite} value={unite}>{unite}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conditionnement
                </label>
                <input
                  type="text"
                  value={formData.conditionnement}
                  onChange={(e) => handleInputChange('conditionnement', e.target.value)}
                  placeholder="Ex: Boîte de 20 comprimés"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité par unité
                </label>
                <input
                  type="number"
                  value={formData.quantiteParUnite}
                  onChange={(e) => handleInputChange('quantiteParUnite', parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Informations financières */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Informations Financières
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix d'achat (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prixAchat}
                  onChange={(e) => handleInputChange('prixAchat', parseFloat(e.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.prixAchat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="0"
                  required
                />
                {getFieldError('prixAchat')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix de vente (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prixVente}
                  onChange={(e) => handleInputChange('prixVente', parseFloat(e.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.prixVente ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="0"
                  required
                />
                {getFieldError('prixVente')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  TVA (%)
                </label>
                <input
                  type="number"
                  value={formData.tva}
                  onChange={(e) => handleInputChange('tva', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Sécurité et réglementation */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Sécurité et Réglementation
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie thérapeutique
                </label>
                <select
                  value={formData.categorieTherapeutique}
                  onChange={(e) => handleInputChange('categorieTherapeutique', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {CATEGORIES_THERAPEUTIQUES.map(categorie => (
                    <option key={categorie} value={categorie}>{categorie}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Classe thérapeutique
                </label>
                <select
                  value={formData.classeTherapeutique}
                  onChange={(e) => handleInputChange('classeTherapeutique', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {CLASSES_THERAPEUTIQUES.map(classe => (
                    <option key={classe} value={classe}>{classe}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Conditions de conservation
                </label>
                <select
                  value={formData.conditionsConservation}
                  onChange={(e) => handleInputChange('conditionsConservation', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {CONDITIONS_CONSERVATION.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="besoinOrdonnance"
                  checked={formData.besoinOrdonnance}
                  onChange={(e) => handleInputChange('besoinOrdonnance', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="besoinOrdonnance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nécessite une ordonnance
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Dates importantes */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Dates Importantes
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de péremption *
                </label>
                <input
                  type="date"
                  value={formData.datePeremption}
                  onChange={(e) => handleInputChange('datePeremption', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.datePeremption ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {getFieldError('datePeremption')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de fabrication
                </label>
                <input
                  type="date"
                  value={formData.dateFabrication}
                  onChange={(e) => handleInputChange('dateFabrication', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'entrée en stock
                </label>
                <input
                  type="date"
                  value={formData.dateEntreeStock}
                  onChange={(e) => handleInputChange('dateEntreeStock', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {mode === "edit" ? "Modifier" : "Créer"} Médicament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour la confirmation de suppression
interface DeleteModalProps {
  medicament: Medicament;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteModalContent({ medicament, onConfirm, onClose }: DeleteModalProps) {
  return (
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
  );
}

// Composant Modal pour voir les détails d'un médicament
interface ViewModalProps {
  medicament: Medicament;
  onClose: () => void;
}

function ViewModalContent({ medicament, onClose }: ViewModalProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Détails du Médicament
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Informations générales */}
          <div className="space-y-6">
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
                {medicament.nomCommercial && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nom commercial:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.nomCommercial}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Forme et dosage:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {medicament.formePharmaceutique} • {medicament.dosage}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Substance active:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.substanceActive}</p>
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
                    {medicament.stockActuel} {medicament.uniteStock}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Seuils:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Min: {medicament.stockMinimum} | Max: {medicament.stockMaximum}
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

          {/* Informations supplémentaires */}
          <div className="space-y-6">
            {/* Informations sécurité */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Sécurité et Réglementation</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Catégorie thérapeutique:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.categorieTherapeutique}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Classe thérapeutique:</span>
                  <Badge
                    size="sm"
                    color={
                      medicament.classeTherapeutique === "Stupéfiant" ? "error" :
                      medicament.classeTherapeutique === "Classe C" ? "warning" :
                      medicament.classeTherapeutique === "Classe B" ? "info" : "success"
                    }
                  >
                    {medicament.classeTherapeutique}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conditions conservation:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.conditionsConservation}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ordonnance requise:</span>
                  <Badge
                    size="sm"
                    color={medicament.besoinOrdonnance ? "warning" : "success"}
                  >
                    {medicament.besoinOrdonnance ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Informations financières */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Financières</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prix d'achat:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.prixAchat.toFixed(2)} €</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Prix de vente:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.prixVente.toFixed(2)} €</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">TVA:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.tva} %</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Valeur stock:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {(medicament.stockActuel * medicament.prixAchat).toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>

            {/* Dates importantes */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Dates Importantes</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Péremption:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {new Date(medicament.datePeremption).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {medicament.dateFabrication && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fabrication:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {new Date(medicament.dateFabrication).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Entrée stock:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {new Date(medicament.dateEntreeStock).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour les mouvements de stock
interface MouvementModalProps {
  medicament: Medicament;
  type: "Entrée" | "Sortie" | "Ajustement";
  onSave: (mouvementData: Omit<MouvementStock, "id">) => void;
  onClose: () => void;
}

function MouvementModalContent({ medicament, type, onSave, onClose }: MouvementModalProps) {
  const [formData, setFormData] = useState({
    medicamentId: medicament.id,
    type: type,
    quantite: 0,
    dateMouvement: new Date().toISOString().split('T')[0],
    heureMouvement: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    reference: "",
    motif: "",
    utilisateur: "Utilisateur Actuel",
    stockAvant: medicament.stockActuel,
    stockApres: medicament.stockActuel,
    coutUnitaire: type === "Entrée" ? medicament.prixAchat : undefined,
    total: 0,
    destination: type === "Sortie" ? "Pharmacie interne" : "",
    fournisseur: type === "Entrée" ? "" : "",
    numeroLot: medicament.lotNumber || "",
    datePeremption: medicament.datePeremption
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stockApres = type === "Entrée" 
      ? medicament.stockActuel + formData.quantite
      : type === "Sortie"
      ? medicament.stockActuel - formData.quantite
      : formData.quantite;

    const total = formData.coutUnitaire ? formData.coutUnitaire * formData.quantite : 0;

    onSave({
      ...formData,
      stockApres,
      total
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {type === "Entrée" ? "Entrée de Stock" : type === "Sortie" ? "Sortie de Stock" : "Ajustement de Stock"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du médicament */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Médicament</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.nom}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.code}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Stock actuel:</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {medicament.stockActuel} {medicament.uniteStock}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Stock après:</span>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {type === "Entrée" ? medicament.stockActuel + formData.quantite :
                   type === "Sortie" ? medicament.stockActuel - formData.quantite :
                   formData.quantite} {medicament.uniteStock}
                </p>
              </div>
            </div>
          </div>

          {/* Détails du mouvement */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Détails du Mouvement</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={formData.quantite}
                  onChange={(e) => handleInputChange('quantite', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motif *
                </label>
                <input
                  type="text"
                  value={formData.motif}
                  onChange={(e) => handleInputChange('motif', e.target.value)}
                  placeholder="Ex: Réapprovisionnement, Dispensation..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  required
                />
              </div>

              {type === "Entrée" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fournisseur
                    </label>
                    <input
                      type="text"
                      value={formData.fournisseur}
                      onChange={(e) => handleInputChange('fournisseur', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Coût unitaire (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.coutUnitaire || ""}
                      onChange={(e) => handleInputChange('coutUnitaire', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                    />
                  </div>
                </>
              )}

              {type === "Sortie" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de lot
                </label>
                <input
                  type="text"
                  value={formData.numeroLot}
                  onChange={(e) => handleInputChange('numeroLot', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de péremption
                </label>
                <input
                  type="date"
                  value={formData.datePeremption}
                  onChange={(e) => handleInputChange('datePeremption', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Enregistrer le mouvement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}