import React from 'react';
import { FlaskConical } from 'lucide-react';

interface DemoModeBannerProps {
  /** Nom du module concerné (ex: "Paiements"). */
  module?: string;
  /** Message additionnel optionnel. */
  message?: string;
}

/**
 * Bannière indiquant clairement qu'un module fonctionne en données de
 * démonstration, car le backend n'expose pas encore les endpoints
 * correspondants. À retirer dès que l'API réelle est disponible.
 */
export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ module, message }) => {
  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <FlaskConical className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="text-sm">
        <span className="font-semibold">Mode démonstration</span>
        {module ? ` — ${module}` : ''}.{' '}
        {message ??
          "Ce module utilise des données de démonstration : l'API backend correspondante n'est pas encore disponible. Les modifications ne sont pas enregistrées."}
      </div>
    </div>
  );
};
