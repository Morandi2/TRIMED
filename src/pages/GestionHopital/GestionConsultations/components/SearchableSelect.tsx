import React, { useState } from 'react';
import { ChoixRecherche, type OptionRecherche } from '../../../../components/form/ChoixRecherche';
import { consultationService } from '../services/ConsultationService';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string, id?: number) => void;
  error?: string;
  required?: boolean;
  type: 'patient' | 'medecin';
  placeholder?: string;
}

// Choix du patient ou du médecin d'une consultation (liste qui se ferme dès qu'on passe à un autre champ).
export const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, error, required, type, placeholder }) => {
  const [idChoisi, setIdChoisi] = useState<number | null>(null);

  const options: OptionRecherche[] = type === 'patient'
    ? consultationService.obtenirPatients().map((p) => ({
      id: p.patient_id, libelle: `${p.prenom} ${p.nom}`,
      detail: [p.numero_dossier_medical, p.telephone].filter(Boolean).join(', ') || undefined,
      motsCles: `${p.telephone ?? ''} ${p.numero_dossier_medical ?? ''}`,
    }))
    : consultationService.obtenirMedecins().map((m) => ({ id: m.medecin_id, libelle: `Dr ${m.prenom} ${m.nom}` }));

  // La valeur reçue est un nom : on garde l'identifiant choisi pour distinguer deux homonymes.
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
