import React from 'react';

interface TableSkeletonProps {
  /** Nombre de lignes skeleton à afficher (défaut: 5) */
  rows?: number;
  /** Nombre de colonnes (défaut: 4) */
  columns?: number;
  /** Afficher un avatar/icône rond à gauche (défaut: true) */
  showAvatar?: boolean;
}

/**
 * Skeleton pulse loader premium pour les tables.
 * Design cohérent avec le style de l'application.
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showAvatar = true
}) => {
  return (
    <div className="p-8 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-4 p-4">
          {showAvatar && (
            <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
          </div>
          {columns >= 2 && (
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-24 flex-shrink-0" />
          )}
          {columns >= 3 && (
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32 flex-shrink-0 hidden sm:block" />
          )}
          {columns >= 4 && (
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20 flex-shrink-0 hidden md:block" />
          )}
        </div>
      ))}
    </div>
  );
};
