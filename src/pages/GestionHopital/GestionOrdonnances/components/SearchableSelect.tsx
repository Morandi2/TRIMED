import React, { useState } from 'react';
import { ChoixRecherche, type OptionRecherche } from '../../../../components/form/ChoixRecherche';
import { ordonnanceService } from '../services/OrdonnanceService';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string, id?: number) => void;
  error?: string;
  required?: boolean;
  type: 'patient' | 'medecin' | 'consultation';
  placeholder?: string;
}

const LIBELLES = { patient: 'Patient', medecin: 'Médecin', consultation: 'Consultation' } as const;

// Choix du patient, du médecin ou de la consultation d'une ordonnance (liste qui se ferme dès qu'on passe à un autre champ).
export const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, error, required, type, placeholder }) => {
  const [idChoisi, setIdChoisi] = useState<number | null>(null);

  const options: OptionRecherche[] = type === 'patient'
    ? ordonnanceService.obtenirPatients().map((p) => ({
      id: p.patient_id, libelle: `${p.prenom} ${p.nom}`, detail: p.telephone || undefined, motsCles: p.telephone ?? '',
    }))
    : type === 'medecin'
      ? ordonnanceService.obtenirMedecins().map((m) => ({ id: m.medecin_id, libelle: `Dr ${m.prenom} ${m.nom}` }))
      : ordonnanceService.obtenirConsultations().map((c) => {
        const date = c.date_consultation ? new Date(c.date_consultation).toLocaleDateString('fr-HT') : '';
        return {
          id: c.consultation_id,
          libelle: ordonnanceService.obtenirConsultationInfo(c.consultation_id)?.motif || c.motif || `Consultation n° ${c.consultation_id}`,
          detail: [ordonnanceService.obtenirNomPatient(c.patient_id), date].filter(Boolean).join(', ') || undefined,
          motsCles: ordonnanceService.obtenirNomPatient(c.patient_id) ?? '',
        };
      });

  const choisie = options.find((o) => o.id === idChoisi && o.libelle === value) ?? options.find((o) => o.libelle === value);

  return (
    <ChoixRecherche
      label={LIBELLES[type]}
      options={options}
      valeur={choisie?.id ?? null}
      onChange={(id, o) => { setIdChoisi(id); onChange(o.libelle, id); }}
      placeholder={placeholder}
      required={required}
      error={error}
    />
  );
};
