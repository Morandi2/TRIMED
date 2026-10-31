// Trace le symbole du logo TRIMED (blob indigo + stéthoscope blanc) à partir du PNG officiel
// et produit les contours vectoriels utilisés par le logo SVG et le robot 3D.
//
//   node scripts/brand/tracer-logo.mjs "C:/…/TRIMED Logo/1.png"
//
// Sorties : src/components/brand/robotFormes.ts (contours normalisés) et public/brand/trimed-symbole.svg
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// --- Décodage PNG (8 bits, RGB ou RGBA, non entrelacé) ---
function lirePng(fichier) {
  const b = readFileSync(fichier);
  let o = 8, w = 0, h = 0, type = 0; const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), nom = b.toString('ascii', o + 4, o + 8), data = b.subarray(o + 8, o + 8 + len);
    if (nom === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; if (data[8] !== 8 || data[12]) throw new Error('PNG non pris en charge'); }
    if (nom === 'IDAT') idat.push(data);
    o += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : (() => { throw new Error('type PNG ' + type); })();
  const brut = inflateSync(Buffer.concat(idat)), ligne = w * bpp, px = Buffer.alloc(h * ligne);
  for (let y = 0; y < h; y++) {
    const f = brut[y * (ligne + 1)], src = brut.subarray(y * (ligne + 1) + 1, (y + 1) * (ligne + 1));
    for (let x = 0; x < ligne; x++) {
      const a = x >= bpp ? px[y * ligne + x - bpp] : 0, up = y ? px[(y - 1) * ligne + x] : 0, c = y && x >= bpp ? px[(y - 1) * ligne + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      px[y * ligne + x] = v & 255;
    }
  }
  return { w, h, get: (x, y) => [px[y * ligne + x * bpp], px[y * ligne + x * bpp + 1], px[y * ligne + x * bpp + 2]] };
}

// --- Masques ---
const img = lirePng(process.argv[2]);
const estIndigo = ([r, g, b]) => b > 180 && r < 120 && g < 120;
// Le symbole est au-dessus du mot « TRIMED » (qui commence vers 53 % de la hauteur) :
// on cherche la boîte des pixels indigo au-dessus de 52 %.
let x0 = img.w, y0 = img.h, x1 = 0, y1 = 0;
for (let y = 0; y < img.h * 0.52; y++) for (let x = 0; x < img.w; x++) if (estIndigo(img.get(x, y))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const W = x1 - x0 + 3, H = y1 - y0 + 3, M = new Uint8Array(W * H); // 1 = indigo
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const X = x0 - 1 + x, Y = y0 - 1 + y; M[y * W + x] = X >= 0 && Y >= 0 && X < img.w && Y < img.h && estIndigo(img.get(X, Y)) ? 1 : 0; }
// Blob plein = tout ce qui n’est pas atteignable depuis le bord sans traverser l’indigo.
const dehors = new Uint8Array(W * H), pile = [0];
dehors[0] = 1;
while (pile.length) { const i = pile.pop(), x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (!dehors[j] && !M[j]) { dehors[j] = 1; pile.push(j); } } }
const blob = new Uint8Array(W * H).map((_, i) => dehors[i] ? 0 : 1);
const blanc = new Uint8Array(W * H).map((_, i) => blob[i] && !M[i] ? 1 : 0);

// Composantes connexes du blanc (yeux et sourire du robot).
function composantes(masque) {
  const lab = new Int32Array(W * H).fill(-1), res = [];
  for (let i = 0; i < W * H; i++) if (masque[i] && lab[i] < 0) {
    const pts = [i], c = res.length; lab[i] = c;
    for (let k = 0; k < pts.length; k++) { const x = pts[k] % W, y = (pts[k] / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (y + dy) * W + x + dx; if (x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H && masque[j] && lab[j] < 0) { lab[j] = c; pts.push(j); } } }
    res.push(pts);
  }
  return res.filter((p) => p.length > 200).map((pts) => { const m = new Uint8Array(W * H); for (const i of pts) m[i] = 1; return m; });
}

// Contour extérieur d’un masque (Moore), puis simplification (Douglas-Peucker).
function contour(m) {
  const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  let s = -1; for (let i = 0; i < W * H && s < 0; i++) if (m[i]) s = i;
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const pts = []; let x = s % W, y = (s / W) | 0, d = 6; const sx = x, sy = y;
  do {
    pts.push([x, y]);
    let k = 0; d = (d + 6) % 8;
    while (k < 8 && !ok(x + dirs[d][0], y + dirs[d][1])) { d = (d + 1) % 8; k++; }
    if (k === 8) break;
    x += dirs[d][0]; y += dirs[d][1];
  } while ((x !== sx || y !== sy) && pts.length < W * H);
  return pts;
}
function simplifier(p, eps) {
  if (p.length < 3) return p;
  const [a, b] = [p[0], p[p.length - 1]]; let dmax = 0, idx = 0;
  for (let i = 1; i < p.length - 1; i++) { const d = Math.abs((b[1] - a[1]) * p[i][0] - (b[0] - a[0]) * p[i][1] + b[0] * a[1] - b[1] * a[0]) / Math.hypot(b[1] - a[1], b[0] - a[0] || 1e-9); if (d > dmax) { dmax = d; idx = i; } }
  return dmax > eps ? simplifier(p.slice(0, idx + 1), eps).slice(0, -1).concat(simplifier(p.slice(idx), eps)) : [a, b];
}
// Coordonnées normalisées : origine au centre du blob, rayon ≈ 1, axe y vers le haut.
const cx = W / 2, cy = H / 2, ech = Math.max(W, H) / 2;
const norme = (pts) => pts.map(([x, y]) => [+((x - cx) / ech).toFixed(4), +(-(y - cy) / ech).toFixed(4)]);
// Contour fermé : Douglas-Peucker ne sait pas traiter un tracé dont les extrémités coïncident ;
// on le coupe au point le plus éloigné du départ et on simplifie chaque moitié.
const fermer = (brut) => {
  // Moyenne glissante (7 points) : efface l’escalier des pixels avant la simplification.
  const n = brut.length, pts = brut.map((_, i) => {
    let sx = 0, sy = 0; for (let j = -3; j <= 3; j++) { const q = brut[(i + j + n) % n]; sx += q[0]; sy += q[1]; }
    return [sx / 7, sy / 7];
  });
  let k = 0, dmax = 0;
  pts.forEach(([x, y], i) => { const d = Math.hypot(x - pts[0][0], y - pts[0][1]); if (d > dmax) { dmax = d; k = i; } });
  return simplifier(pts.slice(0, k + 1), 0.45).slice(0, -1).concat(simplifier(pts.slice(k).concat([pts[0]]), 0.45).slice(0, -1));
};

// Les pixels isolés de l’anticrénelage forment de petites zones à part : on garde la plus grande.
const blobPrincipal = composantes(blob).sort((a, b) => b.reduce((s, v) => s + v, 0) - a.reduce((s, v) => s + v, 0))[0];
const formeBlob = norme(fermer(contour(blobPrincipal)));
const parties = composantes(blanc).map((m) => norme(fermer(contour(m))));
// Les deux yeux (écouteurs du stéthoscope) sont en haut ; le sourire (tube et pavillon) est la plus grande partie.
parties.sort((a, b) => b.length - a.length);
const [sourire, ...yeux] = parties;
yeux.sort((a, b) => Math.min(...a.map((p) => p[0])) - Math.min(...b.map((p) => p[0])));

const ts = `// Contours du symbole TRIMED, tracés depuis le logo officiel par scripts/brand/tracer-logo.mjs.
// Coordonnées normalisées : origine au centre du blob, axe y vers le haut. Ne pas modifier à la main.
export type Contour = ReadonlyArray<readonly [number, number]>;

export const BLOB: Contour = ${JSON.stringify(formeBlob)};
export const OEIL_GAUCHE: Contour = ${JSON.stringify(yeux[0])};
export const OEIL_DROIT: Contour = ${JSON.stringify(yeux[1])};
export const SOURIRE: Contour = ${JSON.stringify(sourire)};
`;
mkdirSync(path.join(RACINE, 'src/components/brand'), { recursive: true });
writeFileSync(path.join(RACINE, 'src/components/brand/robotFormes.ts'), ts);

// Tracé lissé : Catmull-Rom converti en courbes de Bézier cubiques (contour fermé).
const d = (pts) => {
  const P = pts.map(([x, y]) => [x * 50 + 50, -y * 50 + 50]), n = P.length, f = (v) => v.toFixed(2);
  let s = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    s += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return s + 'Z';
};
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="TRIMED">
  <path fill="#2720FF" d="${d(formeBlob)}"/>
  <path fill="#FFFFFF" d="${d(yeux[0])}${d(yeux[1])}${d(sourire)}"/>
</svg>
`;
mkdirSync(path.join(RACINE, 'public/brand'), { recursive: true });
writeFileSync(path.join(RACINE, 'public/brand/trimed-symbole.svg'), svg);
console.log(`blob ${formeBlob.length} pts · yeux ${yeux.map((y) => y.length).join('/')} pts · sourire ${sourire.length} pts · boîte ${W}×${H} px`);
