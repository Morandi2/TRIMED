import { TRACE_BLOB, TRACE_OEIL_DROIT, TRACE_OEIL_GAUCHE, TRACE_SOURIRE } from './traces';

interface SymboleProps {
  taille?: number;
  /** Couleur du blob (le corps du robot). */
  corps?: string;
  /** Couleur du stéthoscope (le visage). */
  visage?: string;
  /** Les yeux clignent de temps en temps (désactivé si l’utilisateur limite les animations). */
  vivant?: boolean;
  className?: string;
  titre?: string;
}

// Le robot gardien en 2D : le blob et son visage-stéthoscope, tracés depuis le logo officiel.
export default function Symbole({
  taille = 40, corps = 'var(--color-trimed-indigo)', visage = '#ffffff', vivant = false, className = '', titre = 'TRIMED'
}: SymboleProps) {
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} className={className}
      {...(titre ? { role: 'img', 'aria-label': titre } : { 'aria-hidden': true })}>
      <path d={TRACE_BLOB} fill={corps} />
      <g fill={visage}>
        <path className={vivant ? 'trimed-oeil' : undefined} d={TRACE_OEIL_GAUCHE} />
        <path className={vivant ? 'trimed-oeil' : undefined} d={TRACE_OEIL_DROIT} />
        <path d={TRACE_SOURIRE} />
      </g>
    </svg>
  );
}
