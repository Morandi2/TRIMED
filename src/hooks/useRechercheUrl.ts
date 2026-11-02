import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Applique le terme `?recherche=` de l’adresse au champ de recherche d’une page.
 * Utilisé par la recherche globale de l’en-tête : elle ouvre la page du module avec le terme déjà saisi.
 */
export function useRechercheUrl(appliquer: (terme: string) => void) {
  const { search } = useLocation();
  const ref = useRef(appliquer);
  ref.current = appliquer;
  useEffect(() => {
    const terme = new URLSearchParams(search).get('recherche');
    if (terme !== null) ref.current(terme);
  }, [search]);
}
