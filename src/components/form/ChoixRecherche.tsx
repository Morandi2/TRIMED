import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { normaliser } from '../../utils/contraintes';

export interface OptionRecherche {
  id: number;
  libelle: string;
  /** Deuxième ligne (téléphone, spécialité, numéro de dossier…). */
  detail?: string;
  /** Texte supplémentaire pris en compte par la recherche. */
  motsCles?: string;
}

interface Props {
  label: string;
  options: OptionRecherche[];
  /** Identifiant choisi (null : rien). */
  valeur: number | null | undefined;
  onChange: (id: number, option: OptionRecherche) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  chargement?: boolean;
  disabled?: boolean;
  /** Texte quand la liste est vide (avant recherche). */
  vide?: string;
}

// Liste déroulante avec recherche. Elle se ferme dès que l'utilisateur clique ailleurs, passe au champ suivant
// (Tab) ou appuie sur Échap : deux listes ne restent jamais ouvertes ensemble. Recherche sans accents.
export function ChoixRecherche({ label, options, valeur, onChange, placeholder, required, error, chargement, disabled, vide }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [surbrillance, setSurbrillance] = useState(0);
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const liste = useRef<HTMLUListElement>(null);
  const id = useId();

  const choisie = options.find((o) => o.id === valeur);
  const filtrees = useMemo(() => {
    const q = normaliser(recherche);
    return q ? options.filter((o) => normaliser(`${o.libelle} ${o.detail ?? ''} ${o.motsCles ?? ''}`).includes(q)) : options;
  }, [options, recherche]);

  const fermer = (rendreLeFocus = false) => {
    setOuvert(false);
    setRecherche('');
    setSurbrillance(0);
    if (rendreLeFocus) bouton.current?.focus();
  };

  // Clic ou toucher en dehors : fermeture.
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: MouseEvent | TouchEvent) => { if (racine.current && !racine.current.contains(e.target as Node)) fermer(); };
    document.addEventListener('mousedown', dehors);
    document.addEventListener('touchstart', dehors);
    return () => { document.removeEventListener('mousedown', dehors); document.removeEventListener('touchstart', dehors); };
  }, [ouvert]);

  // L'option en surbrillance reste visible pendant la navigation au clavier.
  useEffect(() => {
    liste.current?.querySelector<HTMLElement>(`[data-index="${surbrillance}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [surbrillance]);

  const choisir = (o: OptionRecherche) => { onChange(o.id, o); fermer(true); };

  const clavier = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!ouvert) setOuvert(true); else setSurbrillance((i) => Math.min(i + 1, filtrees.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSurbrillance((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && ouvert) { e.preventDefault(); if (filtrees[surbrillance]) choisir(filtrees[surbrillance]); }
    else if (e.key === 'Escape' && ouvert) { e.preventDefault(); e.stopPropagation(); fermer(true); }
  };

  return (
    <div
      ref={racine}
      className="relative"
      // Le focus quitte le composant (Tab vers le champ suivant) : fermeture.
      onBlur={(e) => { if (ouvert && !racine.current?.contains(e.relatedTarget as Node)) fermer(); }}
    >
      <label htmlFor={`${id}-bouton`} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        ref={bouton}
        id={`${id}-bouton`}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-expanded={ouvert}
        aria-controls={`${id}-liste`}
        aria-invalid={!!error}
        onClick={() => (ouvert ? fermer() : setOuvert(true))}
        onKeyDown={clavier}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-left text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-700 dark:text-white ${
          error ? 'border-red-500' : ouvert ? 'border-brand-500 ring-2 ring-brand-500' : 'border-gray-300 dark:border-gray-600'}`}
      >
        <span className="flex items-center justify-between gap-2">
          {choisie ? (
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{choisie.libelle}</span>
              {choisie.detail && <span className="truncate text-xs text-gray-500 dark:text-gray-400">{choisie.detail}</span>}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{chargement ? 'Chargement…' : placeholder ?? `Choisir : ${label.toLowerCase()}`}</span>
          )}
          <svg className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${ouvert ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {ouvert && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
          <div className="border-b border-gray-100 p-2 dark:border-gray-600">
            <input
              type="text"
              autoFocus
              value={recherche}
              onChange={(e) => { setRecherche(e.target.value); setSurbrillance(0); }}
              onKeyDown={clavier}
              placeholder="Rechercher…"
              aria-label={`Rechercher : ${label.toLowerCase()}`}
              aria-controls={`${id}-liste`}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
            />
          </div>
          <ul ref={liste} id={`${id}-liste`} role="listbox" aria-label={label} className="max-h-60 overflow-y-auto py-1">
            {filtrees.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {chargement ? 'Chargement…' : recherche ? 'Aucun résultat' : vide ?? 'Aucun élément disponible'}
              </li>
            ) : filtrees.map((o, i) => (
              <li
                key={o.id}
                data-index={i}
                role="option"
                aria-selected={o.id === valeur}
                // mousedown plutôt que click : le choix passe avant la perte de focus.
                onMouseDown={(e) => { e.preventDefault(); choisir(o); }}
                onMouseEnter={() => setSurbrillance(i)}
                className={`cursor-pointer px-3 py-2 text-sm ${i === surbrillance ? 'bg-brand-50 dark:bg-brand-500/20' : ''} ${o.id === valeur ? 'border-l-2 border-brand-500 font-medium' : ''}`}
              >
                <span className="block truncate text-gray-900 dark:text-white">{o.libelle}</span>
                {o.detail && <span className="block truncate text-xs text-gray-500 dark:text-gray-300">{o.detail}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
