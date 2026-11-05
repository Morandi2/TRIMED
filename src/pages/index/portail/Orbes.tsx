// Billes colorées derrière les cartes : elles donnent au verre dépoli quelque chose à flouter
// (sans elles, sur fond clair, le verre se lit comme une simple carte blanche). Parallaxe au défilement.

const TEINTES = {
  indigo: 'radial-gradient(circle at 32% 30%, #c9c7ff 0%, #7d79ff 45%, #2720ff 100%)',
  menthe: 'radial-gradient(circle at 32% 30%, #f0fff8 0%, #a5f0d1 45%, #33d396 100%)',
  vert: 'radial-gradient(circle at 32% 30%, #d6fbe9 0%, #5fe0ad 50%, #02c377 100%)'
};

export interface Orbe {
  haut: string;
  gauche?: string;
  droite?: string;
  taille: number;
  teinte: keyof typeof TEINTES;
  vitesse?: number;
  opacite?: number;
}

export default function Orbes({ liste }: { liste: Orbe[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {liste.map((o, i) => (
        <span
          key={i}
          data-vitesse={o.vitesse ?? 0.08}
          className="absolute rounded-full"
          style={{ top: o.haut, left: o.gauche, right: o.droite, width: o.taille, height: o.taille, background: TEINTES[o.teinte], opacity: o.opacite ?? 0.7 }}
        />
      ))}
    </div>
  );
}
