import React from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { UserPermissions } from '../../types/userRoles';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
 children: React.ReactNode;
 requiredRole?: string | string[];
 requiredPermission?: keyof UserPermissions;
 redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
 children,
 requiredRole,
 requiredPermission,
 redirectTo = '/connexion'
}) => {
 const { user, isAuthenticated, isLoading } = useAuth();
 const { permissions } = useUser();
 const location = useLocation();

 // Afficher un loader pendant la vérification
 if (isLoading) {
 return <LoadingSpinner fullScreen message="Vérification de l'authentification..." />;
 }

 // Rediriger vers la page de connexion si non authentifié
 if (!isAuthenticated || !user) {
 return (
 <Navigate
 to={redirectTo}
 state={{ from: location.pathname }}
 replace
 />
 );
 }

 // Vérifier les permissions si spécifiées (Prioritaire)
 if (requiredPermission && !permissions[requiredPermission]) {
 return <AccessDenied currentRole={user.role} required={requiredPermission} />;
 }

 // Vérifier les rôles si spécifiés (Legacy fallback)
 if (requiredRole) {
 const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

 if (!allowedRoles.includes(user.role)) {
 return <AccessDenied currentRole={user.role} required={allowedRoles.join(' ou ')} />;
 }
 }

 // Afficher le contenu protégé
 return <>{children}</>;
};

/**
 * Composant interne pour afficher l'écran d'accès refusé
 */
const AccessDenied: React.FC<{ currentRole: string; required: string }> = ({ currentRole, required }) => (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
 <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
 <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
 <span className="text-red-500 dark:text-red-400 text-4xl"></span>
 </div>
 <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Accès refusé</h1>
 <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
 Désolé, votre niveau d'accès actuel ne vous permet pas de consulter cette ressource.
 </p>
 <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-8 text-sm space-y-2 border border-gray-100 dark:border-gray-600">
 <p className="text-gray-500 dark:text-gray-400">
 <span className="font-semibold text-gray-700 dark:text-gray-200">Requis:</span> {required}
 </p>
 <p className="text-gray-500 dark:text-gray-400">
 <span className="font-semibold text-gray-700 dark:text-gray-200">Votre rôle:</span> {currentRole}
 </p>
 </div>
 <button
 onClick={() => {
 if (window.history.length > 2) {
 window.history.back();
 } else {
 window.location.href = '/home';
 }
 }}
 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25"
 >
 Retourner au tableau de bord
 </button>
 </div>
 </div>
);

export default ProtectedRoute;