import config from '../config/environment';

// Le backend (offre gratuite de Render) s’endort après 15 minutes sans requête et met 30 à 90 secondes
// à redémarrer. On le réveille dès qu’un visiteur arrive sur le site : le temps qu’il lise la page
// et clique sur « Se connecter », le serveur est prêt. Une requête au plus toutes les 10 minutes.
const CLE = 'trimed-reveil-serveur';
const INTERVALLE = 10 * 60 * 1000;

export function reveillerServeur() {
  try {
    const dernier = Number(sessionStorage.getItem(CLE) || 0);
    if (Date.now() - dernier < INTERVALLE) return;
    sessionStorage.setItem(CLE, String(Date.now()));
  } catch {
    // stockage indisponible (navigation privée stricte) : on réveille quand même
  }
  const sante = new URL('/health/', config.API_BASE_URL).toString();
  fetch(sante, { mode: 'no-cors', cache: 'no-store', keepalive: true }).catch(() => undefined);
}
