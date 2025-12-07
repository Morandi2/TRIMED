import React from 'react';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../types/userRoles';

export const RoleSwitcher: React.FC = () => {
  const { currentUserRole, setCurrentUserRole } = useUser();

  const roles: UserRole[] = ['Administrateur', 'Médecin', 'Infirmier', 'Réceptionniste', 'Pharmacien', 'Manager', 'Technicien', 'Finance', 'Auditeur'];

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Rôle:
      </label>
      <select
        value={currentUserRole}
        onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
};
