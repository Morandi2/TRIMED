import React, { useState } from 'react';

interface Medicament {
  id: number;
  nom: string;
  code: string;
  stock: number;
  prix: number;
  statut: string;
  forme: string;
}

const medicamentsData: Medicament[] = [
  {
    id: 1,
    nom: "Paracétamol",
    code: "PARA500",
    stock: 150,
    prix: 5.50,
    statut: "Disponible",
    forme: "Comprimé"
  },
  {
    id: 2,
    nom: "Amoxicilline",
    code: "AMOX250",
    stock: 25,
    prix: 12.00,
    statut: "Stock bas",
    forme: "Gélule"
  }
];

export default function GestionMedicamentsSimple({ tenantId }: { tenantId: number }) {
  const [medicaments, setMedicaments] = useState<Medicament[]>(medicamentsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleNewMedicament = () => {
    // TODO: Implement new medication modal
    console.log('New medication for tenant:', tenantId);
    alert('Fonksyonalite pou nouvo medikaman an ap vini');
  };

  const handleModifier = (id: number) => {
    // TODO: Implement edit medication
    console.log('Edit medication:', id);
    alert('Fonksyonalite pou modifye medikaman an ap vini');
  };

  const handleSupprimer = (id: number) => {
    if (confirm('Ou vle efase medikaman sa a?')) {
      setMedicaments(medicaments.filter(m => m.id !== id));
    }
  };

  const filteredMedicaments = medicaments.filter(medicament =>
    medicament.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicament.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Stock bas': return 'bg-yellow-100 text-yellow-800';
      case 'Rupture': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Médicaments
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez le stock et les informations des médicaments
            </p>
          </div>

          <button onClick={handleNewMedicament} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.33331V12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.33301 8H12.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Nouveau Médicament
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Forme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredMedicaments.map((medicament) => (
                <tr key={medicament.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {medicament.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {medicament.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {medicament.forme}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {medicament.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {medicament.prix.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(medicament.statut)}`}>
                      {medicament.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleModifier(medicament.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        Modifier
                      </button>
                      <button onClick={() => handleSupprimer(medicament.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMedicaments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Aucun médicament trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}