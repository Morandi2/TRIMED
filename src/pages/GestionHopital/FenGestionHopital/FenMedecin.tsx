import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useState, useEffect } from "react";

// Interface TypeScript pour les données médecin
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
  avatar: string;
  dateEmbauche: string;
  anneesExperience: number;
  grade: "Interne" | "Résident" | "Chef de Clinique" | "Professeur" | "Chef de Service";
  consultationsParJour: number;
  tauxSatisfaction: number;
  formations: string[];
  certifications: string[];
  langues: string[];
  horairesTravail: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
  urgence: boolean;
  salleConsultation: string;
}

// Spécialités médicales complètes
const SPECIALITES_MEDICALES = [
  "Médecine Générale",
  "Cardiologie",
  "Chirurgie Générale",
  "Pédiatrie",
  "Gynécologie-Obstétrique",
  "Dermatologie",
  "Neurologie",
  "Psychiatrie",
  "Radiologie",
  "Anesthésiologie",
  "Urgences",
  "Médecine Interne",
  "Oncologie",
  "Ophtalmologie",
  "ORL",
  "Rhumatologie",
  "Endocrinologie",
  "Gastro-entérologie",
  "Néphrologie",
  "Pneumologie",
  "Hématologie",
  "Médecine du Travail",
  "Médecine Sportive"
] as const;

const SOUS_SPECIALITES: Record<string, string[]> = {
  "Cardiologie": ["Cardiologie Interventionnelle", "Rythmologie", "Cardiologie Pédiatrique"],
  "Chirurgie Générale": ["Chirurgie Digestive", "Chirurgie Vasculaire", "Chirurgie Thoracique"],
  "Pédiatrie": ["Néonatologie", "Pédiatrie Générale", "Pédiatrie Sociale"],
  "Neurologie": ["Neurochirurgie", "Neurologie Vasculaire", "Épileptologie"],
  "Oncologie": ["Oncologie Médicale", "Radiothérapie", "Oncohématologie"],
  "Médecine Générale": [],
  "Gynécologie-Obstétrique": [],
  "Dermatologie": [],
  "Psychiatrie": [],
  "Radiologie": [],
  "Anesthésiologie": [],
  "Urgences": [],
  "Médecine Interne": [],
  "Ophtalmologie": [],
  "ORL": [],
  "Rhumatologie": [],
  "Endocrinologie": [],
  "Gastro-entérologie": [],
  "Néphrologie": [],
  "Pneumologie": [],
  "Hématologie": [],
  "Médecine du Travail": [],
  "Médecine Sportive": []
};

const GRADES_MEDICAUX = [
  "Interne",
  "Résident",
  "Chef de Clinique",
  "Professeur",
  "Chef de Service"
] as const;

const DEPARTEMENTS_HOPITAL = [
  "Urgences",
  "Cardiologie",
  "Chirurgie",
  "Pédiatrie",
  "Maternité",
  "Médecine Interne",
  "Oncologie",
  "Radiologie",
  "Laboratoire",
  "Consultation Externe",
  "Soins Intensifs",
  "Bloc Opératoire"
] as const;

// Données initiales des médecins
const initialMedecinData: Medecin[] = [
  {
    id: 1,
    matricule: "MED2024001",
    fullName: "Dr. Marie Laurent",
    specialite: "Cardiologie",
    sousSpecialite: "Cardiologie Interventionnelle",
    departement: "Cardiologie",
    email: "m.laurent@hopital.com",
    phone: "+509 48 12 34 56",
    status: "Actif",
    avatar: "/images/avatars/doctor-01.jpg",
    dateEmbauche: "15/03/2020",
    anneesExperience: 8,
    grade: "Chef de Service",
    consultationsParJour: 25,
    tauxSatisfaction: 94,
    formations: ["Échocardiographie", "Rythmologie Avancée"],
    certifications: ["Diplôme de Cardiologie", "Certificat en Urgences Cardiaques"],
    langues: ["Français", "Créole", "Anglais"],
    horairesTravail: {
      lundi: "08:00-16:00",
      mardi: "08:00-16:00",
      mercredi: "08:00-12:00",
      jeudi: "08:00-16:00",
      vendredi: "08:00-16:00",
      samedi: "Urgences",
      dimanche: "Repos"
    },
    urgence: true,
    salleConsultation: "Salle 101"
  },
  {
    id: 2,
    matricule: "MED2024002",
    fullName: "Dr. Jean-Pierre Dubois",
    specialite: "Chirurgie Générale",
    sousSpecialite: "Chirurgie Digestive",
    departement: "Chirurgie",
    email: "jp.dubois@hopital.com",
    phone: "+509 48 23 45 67",
    status: "Actif",
    avatar: "/images/avatars/doctor-02.jpg",
    dateEmbauche: "10/06/2019",
    anneesExperience: 12,
    grade: "Professeur",
    consultationsParJour: 15,
    tauxSatisfaction: 96,
    formations: ["Chirurgie Laparoscopique", "Chirurgie d'Urgence"],
    certifications: ["Diplôme de Chirurgie", "Certificat en Traumatologie"],
    langues: ["Français", "Créole", "Espagnol"],
    horairesTravail: {
      lundi: "Bloc Opératoire",
      mardi: "Consultation",
      mercredi: "Bloc Opératoire",
      jeudi: "Consultation",
      vendredi: "Bloc Opératoire",
      samedi: "Urgences",
      dimanche: "Repos"
    },
    urgence: true,
    salleConsultation: "Salle 205"
  },
  {
    id: 3,
    matricule: "MED2024003",
    fullName: "Dr. Sophie Martin",
    specialite: "Pédiatrie",
    sousSpecialite: "Néonatologie",
    departement: "Pédiatrie",
    email: "s.martin@hopital.com",
    phone: "+509 48 34 56 78",
    status: "En Congé",
    avatar: "/images/avatars/doctor-03.jpg",
    dateEmbauche: "22/01/2022",
    anneesExperience: 6,
    grade: "Chef de Clinique",
    consultationsParJour: 30,
    tauxSatisfaction: 92,
    formations: ["Réanimation Néonatale", "Allergologie Pédiatrique"],
    certifications: ["Diplôme de Pédiatrie", "Certificat en Néonatologie"],
    langues: ["Français", "Créole"],
    horairesTravail: {
      lundi: "08:00-17:00",
      mardi: "08:00-17:00",
      mercredi: "08:00-17:00",
      jeudi: "08:00-17:00",
      vendredi: "08:00-17:00",
      samedi: "Repos",
      dimanche: "Repos"
    },
    urgence: false,
    salleConsultation: "Salle 304"
  }
];

// Fonction utilitaire pour formater le téléphone
const formatPhoneNumber = (value: string): string => {
  let cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('509') && !cleaned.startsWith('+509')) {
    cleaned = '+' + cleaned;
  }
  
  if (!cleaned.startsWith('+509')) {
    if (cleaned.startsWith('509')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length > 0) {
      cleaned = '+509' + cleaned.replace(/^\++/, '');
    }
  }
  
  if (cleaned.length > 13) {
    cleaned = cleaned.substring(0, 13);
  }
  
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  } else if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length <= 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  } else {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}${cleaned.slice(10) ? ' ' + cleaned.slice(10) : ''}`;
  }
};

// Fonction de validation du téléphone
const validatePhoneNumber = (phone: string): string => {
  if (!phone) {
    return "Le numéro de téléphone est requis";
  }
  
  const cleaned = phone.replace(/\s/g, '');
  
  if (!cleaned.startsWith('+509')) {
    return "Le numéro doit commencer par +509";
  }
  
  if (cleaned.length !== 12) {
    return "Le numéro doit contenir 8 chiffres après +509";
  }
  
  if (!/^\+\d{11}$/.test(cleaned)) {
    return "Format invalide. Exemple: +509 48 12 34 56";
  }
  
  return "";
};

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

// Composant principal
export default function GestionMedecins() {
  const [medecins, setMedecins] = useState<Medecin[]>(initialMedecinData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialite, setSelectedSpecialite] = useState("Tous");
  const [selectedDepartement, setSelectedDepartement] = useState("Tous");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null);
  const medecinsPerPage = 5;

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

  // Filtrage des médecins
  const filteredMedecins = medecins.filter(medecin => {
    const matchesSearch = medecin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medecin.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medecin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialite = selectedSpecialite === "Tous" || medecin.specialite === selectedSpecialite;
    const matchesDepartement = selectedDepartement === "Tous" || medecin.departement === selectedDepartement;
    const matchesStatus = selectedStatus === "Tous" || medecin.status === selectedStatus;
    
    return matchesSearch && matchesSpecialite && matchesDepartement && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMedecins.length / medecinsPerPage);
  const currentMedecins = filteredMedecins.slice(
    (currentPage - 1) * medecinsPerPage,
    currentPage * medecinsPerPage
  );

  // Spécialités et départements uniques pour les filtres
  const specialites = ["Tous", ...new Set(medecins.map(medecin => medecin.specialite))];
  const departements = ["Tous", ...new Set(medecins.map(medecin => medecin.departement))];
  const statusList = ["Tous", ...new Set(medecins.map(medecin => medecin.status))];

  // Gestion des actions
  const handleEdit = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setModalType("edit");
  };

  const handleView = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setModalType("view");
  };

  const handleDeleteClick = (medecin: Medecin) => {
    setSelectedMedecin(medecin);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (selectedMedecin) {
      setMedecins(medecins.filter(medecin => medecin.id !== selectedMedecin.id));
      setModalType(null);
      setSelectedMedecin(null);
    }
  };

  const handleAddMedecin = () => {
    setSelectedMedecin(null);
    setModalType("add");
  };

  const handleSaveMedecin = (medecinData: Omit<Medecin, "id">) => {
    if (modalType === "edit" && selectedMedecin) {
      // Modification
      setMedecins(medecins.map(medecin => 
        medecin.id === selectedMedecin.id ? { ...medecinData, id: selectedMedecin.id } : medecin
      ));
    } else {
      // Ajout
      const newMedecin = {
        ...medecinData,
        id: Math.max(...medecins.map(m => m.id)) + 1,
        matricule: `MED${new Date().getFullYear()}${String(medecins.length + 1).padStart(3, '0')}`
      };
      setMedecins([...medecins, newMedecin]);
    }
    setModalType(null);
    setSelectedMedecin(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMedecin(null);
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

  // Statistiques
  const stats = {
    total: medecins.length,
    actifs: medecins.filter(m => m.status === "Actif").length,
    enConge: medecins.filter(m => m.status === "En Congé").length,
    urgence: medecins.filter(m => m.urgence).length
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        
        {/* En-tête avec titre et boutons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Médecins
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez le corps médical et leurs informations professionnelles
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Ajouter un nouveau médecin">
              <button 
                onClick={handleAddMedecin}
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
                Ajouter un Médecin
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Médecins</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Médecins Actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.actifs}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Congé</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enConge}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Urgence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgence}</p>
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
                placeholder="Rechercher par nom, matricule ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-theme-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400"
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
              value={selectedSpecialite}
              onChange={(e) => setSelectedSpecialite(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {specialites.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select
              value={selectedDepartement}
              onChange={(e) => setSelectedDepartement(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {departements.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {statusList.map(status => (
                <option key={status} value={status}>{status}</option>
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
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Médecin
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Spécialité
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Grade
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Expérience
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Contact
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Statut
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Corps du tableau */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentMedecins.map((medecin) => (
                <TableRow key={medecin.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                        <img
                          src={medecin.avatar}
                          className="h-[40px] w-[40px] object-cover"
                          alt={medecin.fullName}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {medecin.fullName}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {medecin.matricule}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {medecin.specialite}
                      </p>
                      {medecin.sousSpecialite && (
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {medecin.sousSpecialite}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90">
                    {medecin.grade}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {medecin.anneesExperience} ans
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {medecin.consultationsParJour}/jour
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {medecin.email}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {medecin.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <Badge
                        size="sm"
                        color={
                          medecin.status === "Actif"
                            ? "success"
                            : medecin.status === "En Congé"
                            ? "warning"
                            : medecin.status === "En Formation"
                            ? "info"
                            : "error"
                        }
                      >
                        {medecin.status}
                      </Badge>
                      {medecin.urgence && (
                        <Badge size="sm" color="error">
                          Urgence
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Tooltip text="Voir les détails">
                        <button 
                          onClick={() => handleView(medecin)}
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
                          onClick={() => handleEdit(medecin)}
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
                      <Tooltip text="Supprimer">
                        <button 
                          onClick={() => handleDeleteClick(medecin)}
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
                    Affichage de <span className="font-medium">{(currentPage - 1) * medecinsPerPage + 1}</span> à <span className="font-medium">
                      {Math.min(currentPage * medecinsPerPage, filteredMedecins.length)}
                    </span> sur <span className="font-medium">{filteredMedecins.length}</span> médecins
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
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
            className={`w-full ${modalType === 'delete' ? 'max-w-md' : 'max-w-4xl'} max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "add" || modalType === "edit" ? (
              <MedecinModalContent
                medecin={selectedMedecin}
                onSave={handleSaveMedecin}
                onClose={closeModal}
                mode={modalType}
              />
            ) : modalType === "delete" && selectedMedecin ? (
              <DeleteModalContent
                medecin={selectedMedecin}
                onConfirm={handleDeleteConfirm}
                onClose={closeModal}
              />
            ) : modalType === "view" && selectedMedecin ? (
              <ViewModalContent
                medecin={selectedMedecin}
                onClose={closeModal}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal pour ajouter/modifier un médecin
interface MedecinModalProps {
  medecin: Medecin | null;
  onSave: (medecinData: Omit<Medecin, "id">) => void;
  onClose: () => void;
  mode: "add" | "edit";
}

function MedecinModalContent({ medecin, onSave, onClose, mode }: MedecinModalProps) {
  const [formData, setFormData] = useState({
    matricule: medecin?.matricule || "",
    fullName: medecin?.fullName || "",
    specialite: medecin?.specialite || "",
    sousSpecialite: medecin?.sousSpecialite || "",
    departement: medecin?.departement || "",
    email: medecin?.email || "",
    phone: medecin?.phone || "",
    status: medecin?.status || "Actif",
    avatar: medecin?.avatar || "/images/avatars/default-doctor.jpg",
    dateEmbauche: medecin?.dateEmbauche || new Date().toLocaleDateString('fr-FR'),
    anneesExperience: medecin?.anneesExperience || 0,
    grade: medecin?.grade || "Interne",
    consultationsParJour: medecin?.consultationsParJour || 20,
    tauxSatisfaction: medecin?.tauxSatisfaction || 0,
    formations: medecin?.formations || [],
    certifications: medecin?.certifications || [],
    langues: medecin?.langues || [],
    horairesTravail: medecin?.horairesTravail || {
      lundi: "08:00-16:00",
      mardi: "08:00-16:00",
      mercredi: "08:00-16:00",
      jeudi: "08:00-16:00",
      vendredi: "08:00-16:00",
      samedi: "Repos",
      dimanche: "Repos"
    },
    urgence: medecin?.urgence || false,
    salleConsultation: medecin?.salleConsultation || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newFormation, setNewFormation] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newLangue, setNewLangue] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis";
    }

    if (!formData.specialite) {
      newErrors.specialite = "La spécialité est requise";
    }

    if (!formData.departement) {
      newErrors.departement = "Le département est requis";
    }

    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    const phoneError = validatePhoneNumber(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
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

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const addFormation = () => {
    if (newFormation.trim() && !formData.formations.includes(newFormation.trim())) {
      handleInputChange('formations', [...formData.formations, newFormation.trim()]);
      setNewFormation("");
    }
  };

  const removeFormation = (index: number) => {
    handleInputChange('formations', formData.formations.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      handleInputChange('certifications', [...formData.certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    handleInputChange('certifications', formData.certifications.filter((_, i) => i !== index));
  };

  const addLangue = () => {
    if (newLangue.trim() && !formData.langues.includes(newLangue.trim())) {
      handleInputChange('langues', [...formData.langues, newLangue.trim()]);
      setNewLangue("");
    }
  };

  const removeLangue = (index: number) => {
    handleInputChange('langues', formData.langues.filter((_, i) => i !== index));
  };

  const getAvailableSousSpecialites = () => {
    if (!formData.specialite) return [];
    return SOUS_SPECIALITES[formData.specialite] || [];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "edit" ? "Modifier le Médecin" : "Ajouter un Médecin"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Informations de base */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90">Informations Personnelles</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Ex: Dr. Marie Laurent"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="prenom.nom@hopital.com"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+509 48 12 34 56"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Consultations par jour
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.consultationsParJour}
                  onChange={(e) => handleInputChange('consultationsParJour', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90">Informations Professionnelles</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Spécialité *
                </label>
                <select
                  value={formData.specialite}
                  onChange={(e) => handleInputChange('specialite', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.specialite ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Sélectionner une spécialité</option>
                  {SPECIALITES_MEDICALES.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialite && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialite}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sous-spécialité
                </label>
                <select
                  value={formData.sousSpecialite}
                  onChange={(e) => handleInputChange('sousSpecialite', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  disabled={!formData.specialite || getAvailableSousSpecialites().length === 0}
                >
                  <option value="">{getAvailableSousSpecialites().length === 0 ? "Aucune sous-spécialité disponible" : "Sélectionner une sous-spécialité"}</option>
                  {getAvailableSousSpecialites().map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Département *
                </label>
                <select
                  value={formData.departement}
                  onChange={(e) => handleInputChange('departement', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                    errors.departement ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Sélectionner un département</option>
                  {DEPARTEMENTS_HOPITAL.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.departement && (
                  <p className="mt-1 text-sm text-red-600">{errors.departement}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  >
                    {GRADES_MEDICAUX.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Années d'expérience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.anneesExperience}
                    onChange={(e) => handleInputChange('anneesExperience', parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formations, certifications et langues */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formations
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFormation}
                  onChange={(e) => setNewFormation(e.target.value)}
                  placeholder="Ajouter une formation"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                <button
                  type="button"
                  onClick={addFormation}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formData.formations.map((formation, index) => (
                  <span key={index} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {formation}
                    <button
                      type="button"
                      onClick={() => removeFormation(index)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certifications
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Ajouter une certification"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formData.certifications.map((certification, index) => (
                  <span key={index} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {certification}
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langues Parlées
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLangue}
                  onChange={(e) => setNewLangue(e.target.value)}
                  placeholder="Ajouter une langue"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                <button
                  type="button"
                  onClick={addLangue}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {formData.langues.map((langue, index) => (
                  <span key={index} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    {langue}
                    <button
                      type="button"
                      onClick={() => removeLangue(index)}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Autres champs */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salle de Consultation
              </label>
              <input
                type="text"
                value={formData.salleConsultation}
                onChange={(e) => handleInputChange('salleConsultation', e.target.value)}
                placeholder="Ex: Salle 101"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="urgence"
                checked={formData.urgence}
                onChange={(e) => handleInputChange('urgence', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="urgence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Service d'Urgence
              </label>
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
              {mode === "edit" ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour la confirmation de suppression
interface DeleteModalProps {
  medecin: Medecin;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteModalContent({ medecin, onConfirm, onClose }: DeleteModalProps) {
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
        Êtes-vous sûr de vouloir supprimer le médecin <strong>{medecin.fullName}</strong> ({medecin.matricule}) ? Cette action est irréversible.
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

// Composant Modal pour voir les détails d'un médecin
interface ViewModalProps {
  medecin: Medecin;
  onClose: () => void;
}

function ViewModalContent({ medecin, onClose }: ViewModalProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Détails du Médecin
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Photo et informations principales */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="h-32 w-32 overflow-hidden rounded-full mb-4">
                <img
                  src={medecin.avatar}
                  className="h-32 w-32 object-cover"
                  alt={medecin.fullName}
                />
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">
                {medecin.fullName}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-1">{medecin.matricule}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{medecin.grade}</p>
              
              <div className="flex flex-col gap-2 w-full">
                <Badge
                  color={
                    medecin.status === "Actif"
                      ? "success"
                      : medecin.status === "En Congé"
                      ? "warning"
                      : medecin.status === "En Formation"
                      ? "info"
                      : "error"
                  }
                >
                  {medecin.status}
                </Badge>
                {medecin.urgence && (
                  <Badge color="error">Service Urgence</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Professionnelles</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spécialité:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.specialite}</p>
                    {medecin.sousSpecialite && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{medecin.sousSpecialite}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Département:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.departement}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expérience:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.anneesExperience} ans</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Consultations/jour:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.consultationsParJour}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Taux de satisfaction:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.tauxSatisfaction}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Contact</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Téléphone:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Salle de consultation:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.salleConsultation}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date d'embauche:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medecin.dateEmbauche}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formations et compétences */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Formations</h5>
                <div className="flex flex-wrap gap-2">
                  {medecin.formations.map((formation, index) => (
                    <span key={index} className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {formation}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Certifications</h5>
                <div className="flex flex-wrap gap-2">
                  {medecin.certifications.map((certification, index) => (
                    <span key={index} className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      {certification}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Langues */}
            <div className="mt-6">
              <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Langues Parlées</h5>
              <div className="flex flex-wrap gap-2">
                {medecin.langues.map((langue, index) => (
                  <span key={index} className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    {langue}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}