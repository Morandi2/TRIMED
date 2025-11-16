import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useState, useEffect } from "react";

// Interfaces TypeScript
interface Patient {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  dateNaissance: string;
  email?: string;
  phone?: string;
}

interface Medecin {
  id: number;
  matricule: string;
  fullName: string;
  specialite: string;
  sousSpecialite?: string;
  departement: string;
  email: string;
  phone: string;
  status: "Actif" | "Inactif" | "En Congé" | "En Formation";
  grade: "Interne" | "Résident" | "Chef de Clinique" | "Professeur" | "Chef de Service";
  salleConsultation: string;
}

interface Medicament {
  id: number;
  nom: string;
  posologie: string;
  duree: string;
  quantite: number;
}

interface Ordonnance {
  id: number;
  date: string;
  consultationId?: number;
  medecinId: number;
  patientId: number;
  medicaments: Medicament[];
  instructions: string;
  validite: number;
  statut: "active" | "expiree" | "annulee";
  dateCreation?: string;
  dateModification?: string;
}

// Données exemple
const patientsData: Patient[] = [
  { id: 1, nom: "Dupont", prenom: "Marie", age: 45, dateNaissance: "1978-05-15", email: "marie.dupont@email.com", phone: "+509 48 12 34 56" },
  { id: 2, nom: "Martin", prenom: "Pierre", age: 62, dateNaissance: "1961-11-23", email: "pierre.martin@email.com", phone: "+509 48 23 45 67" },
  { id: 3, nom: "Bernard", prenom: "Sophie", age: 28, dateNaissance: "1995-08-07", email: "sophie.bernard@email.com", phone: "+509 48 34 56 78" },
  { id: 4, nom: "Moreau", prenom: "Jean", age: 35, dateNaissance: "1988-03-12", email: "jean.moreau@email.com", phone: "+509 48 45 67 89" },
  { id: 5, nom: "Lefebvre", prenom: "Catherine", age: 52, dateNaissance: "1971-07-25", email: "catherine.lefebvre@email.com", phone: "+509 48 56 78 90" }
];

const medecinsData: Medecin[] = [
  { id: 1, matricule: "MED2024001", fullName: "Dr. Marie Laurent", specialite: "Cardiologie", sousSpecialite: "Cardiologie Interventionnelle", departement: "Cardiologie", email: "m.laurent@hopital.com", phone: "+509 48 12 34 56", status: "Actif", grade: "Chef de Service", salleConsultation: "Salle 101" },
  { id: 2, matricule: "MED2024002", fullName: "Dr. Jean-Pierre Dubois", specialite: "Chirurgie Générale", sousSpecialite: "Chirurgie Digestive", departement: "Chirurgie", email: "jp.dubois@hopital.com", phone: "+509 48 23 45 67", status: "Actif", grade: "Professeur", salleConsultation: "Salle 205" },
  { id: 3, matricule: "MED2024003", fullName: "Dr. Sophie Martin", specialite: "Pédiatrie", sousSpecialite: "Néonatologie", departement: "Pédiatrie", email: "s.martin@hopital.com", phone: "+509 48 34 56 78", status: "En Congé", grade: "Chef de Clinique", salleConsultation: "Salle 304" },
  { id: 4, matricule: "MED2024004", fullName: "Dr. Alain Petit", specialite: "Dermatologie", departement: "Dermatologie", email: "a.petit@hopital.com", phone: "+509 48 67 89 01", status: "Actif", grade: "Résident", salleConsultation: "Salle 402" }
];

// Service de gestion des ordonnances
class OrdonnanceService {
  private ordonnances: Ordonnance[];

  constructor() {
    this.ordonnances = JSON.parse(localStorage.getItem('ordonnances') || '[]');
    this.mettreAJourStatuts();
  }

  private saveToStorage() {
    localStorage.setItem('ordonnances', JSON.stringify(this.ordonnances));
  }

  creerOrdonnance(ordonnance: Omit<Ordonnance, 'id'>): Ordonnance {
    const nouvelleOrdonnance: Ordonnance = {
      ...ordonnance,
      id: Date.now(),
      dateCreation: new Date().toISOString()
    };
    
    this.ordonnances.push(nouvelleOrdonnance);
    this.saveToStorage();
    return nouvelleOrdonnance;
  }

  modifierOrdonnance(id: number, modifications: Partial<Ordonnance>): Ordonnance | null {
    const index = this.ordonnances.findIndex(ord => ord.id === id);
    if (index !== -1) {
      this.ordonnances[index] = {
        ...this.ordonnances[index],
        ...modifications,
        dateModification: new Date().toISOString()
      };
      this.saveToStorage();
      return this.ordonnances[index];
    }
    return null;
  }

  obtenirOrdonnance(id: number): Ordonnance | undefined {
    return this.ordonnances.find(ord => ord.id === id);
  }

  obtenirToutesOrdonnances(): Ordonnance[] {
    return this.ordonnances;
  }

  obtenirOrdonnancesPatient(patientId: number): Ordonnance[] {
    return this.ordonnances.filter(ord => ord.patientId === patientId);
  }

  obtenirOrdonnancesMedecin(medecinId: number): Ordonnance[] {
    return this.ordonnances.filter(ord => ord.medecinId === medecinId);
  }

  supprimerOrdonnance(id: number): void {
    this.ordonnances = this.ordonnances.filter(ord => ord.id !== id);
    this.saveToStorage();
  }

  verifierExpiration(ordonnance: Ordonnance): boolean {
    const datePrescription = new Date(ordonnance.date);
    const dateExpiration = new Date(datePrescription);
    dateExpiration.setDate(dateExpiration.getDate() + ordonnance.validite);
    
    return dateExpiration < new Date();
  }

  mettreAJourStatuts(): void {
    this.ordonnances.forEach(ordonnance => {
      if (ordonnance.statut === 'active' && this.verifierExpiration(ordonnance)) {
        ordonnance.statut = 'expiree';
      }
    });
    this.saveToStorage();
  }
}

const ordonnanceService = new OrdonnanceService();

// Composant Tooltip personnalisé
const Tooltip = ({ 
  children, 
  text 
}: { 
  children: React.ReactNode;
  text: string;
}) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

// Composant Dropdown avec recherche
interface DropdownProps {
  options: { id: number; label: string; subLabel?: string }[];
  selectedValue: number;
  onSelect: (value: number) => void;
  placeholder: string;
}

function DropdownWithSearch({ options, selectedValue, onSelect, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subLabel && option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.id === selectedValue);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 flex justify-between items-center"
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.subLabel && (
            <span className="text-gray-600 text-xs ml-2 dark:text-gray-400">
              {selectedOption.subLabel}
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto dark:bg-gray-700 dark:border-gray-600">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600 dark:text-white/90"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Liste des options */}
          <div className="py-1">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                  selectedValue === option.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' : 'text-gray-800 dark:text-white/90'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                {option.subLabel && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">{option.subLabel}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Fonctions utilitaires pour obtenir les noms
const getPatientName = (patientId: number): string => {
  const patient = patientsData.find(p => p.id === patientId);
  return patient ? `${patient.nom} ${patient.prenom}` : 'Inconnu';
};

const getMedecinName = (medecinId: number): string => {
  const medecin = medecinsData.find(m => m.id === medecinId);
  return medecin ? medecin.fullName : 'Inconnu';
};

const getPatientDetails = (patientId: number): Patient | undefined => {
  return patientsData.find(p => p.id === patientId);
};

const getMedecinDetails = (medecinId: number): Medecin | undefined => {
  return medecinsData.find(m => m.id === medecinId);
};

// Composant principal Ordonnance
export default function GestionOrdonnances() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | "print" | null>(null);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
  const ordonnancesPerPage = 5;

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

  // Charger les ordonnances
  useEffect(() => {
    setOrdonnances(ordonnanceService.obtenirToutesOrdonnances());
  }, []);

  // Filtrage des ordonnances
  const filteredOrdonnances = ordonnances.filter(ordonnance => {
    const patientName = getPatientName(ordonnance.patientId);
    const medecinName = getMedecinName(ordonnance.medecinId);
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecinName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatut = selectedStatut === "Tous" || ordonnance.statut === selectedStatut;
    
    return matchesSearch && matchesStatut;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrdonnances.length / ordonnancesPerPage);
  const currentOrdonnances = filteredOrdonnances.slice(
    (currentPage - 1) * ordonnancesPerPage,
    currentPage * ordonnancesPerPage
  );

  // Statuts pour les filtres
  const statutList = ["Tous", "active", "expiree", "annulee"];

  // Gestion des actions
  const handleEdit = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setModalType("edit");
  };

  const handleView = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setModalType("view");
  };

  const handlePrint = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setModalType("print");
  };

  const handleDeleteClick = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (selectedOrdonnance) {
      ordonnanceService.supprimerOrdonnance(selectedOrdonnance.id);
      setOrdonnances(ordonnanceService.obtenirToutesOrdonnances());
      setModalType(null);
      setSelectedOrdonnance(null);
    }
  };

  const handleAddOrdonnance = () => {
    setSelectedOrdonnance(null);
    setModalType("add");
  };

  const handleSaveOrdonnance = (ordonnanceData: Omit<Ordonnance, "id">) => {
    if (modalType === "edit" && selectedOrdonnance) {
      // Modification
      ordonnanceService.modifierOrdonnance(selectedOrdonnance.id, ordonnanceData);
    } else {
      // Ajout
      ordonnanceService.creerOrdonnance(ordonnanceData);
    }
    setOrdonnances(ordonnanceService.obtenirToutesOrdonnances());
    setModalType(null);
    setSelectedOrdonnance(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedOrdonnance(null);
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

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'active': return 'success';
      case 'expiree': return 'error';
      case 'annulee': return 'warning';
      default: return 'info';
    }
  };

  // Statistiques
  const stats = {
    total: ordonnances.length,
    active: ordonnances.filter(o => o.statut === "active").length,
    expiree: ordonnances.filter(o => o.statut === "expiree").length,
    annulee: ordonnances.filter(o => o.statut === "annulee").length
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        
        {/* En-tête avec titre et boutons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Ordonnances
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les prescriptions médicales et les médicaments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Créer une nouvelle ordonnance">
              <button 
                onClick={handleAddOrdonnance}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3.33331V12.6666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33301 8H12.6663"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Nouvelle Ordonnance
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ordonnances</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordonnances Actives</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordonnances Expirées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expiree}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ordonnances Annulées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.annulee}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par patient ou médecin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-theme-sm text-gray-800 placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {statutList.map(statut => (
                <option key={statut} value={statut}>
                  {statut === "Tous" ? "Tous les statuts" : 
                   statut === "active" ? "Actives" :
                   statut === "expiree" ? "Expirées" : "Annulées"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* En-tête du tableau */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Patient
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Médecin
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Médicaments
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Validité
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Statut
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Corps du tableau */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentOrdonnances.map((ordonnance) => (
                <TableRow key={ordonnance.id}>
                  <TableCell className="py-3">
                    <div className="text-gray-800 text-theme-sm dark:text-white/90">
                      {new Date(ordonnance.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {getPatientName(ordonnance.patientId)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-gray-800 text-theme-sm dark:text-white/90">
                      {getMedecinName(ordonnance.medecinId)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-gray-800 text-theme-sm dark:text-white/90">
                      {ordonnance.medicaments.length} médicament(s)
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-gray-800 text-theme-sm dark:text-white/90">
                      {ordonnance.validite} jours
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={getStatutColor(ordonnance.statut)}
                    >
                      {ordonnance.statut === 'active' ? 'Active' : 
                       ordonnance.statut === 'expiree' ? 'Expirée' : 'Annulée'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Tooltip text="Voir les détails">
                        <button 
                          onClick={() => handleView(ordonnance)}
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
                          onClick={() => handleEdit(ordonnance)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip text="Imprimer">
                        <button 
                          onClick={() => handlePrint(ordonnance)}
                          className="rounded p-1.5 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3337 6.66665H12.0003V2.66665H4.00033V6.66665H2.66699C1.93366 6.66665 1.33366 7.26665 1.33366 7.99998V11.3333H4.00033V13.3333H12.0003V11.3333H14.667V7.99998C14.667 7.26665 14.067 6.66665 13.3337 6.66665ZM5.33366 3.99998H10.667V6.66665H5.33366V3.99998ZM10.667 12H5.33366V9.33331H10.667V12ZM12.0003 9.99998C11.6337 9.99998 11.3337 9.69998 11.3337 9.33331C11.3337 8.96665 11.6337 8.66665 12.0003 8.66665C12.367 8.66665 12.667 8.96665 12.667 9.33331C12.667 9.69998 12.367 9.99998 12.0003 9.99998Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip text="Supprimer">
                        <button 
                          onClick={() => handleDeleteClick(ordonnance)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Message si aucune ordonnance */}
          {filteredOrdonnances.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Aucune ordonnance trouvée
            </div>
          )}

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
                    Affichage de <span className="font-medium">{(currentPage - 1) * ordonnancesPerPage + 1}</span> à <span className="font-medium">
                      {Math.min(currentPage * ordonnancesPerPage, filteredOrdonnances.length)}
                    </span> sur <span className="font-medium">{filteredOrdonnances.length}</span> ordonnances
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === page
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
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Suivant</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l4.5-4.25a.75.75 0 111.04 1.08l-3.938 3.71 3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals overlay */}
      {modalType && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div 
            className={`w-full ${
              modalType === 'delete' ? 'max-w-md' : 
              modalType === 'print' ? 'max-w-3xl' : 
              'max-w-4xl'
            } max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "add" || modalType === "edit" ? (
              <OrdonnanceModalContent
                ordonnance={selectedOrdonnance}
                onSave={handleSaveOrdonnance}
                onClose={closeModal}
                mode={modalType}
              />
            ) : modalType === "delete" && selectedOrdonnance ? (
              <DeleteModalContent
                ordonnance={selectedOrdonnance}
                onConfirm={handleDeleteConfirm}
                onClose={closeModal}
              />
            ) : modalType === "view" && selectedOrdonnance ? (
              <ViewModalContent
                ordonnance={selectedOrdonnance}
                onClose={closeModal}
              />
            ) : modalType === "print" && selectedOrdonnance ? (
              <PrintModalContent
                ordonnance={selectedOrdonnance}
                onClose={closeModal}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal pour ajouter/modifier une ordonnance
interface OrdonnanceModalProps {
  ordonnance: Ordonnance | null;
  onSave: (ordonnanceData: Omit<Ordonnance, "id">) => void;
  onClose: () => void;
  mode: "add" | "edit";
}

function OrdonnanceModalContent({ ordonnance, onSave, onClose, mode }: OrdonnanceModalProps) {
  const [formData, setFormData] = useState<Omit<Ordonnance, 'id'>>({
    date: ordonnance?.date || new Date().toISOString().split('T')[0],
    consultationId: ordonnance?.consultationId || 0,
    medecinId: ordonnance?.medecinId || medecinsData[0]?.id || 0,
    patientId: ordonnance?.patientId || patientsData[0]?.id || 0,
    medicaments: ordonnance?.medicaments || [],
    instructions: ordonnance?.instructions || '',
    validite: ordonnance?.validite || 30,
    statut: ordonnance?.statut || 'active'
  });

  const [newMedicament, setNewMedicament] = useState<Omit<Medicament, 'id'>>({
    nom: '',
    posologie: '',
    duree: '',
    quantite: 1
  });

  // Préparer les options pour les dropdowns
  const patientOptions = patientsData.map(patient => ({
    id: patient.id,
    label: `${patient.nom} ${patient.prenom}`,
    subLabel: `${patient.age} ans`
  }));

  const medecinOptions = medecinsData.map(medecin => ({
    id: medecin.id,
    label: medecin.fullName,
    subLabel: medecin.specialite
  }));

  const ajouterMedicament = () => {
    if (newMedicament.nom && newMedicament.posologie) {
      setFormData(prev => ({
        ...prev,
        medicaments: [...prev.medicaments, { ...newMedicament, id: Date.now() }]
      }));
      setNewMedicament({
        nom: '',
        posologie: '',
        duree: '',
        quantite: 1
      });
    }
  };

  const supprimerMedicament = (id: number) => {
    setFormData(prev => ({
      ...prev,
      medicaments: prev.medicaments.filter(med => med.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "edit" ? "Modifier l'Ordonnance" : "Nouvelle Ordonnance"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations patient et médecin */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patient *
              </label>
              <DropdownWithSearch
                options={patientOptions}
                selectedValue={formData.patientId}
                onSelect={(value) => handleInputChange('patientId', value)}
                placeholder="Sélectionner un patient"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Médecin *
              </label>
              <DropdownWithSearch
                options={medecinOptions}
                selectedValue={formData.medecinId}
                onSelect={(value) => handleInputChange('medecinId', value)}
                placeholder="Sélectionner un médecin"
              />
            </div>
          </div>

          {/* Gestion des médicaments - Version simplifiée */}
          <div className="border rounded-lg p-4 dark:border-gray-600">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">Médicaments</h4>
            
            <div className="space-y-4">
              {/* Champs simplifiés pour médicament */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du médicament *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Doliprane 1000mg"
                    value={newMedicament.nom}
                    onChange={(e) => setNewMedicament(prev => ({
                      ...prev, nom: e.target.value
                    }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMedicament.quantite}
                    onChange={(e) => setNewMedicament(prev => ({
                      ...prev, quantite: parseInt(e.target.value) || 1
                    }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Posologie *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1 comprimé 3 fois par jour"
                    value={newMedicament.posologie}
                    onChange={(e) => setNewMedicament(prev => ({
                      ...prev, posologie: e.target.value
                    }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 7 jours"
                    value={newMedicament.duree}
                    onChange={(e) => setNewMedicament(prev => ({
                      ...prev, duree: e.target.value
                    }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={ajouterMedicament}
                disabled={!newMedicament.nom || !newMedicament.posologie}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3.33331V12.6666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33301 8H12.6663"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Ajouter Médicament
              </button>
            </div>

            {/* Liste des médicaments ajoutés - Version Badge */}
            {formData.medicaments.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Médicaments ajoutés:</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.medicaments.map((med) => (
                    <div
                      key={med.id}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      <span className="font-medium">{med.nom}</span>
                      <span className="text-xs">({med.quantite})</span>
                      <button
                        type="button"
                        onClick={() => supprimerMedicament(med.id)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ml-1"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M4 4L12 12M4 12L12 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions et validité */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions supplémentaires
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                placeholder="Instructions particulières pour le patient..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de prescription
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Validité (jours)
                </label>
                <input
                  type="number"
                  value={formData.validite}
                  onChange={(e) => handleInputChange('validite', parseInt(e.target.value))}
                  min="1"
                  max="90"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>
            </div>
          </div>

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
              {mode === "edit" ? "Modifier" : "Créer"} l'Ordonnance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour la confirmation de suppression
interface DeleteModalProps {
  ordonnance: Ordonnance;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteModalContent({ ordonnance, onConfirm, onClose }: DeleteModalProps) {
  const patientName = getPatientName(ordonnance.patientId);

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

      <p className="text-gray-700 dark:text-gray-400 mb-6">
        Êtes-vous sûr de vouloir supprimer l'ordonnance du <strong>{new Date(ordonnance.date).toLocaleDateString()}</strong> pour le patient <strong>{patientName}</strong> ? Cette action est irréversible.
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

// Composant Modal pour voir les détails d'une ordonnance
interface ViewModalProps {
  ordonnance: Ordonnance;
  onClose: () => void;
}

function ViewModalContent({ ordonnance, onClose }: ViewModalProps) {
  const patient = getPatientDetails(ordonnance.patientId);
  const medecin = getMedecinDetails(ordonnance.medecinId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Détails de l'Ordonnance
        </h3>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <div className="grid grid-cols-1 gap-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Patient</h4>
              <p className="text-gray-800 dark:text-white/90">{patient?.nom} {patient?.prenom}</p>
              <p className="text-sm text-gray-700 dark:text-gray-400">Âge: {patient?.age} ans</p>
              <p className="text-sm text-gray-700 dark:text-gray-400">Date de naissance: {patient?.dateNaissance}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/20">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Médecin</h4>
              <p className="text-gray-800 dark:text-white/90">{medecin?.fullName}</p>
              <p className="text-sm text-gray-700 dark:text-gray-400">{medecin?.specialite}</p>
              <p className="text-sm text-gray-700 dark:text-gray-400">Salle: {medecin?.salleConsultation}</p>
            </div>
          </div>

          {/* Informations de prescription */}
          <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-3">Informations de prescription</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-700 dark:text-gray-400">Date de prescription:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{new Date(ordonnance.date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-400">Validité:</span>
                <p className="font-medium text-gray-800 dark:text-white/90">{ordonnance.validite} jours</p>
              </div>
              <div>
                <span className="text-gray-700 dark:text-gray-400">Statut:</span>
                <Badge
                  color={
                    ordonnance.statut === 'active' ? 'success' :
                    ordonnance.statut === 'expiree' ? 'error' : 'warning'
                  }
                >
                  {ordonnance.statut === 'active' ? 'Active' : 
                   ordonnance.statut === 'expiree' ? 'Expirée' : 'Annulée'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Médicaments prescrits */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-3">Médicaments prescrits</h4>
            <div className="space-y-3">
              {ordonnance.medicaments.map((medicament) => (
                <div key={medicament.id} className="border rounded-lg p-4 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-lg text-gray-800 dark:text-white/90">{medicament.nom}</h5>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-800 dark:text-white/90"><strong>Posologie:</strong> {medicament.posologie}</p>
                        <p className="text-gray-800 dark:text-white/90"><strong>Durée:</strong> {medicament.duree}</p>
                        <p className="text-gray-800 dark:text-white/90"><strong>Quantité:</strong> {medicament.quantite}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions supplémentaires */}
          {ordonnance.instructions && (
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-2">Instructions supplémentaires</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
                <p className="text-gray-800 dark:text-white/90">{ordonnance.instructions}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant Modal pour l'impression
interface PrintModalProps {
  ordonnance: Ordonnance;
  onClose: () => void;
}

function PrintModalContent({ ordonnance, onClose }: PrintModalProps) {
  const patient = getPatientDetails(ordonnance.patientId);
  const medecin = getMedecinDetails(ordonnance.medecinId);
  
  const dateExpiration = new Date(ordonnance.date);
  dateExpiration.setDate(dateExpiration.getDate() + ordonnance.validite);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Impression de l'Ordonnance
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3337 6.66665H12.0003V2.66665H4.00033V6.66665H2.66699C1.93366 6.66665 1.33366 7.26665 1.33366 7.99998V11.3333H4.00033V13.3333H12.0003V11.3333H14.667V7.99998C14.667 7.26665 14.067 6.66665 13.3337 6.66665ZM5.33366 3.99998H10.667V6.66665H5.33366V3.99998ZM10.667 12H5.33366V9.33331H10.667V12ZM12.0003 9.99998C11.6337 9.99998 11.3337 9.69998 11.3337 9.33331C11.3337 8.96665 11.6337 8.66665 12.0003 8.66665C12.367 8.66665 12.667 8.96665 12.667 9.33331C12.667 9.69998 12.367 9.99998 12.0003 9.99998Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 print:p-0" id="ordonnance-print">
          <div className="bg-white p-8 print:shadow-none print:border-0 rounded-lg print:p-4 print:bg-white">
            {/* En-tête professionnel */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-6 print:border-black">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-800 print:text-black">HÔPITAL GÉNÉRAL</h2>
                  <p className="text-sm text-gray-700 print:text-black">Centre Médical Spécialisé</p>
                  <p className="text-sm text-gray-700 print:text-black">123 Avenue de la Santé, Port-au-Prince</p>
                  <p className="text-sm text-gray-700 print:text-black">Tél: +509 28 11 22 33</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-gray-800 print:text-black mb-2">ORDONNANCE MÉDICALE</h1>
                  <p className="text-sm text-gray-700 print:text-black">N° {ordonnance.id}</p>
                </div>
              </div>
            </div>

            {/* Informations patient et médecin */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border-2 border-gray-300 rounded-lg p-4 print:border-black">
                <h3 className="font-bold text-gray-700 mb-3 text-lg border-b pb-2 print:text-black print:border-black">INFORMATIONS PATIENT</h3>
                <div className="space-y-2">
                  <p className="text-gray-800 print:text-black"><strong>Nom:</strong> {patient?.nom} {patient?.prenom}</p>
                  <p className="text-gray-800 print:text-black"><strong>Âge:</strong> {patient?.age} ans</p>
                  <p className="text-gray-800 print:text-black"><strong>Date de naissance:</strong> {patient?.dateNaissance}</p>
                </div>
              </div>
              
              <div className="border-2 border-gray-300 rounded-lg p-4 print:border-black">
                <h3 className="font-bold text-gray-700 mb-3 text-lg border-b pb-2 print:text-black print:border-black">INFORMATIONS MÉDECIN</h3>
                <div className="space-y-2">
                  <p className="text-gray-800 print:text-black"><strong>Dr.</strong> {medecin?.fullName}</p>
                  <p className="text-gray-800 print:text-black"><strong>Spécialité:</strong> {medecin?.specialite}</p>
                  <p className="text-gray-800 print:text-black"><strong>Matricule:</strong> {medecin?.matricule}</p>
                  <p className="text-gray-800 print:text-black"><strong>Salle:</strong> {medecin?.salleConsultation}</p>
                </div>
              </div>
            </div>

            {/* Date et validité */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6 print:bg-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-gray-800 print:text-black">
                  <strong>Date de prescription:</strong> {new Date(ordonnance.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-gray-800 print:text-black">
                  <strong>Validité:</strong> {ordonnance.validite} jours (jusqu'au {dateExpiration.toLocaleDateString('fr-FR')})
                </div>
              </div>
            </div>

            {/* Liste des médicaments */}
            <div className="mb-8">
              <h3 className="font-bold text-xl mb-4 border-b-2 border-gray-800 pb-2 text-gray-800 print:text-black print:border-black">PRESCRIPTIONS MÉDICALES</h3>
              <div className="space-y-4">
                {ordonnance.medicaments.map((medicament) => (
                  <div key={medicament.id} className="border-l-4 border-gray-800 pl-4 py-3 bg-gray-50 rounded-r-lg print:border-black print:bg-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 print:text-black mb-1">{medicament.nom}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-gray-800 print:text-black">
                            <strong>Posologie:</strong> {medicament.posologie}
                          </div>
                          <div className="text-gray-800 print:text-black">
                            <strong>Durée:</strong> {medicament.duree}
                          </div>
                          <div className="text-gray-800 print:text-black">
                            <strong>Quantité:</strong> {medicament.quantite}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions supplémentaires */}
            {ordonnance.instructions && (
              <div className="mb-8">
                <h3 className="font-bold text-xl mb-3 border-b-2 border-gray-600 pb-2 text-gray-800 print:text-black print:border-black">RECOMMANDATIONS PARTICULIÈRES</h3>
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 print:bg-yellow-100 print:border-black">
                  <p className="text-gray-800 leading-relaxed print:text-black">{ordonnance.instructions}</p>
                </div>
              </div>
            )}

            {/* Signature et cachet */}
            <div className="mt-12">
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-64 mt-16 mx-auto print:border-black"></div>
                  <p className="text-sm text-gray-700 mt-2 print:text-black">Signature du patient</p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-64 mt-16 mx-auto print:border-black"></div>
                  <p className="text-sm text-gray-700 mt-2 print:text-black">Signature et cachet du médecin</p>
                  <p className="text-xs text-gray-700 mt-1 print:text-black">{medecin?.fullName}</p>
                  <p className="text-xs text-gray-700 print:text-black">Médecin {medecin?.specialite}</p>
                </div>
              </div>
            </div>

            {/* Pied de page professionnel */}
            <div className="mt-8 text-center text-xs text-gray-700 border-t pt-4 print:text-black print:border-black">
              <p><strong>HÔPITAL GÉNÉRAL</strong> - Centre Médical Spécialisé</p>
              <p>123 Avenue de la Santé • Port-au-Prince • Haïti • Tél: +509 28 11 22 33</p>
              <p className="mt-2">Ordonnance générée le {new Date().toLocaleDateString('fr-FR')} • Conserver cet document pendant toute la durée du traitement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}