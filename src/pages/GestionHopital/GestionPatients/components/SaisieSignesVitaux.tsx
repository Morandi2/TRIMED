import { useState, type FormEvent } from 'react';
import apiClient from '../../../../api/apiConfig';
import { getApiErrorMessage } from '../../../../utils/apiErrorHandler';
import { bornes, limites, NOMBRES, REGLES, verifierDate, verifierNombre, versChamp, type RegleNombre } from '../../../../utils/contraintes';

interface Props {
  patientId: number;
  onEnregistre: () => void;
}

type Champ = 'temperature' | 'tension_arterielle_systolique' | 'tension_arterielle_diastolique' | 'pouls' | 'frequence_respiratoire' | 'poids' | 'taille' | 'glycemie';

// [champ du serveur, libellé, règle, pas de saisie]
const CHAMPS: [Champ, string, RegleNombre, string][] = [
  ['temperature', 'Température (°C)', NOMBRES.temperature, '0.1'],
  ['tension_arterielle_systolique', 'Tension systolique (mmHg)', NOMBRES.tensionSystolique, '1'],
  ['tension_arterielle_diastolique', 'Tension diastolique (mmHg)', NOMBRES.tensionDiastolique, '1'],
  ['pouls', 'Pouls (battements/min)', NOMBRES.pouls, '1'],
  ['frequence_respiratoire', 'Fréquence respiratoire (/min)', NOMBRES.frequenceRespiratoire, '1'],
  ['poids', 'Poids (kg)', NOMBRES.poids, '0.1'],
  ['taille', 'Taille (m)', NOMBRES.taille, '0.01'],
  ['glycemie', 'Glycémie (mmol/L)', NOMBRES.glycemie, '0.1'],
];

const vide = () => ({ date_suivi: versChamp(new Date(), 'date'), observations: '', ...Object.fromEntries(CHAMPS.map(([c]) => [c, ''])) as Record<Champ, string> });

// Relevé des constantes vitales par le personnel soignant (UC-05). Chaque valeur est bornée comme sur le serveur,
// et la tension diastolique doit rester inférieure à la systolique.
export function SaisieSignesVitaux({ patientId, onEnregistre }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState(vide);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const verifier = () => {
    const e: Record<string, string> = {};
    const d = verifierDate(form.date_suivi, { ...REGLES.antecedent, libelle: 'la date du relevé', min: { ans: -1 } });
    if (!form.date_suivi) e.date_suivi = 'Indiquez la date du relevé.';
    else if (d) e.date_suivi = d;
    for (const [c, , regle] of CHAMPS) { const m = verifierNombre(form[c], regle); if (m) e[c] = m; }
    const sys = Number(form.tension_arterielle_systolique), dia = Number(form.tension_arterielle_diastolique);
    if ((form.tension_arterielle_systolique === '') !== (form.tension_arterielle_diastolique === '')) e.tension_arterielle_diastolique = 'Saisissez les deux valeurs de la tension.';
    else if (form.tension_arterielle_systolique && !e.tension_arterielle_systolique && !e.tension_arterielle_diastolique && dia >= sys) e.tension_arterielle_diastolique = 'La tension diastolique doit être inférieure à la systolique.';
    if (CHAMPS.every(([c]) => form[c] === '') && !form.observations.trim()) e.general = 'Saisissez au moins une mesure ou une observation.';
    return e;
  };

  const enregistrer = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = verifier();
    setErreurs(e);
    if (Object.keys(e).length) return;
    setEnvoi(true); setErreurServeur('');
    try {
      const corps: Record<string, unknown> = { patient: patientId, date_suivi: form.date_suivi, observations: form.observations.trim() || null };
      for (const [c] of CHAMPS) if (form[c] !== '') corps[c] = Number(String(form[c]).replace(',', '.'));
      await apiClient.post('/patients/suivis/', corps);
      setForm(vide()); setOuvert(false); onEnregistre();
    } catch (err) {
      setErreurServeur(getApiErrorMessage(err));
    } finally { setEnvoi(false); }
  };

  const champ = 'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 dark:bg-gray-800 dark:text-white';
  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className="mt-3 rounded-lg border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-500/40 dark:text-brand-300 dark:hover:bg-brand-500/10">
        Saisir des signes vitaux
      </button>
    );
  }
  return (
    <form onSubmit={enregistrer} noValidate className="mt-3 space-y-3 rounded-xl border border-gray-200 p-4 dark:border-white/10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-xs text-gray-600 dark:text-gray-400">Date du relevé
          <input type="date" className={`${champ} mt-1 ${erreurs.date_suivi ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            {...bornes({ ...REGLES.antecedent, min: { ans: -1 } }, 'date')} value={form.date_suivi} onChange={(e) => setForm({ ...form, date_suivi: e.target.value })} />
          {erreurs.date_suivi && <span className="mt-1 block text-red-600">{erreurs.date_suivi}</span>}
        </label>
        {CHAMPS.map(([c, libelle, regle, pas]) => (
          <label key={c} className="text-xs text-gray-600 dark:text-gray-400">{libelle}
            <input type="number" inputMode="decimal" {...limites(regle)} step={pas} value={form[c]}
              onChange={(e) => setForm({ ...form, [c]: e.target.value })}
              className={`${champ} mt-1 ${erreurs[c] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            {erreurs[c] && <span className="mt-1 block text-red-600">{erreurs[c]}</span>}
          </label>
        ))}
      </div>
      <label className="block text-xs text-gray-600 dark:text-gray-400">Observations
        <textarea rows={2} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className={`${champ} mt-1 border-gray-300 dark:border-gray-600`} />
      </label>
      {(erreurs.general || erreurServeur) && <p role="alert" className="text-sm text-red-600">{erreurs.general || erreurServeur}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setOuvert(false); setErreurs({}); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">Annuler</button>
        <button type="submit" disabled={envoi} className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}
