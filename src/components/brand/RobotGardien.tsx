import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { BLOB, OEIL_DROIT, OEIL_GAUCHE, SOURIRE, type Contour } from './robotFormes';

// Le robot gardien en 3D : le blob du logo en verre indigo, son visage-stéthoscope en relief.
// La page lui transmet une progression de 0 à 1 (le défilement de l’ouverture et de l’histoire) :
//   0 → 0,18    ouverture : le robot est entier, à droite du titre ;
//   0,18 → 0,45 « Aujourd’hui » : il se brise, des fiches papier s’éparpillent ;
//   0,45 → 0,72 « Avec TRIMED » : les morceaux se rassemblent, les fiches sont absorbées ;
//   0,72 → 1    « En sécurité » : un halo protecteur l’entoure.
// Matériau et studio de lumière repris du moteur « Premium 3D Glass ».

export interface EtatRobot { progression: number }

interface Props {
  etat: MutableRefObject<EtatRobot>;
  mouvementReduit: boolean;
  /** Appelé si WebGL n’est pas disponible : la page affiche alors le symbole 2D. */
  onIndisponible?: () => void;
  /** Appelé après la première image : la page peut alors fondre le symbole 2D. */
  onPret?: () => void;
  className?: string;
}

type V2 = THREE.Vector2;
const ECHELLE = 1.35, PROFONDEUR = 0.42, BISEAU = 0.05;
const lisse = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const entre = (a: number, b: number, t: number) => a + (b - a) * t;

const versPoints = (c: Contour) => c.map(([x, y]) => new THREE.Vector2(x * ECHELLE, y * ECHELLE));
const centreDe = (pts: V2[]) => {
  let a = 0, cx = 0, cy = 0;
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], k = p.x * q.y - q.x * p.y; a += k; cx += (p.x + q.x) * k; cy += (p.y + q.y) * k; });
  return new THREE.Vector2(cx / (3 * a), cy / (3 * a));
};

// Découpe convexe (Sutherland-Hodgman) : la silhouette coupée par un secteur angulaire.
function decouper(sujet: V2[], secteur: V2[]): V2[] {
  let sortie = sujet;
  for (let i = 0; i < secteur.length; i++) {
    const A = secteur[i], B = secteur[(i + 1) % secteur.length], entree = sortie;
    const dedans = (p: V2) => (B.x - A.x) * (p.y - A.y) - (B.y - A.y) * (p.x - A.x) >= 0;
    const croise = (P: V2, Q: V2) => {
      const d = (P.x - Q.x) * (A.y - B.y) - (P.y - Q.y) * (A.x - B.x);
      const t = ((P.x - A.x) * (A.y - B.y) - (P.y - A.y) * (A.x - B.x)) / d;
      return new THREE.Vector2(P.x + t * (Q.x - P.x), P.y + t * (Q.y - P.y));
    };
    sortie = [];
    entree.forEach((P, j) => {
      const Q = entree[(j + 1) % entree.length];
      if (dedans(P)) sortie.push(P);
      if (dedans(P) !== dedans(Q)) sortie.push(croise(P, Q));
    });
  }
  return sortie;
}

function prisme(points: V2[], profondeur: number, biseau: number) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(points), {
    depth: profondeur, bevelEnabled: true, bevelSize: biseau, bevelThickness: biseau * 1.2, bevelOffset: -biseau, bevelSegments: 4, curveSegments: 1
  });
  g.translate(0, 0, -profondeur / 2);
  g.computeVertexNormals();
  return g;
}

// Studio de panneaux lumineux (moteur Premium 3D Glass), teinté aux couleurs TRIMED.
function environnement(rendu: THREE.WebGLRenderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color('#1b2042');
  const panneaux: [number, number, number, number, number, string, number][] = [
    [2.8, 8, -4, 2, 3, '#ffffff', 2.6], [0.65, 7, 3, 1, 2, '#e4fff4', 4.0], [5, 0.7, 0, 5, -1, '#ffffff', 3.5],
    [0.5, 6, -2, 0, -4, '#7b77ff', 3.0], [1.0, 5, 3, -1, -3, '#b3f4db', 2.4], [4, 0.35, 0, -3, 3, '#92a8ff', 3.0],
    [0.16, 5, -3, 0, 2, '#ffffff', 5.0], [0.35, 4, 4, 0, -2, '#02c377', 2.0],
    // Grande boîte à lumière face au robot : la face avant, tournée vers la caméra, prend un reflet doux.
    [7, 3.2, -1.5, 2.6, 6, '#ffffff', 1.6], [5, 1.2, 1.5, -2.2, 6, '#b3f4db', 1.2]
  ];
  for (const [w, h, x, y, z, couleur, intensite] of panneaux) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(couleur).multiplyScalar(intensite), side: THREE.DoubleSide }));
    p.position.set(x, y, z); p.lookAt(0, 0, 0); studio.add(p);
  }
  const pmrem = new THREE.PMREMGenerator(rendu);
  const texture = pmrem.fromScene(studio, 0.025, 0.1, 100).texture;
  studio.traverse((o) => { if ((o as THREE.Mesh).isMesh) { (o as THREE.Mesh).geometry.dispose(); ((o as THREE.Mesh).material as THREE.Material).dispose(); } });
  pmrem.dispose();
  return texture;
}

function textureAura() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d')!, d = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  d.addColorStop(0, 'rgba(120,116,255,0.55)'); d.addColorStop(0.45, 'rgba(2,195,119,0.18)'); d.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = d; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export default function RobotGardien({ etat, mouvementReduit, onIndisponible, onPret, className = '' }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hote = conteneur.current;
    if (!hote) return;
    let rendu: THREE.WebGLRenderer;
    try {
      rendu = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      onIndisponible?.();
      return;
    }
    rendu.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    rendu.toneMapping = THREE.ACESFilmicToneMapping;
    rendu.toneMappingExposure = 1.05;
    rendu.outputColorSpace = THREE.SRGBColorSpace;
    rendu.setClearColor(0x000000, 0);
    hote.appendChild(rendu.domElement);
    rendu.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 8.5);
    // Préparation en plusieurs étapes (voir plus bas) : rien n’est dessiné avant que les shaders soient prêts.
    let env: THREE.Texture | null = null, prepare = false, annule = false;
    const lumiere = new THREE.DirectionalLight('#ffffff', 1.2);
    lumiere.position.set(2, 3, 5);
    scene.add(lumiere, new THREE.AmbientLight('#ffffff', 0.35));

    // Matériaux. Verre indigo translucide plutôt qu’une transmission physique : sur un canevas transparent,
    // la transmission n’a rien à réfracter (le fond de page est en CSS) et coûte cher aux machines modestes.
    const verre = new THREE.MeshPhysicalMaterial({
      color: '#2720ff', metalness: 0.05, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.03,
      iridescence: 0.55, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 480],
      sheen: 0.5, sheenColor: new THREE.Color('#b3f4db'), sheenRoughness: 0.35,
      envMapIntensity: 2.2, transparent: true, opacity: 0.9
    });
    const blanc = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, emissive: '#ffffff', emissiveIntensity: 0.45 });
    const papier = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.6, emissive: '#ffffff', emissiveIntensity: 0.55, side: THREE.DoubleSide, transparent: true });

    // Le robot : corps entier (au repos) et quatre fragments (pendant la cassure)
    const robot = new THREE.Group();
    scene.add(robot);
    const pointsBlob = versPoints(BLOB), centre = centreDe(pointsBlob);
    const corps = new THREE.Mesh(prisme(pointsBlob, PROFONDEUR, BISEAU), verre);
    robot.add(corps);

    const fragments: { mesh: THREE.Mesh; direction: THREE.Vector3; axe: THREE.Vector3; base: THREE.Vector3 }[] = [];
    const depart = 0.35;
    for (let k = 0; k < 4; k++) {
      const a1 = depart + k * Math.PI / 2 + (k % 2 ? 0.12 : -0.08), a2 = depart + (k + 1) * Math.PI / 2 + ((k + 1) % 2 ? 0.12 : -0.08), am = (a1 + a2) / 2;
      const secteur = [centre.clone(), ...[a1, am, a2].map((a) => new THREE.Vector2(centre.x + 6 * Math.cos(a), centre.y + 6 * Math.sin(a)))];
      const morceau = decouper(pointsBlob, secteur);
      if (morceau.length < 3) continue;
      const c = centreDe(morceau);
      const geo = prisme(morceau.map((p) => p.clone().sub(c)), PROFONDEUR, BISEAU * 0.7);
      const mesh = new THREE.Mesh(geo, verre);
      mesh.position.set(c.x, c.y, 0);
      mesh.visible = false;
      robot.add(mesh);
      const dir = new THREE.Vector3(c.x - centre.x, c.y - centre.y, 0).normalize();
      dir.z = (k % 2 ? 0.55 : -0.35);
      fragments.push({ mesh, direction: dir, axe: new THREE.Vector3(Math.sin(k * 2.1), Math.cos(k * 1.3), 0.4).normalize(), base: mesh.position.clone() });
    }

    // Le visage : deux yeux (écouteurs du stéthoscope) et le sourire (tube et pavillon)
    const avant = PROFONDEUR / 2 + BISEAU * 1.2 + 0.015;
    const visage = [OEIL_GAUCHE, OEIL_DROIT, SOURIRE].map((contour, i) => {
      const pts = versPoints(contour), c = centreDe(pts);
      const mesh = new THREE.Mesh(prisme(pts.map((p) => p.clone().sub(c)), 0.07, 0.018), blanc);
      mesh.position.set(c.x, c.y, avant);
      robot.add(mesh);
      return { mesh, base: mesh.position.clone(), fuite: new THREE.Vector3(i === 0 ? -0.9 : i === 1 ? 0.9 : 0, i === 2 ? -1.1 : 1.0, 1.2) };
    });

    // Fiches papier : les dossiers dispersés de « Aujourd’hui »
    const fiches = Array.from({ length: 7 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), papier.clone());
      const angle = (i / 7) * Math.PI * 2 + 0.4;
      m.visible = false;
      scene.add(m);
      return { mesh: m, cible: new THREE.Vector3(Math.cos(angle) * (1.45 + (i % 3) * 0.25), Math.sin(angle) * (1.05 + (i % 2) * 0.25), -0.4 + (i % 3) * 0.5), tour: (i % 2 ? 1 : -1) * (0.6 + i * 0.12) };
    });

    // Halo protecteur et aura
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureAura(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45 }));
    aura.scale.set(5.2, 5.2, 1);
    aura.position.z = -0.8;
    robot.add(aura);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.014, 12, 160), new THREE.MeshBasicMaterial({ color: '#02c377', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.008, 12, 160), new THREE.MeshBasicMaterial({ color: '#7b77ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    robot.add(halo, halo2);

    // Pointeur (inclinaison douce du robot vers la souris)
    const pointeur = { x: 0, y: 0, cx: 0, cy: 0 };
    const surPointeur = (e: PointerEvent) => { pointeur.x = (e.clientX / window.innerWidth) * 2 - 1; pointeur.y = (e.clientY / window.innerHeight) * 2 - 1; };
    if (!mouvementReduit) window.addEventListener('pointermove', surPointeur, { passive: true });

    // Dimensions : le cadrage dépend du champ visible, pour que le robot reste du côté opposé au texte
    let portrait = false, demiLargeur = 3, demiHauteur = 2.4, taille = 1;
    const redimensionner = () => {
      const { width, height } = hote.getBoundingClientRect();
      if (!width || !height) return;
      rendu.setSize(width, height, false);
      camera.aspect = width / height;
      portrait = camera.aspect < 0.95;
      camera.position.z = portrait ? 10.5 : 8.5;
      camera.updateProjectionMatrix();
      demiHauteur = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      demiLargeur = demiHauteur * camera.aspect;
      // Rayon visé : un tiers de la hauteur visible, sans dépasser un quart de la largeur
      // En portrait, le robot occupe le haut de l’écran, au-dessus du texte : plus petit.
      taille = Math.min(demiHauteur * (portrait ? 0.2 : 0.36), demiLargeur * (portrait ? 0.62 : 0.24)) / ECHELLE;
      if (mouvementReduit && prepare) dessiner(performance.now());
    };
    const observateur = new ResizeObserver(redimensionner);
    observateur.observe(hote);

    // Position horizontale du robot selon le chapitre (le texte occupe l’autre côté)
    const positionX = (p: number) => {
      if (portrait) return 0;
      const d = demiLargeur * 0.56;
      if (p < 0.18) return d;
      if (p < 0.27) return entre(d, -d, lisse(0.18, 0.27, p));
      if (p < 0.70) return -d;
      return entre(-d, d, lisse(0.70, 0.79, p));
    };

    let prochainClin = performance.now() + 2500, debutClin = -1, signale = false;
    function dessiner(t: number) {
      const p = mouvementReduit ? Math.round(etat.current.progression * 4) / 4 : etat.current.progression;
      const casse = mouvementReduit ? 0 : lisse(0.22, 0.38, p) * (1 - lisse(0.48, 0.64, p));
      const securite = lisse(0.74, 0.86, p);
      const sec = t / 1000;

      pointeur.cx += (pointeur.x - pointeur.cx) * 0.06;
      pointeur.cy += (pointeur.y - pointeur.cy) * 0.06;
      robot.position.x += (positionX(p) - robot.position.x) * (mouvementReduit ? 1 : 0.08);
      robot.position.y = (portrait ? demiHauteur * 0.55 : 0) + (mouvementReduit ? 0 : Math.sin(sec * 0.9) * 0.06);
      robot.scale.setScalar(taille);
      // Le robot se tourne légèrement vers le centre de l’écran : on lit son épaisseur de verre.
      const versCentre = portrait ? 0 : -Math.sign(robot.position.x) * Math.min(1, Math.abs(robot.position.x)) * 0.3;
      robot.rotation.y = versCentre + (mouvementReduit ? 0 : Math.sin(sec * 0.45) * 0.14 + pointeur.cx * 0.3 + casse * 0.5);
      robot.rotation.x = mouvementReduit ? 0.04 : pointeur.cy * 0.18;

      // Corps entier au repos, fragments pendant la cassure
      const enMorceaux = casse > 0.002;
      corps.visible = !enMorceaux;
      for (const f of fragments) {
        f.mesh.visible = enMorceaux;
        f.mesh.position.copy(f.base).addScaledVector(f.direction, casse * 0.95);
        f.mesh.setRotationFromAxisAngle(f.axe, casse * 0.95);
      }
      // Clin d’œil de temps en temps, quand le robot est entier
      let ouverture = 1;
      if (!mouvementReduit && !enMorceaux) {
        if (debutClin < 0 && t > prochainClin) debutClin = t;
        if (debutClin >= 0) {
          const u = (t - debutClin) / 170;
          ouverture = u < 1 ? 1 - Math.sin(u * Math.PI) * 0.88 : 1;
          if (u >= 1) { debutClin = -1; prochainClin = t + 3200 + Math.random() * 3000; }
        }
      }
      visage.forEach((v, i) => {
        v.mesh.position.copy(v.base).addScaledVector(v.fuite, casse * 0.8);
        v.mesh.rotation.z = casse * (i === 2 ? 0.5 : i ? -0.7 : 0.7);
        v.mesh.scale.set(1, i < 2 ? ouverture : 1, 1);
      });

      // Fiches : sorties pendant la cassure, absorbées pendant la recomposition
      const sortie = mouvementReduit ? 0 : lisse(0.24, 0.40, p), absorbe = lisse(0.50, 0.66, p);
      fiches.forEach((f, i) => {
        const visible = sortie > 0.01 && absorbe < 0.99;
        f.mesh.visible = visible;
        if (!visible) return;
        const ici = new THREE.Vector3().lerpVectors(new THREE.Vector3(robot.position.x, robot.position.y, -0.3), f.cible.clone().add(new THREE.Vector3(robot.position.x, robot.position.y, 0)), sortie * (1 - absorbe));
        ici.y += Math.sin(sec * 0.8 + i) * 0.05;
        f.mesh.position.copy(ici);
        f.mesh.rotation.set(0.3 * Math.sin(sec * 0.5 + i), f.tour * sortie + sec * 0.15 * f.tour, 0.25 * f.tour);
        f.mesh.scale.setScalar(Math.max(0.001, sortie * (1 - absorbe)));
        (f.mesh.material as THREE.MeshPhysicalMaterial).opacity = 0.92 * (1 - absorbe);
      });

      // Halo protecteur du chapitre « En sécurité »
      (halo.material as THREE.MeshBasicMaterial).opacity = 0.75 * securite;
      (halo2.material as THREE.MeshBasicMaterial).opacity = 0.5 * securite;
      halo.scale.setScalar(0.8 + 0.2 * securite);
      halo2.scale.setScalar(0.85 + 0.15 * securite);
      // Orbites presque horizontales, qui passent devant et derrière le robot sans barrer son visage
      halo.rotation.set(1.32 + Math.sin(sec * 0.6) * 0.05, 0, 0.18 + Math.sin(sec * 0.35) * 0.08);
      halo2.rotation.set(1.42, 0, -0.32 + Math.sin(sec * 0.28) * 0.06);
      (aura.material as THREE.SpriteMaterial).opacity = 0.4 + 0.35 * securite - 0.2 * casse;

      rendu.render(scene, camera);
      if (!signale) { signale = true; onPret?.(); }
    }

    // Boucle d’animation, suspendue quand le robot n’est pas à l’écran ou que l’onglet est caché
    let boucle = 0, visible = true;
    const tourner = (t: number) => { dessiner(t); boucle = requestAnimationFrame(tourner); };
    const demarrer = () => { if (prepare && !boucle && visible && !document.hidden && !mouvementReduit) boucle = requestAnimationFrame(tourner); };
    const arreter = () => { cancelAnimationFrame(boucle); boucle = 0; };
    const vue = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) demarrer(); else arreter(); });
    vue.observe(hote);
    const onglet = () => (document.hidden ? arreter() : demarrer());
    document.addEventListener('visibilitychange', onglet);
    // En mouvement réduit : une image fixe, redessinée seulement quand le chapitre change
    const surDefilement = () => mouvementReduit && prepare && dessiner(performance.now());
    if (mouvementReduit) window.addEventListener('scroll', surDefilement, { passive: true });

    // Le studio de lumière et la compilation des shaders du verre sont les étapes les plus lourdes.
    // On rend la main au navigateur entre chacune, et les shaders se compilent en arrière-plan
    // (compileAsync) : la page reste fluide pendant que le robot se prépare.
    const pause = () => new Promise<void>((r) => setTimeout(r, 0));
    let compilation: Promise<unknown> = Promise.resolve();
    (async () => {
      await pause();
      if (annule) return;
      env = environnement(rendu);
      scene.environment = env;
      await pause();
      if (annule) return;
      compilation = rendu.compileAsync(scene, camera);
      await compilation;
      if (annule) return;
      prepare = true;
      redimensionner();
      demarrer();
    })();

    return () => {
      annule = true;
      arreter();
      vue.disconnect();
      observateur.disconnect();
      document.removeEventListener('visibilitychange', onglet);
      window.removeEventListener('pointermove', surPointeur);
      window.removeEventListener('scroll', surDefilement);
      rendu.domElement.remove();
      // Une compilation en cours interroge encore les shaders : on libère le GPU une fois qu’elle est finie.
      void compilation.then(() => {
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[] | undefined;
          if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => { (x as THREE.SpriteMaterial).map?.dispose(); x.dispose(); });
        });
        env?.dispose();
        rendu.dispose();
      });
    };
  }, [etat, mouvementReduit, onIndisponible, onPret]);

  return <div ref={conteneur} className={className} />;
}
