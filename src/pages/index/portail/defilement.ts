import { useEffect, useState, type RefObject } from 'react';

// Comportements de défilement du portail, inspirés du template « Site Immersif » :
// progression d’une scène épinglée, parallaxe par couches, apparitions et inclinaison 3D des cartes.
// Tous respectent la préférence « réduire les animations » du système.

export function useMouvementReduit() {
  const [reduit, setReduit] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const maj = () => setReduit(m.matches);
    m.addEventListener('change', maj);
    return () => m.removeEventListener('change', maj);
  }, []);
  return reduit;
}

/** Progression (0 → 1) du défilement à travers une section plus haute que l’écran. */
export function progressionDe(section: HTMLElement) {
  const r = section.getBoundingClientRect(), course = r.height - window.innerHeight;
  return course <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / course));
}

/** Parallaxe : chaque élément [data-vitesse] glisse selon sa distance au centre de l’écran. */
export function useParallaxe(racine: RefObject<HTMLElement | null>, actif: boolean) {
  useEffect(() => {
    const el = racine.current;
    if (!el || !actif) return;
    const cibles = Array.from(el.querySelectorAll<HTMLElement>('[data-vitesse]'));
    let image = 0;
    const maj = () => {
      image = 0;
      const milieu = window.innerHeight / 2;
      for (const c of cibles) {
        const r = c.getBoundingClientRect(), v = parseFloat(c.dataset.vitesse || '0');
        c.style.transform = `translate3d(0, ${((r.top + r.height / 2 - milieu) * v).toFixed(1)}px, 0)`;
      }
    };
    const demander = () => { if (!image) image = requestAnimationFrame(maj); };
    maj();
    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander);
    return () => { cancelAnimationFrame(image); window.removeEventListener('scroll', demander); window.removeEventListener('resize', demander); };
  }, [racine, actif]);
}

/** Apparition : marque data-visible sur les éléments [data-apparition] quand ils entrent à l’écran.
 *  Un attribut et non une classe : React réécrit className à chaque rendu et effacerait la marque. */
export function useApparitions(racine: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = racine.current;
    if (!el) return;
    const cibles = el.querySelectorAll<HTMLElement>('[data-apparition]');
    const obs = new IntersectionObserver((entrees) => {
      for (const e of entrees) if (e.isIntersecting) { (e.target as HTMLElement).dataset.visible = ''; obs.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    cibles.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [racine]);
}

/** Inclinaison 3D d’une carte de verre sous le pointeur (souris uniquement). */
export function useInclinaison(racine: RefObject<HTMLElement | null>, actif: boolean) {
  useEffect(() => {
    const el = racine.current;
    if (!el || !actif || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cartes = Array.from(el.querySelectorAll<HTMLElement>('[data-inclinaison]'));
    const nettoyages = cartes.map((c) => {
      const bouger = (e: PointerEvent) => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateZ(0)`;
        c.style.setProperty('--reflet-x', `${((x + 0.5) * 100).toFixed(1)}%`);
        c.style.setProperty('--reflet-y', `${((y + 0.5) * 100).toFixed(1)}%`);
      };
      const sortir = () => { c.style.transform = ''; };
      c.addEventListener('pointermove', bouger);
      c.addEventListener('pointerleave', sortir);
      return () => { c.removeEventListener('pointermove', bouger); c.removeEventListener('pointerleave', sortir); };
    });
    return () => nettoyages.forEach((n) => n());
  }, [racine, actif]);
}
