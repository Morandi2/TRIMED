import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useState, useEffect } from "react";

// Interface TypeScript pour les données consultation
interface Consultation {
  id: number;
  numeroConsultation: string;
  patientId: number;
  patientNom: string;
  patientPrenom: string;
  patientAge: number;
  patientGenre: "M" | "F";
  medecinId: number;
  medecinNom: string;
  specialite: string;
  dateConsultation: string;
  heureConsultation: string;
  typeConsultation: "Première visite" | "Suivi" | "Urgence" | "Contrôle";
  statut: "Programmée" | "En cours" | "Terminée" | "Annulée" | "Reportée";
  motif: string;
  symptomes: string;
  antecedents: string;
  examenClinique: string;
  diagnostic: string;
  prescriptions: Prescription[];
  examensDemandes: Examen[];
  notesMedecin: string;
  poids?: number;
  taille?: number;
  tensionArterielle?: string;
  temperature?: number;
  frequenceCardiaque?: number;
  saturationO2?: number;
  prochaineVisite?: string;
  dureeConsultation: number;
  coutConsultation: number;
  paye: boolean;
  salle: string;
}

interface Prescription {
  id: number;
  medicament: string;
  dosage: string;
  duree: string;
  instructions: string;
}

interface Examen {
  id: number;
  type: string;
  description: string;
  urgent: boolean;
  statut: "Demandé" | "En cours" | "Terminé" | "Annulé";
  resultat?: string;
}

// Types de consultations
const TYPES_CONSULTATION = [
  "Première visite",
  "Suivi",
  "Urgence",
  "Contrôle"
] as const;

const STATUTS_CONSULTATION = [
  "Programmée",
  "En cours",
  "Terminée",
  "Annulée",
  "Reportée"
] as const;

const TYPES_EXAMENS = [
  "Analyse sanguine",
  "Radiographie",
  "Échographie",
  "Scanner",
  "IRM",
  "ECG",
  "Échocardiographie",
  "Endoscopie",
  "Biopsie",
  "Test urinaire",
  "Test de fonction pulmonaire",
  "Autre"
] as const;

const SALLES_CONSULTATION = [
  "Salle 101",
  "Salle 102",
  "Salle 103",
  "Salle 104",
  "Salle 201",
  "Salle 202",
  "Salle 203",
  "Salle 204",
  "Urgences 1",
  "Urgences 2",
  "Consultation Externe 1",
  "Consultation Externe 2"
] as const;

// Données pour patients et médecins
const patientsList = [
  { id: 1, nom: "Dupont", prenom: "Jean", age: 45, genre: "M" as const },
  { id: 2, nom: "Claire", prenom: "Marie", age: 32, genre: "F" as const },
  { id: 3, nom: "Moreau", prenom: "Pierre", age: 68, genre: "M" as const },
  { id: 4, nom: "Laurent", prenom: "Sophie", age: 29, genre: "F" as const }
];

const medecinsList = [
  { id: 1, nom: "Dr. Marie Laurent", specialite: "Cardiologie" },
  { id: 2, nom: "Dr. Jean-Pierre Dubois", specialite: "Chirurgie Générale" },
  { id: 3, nom: "Dr. Sophie Martin", specialite: "Pédiatrie" }
];

// Données initiales des consultations
const initialConsultationData: Consultation[] = [
  {
    id: 1,
    numeroConsultation: "CONS20240001",
    patientId: 1,
    patientNom: "Jean",
    patientPrenom: "Dupont",
    patientAge: 45,
    patientGenre: "M",
    medecinId: 1,
    medecinNom: "Dr. Marie Laurent",
    specialite: "Cardiologie",
    dateConsultation: "15/01/2024",
    heureConsultation: "09:00",
    typeConsultation: "Première visite",
    statut: "Terminée",
    motif: "Douleur thoracique et essoufflement",
    symptomes: "Douleur thoracique à l'effort, essoufflement, palpitations",
    antecedents: "Hypertension, tabagisme (20 paquets-années), père décédé d'infarctus à 60 ans",
    examenClinique: "TA: 145/90 mmHg, FC: 95/min, souffle systolique 2/6",
    diagnostic: "Angor stable suspecté. Hypertension artérielle.",
    prescriptions: [
      {
        id: 1,
        medicament: "Aspirine",
        dosage: "100 mg",
        duree: "30 jours",
        instructions: "1 comprimé par jour"
      },
      {
        id: 2,
        medicament: "Atorvastatine",
        dosage: "20 mg",
        duree: "30 jours",
        instructions: "1 comprimé le soir"
      }
    ],
    examensDemandes: [
      {
        id: 1,
        type: "ECG",
        description: "Électrocardiogramme de repos",
        urgent: false,
        statut: "Terminé",
        resultat: "Ondes T inversées en V4-V6, suggérant une ischémie"
      },
      {
        id: 2,
        type: "Analyse sanguine",
        description: "Bilan lipidique et glycémie",
        urgent: false,
        statut: "Terminé",
        resultat: "Cholestérol total: 245 mg/dL, LDL: 160 mg/dL"
      }
    ],
    notesMedecin: "Patient à risque cardiovasculaire élevé. Surveiller symptômes. Consultation de suivi dans 1 mois.",
    poids: 85,
    taille: 178,
    tensionArterielle: "145/90",
    temperature: 36.8,
    frequenceCardiaque: 95,
    saturationO2: 98,
    prochaineVisite: "15/02/2024",
    dureeConsultation: 30,
    coutConsultation: 5000,
    paye: true,
    salle: "Salle 101"
  },
  {
    id: 2,
    numeroConsultation: "CONS20240002",
    patientId: 2,
    patientNom: "Marie",
    patientPrenom: "Claire",
    patientAge: 32,
    patientGenre: "F",
    medecinId: 3,
    medecinNom: "Dr. Sophie Martin",
    specialite: "Pédiatrie",
    dateConsultation: "15/01/2024",
    heureConsultation: "10:30",
    typeConsultation: "Suivi",
    statut: "Terminée",
    motif: "Suivi vaccination et développement",
    symptomes: "Aucun symptôme particulier",
    antecedents: "Naissance à terme, allaitement maternel exclusif 6 mois",
    examenClinique: "Enfant éveillé, interactif. Poids et taille dans les courbes. Développement psychomoteur normal.",
    diagnostic: "Enfant en bonne santé. Développement normal.",
    prescriptions: [
      {
        id: 1,
        medicament: "Vitamine D",
        dosage: "400 UI",
        duree: "90 jours",
        instructions: "4 gouttes par jour"
      }
    ],
    examensDemandes: [],
    notesMedecin: "Enfant se développant normalement. Prochaine vaccination à 18 mois.",
    poids: 12.5,
    taille: 82,
    tensionArterielle: "90/60",
    temperature: 36.6,
    frequenceCardiaque: 110,
    saturationO2: 99,
    prochaineVisite: "15/04/2024",
    dureeConsultation: 20,
    coutConsultation: 3500,
    paye: true,
    salle: "Salle 304"
  },
  {
    id: 3,
    numeroConsultation: "CONS20240003",
    patientId: 3,
    patientNom: "Pierre",
    patientPrenom: "Moreau",
    patientAge: 68,
    patientGenre: "M",
    medecinId: 2,
    medecinNom: "Dr. Jean-Pierre Dubois",
    specialite: "Chirurgie Générale",
    dateConsultation: "16/01/2024",
    heureConsultation: "14:00",
    typeConsultation: "Urgence",
    statut: "En cours",
    motif: "Douleur abdominale aiguë",
    symptomes: "Douleur en fosse iliaque droite, nausées, fièvre 38.5°C",
    antecedents: "Appendicectomie à 25 ans, hypertension traitée",
    examenClinique: "Défense et contracture en FID. Signe de Blumberg positif. TA: 130/80, FC: 105/min",
    diagnostic: "Appendicite aiguë suspectée",
    prescriptions: [
      {
        id: 1,
        medicament: "Paracétamol",
        dosage: "1g",
        duree: "1 dose",
        instructions: "Perfusion IV"
      }
    ],
    examensDemandes: [
      {
        id: 1,
        type: "Scanner",
        description: "Scanner abdomino-pelvien avec injection",
        urgent: true,
        statut: "Demandé"
      },
      {
        id: 2,
        type: "Analyse sanguine",
        description: "NFS, CRP, ionogramme",
        urgent: true,
        statut: "En cours"
      }
    ],
    notesMedecin: "Patient à jeun. Préparation possible pour intervention chirurgicale. Surveillance continue.",
    poids: 78,
    taille: 175,
    tensionArterielle: "130/80",
    temperature: 38.5,
    frequenceCardiaque: 105,
    saturationO2: 96,
    dureeConsultation: 25,
    coutConsultation: 7500,
    paye: false,
    salle: "Urgences 1"
  }
];

// Composant Tooltip personnalisé - VERSION AMÉLIORÉE
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
export default function GestionConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultationData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [selectedMedecin, setSelectedMedecin] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const consultationsPerPage = 5;

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

  // Filtrage des consultations
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch =
      consultation.patientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patientPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.numeroConsultation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.medecinNom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "Tous" || consultation.typeConsultation === selectedType;
    const matchesStatut = selectedStatut === "Tous" || consultation.statut === selectedStatut;
    const matchesMedecin = selectedMedecin === "Tous" || consultation.medecinNom === selectedMedecin;

    return matchesSearch && matchesType && matchesStatut && matchesMedecin;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConsultations.length / consultationsPerPage);
  const currentConsultations = filteredConsultations.slice(
    (currentPage - 1) * consultationsPerPage,
    currentPage * consultationsPerPage
  );

  // Types, statuts et médecins uniques pour les filtres
  const types = ["Tous", ...new Set(consultations.map(consultation => consultation.typeConsultation))];
  const statuts = ["Tous", ...new Set(consultations.map(consultation => consultation.statut))];
  const medecins = ["Tous", ...new Set(consultations.map(consultation => consultation.medecinNom))];

  // Gestion des actions
  const handleEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setModalType("edit");
  };

  const handleView = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setModalType("view");
  };

  const handleDeleteClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (selectedConsultation) {
      setConsultations(consultations.filter(consultation => consultation.id !== selectedConsultation.id));
      setModalType(null);
      setSelectedConsultation(null);
    }
  };

  const handleAddConsultation = () => {
    setSelectedConsultation(null);
    setModalType("add");
  };

  const handleSaveConsultation = (consultationData: Omit<Consultation, "id">) => {
    if (modalType === "edit" && selectedConsultation) {
      // Modification
      setConsultations(consultations.map(consultation =>
        consultation.id === selectedConsultation.id ? { ...consultationData, id: selectedConsultation.id } : consultation
      ));
    } else {
      // Ajout
      const newConsultation = {
        ...consultationData,
        id: Math.max(...consultations.map(c => c.id)) + 1,
        numeroConsultation: `CONS${new Date().getFullYear()}${String(consultations.length + 1).padStart(4, '0')}`
      };
      setConsultations([...consultations, newConsultation]);
    }
    setModalType(null);
    setSelectedConsultation(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedConsultation(null);
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
    total: consultations.length,
    programmees: consultations.filter(c => c.statut === "Programmée").length,
    enCours: consultations.filter(c => c.statut === "En cours").length,
    terminees: consultations.filter(c => c.statut === "Terminée").length,
    urgentes: consultations.filter(c => c.typeConsultation === "Urgence").length
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

        {/* En-tête avec titre et boutons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Consultations
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez les consultations médicales et le suivi des patients
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Nouvelle consultation">
              <button
                onClick={handleAddConsultation}
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
                Nouvelle Consultation
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Consultations</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.terminees}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Cours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enCours}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Programmées</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.programmees}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgentes}</p>
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
                placeholder="Rechercher par patient, médecin ou numéro..."
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
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

            <select
              value={selectedMedecin}
              onChange={(e) => setSelectedMedecin(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {medecins.map(medecin => (
                <option key={medecin} value={medecin}>{medecin}</option>
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
                  Consultation
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Patient
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Médecin
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Date & Heure
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Type
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
              {currentConsultations.map((consultation) => (
                <TableRow key={consultation.id}>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {consultation.numeroConsultation}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {consultation.salle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {consultation.patientNom} {consultation.patientPrenom}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {consultation.patientAge} ans, {consultation.patientGenre === 'M' ? 'Homme' : 'Femme'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {consultation.medecinNom}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {consultation.specialite}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {consultation.dateConsultation}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {consultation.heureConsultation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        consultation.typeConsultation === "Urgence"
                          ? "error"
                          : consultation.typeConsultation === "Première visite"
                            ? "info"
                            : consultation.typeConsultation === "Suivi"
                              ? "success"
                              : "warning"
                      }
                    >
                      {consultation.typeConsultation}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        consultation.statut === "Terminée"
                          ? "success"
                          : consultation.statut === "En cours"
                            ? "warning"
                            : consultation.statut === "Programmée"
                              ? "info"
                              : consultation.statut === "Annulée"
                                ? "error"
                                : "light"
                      }
                    >
                      {consultation.statut}
                    </Badge>
                    {!consultation.paye && consultation.statut === "Terminée" && (
                      <span className="ml-1 text-xs text-red-500">• Non payé</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Tooltip text="Voir les détails">
                        <button
                          onClick={() => handleView(consultation)}
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
                          onClick={() => handleEdit(consultation)}
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
                          onClick={() => handleDeleteClick(consultation)}
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
                    Affichage de <span className="font-medium">{(currentPage - 1) * consultationsPerPage + 1}</span> à <span className="font-medium">
                      {Math.min(currentPage * consultationsPerPage, filteredConsultations.length)}
                    </span> sur <span className="font-medium">{filteredConsultations.length}</span> consultations
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
            className={`w-full ${modalType === 'delete' ? 'max-w-md' : 'max-w-6xl'} max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "add" || modalType === "edit" ? (
              <ConsultationModalContent
                consultation={selectedConsultation}
                onSave={handleSaveConsultation}
                onClose={closeModal}
                mode={modalType}
              />
            ) : modalType === "delete" && selectedConsultation ? (
              <DeleteModalContent
                consultation={selectedConsultation}
                onConfirm={handleDeleteConfirm}
                onClose={closeModal}
              />
            ) : modalType === "view" && selectedConsultation ? (
              <ViewModalContent
                consultation={selectedConsultation}
                onClose={closeModal}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal pour ajouter/modifier une consultation
interface ConsultationModalProps {
  consultation: Consultation | null;
  onSave: (consultationData: Omit<Consultation, "id">) => void;
  onClose: () => void;
  mode: "add" | "edit";
}

function ConsultationModalContent({ consultation, onSave, onClose, mode }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    numeroConsultation: consultation?.numeroConsultation || "",
    patientId: consultation?.patientId || 0,
    patientNom: consultation?.patientNom || "",
    patientPrenom: consultation?.patientPrenom || "",
    patientAge: consultation?.patientAge || 0,
    patientGenre: consultation?.patientGenre || "M",
    medecinId: consultation?.medecinId || 0,
    medecinNom: consultation?.medecinNom || "",
    specialite: consultation?.specialite || "",
    dateConsultation: consultation?.dateConsultation || new Date().toLocaleDateString('fr-FR'),
    heureConsultation: consultation?.heureConsultation || "09:00",
    typeConsultation: consultation?.typeConsultation || "Première visite",
    statut: consultation?.statut || "Programmée",
    motif: consultation?.motif || "",
    symptomes: consultation?.symptomes || "",
    antecedents: consultation?.antecedents || "",
    examenClinique: consultation?.examenClinique || "",
    diagnostic: consultation?.diagnostic || "",
    prescriptions: consultation?.prescriptions || [],
    examensDemandes: consultation?.examensDemandes || [],
    notesMedecin: consultation?.notesMedecin || "",
    poids: consultation?.poids || undefined,
    taille: consultation?.taille || undefined,
    tensionArterielle: consultation?.tensionArterielle || "",
    temperature: consultation?.temperature || undefined,
    frequenceCardiaque: consultation?.frequenceCardiaque || undefined,
    saturationO2: consultation?.saturationO2 || undefined,
    prochaineVisite: consultation?.prochaineVisite || "",
    dureeConsultation: consultation?.dureeConsultation || 30,
    coutConsultation: consultation?.coutConsultation || 0,
    paye: consultation?.paye || false,
    salle: consultation?.salle || "Salle 101"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPrescription, setNewPrescription] = useState({
    medicament: "",
    dosage: "",
    duree: "",
    instructions: ""
  });
  const [newExamen, setNewExamen] = useState({
    type: "",
    description: "",
    urgent: false
  });

  // Fonction de validation améliorée
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Kontrent obligatwa
    if (!formData.patientId || formData.patientId === 0) {
      newErrors.patient = "Veuillez sélectionner un patient";
    }

    if (!formData.medecinId || formData.medecinId === 0) {
      newErrors.medecin = "Veuillez sélectionner un médecin";
    }

    if (!formData.dateConsultation.trim()) {
      newErrors.dateConsultation = "La date de consultation est requise";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dateConsultation)) {
      newErrors.dateConsultation = "Format de date invalide (JJ/MM/AAAA)";
    }

    if (!formData.heureConsultation.trim()) {
      newErrors.heureConsultation = "L'heure de consultation est requise";
    }

    if (!formData.motif.trim()) {
      newErrors.motif = "Le motif de consultation est obligatoire";
    } else if (formData.motif.trim().length < 5) {
      newErrors.motif = "Le motif doit contenir au moins 5 caractères";
    }

    // Kontrent nimerik
    if (formData.patientAge < 0 || formData.patientAge > 150) {
      newErrors.patientAge = "L'âge doit être entre 0 et 150 ans";
    }

    if (formData.dureeConsultation < 5) {
      newErrors.dureeConsultation = "La durée minimum est de 5 minutes";
    }

    if (formData.coutConsultation < 0) {
      newErrors.coutConsultation = "Le coût ne peut pas être négatif";
    }

    // Kontrent signes vitaux
    if (formData.poids && (formData.poids < 0.5 || formData.poids > 300)) {
      newErrors.poids = "Poids invalide";
    }

    if (formData.taille && (formData.taille < 30 || formData.taille > 250)) {
      newErrors.taille = "Taille invalide";
    }

    if (formData.temperature && (formData.temperature < 30 || formData.temperature > 45)) {
      newErrors.temperature = "Température invalide";
    }

    if (formData.frequenceCardiaque && (formData.frequenceCardiaque < 30 || formData.frequenceCardiaque > 250)) {
      newErrors.frequenceCardiaque = "Fréquence cardiaque invalide";
    }

    if (formData.saturationO2 && (formData.saturationO2 < 50 || formData.saturationO2 > 100)) {
      newErrors.saturationO2 = "Saturation O2 invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction utilitaire pour afficher les erreurs
  const getFieldError = (fieldName: string) => {
    return errors[fieldName] ? (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[fieldName]}</p>
    ) : null;
  };

  // Fonction pour gérer les inputs numériques avec validation
  const handleNumericInput = (field: string, value: string, min?: number, max?: number) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    
    if (numValue !== undefined) {
      if (min !== undefined && numValue < min) return;
      if (max !== undefined && numValue > max) return;
    }
    
    handleInputChange(field, numValue);
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

  const handlePatientChange = (patientId: number) => {
    const patient = patientsList.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientNom: patient.nom,
        patientPrenom: patient.prenom,
        patientAge: patient.age,
        patientGenre: patient.genre
      }));
    }
  };

  const handleMedecinChange = (medecinId: number) => {
    const medecin = medecinsList.find(m => m.id === medecinId);
    if (medecin) {
      setFormData(prev => ({
        ...prev,
        medecinId: medecin.id,
        medecinNom: medecin.nom,
        specialite: medecin.specialite
      }));
    }
  };

  const addPrescription = () => {
    if (newPrescription.medicament.trim() && newPrescription.dosage.trim()) {
      const prescription: Prescription = {
        id: formData.prescriptions.length + 1,
        ...newPrescription
      };
      handleInputChange('prescriptions', [...formData.prescriptions, prescription]);
      setNewPrescription({
        medicament: "",
        dosage: "",
        duree: "",
        instructions: ""
      });
    }
  };

  const removePrescription = (index: number) => {
    handleInputChange('prescriptions', formData.prescriptions.filter((_, i) => i !== index));
  };

  const addExamen = () => {
    if (newExamen.type.trim()) {
      const examen: Examen = {
        id: formData.examensDemandes.length + 1,
        ...newExamen,
        statut: "Demandé"
      };
      handleInputChange('examensDemandes', [...formData.examensDemandes, examen]);
      setNewExamen({
        type: "",
        description: "",
        urgent: false
      });
    }
  };

  const removeExamen = (index: number) => {
    handleInputChange('examensDemandes', formData.examensDemandes.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "edit" ? "Modifier la Consultation" : "Nouvelle Consultation"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informations de base */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Informations de Base
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => handlePatientChange(parseInt(e.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${errors.patient ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  required
                >
                  <option value="0">Sélectionner un patient</option>
                  {patientsList.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nom} {patient.prenom} ({patient.age} ans)
                    </option>
                  ))}
                </select>
                {getFieldError('patient')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Médecin *
                </label>
                <select
                  value={formData.medecinId}
                  onChange={(e) => handleMedecinChange(parseInt(e.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${errors.medecin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  required
                >
                  <option value="0">Sélectionner un médecin</option>
                  {medecinsList.map(medecin => (
                    <option key={medecin.id} value={medecin.id}>
                      {medecin.nom} - {medecin.specialite}
                    </option>
                  ))}
                </select>
                {getFieldError('medecin')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salle
                </label>
                <select
                  value={formData.salle}
                  onChange={(e) => handleInputChange('salle', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {SALLES_CONSULTATION.map(salle => (
                    <option key={salle} value={salle}>{salle}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.dateConsultation}
                  onChange={(e) => handleInputChange('dateConsultation', e.target.value)}
                  placeholder="JJ/MM/AAAA"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${errors.dateConsultation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  required
                />
                {getFieldError('dateConsultation')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heure *
                </label>
                <input
                  type="time"
                  value={formData.heureConsultation}
                  onChange={(e) => handleInputChange('heureConsultation', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${errors.heureConsultation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  required
                />
                {getFieldError('heureConsultation')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.typeConsultation}
                  onChange={(e) => handleInputChange('typeConsultation', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {TYPES_CONSULTATION.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => handleInputChange('statut', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                >
                  {STATUTS_CONSULTATION.map(statut => (
                    <option key={statut} value={statut}>{statut}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Motif et symptômes */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Motif de Consultation
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motif de consultation *
              </label>
              <textarea
                value={formData.motif}
                onChange={(e) => handleInputChange('motif', e.target.value)}
                placeholder="Décrivez le motif principal de la consultation..."
                rows={2}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${errors.motif ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                required
              />
              {getFieldError('motif')}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symptômes
                </label>
                <textarea
                  value={formData.symptomes}
                  onChange={(e) => handleInputChange('symptomes', e.target.value)}
                  placeholder="Décrivez les symptômes présentés par le patient..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Antécédents
                </label>
                <textarea
                  value={formData.antecedents}
                  onChange={(e) => handleInputChange('antecedents', e.target.value)}
                  placeholder="Antécédents médicaux, chirurgicaux, familiaux..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Signes vitaux */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Signes Vitaux
            </h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.poids || ""}
                  onChange={(e) => handleNumericInput('poids', e.target.value, 0.5, 300)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('poids')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  value={formData.taille || ""}
                  onChange={(e) => handleNumericInput('taille', e.target.value, 30, 250)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('taille')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tension (mmHg)
                </label>
                <input
                  type="text"
                  value={formData.tensionArterielle}
                  onChange={(e) => handleInputChange('tensionArterielle', e.target.value)}
                  placeholder="120/80"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Température (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature || ""}
                  onChange={(e) => handleNumericInput('temperature', e.target.value, 30, 45)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('temperature')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  FC (bpm)
                </label>
                <input
                  type="number"
                  value={formData.frequenceCardiaque || ""}
                  onChange={(e) => handleNumericInput('frequenceCardiaque', e.target.value, 30, 250)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('frequenceCardiaque')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SpO2 (%)
                </label>
                <input
                  type="number"
                  value={formData.saturationO2 || ""}
                  onChange={(e) => handleNumericInput('saturationO2', e.target.value, 50, 100)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('saturationO2')}
              </div>
            </div>
          </div>

          {/* Section 4: Diagnostic et traitement */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Diagnostic et Traitement
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Examen Clinique
                </label>
                <textarea
                  value={formData.examenClinique}
                  onChange={(e) => handleInputChange('examenClinique', e.target.value)}
                  placeholder="Résultats de l'examen clinique..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnostic
                </label>
                <textarea
                  value={formData.diagnostic}
                  onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                  placeholder="Diagnostic posé..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Prescriptions */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Prescriptions
            </h4>
            <div className="space-y-3 mb-3">
              {formData.prescriptions.map((prescription, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {prescription.medicament} - {prescription.dosage}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {prescription.duree} • {prescription.instructions}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <input
                type="text"
                value={newPrescription.medicament}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, medicament: e.target.value }))}
                placeholder="Médicament"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
              />
              <input
                type="text"
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="Dosage"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
              />
              <input
                type="text"
                value={newPrescription.duree}
                onChange={(e) => setNewPrescription(prev => ({ ...prev, duree: e.target.value }))}
                placeholder="Durée"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Instructions"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={addPrescription}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Examens demandés */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Examens Demandés
            </h4>
            <div className="space-y-3 mb-3">
              {formData.examensDemandes.map((examen, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-600 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 dark:text-white/90">{examen.type}</p>
                      {examen.urgent && (
                        <Badge size="sm" color="error">Urgent</Badge>
                      )}
                      <Badge size="sm" color={
                        examen.statut === "Terminé" ? "success" :
                          examen.statut === "En cours" ? "warning" : "info"
                      }>
                        {examen.statut}
                      </Badge>
                    </div>
                    {examen.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {examen.description}
                      </p>
                    )}
                    {examen.resultat && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Résultat: {examen.resultat}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExamen(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <select
                value={newExamen.type}
                onChange={(e) => setNewExamen(prev => ({ ...prev, type: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
              >
                <option value="">Type d'examen</option>
                {TYPES_EXAMENS.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                value={newExamen.description}
                onChange={(e) => setNewExamen(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de l'examen"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
              />
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={newExamen.urgent}
                    onChange={(e) => setNewExamen(prev => ({ ...prev, urgent: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="urgent" className="text-sm text-gray-700 dark:text-gray-300">
                    Urgent
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addExamen}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Section 7: Informations administratives */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-4 border-b pb-2">
              Informations Administratives
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={formData.dureeConsultation}
                  onChange={(e) => handleNumericInput('dureeConsultation', e.target.value, 5)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('dureeConsultation')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coût (HTG)
                </label>
                <input
                  type="number"
                  value={formData.coutConsultation}
                  onChange={(e) => handleNumericInput('coutConsultation', e.target.value, 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                />
                {getFieldError('coutConsultation')}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="paye"
                  checked={formData.paye}
                  onChange={(e) => handleInputChange('paye', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="paye" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Consultation payée
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes du Médecin
              </label>
              <textarea
                value={formData.notesMedecin}
                onChange={(e) => handleInputChange('notesMedecin', e.target.value)}
                placeholder="Notes supplémentaires, recommandations, suivi..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prochaine visite
              </label>
              <input
                type="date"
                value={formData.prochaineVisite}
                onChange={(e) => handleInputChange('prochaineVisite', e.target.value)}
                placeholder="JJ/MM/AAAA"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
              />
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
              {mode === "edit" ? "Modifier" : "Créer"} Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour la confirmation de suppression
interface DeleteModalProps {
  consultation: Consultation;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteModalContent({ consultation, onConfirm, onClose }: DeleteModalProps) {
  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
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
        Êtes-vous sûr de vouloir supprimer la consultation <strong>{consultation.numeroConsultation}</strong> du patient <strong>{consultation.patientNom} {consultation.patientPrenom}</strong> ? Cette action est irréversible.
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

// Composant Modal pour voir les détails d'une consultation
interface ViewModalProps {
  consultation: Consultation;
  onClose: () => void;
}

function ViewModalContent({ consultation, onClose }: ViewModalProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Détails de la Consultation
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Informations patient */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Patient</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nom complet:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {consultation.patientNom} {consultation.patientPrenom}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Âge et genre:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {consultation.patientAge} ans, {consultation.patientGenre === 'M' ? 'Homme' : 'Femme'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations consultation */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Consultation</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Numéro:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {consultation.numeroConsultation}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date et heure:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {consultation.dateConsultation} à {consultation.heureConsultation}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                    <Badge
                      size="sm"
                      color={
                        consultation.typeConsultation === "Urgence"
                          ? "error"
                          : consultation.typeConsultation === "Première visite"
                            ? "info"
                            : consultation.typeConsultation === "Suivi"
                              ? "success"
                              : "warning"
                      }
                    >
                      {consultation.typeConsultation}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                    <Badge
                      size="sm"
                      color={
                        consultation.statut === "Terminée"
                          ? "success"
                          : consultation.statut === "En cours"
                            ? "warning"
                            : consultation.statut === "Programmée"
                              ? "info"
                              : consultation.statut === "Annulée"
                                ? "error"
                                : "light"
                      }
                    >
                      {consultation.statut}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations médicales */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Médicales</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motif et symptômes</h5>
                    <p className="text-sm text-gray-800 dark:text-white/90">{consultation.motif}</p>
                    {consultation.symptomes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{consultation.symptomes}</p>
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Antécédents</h5>
                    <p className="text-sm text-gray-800 dark:text-white/90">
                      {consultation.antecedents || "Aucun antécédent notable"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signes vitaux */}
              {consultation.poids && consultation.taille && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Signes Vitaux</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    {consultation.poids && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Poids:</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{consultation.poids} kg</p>
                      </div>
                    )}
                    {consultation.taille && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Taille:</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{consultation.taille} cm</p>
                      </div>
                    )}
                    {consultation.tensionArterielle && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tension:</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{consultation.tensionArterielle} mmHg</p>
                      </div>
                    )}
                    {consultation.temperature && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Température:</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{consultation.temperature} °C</p>
                      </div>
                    )}
                    {consultation.frequenceCardiaque && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">FC:</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{consultation.frequenceCardiaque} bpm</p>
                      </div>
                    )}
                    {consultation.saturationO2 && (
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">SpO2:</span>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{consultation.saturationO2} %</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diagnostic et traitement */}
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Diagnostic et Traitement</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Examen Clinique</h5>
                    <p className="text-sm text-gray-800 dark:text-white/90">
                      {consultation.examenClinique || "Aucun examen clinique noté"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnostic</h5>
                    <p className="text-sm text-gray-800 dark:text-white/90">
                      {consultation.diagnostic || "Aucun diagnostic posé"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescriptions */}
              {consultation.prescriptions.length > 0 && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Prescriptions</h4>
                  <div className="space-y-2">
                    {consultation.prescriptions.map((prescription, index) => (
                      <div key={index} className="flex items-start gap-3 p-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {prescription.medicament} - {prescription.dosage}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.duree} • {prescription.instructions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examens demandés */}
              {consultation.examensDemandes.length > 0 && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Examens Demandés</h4>
                  <div className="space-y-3">
                    {consultation.examensDemandes.map((examen, index) => (
                      <div key={index} className="flex items-start gap-3 p-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-800 dark:text-white/90">{examen.type}</p>
                            <Badge
                              size="sm"
                              color={
                                examen.statut === "Terminé" ? "success" :
                                  examen.statut === "En cours" ? "warning" :
                                    "info"
                              }
                            >
                              {examen.statut}
                            </Badge>

                            {examen.urgent && (
                              <Badge size="sm" color="error">Urgent</Badge>
                            )}
                          </div>
                          {examen.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {examen.description}
                            </p>
                          )}
                          {examen.resultat && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              <strong>Résultat:</strong> {examen.resultat}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes du médecin */}
              {consultation.notesMedecin && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Notes du Médecin</h4>
                  <p className="text-sm text-gray-800 dark:text-white/90">{consultation.notesMedecin}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations médecin et administratives */}
          <div className="space-y-6">
            {/* Informations médecin */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Médecin Traitant</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {consultation.medecinNom}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Spécialité:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {consultation.specialite}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Salle:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {consultation.salle}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations administratives */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Administratives</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Durée:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {consultation.dureeConsultation} minutes
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Coût:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {consultation.coutConsultation} HTG
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Paiement:</span>
                  <Badge
                    size="sm"
                    color={consultation.paye ? "success" : "error"}
                  >
                    {consultation.paye ? "Payé" : "Non payé"}
                  </Badge>
                </div>
                {consultation.prochaineVisite && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Prochaine visite:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {consultation.prochaineVisite}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}