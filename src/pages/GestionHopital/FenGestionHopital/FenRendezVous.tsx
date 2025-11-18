import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { useState, useEffect } from "react";

// Interface TypeScript pour les données rendez-vous
interface RendezVous {
  id: number;
  reference: string;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  medecinId: number;
  medecinName: string;
  specialite: string;
  dateRendezVous: string;
  heureDebut: string;
  heureFin: string;
  statut: "Confirmé" | "En attente" | "Annulé" | "Terminé" | "Reporté";
  typeConsultation: "Consultation générale" | "Suivi" | "Urgence" | "Spécialiste" | "Téléconsultation";
  motif: string;
  notes: string;
  dateCreation: string;
  duree: number;
  salle: string;
  prix: number;
  moyenPaiement?: "Espèces" | "Carte" | "Mobile Money" | "Assurance";
  assuranceValidee?: boolean;
}

// Types de consultation
const TYPES_CONSULTATION = [
  "Consultation générale",
  "Suivi",
  "Urgence",
  "Spécialiste",
  "Téléconsultation"
] as const;

// Statuts des rendez-vous
const STATUTS_RENDEZ_VOUS = [
  "Confirmé",
  "En attente",
  "Annulé",
  "Terminé",
  "Reporté"
] as const;

// Salles de consultation
const SALLES_CONSULTATION = [
  "Salle 101",
  "Salle 102",
  "Salle 103",
  "Salle 201",
  "Salle 202",
  "Salle 203",
  "Salle Urgences 1",
  "Salle Urgences 2",
  "Téléconsultation"
] as const;

// Durées de consultation disponibles
const DUREES_CONSULTATION = [15, 30, 45, 60, 90] as const;

// Plages horaires de travail
const HEURES_DEBUT = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"
] as const;

// Simulation d'une API pour les médecins
const mockMedecinsAPI = {
  getMedecins: async (searchTerm: string = "", page: number = 1, pageSize: number = 10) => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Liste étendue de médecins pour la démonstration
    const allMedecins = [
      { id: 1, name: "Dr. Marie Laurent", specialite: "Cardiologie" },
      { id: 2, name: "Dr. Jean-Pierre Dubois", specialite: "Chirurgie Générale" },
      { id: 3, name: "Dr. Sophie Martin", specialite: "Pédiatrie" },
      { id: 4, name: "Dr. Paul Bernard", specialite: "Dermatologie" },
      { id: 5, name: "Dr. Lucie Petit", specialite: "Gynécologie" },
      { id: 6, name: "Dr. Michel Robert", specialite: "Neurologie" },
      { id: 7, name: "Dr. Catherine Moreau", specialite: "Psychiatrie" },
      { id: 8, name: "Dr. Pierre Simon", specialite: "Radiologie" },
      { id: 9, name: "Dr. Anne Laurent", specialite: "Anesthésiologie" },
      { id: 10, name: "Dr. François Martin", specialite: "Urgences" },
      { id: 11, name: "Dr. Élise Dubois", specialite: "Médecine Interne" },
      { id: 12, name: "Dr. Thomas Bernard", specialite: "Oncologie" },
      { id: 13, name: "Dr. Julie Petit", specialite: "Ophtalmologie" },
      { id: 14, name: "Dr. Marc Robert", specialite: "ORL" },
      { id: 15, name: "Dr. Sarah Moreau", specialite: "Rhumatologie" },
      { id: 16, name: "Dr. David Simon", specialite: "Endocrinologie" },
      { id: 17, name: "Dr. Laura Laurent", specialite: "Gastro-entérologie" },
      { id: 18, name: "Dr. Kevin Martin", specialite: "Néphrologie" },
      { id: 19, name: "Dr. Chloe Dubois", specialite: "Pneumologie" },
      { id: 20, name: "Dr. Alex Bernard", specialite: "Hématologie" },
      { id: 21, name: "Dr. Nicolas Martin", specialite: "Cardiologie Interventionnelle" },
      { id: 22, name: "Dr. Isabelle Petit", specialite: "Chirurgie Digestive" },
      { id: 23, name: "Dr. Patrick Robert", specialite: "Néonatologie" },
      { id: 24, name: "Dr. Valérie Simon", specialite: "Neurochirurgie" },
      { id: 25, name: "Dr. Benjamin Laurent", specialite: "Oncologie Médicale" },
    ];

    // Filtrer selon le terme de recherche
    const filtered = allMedecins.filter(medecin =>
      medecin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      medecins: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasMore: endIndex < filtered.length
    };
  }
};

// Données initiales des rendez-vous
const initialRendezVousData: RendezVous[] = [
  {
    id: 1,
    reference: "RDV20240001",
    patientId: 1,
    patientName: "Jean Dupont",
    patientEmail: "jean.dupont@email.com",
    patientPhone: "+509 48 11 22 33",
    medecinId: 1,
    medecinName: "Dr. Marie Laurent",
    specialite: "Cardiologie",
    dateRendezVous: "2024-01-15",
    heureDebut: "09:00",
    heureFin: "09:30",
    statut: "Confirmé",
    typeConsultation: "Consultation générale",
    motif: "Douleur thoracique",
    notes: "Patient avec antécédents cardiaques familiaux",
    dateCreation: "2024-01-10",
    duree: 30,
    salle: "Salle 101",
    prix: 2500,
    moyenPaiement: "Carte",
    assuranceValidee: true
  },
  {
    id: 2,
    reference: "RDV20240002",
    patientId: 2,
    patientName: "Sophie Martin",
    patientEmail: "sophie.martin@email.com",
    patientPhone: "+509 48 44 55 66",
    medecinId: 2,
    medecinName: "Dr. Jean-Pierre Dubois",
    specialite: "Chirurgie Générale",
    dateRendezVous: "2024-01-15",
    heureDebut: "10:00",
    heureFin: "10:45",
    statut: "En attente",
    typeConsultation: "Suivi",
    motif: "Contrôle post-opératoire",
    notes: "Opération appendicite il y a 2 semaines",
    dateCreation: "2024-01-08",
    duree: 45,
    salle: "Salle 205",
    prix: 1800,
    assuranceValidee: false
  },
  {
    id: 3,
    reference: "RDV20240003",
    patientId: 3,
    patientName: "Pierre Joseph",
    patientEmail: "pierre.joseph@email.com",
    patientPhone: "+509 48 77 88 99",
    medecinId: 3,
    medecinName: "Dr. Sophie Martin",
    specialite: "Pédiatrie",
    dateRendezVous: "2024-01-16",
    heureDebut: "14:00",
    heureFin: "14:30",
    statut: "Terminé",
    typeConsultation: "Urgence",
    motif: "Fièvre élevée chez enfant",
    notes: "Enfant de 5 ans, température 39.5°C",
    dateCreation: "2024-01-16",
    duree: 30,
    salle: "Salle 304",
    prix: 2000,
    moyenPaiement: "Espèces",
    assuranceValidee: true
  }
];

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Fonction pour calculer l'heure de fin basée sur l'heure de début et la durée
const calculerHeureFin = (heureDebut: string, duree: number): string => {
  const [heures, minutes] = heureDebut.split(':').map(Number);
  const totalMinutes = heures * 60 + minutes + duree;
  const nouvellesHeures = Math.floor(totalMinutes / 60);
  const nouvellesMinutes = totalMinutes % 60;
  return `${nouvellesHeures.toString().padStart(2, '0')}:${nouvellesMinutes.toString().padStart(2, '0')}`;
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

// Fonction pour formater le numéro de téléphone
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

// Fonction pour valider l'email
const validateEmail = (email: string): string => {
  if (!email) {
    return "L'email est requis";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Format d'email invalide";
  }
  
  return "";
};

// Fonction pour valider la date (ne pas permettre les dates passées pour les nouveaux rendez-vous)
const validateDateRendezVous = (date: string, isEdit: boolean = false): string => {
  if (!date) {
    return "La date est requise";
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!isEdit && selectedDate < today) {
    return "La date ne peut pas être dans le passé";
  }
  
  return "";
};

// Fonction pour valider les chevauchements de rendez-vous
const validateChevauchement = (
  medecinId: number,
  dateRendezVous: string,
  heureDebut: string,
  heureFin: string,
  rendezVousExistants: RendezVous[],
  rendezVousId?: number
): string => {
  const conflits = rendezVousExistants.filter(rdv => 
    rdv.medecinId === medecinId &&
    rdv.dateRendezVous === dateRendezVous &&
    rdv.id !== rendezVousId && // Exclure le rendez-vous en cours d'édition
    (
      (heureDebut >= rdv.heureDebut && heureDebut < rdv.heureFin) ||
      (heureFin > rdv.heureDebut && heureFin <= rdv.heureFin) ||
      (heureDebut <= rdv.heureDebut && heureFin >= rdv.heureFin)
    )
  );
  
  if (conflits.length > 0) {
    return `Le médecin a déjà un rendez-vous de ${conflits[0].heureDebut} à ${conflits[0].heureFin}`;
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

// Composant SearchableMedecinSelect avancé
interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

function AdvancedSearchableMedecinSelect({ value, onChange, error, required }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [medecins, setMedecins] = useState<Array<{ id: number; name: string; specialite: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les médecins initiaux
  useEffect(() => {
    if (isOpen && medecins.length === 0) {
      loadMedecins();
    }
  }, [isOpen]);

  const loadMedecins = async (search: string = "", page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await mockMedecinsAPI.getMedecins(search, page, 10);
      if (page === 1) {
        setMedecins(result.medecins);
      } else {
        setMedecins(prev => [...prev, ...result.medecins]);
      }
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (search: string) => {
    setSearchTerm(search);
    setHighlightedIndex(0);
    await loadMedecins(search, 1);
  };

  const handleSelect = (medecin: { id: number; name: string; specialite: string }) => {
    onChange(medecin.name);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(0);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMedecins(searchTerm, currentPage + 1);
    }
  };

  const selectedMedecin = medecins.find(m => m.name === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < medecins.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (medecins[highlightedIndex]) {
          handleSelect(medecins[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Médecin {required && "*"}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-left text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            {selectedMedecin ? (
              <div className="flex flex-col">
                <span className="font-medium">{selectedMedecin.name}</span>
                <span className="text-xs text-gray-500">{selectedMedecin.specialite}</span>
              </div>
            ) : (
              <span className="text-gray-500">Sélectionner un médecin...</span>
            )}
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-auto">
            {/* Barre de recherche */}
            <div className="sticky top-0 bg-white dark:bg-gray-700 p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou spécialité..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 pl-9 text-sm text-gray-800 dark:text-white/90 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600"
                  autoFocus
                />
                <svg
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Liste des médecins */}
            <div className="py-1">
              {isLoading && medecins.length === 0 ? (
                <div className="flex justify-center items-center py-4">
                  <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
              ) : medecins.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? "Aucun médecin trouvé" : "Aucun médecin disponible"}
                </div>
              ) : (
                <>
                  {medecins.map((medecin, index) => (
                    <button
                      key={medecin.id}
                      type="button"
                      onClick={() => handleSelect(medecin)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        index === highlightedIndex
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                      } ${
                        medecin.name === value ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{medecin.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{medecin.specialite}</span>
                      </div>
                    </button>
                  ))}
                  
                  {/* Bouton Charger plus */}
                  {hasMore && (
                    <div className="border-t border-gray-200 dark:border-gray-600">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Chargement...
                          </>
                        ) : (
                          "Charger plus de médecins"
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Indicateur de résultats */}
            {medecins.length > 0 && (
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-600 px-3 py-1 border-t border-gray-200 dark:border-gray-500">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {medecins.length} médecin{medecins.length > 1 ? 's' : ''} affiché{medecins.length > 1 ? 's' : ''}
                  {hasMore && " • Plus de résultats disponibles"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Indicateur de sélection */}
      {selectedMedecin && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Médecin sélectionné: {selectedMedecin.name} - {selectedMedecin.specialite}
        </div>
      )}
    </div>
  );
}

// Composant principal
export default function GestionRendezVous() {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>(initialRendezVousData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [selectedMedecin, setSelectedMedecin] = useState("Tous");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous | null>(null);
  const rendezVousPerPage = 5;

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

  // Filtrage des rendez-vous
  const filteredRendezVous = rendezVous.filter(rdv => {
    const matchesSearch = rdv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rdv.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rdv.medecinName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = selectedStatut === "Tous" || rdv.statut === selectedStatut;
    const matchesMedecin = selectedMedecin === "Tous" || rdv.medecinName === selectedMedecin;
    const matchesDate = !selectedDate || rdv.dateRendezVous === selectedDate;
    
    return matchesSearch && matchesStatut && matchesMedecin && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRendezVous.length / rendezVousPerPage);
  const currentRendezVous = filteredRendezVous.slice(
    (currentPage - 1) * rendezVousPerPage,
    currentPage * rendezVousPerPage
  );

  // Médecins et statuts uniques pour les filtres
  const medecins = ["Tous", ...new Set(rendezVous.map(rdv => rdv.medecinName))];
  const statuts = ["Tous", ...STATUTS_RENDEZ_VOUS];

  // Gestion des actions
  const handleEdit = (rdv: RendezVous) => {
    setSelectedRendezVous(rdv);
    setModalType("edit");
  };

  const handleView = (rdv: RendezVous) => {
    setSelectedRendezVous(rdv);
    setModalType("view");
  };

  const handleDeleteClick = (rdv: RendezVous) => {
    setSelectedRendezVous(rdv);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (selectedRendezVous) {
      setRendezVous(rendezVous.filter(rdv => rdv.id !== selectedRendezVous.id));
      setModalType(null);
      setSelectedRendezVous(null);
    }
  };

  const handleAddRendezVous = () => {
    setSelectedRendezVous(null);
    setModalType("add");
  };

  const handleSaveRendezVous = (rdvData: Omit<RendezVous, "id">) => {
    if (modalType === "edit" && selectedRendezVous) {
      // Modification
      setRendezVous(rendezVous.map(rdv => 
        rdv.id === selectedRendezVous.id ? { ...rdvData, id: selectedRendezVous.id } : rdv
      ));
    } else {
      // Ajout
      const newRendezVous = {
        ...rdvData,
        id: Math.max(...rendezVous.map(r => r.id)) + 1,
        reference: `RDV${new Date().getFullYear()}${String(rendezVous.length + 1).padStart(4, '0')}`
      };
      setRendezVous([...rendezVous, newRendezVous]);
    }
    setModalType(null);
    setSelectedRendezVous(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRendezVous(null);
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
    total: rendezVous.length,
    confirmes: rendezVous.filter(r => r.statut === "Confirmé").length,
    enAttente: rendezVous.filter(r => r.statut === "En attente").length,
    aujourdhui: rendezVous.filter(r => r.dateRendezVous === new Date().toISOString().split('T')[0]).length
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        
        {/* En-tête avec titre et boutons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Rendez-vous
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez les rendez-vous des patients et le planning médical
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Prendre un nouveau rendez-vous">
              <button 
                onClick={handleAddRendezVous}
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
                Nouveau Rendez-vous
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total RDV</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.confirmes}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enAttente}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aujourdhui}</p>
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
                placeholder="Rechercher par patient, médecin ou référence..."
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

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* En-tête du tableau */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Référence
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
              {currentRendezVous.map((rdv) => (
                <TableRow key={rdv.id}>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {rdv.reference}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {formatDate(rdv.dateCreation)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {rdv.patientName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {rdv.patientPhone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {rdv.medecinName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {rdv.specialite}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {formatDate(rdv.dateRendezVous)}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {rdv.heureDebut} - {rdv.heureFin}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        rdv.typeConsultation === "Urgence"
                          ? "error"
                          : rdv.typeConsultation === "Téléconsultation"
                          ? "info"
                          : "primary"
                      }
                    >
                      {rdv.typeConsultation}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        rdv.statut === "Confirmé"
                          ? "success"
                          : rdv.statut === "En attente"
                          ? "warning"
                          : rdv.statut === "Annulé"
                          ? "error"
                          : rdv.statut === "Terminé"
                          ? "primary"
                          : "info"
                      }
                    >
                      {rdv.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Tooltip text="Voir les détails">
                        <button 
                          onClick={() => handleView(rdv)}
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
                          onClick={() => handleEdit(rdv)}
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
                          onClick={() => handleDeleteClick(rdv)}
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

          {/* Message si aucun résultat */}
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
                    Affichage de <span className="font-medium">{(currentPage - 1) * rendezVousPerPage + 1}</span> à <span className="font-medium">
                      {Math.min(currentPage * rendezVousPerPage, filteredRendezVous.length)}
                    </span> sur <span className="font-medium">{filteredRendezVous.length}</span> rendez-vous
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
              <RendezVousModalContent
                rendezVous={selectedRendezVous}
                onSave={handleSaveRendezVous}
                onClose={closeModal}
                mode={modalType}
                existingRendezVous={rendezVous}
              />
            ) : modalType === "delete" && selectedRendezVous ? (
              <DeleteModalContent
                rendezVous={selectedRendezVous}
                onConfirm={handleDeleteConfirm}
                onClose={closeModal}
              />
            ) : modalType === "view" && selectedRendezVous ? (
              <ViewModalContent
                rendezVous={selectedRendezVous}
                onClose={closeModal}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal pour ajouter/modifier un rendez-vous
interface RendezVousModalProps {
  rendezVous: RendezVous | null;
  onSave: (rdvData: Omit<RendezVous, "id">) => void;
  onClose: () => void;
  mode: "add" | "edit";
  existingRendezVous: RendezVous[];
}

function RendezVousModalContent({ rendezVous, onSave, onClose, mode, existingRendezVous }: RendezVousModalProps) {
  const [formData, setFormData] = useState({
    reference: rendezVous?.reference || "",
    patientId: rendezVous?.patientId || 0,
    patientName: rendezVous?.patientName || "",
    patientEmail: rendezVous?.patientEmail || "",
    patientPhone: rendezVous?.patientPhone || "",
    medecinId: rendezVous?.medecinId || 0,
    medecinName: rendezVous?.medecinName || "",
    specialite: rendezVous?.specialite || "",
    dateRendezVous: rendezVous?.dateRendezVous || new Date().toISOString().split('T')[0],
    heureDebut: rendezVous?.heureDebut || "09:00",
    heureFin: rendezVous?.heureFin || "09:30",
    statut: rendezVous?.statut || "En attente",
    typeConsultation: rendezVous?.typeConsultation || "Consultation générale",
    motif: rendezVous?.motif || "",
    notes: rendezVous?.notes || "",
    dateCreation: rendezVous?.dateCreation || new Date().toISOString().split('T')[0],
    duree: rendezVous?.duree || 30,
    salle: rendezVous?.salle || "Salle 101",
    prix: rendezVous?.prix || 0,
    moyenPaiement: rendezVous?.moyenPaiement || undefined,
    assuranceValidee: rendezVous?.assuranceValidee || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour l'heure de fin quand l'heure de début ou la durée change
  useEffect(() => {
    const nouvelleHeureFin = calculerHeureFin(formData.heureDebut, formData.duree);
    setFormData(prev => ({ ...prev, heureFin: nouvelleHeureFin }));
  }, [formData.heureDebut, formData.duree]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation du nom du patient
    if (!formData.patientName.trim()) {
      newErrors.patientName = "Le nom du patient est requis";
    } else if (formData.patientName.trim().length < 2) {
      newErrors.patientName = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    if (formData.patientEmail) {
      const emailError = validateEmail(formData.patientEmail);
      if (emailError) {
        newErrors.patientEmail = emailError;
      }
    }

    // Validation du téléphone
    if (formData.patientPhone) {
      const phoneError = validatePhoneNumber(formData.patientPhone);
      if (phoneError) {
        newErrors.patientPhone = phoneError;
      }
    }

    // Validation du médecin
    if (!formData.medecinName) {
      newErrors.medecinName = "Le médecin est requis";
    }

    // Validation de la date
    const dateError = validateDateRendezVous(formData.dateRendezVous, mode === "edit");
    if (dateError) {
      newErrors.dateRendezVous = dateError;
    }

    // Validation de l'heure de début
    if (!formData.heureDebut) {
      newErrors.heureDebut = "L'heure de début est requise";
    }

    // Validation du motif
    if (!formData.motif.trim()) {
      newErrors.motif = "Le motif de consultation est requis";
    } else if (formData.motif.trim().length < 10) {
      newErrors.motif = "Le motif doit contenir au moins 10 caractères";
    } else if (formData.motif.trim().length > 500) {
      newErrors.motif = "Le motif ne peut pas dépasser 500 caractères";
    }

    // Validation des notes (optionnelles mais avec limite)
    if (formData.notes.length > 1000) {
      newErrors.notes = "Les notes ne peuvent pas dépasser 1000 caractères";
    }

    // Validation du prix
    if (formData.prix < 0) {
      newErrors.prix = "Le prix ne peut pas être négatif";
    } else if (formData.prix > 100000) {
      newErrors.prix = "Le prix ne peut pas dépasser 100,000 HTG";
    }

    // Validation des chevauchements
    if (formData.medecinId && formData.dateRendezVous && formData.heureDebut && formData.heureFin) {
      const chevauchementError = validateChevauchement(
        formData.medecinId,
        formData.dateRendezVous,
        formData.heureDebut,
        formData.heureFin,
        existingRendezVous,
        mode === "edit" ? rendezVous?.id : undefined
      );
      if (chevauchementError) {
        newErrors.heureDebut = chevauchementError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simuler une requête API
        onSave(formData);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('patientPhone', formatted);
  };

  const handleDureeChange = (duree: number) => {
    handleInputChange('duree', duree);
  };

  const handleMedecinChange = (medecinName: string) => {
    const medecin = mockMedecinsAPI.getMedecins().then(result => {
      const foundMedecin = result.medecins.find(m => m.name === medecinName);
      if (foundMedecin) {
        handleInputChange('medecinId', foundMedecin.id);
        handleInputChange('specialite', foundMedecin.specialite);
      }
    });
    handleInputChange('medecinName', medecinName);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {mode === "edit" ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          disabled={isSubmitting}
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
            {/* Informations patient */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90">Informations Patient</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du Patient *
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  maxLength={100}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    errors.patientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.patientName.length}/100 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email du Patient
                </label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  placeholder="patient@email.com"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    errors.patientEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.patientEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone du Patient
                </label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+509 48 12 34 56"
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    errors.patientPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.patientPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientPhone}</p>
                )}
              </div>
            </div>

            {/* Informations rendez-vous */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-white/90">Informations Rendez-vous</h4>
              
              <div>
                <AdvancedSearchableMedecinSelect
                  value={formData.medecinName}
                  onChange={handleMedecinChange}
                  error={errors.medecinName}
                  required={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateRendezVous}
                    onChange={(e) => handleInputChange('dateRendezVous', e.target.value)}
                    min={mode === "add" ? new Date().toISOString().split('T')[0] : undefined}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                      errors.dateRendezVous ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.dateRendezVous && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateRendezVous}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure Début *
                  </label>
                  <select
                    value={formData.heureDebut}
                    onChange={(e) => handleInputChange('heureDebut', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                      errors.heureDebut ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                  >
                    <option value="">Sélectionner une heure</option>
                    {HEURES_DEBUT.map(heure => (
                      <option key={heure} value={heure}>{heure}</option>
                    ))}
                  </select>
                  {errors.heureDebut && (
                    <p className="mt-1 text-sm text-red-600">{errors.heureDebut}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée (minutes) *
                  </label>
                  <select
                    value={formData.duree}
                    onChange={(e) => handleDureeChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                    required
                  >
                    {DUREES_CONSULTATION.map(duree => (
                      <option key={duree} value={duree}>{duree} minutes</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salle *
                  </label>
                  <select
                    value={formData.salle}
                    onChange={(e) => handleInputChange('salle', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                    required
                  >
                    <option value="">Sélectionner une salle</option>
                    {SALLES_CONSULTATION.map(salle => (
                      <option key={salle} value={salle}>{salle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure de Fin
                  </label>
                  <input
                    type="text"
                    value={formData.heureFin}
                    readOnly
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix (HTG)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="100"
                    value={formData.prix}
                    onChange={(e) => handleInputChange('prix', Number(e.target.value))}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                      errors.prix ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.prix && (
                    <p className="mt-1 text-sm text-red-600">{errors.prix}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de Consultation *
              </label>
              <select
                value={formData.typeConsultation}
                onChange={(e) => handleInputChange('typeConsultation', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                required
              >
                {TYPES_CONSULTATION.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut *
              </label>
              <select
                value={formData.statut}
                onChange={(e) => handleInputChange('statut', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                required
              >
                {STATUTS_RENDEZ_VOUS.map(statut => (
                  <option key={statut} value={statut}>{statut}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Motif de Consultation *
            </label>
            <textarea
              required
              value={formData.motif}
              onChange={(e) => handleInputChange('motif', e.target.value)}
              placeholder="Décrivez le motif de la consultation en détail..."
              rows={3}
              maxLength={500}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                errors.motif ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.motif && (
              <p className="mt-1 text-sm text-red-600">{errors.motif}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.motif.length}/500 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes supplémentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notes médicales ou informations complémentaires..."
              rows={2}
              maxLength={1000}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                errors.notes ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.notes.length}/1000 caractères
            </p>
          </div>

          {/* Informations de paiement */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moyen de Paiement
              </label>
              <select
                value={formData.moyenPaiement || ""}
                onChange={(e) => handleInputChange('moyenPaiement', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
              >
                <option value="">Non spécifié</option>
                <option value="Espèces">Espèces</option>
                <option value="Carte">Carte</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Assurance">Assurance</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="assuranceValidee"
                checked={formData.assuranceValidee}
                onChange={(e) => handleInputChange('assuranceValidee', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="assuranceValidee" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assurance Validée
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              )}
              {isSubmitting ? "Enregistrement..." : (mode === "edit" ? "Modifier" : "Créer")} Rendez-vous
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour la confirmation de suppression
interface DeleteModalProps {
  rendezVous: RendezVous;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteModalContent({ rendezVous, onConfirm, onClose }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simuler une requête API
      onConfirm();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

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
        Êtes-vous sûr de vouloir supprimer le rendez-vous <strong>{rendezVous.reference}</strong> du patient <strong>{rendezVous.patientName}</strong> ? Cette action est irréversible.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleConfirm}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          )}
          {isDeleting ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </div>
  );
}

// Composant Modal pour voir les détails d'un rendez-vous
interface ViewModalProps {
  rendezVous: RendezVous;
  onClose: () => void;
}

function ViewModalContent({ rendezVous, onClose }: ViewModalProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Détails du Rendez-vous
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
          {/* Informations principales */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Patient</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.patientName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.patientEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Téléphone:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.patientPhone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Rendez-vous</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Référence:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.reference}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formatDate(rendezVous.dateRendezVous)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Heure:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.heureDebut} - {rendezVous.heureFin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Durée:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.duree} minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Médicales</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Médecin:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.medecinName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spécialité:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.specialite}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                    <Badge
                      size="sm"
                      color={
                        rendezVous.typeConsultation === "Urgence"
                          ? "error"
                          : rendezVous.typeConsultation === "Téléconsultation"
                          ? "info"
                          : "primary"
                      }
                    >
                      {rendezVous.typeConsultation}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Salle:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.salle}</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Statut et Paiement</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                    <Badge
                      size="sm"
                      color={
                        rendezVous.statut === "Confirmé"
                          ? "success"
                          : rendezVous.statut === "En attente"
                          ? "warning"
                          : rendezVous.statut === "Annulé"
                          ? "error"
                          : rendezVous.statut === "Terminé"
                          ? "primary"
                          : "info"
                      }
                    >
                      {rendezVous.statut}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Prix:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.prix} HTG</p>
                  </div>
                  {rendezVous.moyenPaiement && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Paiement:</span>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.moyenPaiement}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Assurance:</span>
                    <Badge
                      size="sm"
                      color={rendezVous.assuranceValidee ? "success" : "warning"}
                    >
                      {rendezVous.assuranceValidee ? "Validée" : "Non validée"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motif et notes */}
          <div className="md:col-span-1">
            <div className="space-y-6">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Motif de Consultation</h5>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{rendezVous.motif}</p>
                </div>
              </div>

              {rendezVous.notes && (
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Notes Médicales</h5>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rendezVous.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <h5 className="font-medium text-gray-800 dark:text-white/90 mb-3">Informations Création</h5>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Créé le:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formatDate(rendezVous.dateCreation)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Référence:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{rendezVous.reference}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}