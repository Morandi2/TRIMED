import { BedDouble, Building2, CalendarCheck, ClipboardList, KeyRound, Lock, Pill, Stethoscope, UserCog, Users } from 'lucide-react';

const ICONES = {
  dossier: ClipboardList, stethoscope: Stethoscope, agenda: CalendarCheck, pharmacie: Pill, lit: BedDouble, equipe: Users,
  cle: KeyRound, espace: Building2, role: UserCog, cadenas: Lock
};

export type NomIcone = keyof typeof ICONES;

export default function Icone({ nom }: { nom: NomIcone }) {
  const I = ICONES[nom];
  return <span className="ptl-icone"><I className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" /></span>;
}
