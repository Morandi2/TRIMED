import React from 'react';
import Badge from "../../../../components/ui/badge/Badge";
import { useUser } from '../../../../context/UserContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Patient } from '../services/PatientService';
import { Tooltip } from './Tooltip';

interface PatientTableProps {
  patients: Patient[];
  currentPage: number;
  patientsPerPage: number;
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  currentPage,
  patientsPerPage,
  onViewPatient,
  onEditPatient,
  onDeletePatient
}) => {
  const { permissions } = useUser();
  const safePatients = Array.isArray(patients) ? patients : [];
  const currentPatients = safePatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );

  const getSexeText = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      default: return sexe;
    }
  };

  const getSexeColor = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'info';
      case 'F': return 'warning';
      default: return 'info';
    }
  };

  const calculateAge = (dateNaissance?: string) => {
    if (!dateNaissance) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    if (isNaN(birthDate.getTime())) return 'N/A';

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              ID
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Patient
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Dossier Medical
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Âge
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Sexe
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Téléphone
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Date Création
            </TableCell>
            <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
              Actions
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {currentPatients.map((patient) => (
            <TableRow key={patient.patient_id}>
              <TableCell className="py-3">
                <div className="font-mono text-gray-600 text-theme-sm dark:text-gray-400">
                  #{patient.patient_id}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {patient.prenom} {patient.nom}
                </div>
                <div className="text-gray-600 text-theme-xs dark:text-gray-400">
                  {patient.email}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="font-mono text-gray-800 text-theme-sm dark:text-white/90">
                  {patient.numero_dossier_medical}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="text-gray-800 text-theme-sm dark:text-white/90">
                  {calculateAge(patient.date_naissance)} ans
                </div>
              </TableCell>
              <TableCell className="py-3">
                <Badge
                  size="sm"
                  color={getSexeColor(patient.sexe)}
                >
                  {getSexeText(patient.sexe)}
                </Badge>
              </TableCell>
              <TableCell className="py-3">
                <div className="text-gray-800 text-theme-sm dark:text-white/90">
                  {patient.telephone || 'Non renseigné'}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="text-gray-600 text-theme-xs dark:text-gray-400">
                  {formatDate(patient.cree_le || patient.created_at)}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <Tooltip text="Voir les détails">
                    <button 
                      onClick={() => onViewPatient(patient)}
                      className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </Tooltip>
                  {permissions.canEditPatients && (
                    <Tooltip text="Modifier">
                      <button 
                        onClick={() => onEditPatient(patient)}
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
                  )}
                  {permissions.canEditPatients && (
                    <Tooltip text="Supprimer">
                      <button 
                        onClick={() => onDeletePatient(patient)}
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
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {patients.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Aucun patient trouvé
        </div>
      )}
    </div>
  );
};