import React, { useState } from 'react';
import { ChoixRecherche, type OptionRecherche } from '../../../../components/form/ChoixRecherche';
import { rendezVousService } from '../services/RendezVousService';

interface SearchableSelectProps {
  value: string;
  onChange: (name: string, id?: number) => void;
  type: 'patient' | 'medecin';
  required?: boolean;
  placeholder?: string;
  error?: string;
}

type Personne = { patient_id?: number; medecin_id?: number; nom: string; prenom?: string; telephone?: string; numero_dossier_medical?: string; specialite?: string };

/** Nom affiché d'un patient ou d'un médecin (le même que celui transmis au formulaire). */
export const nomAffiche = (p: Personne, type: 'patient' | 'medecin') =>
  `${type === 'medecin' ? 'Dr ' : ''}${p.prenom ?? ''} ${p.nom}`.replace(/\s+/g, ' ').trim();

// Choix du patient ou du médecin d'un rendez-vous : toute la liste est proposée dès l'ouverture, et elle se ferme
// dès qu'on passe au champ suivant. Le nom complet (prénom et nom) est transmis, plus seulement le nom de famille.
export const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, type, required = false, placeholder, error }) => {
  const [idChoisi, setIdChoisi] = useState<number | null>(null);
  const personnes = (type === 'patient' ? rendezVousService.rechercherPatients('') : rendezVousService.rechercherMedecins('')) as Personne[];
  const options: OptionRecherche[] = personnes.map((p) => ({
    id: (type === 'patient' ? p.patient_id : p.medecin_id) as number,
    libelle: nomAffiche(p, type),
    detail: (type === 'patient' ? [p.numero_dossier_medical, p.telephone] : [p.specialite]).filter(Boolean).join(', ') || undefined,
    motsCles: `${p.telephone ?? ''} ${p.numero_dossier_medical ?? ''}`,
  }));
  const choisie = options.find((o) => o.id === idChoisi && o.libelle === value) ?? options.find((o) => o.libelle === value);

  return (
    <ChoixRecherche
      label={type === 'patient' ? 'Patient' : 'Médecin'}
      options={options}
      valeur={choisie?.id ?? null}
      onChange={(id, o) => { setIdChoisi(id); onChange(o.libelle, id); }}
      placeholder={placeholder}
      required={required}
      error={error}
    />
  );
};
