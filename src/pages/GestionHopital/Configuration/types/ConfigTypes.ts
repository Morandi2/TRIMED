export interface HospitalConfig {
  hospital_id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  logo?: string;
  couleur_principale: string;
  langue_defaut: string;
  fuseau_horaire: string;
  devise: string;
  format_date: string;
  capacite_totale: number;
  branches: Branch[];
  is_configured: boolean;
}

export interface Branch {
  branch_id?: number;
  nom: string;
  adresse: string;
  telephone: string;
  responsable: string;
  specialites: string[];
  capacite_lits: number;
  departements: Department[];
}

export interface Department {
  department_id?: number;
  nom: string;
  type: string;
  lits_total: number;
  lits_disponibles: number;
  lits_icu?: number;
  lits_pediatrie?: number;
  chambres_privees?: number;
  rooms?: Room[];
}

export interface Room {
  room_id?: string;
  nom: string; // e.g. "Chambre 101"
  type: 'standard' | 'icu' | 'pediatrie' | 'vip';
  beds: Bed[];
}

export interface Bed {
  bed_id: string; // e.g. "B1-101"
  status: 'disponible' | 'occupe' | 'maintenance';
}

export interface ConfigStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}
