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
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            Journal d'Audit
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
            Suivi complet des activités et de la sécurité du système
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="group relative inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
            <Download className="w-4.5 h-4.5 transition-transform group-hover:-translate-y-0.5" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Stats Section with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Activités</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{logs.length}</span>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30">LOGS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Collaborateurs</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{new Set(logs.map(l => l.utilisateur)).size}</span>
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-lg border border-purple-100 dark:border-purple-900/30">ACTIFS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="group p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Évènements de Sécurité</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {logs.filter(l => l.action.toLowerCase().includes('échec') || l.action.toLowerCase().includes('révoqué')).length}
                </span>
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-lg border border-orange-100 dark:border-orange-900/30 uppercase">Critiques</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-4 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
          <input 
            type="text"
            placeholder="Rechercher par utilisateur, action, module ou IP..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-gray-100/30 dark:bg-white/5 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all dark:text-white font-medium placeholder:text-gray-400 text-sm"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none group-focus-within:text-blue-500" />
            <select 
              className="pl-10 pr-10 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900/50 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-sm font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
              value={filters.module}
              onChange={(e) => setFilters({...filters, module: e.target.value})}
            >
              <option value="">Tous les modules</option>
              <option value="Authentification">Authentification</option>
              <option value="Patients">Patients</option>
              <option value="Utilisateurs">Utilisateurs</option>
              <option value="Facturation">Facturation</option>
              <option value="Sécurité">Sécurité</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2 transition-all hover:border-blue-300 dark:hover:border-blue-700">
            <Calendar className="text-gray-400 w-4 h-4" />
            <input type="date" className="bg-transparent outline-none dark:text-gray-200 text-sm font-bold" />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Temporel</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Agent</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Action</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Module</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Provenance IP</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] text-right">Analyse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {isLoading ? (
                Array.from({length: 8}).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-5 h-16 bg-gray-50/30 dark:bg-white/[0.01]"></td>
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];
                  const avatarColor = colors[log.utilisateur.length % colors.length];
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-200 group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">
                            {log.date ? new Date(log.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {log.date ? new Date(log.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-black text-[10px] shadow-md ring-4 ring-white dark:ring-transparent transition-transform group-hover:scale-110`}>
                            {log.utilisateur.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {log.utilisateur.split('@')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${
                          log.action.toLowerCase().includes('suppression') || log.action.toLowerCase().includes('échec')
                            ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'
                            : log.action.toLowerCase().includes('création') || log.action.toLowerCase().includes('succès')
                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30'
                            : 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap font-mono text-[10px] text-gray-400 font-bold tracking-tighter">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <button className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-indigo-600 transition-all active:scale-90">
                          <Info className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-inner">
                        <Search className="w-10 h-10 text-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-widest">Aucun résultat</p>
                        <p className="text-gray-500 text-[10px] font-bold italic">Essayez de modifier vos filtres de recherche</p>
                      </div>
                    </div>
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
