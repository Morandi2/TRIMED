import { useEffect, useState } from 'react';
import hospitalApi from '../../../../api/hospitalApi';

export interface Preferences { devise: string; duree_consultation_defaut: number }

const DUREES = [15, 20, 30, 45, 60];
const champ = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-trimed-indigo focus:ring-2 focus:ring-trimed-indigo/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

// Étape 4 : les réglages utilisés au quotidien. Seuls les réglages réellement pris en compte
// par l’application sont proposés ; les autres paramètres du serveur restent inchangés.
export function EtapePreferences({ valeur, onChange }: { valeur: Preferences; onChange: (p: Preferences) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Derniers réglages. Vous pourrez les modifier à tout moment depuis « Paramètres de l’hôpital ».
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Monnaie des factures
          <select className={`${champ} mt-1.5`} value={valeur.devise} onChange={(e) => onChange({ ...valeur, devise: e.target.value })}>
            <option value="HTG">Gourde (HTG)</option>
            <option value="USD">Dollar américain (USD)</option>
          </select>
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          Durée habituelle d’une consultation
          <select className={`${champ} mt-1.5`} value={valeur.duree_consultation_defaut} onChange={(e) => onChange({ ...valeur, duree_consultation_defaut: Number(e.target.value) })}>
            {DUREES.map((d) => <option key={d} value={d}>{d} minutes</option>)}
          </select>
        </label>
        <div className="text-sm text-gray-700 dark:text-gray-300 sm:col-span-2">
          Fuseau horaire
          <p className="mt-1.5 rounded-xl bg-gray-50 px-3.5 py-3 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Haïti (heure de Port-au-Prince)</p>
        </div>
      </div>
    </div>
  );
}

/** Charge les préférences existantes de l’hôpital (ou les valeurs par défaut). */
export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>({ devise: 'HTG', duree_consultation_defaut: 30 });
  const [existe, setExiste] = useState(false);
  useEffect(() => {
    let annule = false;
    hospitalApi.config.getParametres().then((res) => {
      if (annule || !res.success || !res.data) return;
      setExiste(true);
      setPrefs({ devise: res.data.devise || 'HTG', duree_consultation_defaut: Number(res.data.duree_consultation_defaut) || 30 });
    });
    return () => { annule = true; };
  }, []);
  return { prefs, setPrefs, existe };
}
