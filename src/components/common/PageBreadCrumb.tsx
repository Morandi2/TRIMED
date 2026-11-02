import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  pageTitle: string;
}

// Fil d’Ariane discret : le titre de la page est porté par l’en-tête du module, pas répété ici.
const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  return (
    <nav aria-label="Fil d’Ariane" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link className="hover:text-brand-600 dark:hover:text-brand-300" to="/home">Tableau de bord</Link>
        </li>
        <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
        <li className="text-gray-800 dark:text-white/90" aria-current="page">{pageTitle}</li>
      </ol>
    </nav>
  );
};

export default PageBreadcrumb;
