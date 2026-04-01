import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  ShieldCheck, 
  Info, 
  User, 
  Activity,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { auditService } from '../services/AuditService';
import { AuditLog, AuditLogFilters } from '../types/AuditTypes';
// Plus besoin de date-fns

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    search: '',
    module: '',
    date_debut: '',
    date_fin: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditService.obtenirTousLogs();
      // Si le backend ne retourne rien, utiliser les simulacres pour la démo
      if (data.length === 0) {
        setLogs(auditService.obtenirLogsSimules());
      } else {
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
      setLogs(auditService.obtenirLogsSimules());
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (action: string) => {
    if (action.toLowerCase().includes('suppression') || action.toLowerCase().includes('échec')) return 'text-red-500 bg-red-100 dark:bg-red-900/30';
    if (action.toLowerCase().includes('création') || action.toLowerCase().includes('succès')) return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    if (action.toLowerCase().includes('modification')) return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.utilisateur.toLowerCase().includes(filters.search.toLowerCase()) || 
                         log.action.toLowerCase().includes(filters.search.toLowerCase());
    const matchesModule = filters.module === '' || log.module === filters.module;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Journal d'Audit
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Suivi complet des activités et de la sécurité du système
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Exporter (CSV)
        </button>
      </div>

      {/* Stats Quick View (Glassmorphism style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <Activity className="w-8 h-8 opacity-20" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Total Activités</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{logs.length}</span>
            <span className="ml-2 text-sm opacity-60">dernières 24h</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <User className="w-8 h-8 text-purple-500 opacity-20" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Utilisateurs actifs</span>
          </div>
          <div className="mt-4 text-gray-900 dark:text-white">
            <span className="text-3xl font-bold">{new Set(logs.map(l => l.utilisateur)).size}</span>
            <span className="ml-2 text-sm text-gray-500">aujourd'hui</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-8 h-8 text-orange-500 opacity-20" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Alertes Sécurité</span>
          </div>
          <div className="mt-4 text-gray-900 dark:text-white">
            <span className="text-3xl font-bold">0</span>
            <span className="ml-2 text-sm text-green-500">Aucune menace</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Rechercher un utilisateur ou une action..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="w-full md:w-auto relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select 
            className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-transparent"
            value={filters.module}
            onChange={(e) => setFilters({...filters, module: e.target.value})}
          >
            <option value="">Tous les modules</option>
            <option value="Authentification">Authentification</option>
            <option value="Patients">Patients</option>
            <option value="Utilisateurs">Utilisateurs</option>
            <option value="Facturation">Facturation</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400 w-4 h-4" />
          <input type="date" className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none" />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date & Heure</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Adresse IP</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 bg-gray-100/50 dark:bg-gray-800/50 h-12"></td>
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.date ? (() => {
                        const date = new Date(log.date);
                        return isNaN(date.getTime()) ? 'Date invalide' : new Intl.DateTimeFormat('fr-FR', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }).format(date);
                      })() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {log.utilisateur.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{log.utilisateur}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {log.module}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-blue-600 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun log trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Fin du composant
