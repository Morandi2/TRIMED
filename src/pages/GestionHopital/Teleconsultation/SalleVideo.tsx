import { useEffect, useRef, useState } from 'react';
import { Mic, PhoneOff, Video, VideoOff } from 'lucide-react';
import type { Connexion } from '../../../api/teleconsultationApi';

interface JitsiApi { executeCommand: (commande: string, ...args: unknown[]) => void; addListener: (e: string, f: () => void) => void; dispose: () => void }
type JitsiConstructeur = new (domaine: string, options: Record<string, unknown>) => JitsiApi;

/** Charge une seule fois le script du fournisseur (meet.jit.si, 8x8.vc ou serveur de l'hôpital). */
function chargerScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[data-jitsi="${url}"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = url; script.async = true; script.dataset.jitsi = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script'));
    document.head.appendChild(script);
  });
}

interface Props { connexion: Connexion; onQuitter: () => void; onTerminer?: () => void }

/** Salle vidéo Jitsi intégrée. Réglée pour les connexions faibles (360p, audio seul possible), sans enregistrement. */
export default function SalleVideo({ connexion, onQuitter, onTerminer }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const api = useRef<JitsiApi | null>(null);
  const [erreur, setErreur] = useState('');
  const [videoCoupee, setVideoCoupee] = useState(connexion.mode_audio);

  useEffect(() => {
    let annule = false;
    chargerScript(connexion.script).then(() => {
      if (annule || !conteneur.current) return;
      const Jitsi = (window as unknown as { JitsiMeetExternalAPI?: JitsiConstructeur }).JitsiMeetExternalAPI;
      if (!Jitsi) { setErreur("Le service vidéo n'a pas répondu."); return; }
      api.current = new Jitsi(connexion.domaine, {
        roomName: connexion.salle,
        jwt: connexion.jwt ?? undefined,
        parentNode: conteneur.current,
        width: '100%', height: '100%',
        userInfo: { displayName: connexion.nom_affiche },
        configOverwrite: {
          prejoinPageEnabled: false, disableDeepLinking: true, startWithVideoMuted: connexion.mode_audio,
          resolution: 360, constraints: { video: { height: { ideal: 360, max: 360 } } },
          fileRecordingsEnabled: false, liveStreamingEnabled: false, transcribingEnabled: false,
        },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, MOBILE_APP_PROMO: false },
      });
      api.current.addListener('readyToClose', onQuitter);
    }).catch(() => setErreur("Impossible de joindre le service vidéo. Vérifiez la connexion Internet."));
    return () => { annule = true; api.current?.dispose(); api.current = null; };
  }, [connexion, onQuitter]);

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 dark:border-gray-800">
      {erreur ? <p className="m-auto p-6 text-center text-sm text-white">{erreur}</p> : <div ref={conteneur} className="flex-1" />}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-950 px-4 py-3 text-sm text-gray-200">
        <span>{connexion.fournisseur === 'public' && connexion.moderateur ? 'Si la salle le demande, connectez-vous (Google ou GitHub) pour l’ouvrir.' : 'Consultation privée, non enregistrée.'}</span>
        <span className="flex gap-2">
          <button type="button" onClick={() => { api.current?.executeCommand('toggleVideo'); setVideoCoupee(!videoCoupee); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">
            {videoCoupee ? <><Video className="h-4 w-4" aria-hidden="true" /> Activer la caméra</> : <><VideoOff className="h-4 w-4" aria-hidden="true" /> Audio seulement</>}
          </button>
          <button type="button" onClick={() => api.current?.executeCommand('toggleAudio')} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"><Mic className="h-4 w-4" aria-hidden="true" /> Micro</button>
          <button type="button" onClick={() => { api.current?.executeCommand('hangup'); (onTerminer ?? onQuitter)(); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700">
            <PhoneOff className="h-4 w-4" aria-hidden="true" /> {onTerminer ? 'Terminer la consultation' : 'Quitter'}
          </button>
        </span>
      </div>
    </div>
  );
}
