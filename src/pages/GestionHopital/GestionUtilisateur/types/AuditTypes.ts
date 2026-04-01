export interface AuditLog {
  id: number;
  utilisateur: string;
  action: string;
  module: string;
  date: string;
  details: any;
  ip_address: string;
}

export interface AuditLogFilters {
  search: string;
  module: string;
  date_debut: string;
  date_fin: string;
}
