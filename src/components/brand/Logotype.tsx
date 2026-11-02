import Symbole from './Symbole';

interface LogotypeProps {
  taille?: 'sm' | 'md' | 'lg';
  /** Version sur fond indigo : texte et visage blancs. */
  inverse?: boolean;
  slogan?: boolean;
  className?: string;
}

const TAILLES = {
  sm: { symbole: 30, texte: 'text-[17px]', slogan: 'text-[9px]' },
  md: { symbole: 38, texte: 'text-[21px]', slogan: 'text-[10px]' },
  lg: { symbole: 56, texte: 'text-[30px]', slogan: 'text-[12px]' }
};

// Logotype TRIMED : le robot, « TRI » en vert et « MED » en indigo, comme le logo officiel.
export default function Logotype({ taille = 'md', inverse = false, slogan = false, className = '' }: LogotypeProps) {
  const t = TAILLES[taille];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Symbole taille={t.symbole} corps={inverse ? '#ffffff' : undefined} visage={inverse ? 'var(--color-trimed-indigo)' : undefined} vivant titre="" />
      <span className="flex flex-col text-left leading-none">
        <span className={`font-marque font-extrabold tracking-tight ${t.texte}`} style={{ fontVariationSettings: "'wdth' 112.5" }}>
          <span className={inverse ? 'text-white' : 'text-trimed-vert'}>TRI</span>
          <span className={inverse ? 'text-white' : 'text-trimed-indigo'}>MED</span>
        </span>
        {slogan && (
          <span className={`font-texte font-light uppercase tracking-[0.32em] mt-1.5 ${t.slogan} ${inverse ? 'text-white/80' : 'text-trimed-indigo/80'}`}>
            Soins • Gestion • Innovation
          </span>
        )}
      </span>
    </span>
  );
}
