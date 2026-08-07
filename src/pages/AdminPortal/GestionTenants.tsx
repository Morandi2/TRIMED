import React, { useEffect, useState } from "react";
import { Building2, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { tenantService, Tenant } from "../../services/admin/tenantService";
import PageMeta from "../../components/common/PageMeta";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Button from "../../components/ui/button/Button";

export default function GestionTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const data = await tenantService.getAllTenants();
        // Gérer le format si c'est une liste paginée vs liste simple
        setTenants(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement tenants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'actif' | 'inactif' | 'suspendu') => {
    if (!confirm(`Êtes-vous sûr de vouloir passer cet hôpital en statut : ${newStatus} ?`)) return;
    
    try {
      await tenantService.updateTenantStatus(id, newStatus);
      // Mise à jour locale après succès API
      setTenants(tenants.map(t => t.id === id ? { ...t, statut: newStatus } : t));
    } catch (error) {
      alert("Impossible de mettre à jour le statut.");
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        tenant.email_professionnel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tenant.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</span>;
      case 'en_attente':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><AlertTriangle className="w-3 h-3 mr-1" /> En attente</span>;
      case 'suspendu':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Suspendu</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"><XCircle className="w-3 h-3 mr-1" /> Inactif</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <span className="text-purple-600 font-bold">👑 Premium</span>;
      case 'standard':
        return <span className="text-blue-600 font-semibold">★ Standard</span>;
      default:
        return <span className="text-gray-500 font-medium">Basic</span>;
    }
  };

  return (
    <>
      <PageMeta title="Gestion Hôpitaux | Admin" description="Gérer les licences et tenants hospitaliers." />
      
      <div className="space-y-6 font-outfit">
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-7 h-7 text-brand-500" />
              Gestion des Hôpitaux (Tenants)
            </h1>
            <p className="text-sm text-gray-500 mt-1">Liste globale des clients enregistrés sur la plateforme TRIMED.</p>
          </div>
        </div>

        {/* Toolbar / Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none cursor-pointer dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center items-center"><LoadingSpinner /></div>
          ) : filteredTenants.length === 0 ? (
            <div className="py-20 text-center text-gray-500">Aucun hôpital ne correspond à vos critères.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4">Hôpital</th>
                    <th className="px-6 py-4">Contact Admin</th>
                    <th className="px-6 py-4">Plan / Abo</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Date Création</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-bold">
                            {tenant.nom.substring(0, 2).toUpperCase()}
                          </div>
                          {tenant.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div>{tenant.email_professionnel}</div>
                        <div className="text-xs opacity-60">{tenant.telephone}</div>
                      </td>
                      <td className="px-6 py-4">{getPlanBadge(tenant.type_abonnement)}</td>
                      <td className="px-6 py-4">{getStatusBadge(tenant.statut)}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(tenant.cree_le || Date.now()).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {tenant.statut !== 'actif' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs shadow-none"
                            onClick={() => handleStatusUpdate(tenant.id, 'actif')}
                          >
                            Activer
                          </Button>
                        )}
                        {tenant.statut === 'actif' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => handleStatusUpdate(tenant.id, 'suspendu')}
                          >
                            Suspendre
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
