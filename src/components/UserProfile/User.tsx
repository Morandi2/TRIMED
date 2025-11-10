import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useState } from "react";

// Interface TypeScript pour les données utilisateur
interface User {
  id: number;
  fullName: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "Actif" | "Inactif" | "En Congé";
  avatar: string;
  lastLogin: string;
}

// Données de la table
const initialUserData: User[] = [
  {
    id: 1,
    fullName: "Dr. Marie Laurent",
    role: "Médecin",
    department: "Cardiologie",
    email: "m.laurent@hopital.com",
    phone: "+509 48 12 34 56",
    status: "Actif",
    avatar: "/images/avatars/doctor-01.jpg",
    lastLogin: "15/10/2023 08:30",
  },
  {
    id: 2,
    fullName: "Jean-Pierre Dubois",
    role: "Infirmier",
    department: "Urgences",
    email: "jp.dubois@hopital.com",
    phone: "+509 48 23 45 67",
    status: "Actif",
    avatar: "/images/avatars/nurse-01.jpg",
    lastLogin: "15/10/2023 07:45",
  },
  {
    id: 3,
    fullName: "Sophie Martin",
    role: "Administrateur",
    department: "Administration",
    email: "s.martin@hopital.com",
    phone: "+509 48 34 56 78",
    status: "En Congé",
    avatar: "/images/avatars/admin-01.jpg",
    lastLogin: "10/10/2023 09:15",
  },
  {
    id: 4,
    fullName: "Dr. Robert Jean",
    role: "Chirurgien",
    department: "Chirurgie",
    email: "r.jean@hopital.com",
    phone: "+509 48 45 67 89",
    status: "Actif",
    avatar: "/images/avatars/doctor-02.jpg",
    lastLogin: "15/10/2023 06:20",
  },
  {
    id: 5,
    fullName: "Lucie Bernard",
    role: "Réceptionniste",
    department: "Accueil",
    email: "l.bernard@hopital.com",
    phone: "+509 48 56 78 90",
    status: "Inactif",
    avatar: "/images/avatars/receptionist-01.jpg",
    lastLogin: "05/10/2023 10:30",
  },
];

// Rôles et départements spécifiques à l'hôpital
const HOSPITAL_ROLES = [
  "Médecin Généraliste",
  "Médecin Spécialiste", 
  "Chirurgien",
  "Infirmier",
  "Aide-soignant",
  "Technicien de Laboratoire",
  "Radiologue",
  "Pharmacien",
  "Administrateur",
  "Réceptionniste",
  "Agent d'entretien",
  "Secrétaire Médicale"
];

const HOSPITAL_DEPARTMENTS = [
  "Urgences",
  "Cardiologie",
  "Chirurgie",
  "Pédiatrie",
  "Maternité",
  "Radiologie",
  "Laboratoire",
  "Pharmacie",
  "Administration",
  "Accueil",
  "Bloc Opératoire",
  "Soins Intensifs",
  "Consultation Externe"
];

// Fonction utilitaire pour formater le téléphone
const formatPhoneNumber = (value: string): string => {
  // Retirer tous les caractères non numériques sauf le +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Si ça commence par 509, ajouter le +
  if (cleaned.startsWith('509') && !cleaned.startsWith('+509')) {
    cleaned = '+' + cleaned;
  }
  
  // S'assurer que ça commence par +509
  if (!cleaned.startsWith('+509')) {
    if (cleaned.startsWith('509')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.length > 0) {
      cleaned = '+509' + cleaned.replace(/^\++/, '');
    }
  }
  
  // Limiter à 12 chiffres après le + (509 + 8 chiffres)
  if (cleaned.length > 13) {
    cleaned = cleaned.substring(0, 13);
  }
  
  // Formater selon le pattern +509 XX XX XX XX
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
  
  // Nettoyer pour la validation
  const cleaned = phone.replace(/\s/g, '');
  
  if (!cleaned.startsWith('+509')) {
    return "Le numéro doit commencer par +509";
  }
  
  if (cleaned.length !== 12) { // +509 + 8 chiffres = 12 caractères
    return "Le numéro doit contenir 8 chiffres après +509";
  }
  
  if (!/^\+\d{11}$/.test(cleaned)) {
    return "Format invalide. Exemple: +509 48 12 34 56";
  }
  
  return "";
};

// Composant principal
export default function GestionUtilisateurs() {
  const [users, setUsers] = useState<User[]>(initialUserData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Tous");
  const [selectedRole, setSelectedRole] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const usersPerPage = 5;

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "Tous" || user.department === selectedDepartment;
    const matchesRole = selectedRole === "Tous" || user.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Départements et rôles uniques pour les filtres
  const departments = ["Tous", ...new Set(users.map(user => user.department))];
  const roles = ["Tous", ...new Set(users.map(user => user.role))];

  // Gestion des actions
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalType("edit");
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setModalType(null);
      setSelectedUser(null);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalType("add");
  };

  const handleSaveUser = (userData: Omit<User, "id">) => {
    if (modalType === "edit" && selectedUser) {
      // Modification
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...userData, id: selectedUser.id } : user
      ));
    } else {
      // Ajout
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1
      };
      setUsers([...users, newUser]);
    }
    setModalType(null);
    setSelectedUser(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        {/* En-tête avec titre et boutons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion du Personnel Hospitalier
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez tous les membres du personnel et leurs comptes
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleAddUser}
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
              Ajouter un Utilisateur
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
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
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-blue-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
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
                  Membre du Personnel
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Rôle
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Département
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
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[40px] w-[40px] overflow-hidden rounded-full">
                        <img
                          src={user.avatar}
                          className="h-[40px] w-[40px] object-cover"
                          alt={user.fullName}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.fullName}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          Dernière connexion: {user.lastLogin}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90">
                    {user.role}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {user.department}
                  </TableCell>
                  <TableCell className="py-3">
                    <div>
                      <p className="text-gray-800 text-theme-sm dark:text-white/90">
                        {user.email}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {user.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        user.status === "Actif"
                          ? "success"
                          : user.status === "En Congé"
                          ? "warning"
                          : "error"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Modifier"
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
                          <path
                            d="M9.93994 2.76666C10.3866 4.36 11.6333 5.60666 13.2333 6.06"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Supprimer"
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
                          <path
                            d="M6.88672 11H9.10672"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.33301 8.33333H9.66634"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
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
                    Affichage de <span className="font-medium">{(currentPage - 1) * usersPerPage + 1}</span> à <span className="font-medium">
                      {Math.min(currentPage * usersPerPage, filteredUsers.length)}
                    </span> sur <span className="font-medium">{filteredUsers.length}</span> résultats
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

      {/* Modals */}
      {modalType === "add" || modalType === "edit" ? (
        <UserModal
          user={selectedUser}
          isOpen={modalType === "add" || modalType === "edit"}
          onSave={handleSaveUser}
          onClose={closeModal}
          mode={modalType}
        />
      ) : modalType === "delete" && selectedUser ? (
        <DeleteModal
          user={selectedUser}
          isOpen={modalType === "delete"}
          onConfirm={handleDeleteConfirm}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}

// Composant Modal pour ajouter/modifier un utilisateur
interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onSave: (userData: Omit<User, "id">) => void;
  onClose: () => void;
  mode: "add" | "edit";
}

function UserModal({ user, isOpen, onSave, onClose, mode }: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    role: user?.role || "",
    department: user?.department || "",
    email: user?.email || "",
    phone: user?.phone || "",
    status: user?.status || "Actif",
    avatar: user?.avatar || "/images/avatars/default-avatar.jpg",
    lastLogin: user?.lastLogin || new Date().toLocaleString('fr-FR'),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation des données
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation du nom complet
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Le nom doit contenir au moins 2 caractères";
    } else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(formData.fullName)) {
      newErrors.fullName = "Le nom ne doit contenir que des lettres, espaces et traits d'union";
    }

    // Validation du rôle
    if (!formData.role) {
      newErrors.role = "Veuillez sélectionner un rôle";
    }

    // Validation du département
    if (!formData.department) {
      newErrors.department = "Veuillez sélectionner un département";
    }

    // Validation de l'email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    } else if (!formData.email.endsWith('@hopital.com')) {
      newErrors.email = "L'email doit se terminer par @hopital.com";
    }

    // Validation du téléphone
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Gestion spécifique du téléphone avec formatage automatique
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 rounded-2xl">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800 mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {mode === "edit" ? "Modifier l'Utilisateur" : "Ajouter un Utilisateur"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom Complet */}
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
                errors.fullName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Rôle et Département */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                  errors.role 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Sélectionner un rôle</option>
                {HOSPITAL_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Département *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 ${
                  errors.department 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Sélectionner un département</option>
                {HOSPITAL_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
              )}
            </div>
          </div>

          {/* Email */}
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
                errors.email 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Téléphone */}
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
              maxLength={17} // +509 XX XX XX XX = 17 caractères maximum
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 ${
                errors.phone 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: +509 XX XX XX XX (8 chiffres après +509)
            </p>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
              required
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En Congé">En Congé</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
  user: User;
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteModal({ user, isOpen, onConfirm, onClose }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 rounded-2xl">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800 mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-600 dark:text-red-400">
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
          Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.fullName}</strong> ? Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}