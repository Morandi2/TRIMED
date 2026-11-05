import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

/** Bandeau discret : prévient quand l’appareil perd Internet, puis quand la connexion revient. */
export default function BanniereReseau() {
  const [enLigne, setEnLigne] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [retour, setRetour] = useState(false);

  useEffect(() => {
    let minuteur = 0;
    const horsLigne = () => { setEnLigne(false); setRetour(false); };
    const revenu = () => {
      setEnLigne(true);
      setRetour(true);
      clearTimeout(minuteur);
      minuteur = window.setTimeout(() => setRetour(false), 4000);
    };
    window.addEventListener("offline", horsLigne);
    window.addEventListener("online", revenu);
    return () => { window.removeEventListener("offline", horsLigne); window.removeEventListener("online", revenu); clearTimeout(minuteur); };
  }, []);

  if (enLigne && !retour) return null;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-3 z-[100000] flex justify-center px-4">
      <div className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm shadow-lg ${enLigne ? "bg-trimed-vert text-white" : "bg-gray-900 text-white dark:bg-white dark:text-gray-900"}`}>
        {enLigne ? <Wifi className="h-4 w-4" aria-hidden="true" /> : <WifiOff className="h-4 w-4" aria-hidden="true" />}
        {enLigne ? "Connexion rétablie." : "Pas de connexion Internet. Ce qui est déjà affiché reste consultable."}
      </div>
    </div>
  );
}
