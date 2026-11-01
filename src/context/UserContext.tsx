import React, { createContext, useContext, ReactNode } from 'react';
import { UserRole, UserPermissions, rolePermissions, normalizeRole } from '../types/userRoles';
import { useAuth } from './AuthContext';

interface UserContextType {
  currentUserRole: UserRole;
  permissions: UserPermissions;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Le rôle découle toujours du compte connecté (réponse du serveur) : il ne se modifie pas
// depuis l’interface, et il change dès qu’on se reconnecte avec un autre compte.
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserRole = normalizeRole(user?.role);
  const permissions = rolePermissions[currentUserRole] || rolePermissions['personnel'];

  return (
    <UserContext.Provider value={{ currentUserRole, permissions }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
