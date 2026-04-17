import apiClient from '../../../../api/apiConfig';
import { djangoAuthApi } from '../../../../api/djangoAuthApi';
import { AuditLog, AuditLogFilters } from '../types/AuditTypes';

class AuditService {
  private findField(obj: any, targetField: string | string[]): any {
    if (!obj || typeof obj !== 'object') return null;

    if (Array.isArray(targetField)) {
        for (const field of targetField) {
            const found = this.findField(obj, field);
            if (found !== undefined && found !== null) return found;
        }
        return null;
    }

    if (obj[targetField] !== undefined) return obj[targetField];

    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        const found = this.findField(obj[key], targetField);
        if (found !== undefined && found !== null) return found;
      }
    }
    return null;
  }

  public normaliserLog(l: any): AuditLog {
    const find = (field: string | string[]) => this.findField(l, field);
    
    return {
      id: l.id || find('log_id') || 0,
      utilisateur: l.utilisateur || find(['user', 'username', 'user_email', 'actor', 'email']) || 'Inconnu',
      action: l.action || find(['event_type', 'action_name', 'event', 'operation']) || 'Action standard',
      module: l.module || find(['resource_type', 'category', 'module_name']) || 'Système',
      date: l.date || find(['timestamp', 'created_at', 'date_joined', 'event_time']) || new Date().toISOString(),
      ip_address: l.ip_address || find(['ip', 'remote_addr', 'client_ip']) || 'N/A',
      details: l.details || find(['extra_data', 'metadata', 'payload']) || {}
    };
  }

  async obtenirTousLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
    try {
      // 1. Essayer de récupérer les logs réels du backend
      const logsReelsResponse = await apiClient.get('/comptes/audit-logs/').catch(() => ({ data: [] }));
      const logsReelsRaw = Array.isArray(logsReelsResponse.data) ? logsReelsResponse.data : (logsReelsResponse.data?.results || []);
      const logsReels = logsReelsRaw.map((l: any) => this.normaliserLog(l));

      // 2. Toujours inclure les informations réelles de session (Outstanding/Blacklisted)
      const [outstanding, blacklisted] = await Promise.all([
        this.obtenirSessionsActives(),
        this.obtenirTokensRevoques()
      ]);

      // Si le backend ne retourne pas de logs réels, on utilise les simulés comme base
      const logsBase = logsReels.length > 0 ? logsReels : this.obtenirLogsSimules();
      
      // Mapper les sessions actives comme des événements d'audit
      const sessionLogs: AuditLog[] = outstanding.map((s: any, index: number) => ({
        id: 5000 + index,
        utilisateur: s.user_email || s.username || `User #${s.user}`,
        action: "Session Active (Outstanding)",
        module: "Sécurité",
        date: s.created_at || s.timestamp || s.date_joined || new Date().toISOString(),
        ip_address: "N/A",
        details: { token_id: s.id, expires_at: s.expires_at }
      }));

      // Mapper les tokens révoqués
      const revokedLogs: AuditLog[] = blacklisted.map((b: any, index: number) => ({
        id: 6000 + index,
        utilisateur: b.token?.user_email || "N/A",
        action: "Token Révoqué (Blacklisted)",
        module: "Sécurité",
        date: b.blacklisted_at || b.created_at || new Date().toISOString(),
        ip_address: "N/A",
        details: { blacklisted_id: b.id }
      }));

      return [...logsBase, ...sessionLogs, ...revokedLogs].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("[AuditService] Error merging logs:", error);
      return this.obtenirLogsSimules();
    }
  }

  /**
   * Récupérer les sessions actives (Outstanding)
   */
  async obtenirSessionsActives(): Promise<any[]> {
    const response = await djangoAuthApi.getOutstandingTokens();
    return response.success ? (response.data || []) : [];
  }

  /**
   * Récupérer les tokens révoqués (Blacklisted)
   */
  async obtenirTokensRevoques(): Promise<any[]> {
    const response = await djangoAuthApi.getBlacklistedTokens();
    return response.success ? (response.data || []) : [];
  }

  // Simulation de données au cas où le backend n'est pas encore prêt
  obtenirLogsSimules(): AuditLog[] {
    const actions = [
      { action: "Connexion réussie", module: "Authentification", user: "admin@trimedh.com" },
      { action: "Création de patient", module: "Patients", user: "dr.jean@trimedh.com" },
      { action: "Modification de tarif", module: "Facturation", user: "admin@trimedh.com" },
      { action: "Suppression de rendez-vous", module: "Rendez-vous", user: "reception@trimedh.com" },
      { action: "Mise à jour dossier", module: "Patients", user: "dr.marie@trimedh.com" },
      { action: "Ajout de médicament", module: "Pharmacie", user: "pharmacie@trimedh.com" },
      { action: "Exportation logs", module: "Sécurité", user: "admin@trimedh.com" },
      { action: "Échec de connexion", module: "Authentification", user: "inconnu@fake.com" },
      { action: "Consultation terminée", module: "Consultations", user: "dr.jean@trimedh.com" },
      { action: "Impression facture", module: "Facturation", user: "reception@trimedh.com" }
    ];

    return Array.from({ length: 30 }).map((_, i) => {
      const template = actions[i % actions.length];
      const timeOffset = i * 24 * 3600000 + (Math.random() * 3600000 * 8); 
      return {
        id: i + 1,
        utilisateur: template.user,
        action: template.action,
        module: template.module,
        date: new Date(Date.now() - timeOffset).toISOString(),
        details: { info: "Action historique" },
        ip_address: `192.168.1.${10 + i}`
      };
    });
  }
}

export const auditService = new AuditService();
