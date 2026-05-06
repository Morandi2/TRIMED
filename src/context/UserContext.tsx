import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserPermissions, rolePermissions, normalizeRole } from '../types/userRoles';

interface UserContextType {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  permissions: UserPermissions;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        return normalizeRole(user.role);
      } catch (e) {
        console.error("Erreur init role context:", e);
      }
    }
    return 'personnel';
  });

  const permissions = rolePermissions[currentUserRole] || rolePermissions['personnel'];

  return (
    <UserContext.Provider value={{ currentUserRole, setCurrentUserRole, permissions }}>
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
