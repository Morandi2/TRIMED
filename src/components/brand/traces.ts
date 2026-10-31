import { BLOB, OEIL_DROIT, OEIL_GAUCHE, SOURIRE, type Contour } from './robotFormes';

// Contour normalisé (origine au centre, y vers le haut) → tracé SVG lissé dans une boîte 0..100.
// Catmull-Rom converti en courbes de Bézier cubiques : la silhouette reste fidèle au logo et douce.
export function cheminLisse(contour: Contour): string {
  const p = contour.map(([x, y]) => [x * 50 + 50, -y * 50 + 50]);
  const n = p.length;
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} `
      + `${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

export const TRACE_BLOB = cheminLisse(BLOB);
export const TRACE_OEIL_GAUCHE = cheminLisse(OEIL_GAUCHE);
export const TRACE_OEIL_DROIT = cheminLisse(OEIL_DROIT);
export const TRACE_SOURIRE = cheminLisse(SOURIRE);
