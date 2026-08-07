import React, { useState } from 'react';
import { BedDouble, Box, Plus, Trash2, Hash, Layers } from 'lucide-react';
import { HospitalConfig, Room, Bed } from '../types/ConfigTypes';
import Button from '../../../../components/ui/button/Button';

interface Props {
  config: Partial<HospitalConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

export const PhysicalLayoutStep: React.FC<Props> = ({ config, setConfig }) => {
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(0);
  const [selectedDeptIndex, setSelectedDeptIndex] = useState(0);

  const branches = config.branches || [];
  const currentBranch = branches[selectedBranchIndex];
  const currentDept = currentBranch?.departements[selectedDeptIndex];

  const handleAddRoom = () => {
    if (!currentDept) return;
    
    const newRoom: Room = {
      room_id: `R${Math.floor(Math.random() * 1000)}`,
      nom: `Chambre ${currentDept.rooms?.length || 0 + 101}`,
      type: 'standard',
      beds: [{ bed_id: `B1-${Math.floor(Math.random() * 1000)}`, status: 'disponible' }]
    };

    const newBranches = [...branches];
    const deptRooms = currentDept.rooms || [];
    newBranches[selectedBranchIndex].departements[selectedDeptIndex].rooms = [...deptRooms, newRoom];
    
    setConfig({ ...config, branches: newBranches });
  };

  const handleAddBed = (roomIndex: number) => {
    if (!currentDept || !currentDept.rooms) return;

    const newBed: Bed = {
      bed_id: `B${currentDept.rooms[roomIndex].beds.length + 1}-${currentDept.rooms[roomIndex].nom.split(' ')[1]}`,
      status: 'disponible'
    };

    const newBranches = [...branches];
    const roomBeds = currentDept.rooms[roomIndex].beds;
    newBranches[selectedBranchIndex].departements[selectedDeptIndex].rooms![roomIndex].beds = [...roomBeds, newBed];
    
    setConfig({ ...config, branches: newBranches });
  };

  const handleDeleteRoom = (roomIndex: number) => {
    const newBranches = [...branches];
    newBranches[selectedBranchIndex].departements[selectedDeptIndex].rooms = 
      currentDept!.rooms!.filter((_, i) => i !== roomIndex);
    
    setConfig({ ...config, branches: newBranches });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Scope Selector */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] border border-gray-100 dark:border-gray-800">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Branche</label>
          <select 
            value={selectedBranchIndex}
            onChange={(e) => { setSelectedBranchIndex(parseInt(e.target.value)); setSelectedDeptIndex(0); }}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {branches.map((b, i) => <option key={i} value={i}>{b.nom}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Département</label>
          <select 
            value={selectedDeptIndex}
            onChange={(e) => setSelectedDeptIndex(parseInt(e.target.value))}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {currentBranch?.departements.map((d, i) => <option key={i} value={i}>{d.nom}</option>)}
          </select>
        </div>
      </div>

      {/* Physical Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500">
                <Layers size={16} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Plan des Chambres</h3>
           </div>
           <Button onClick={handleAddRoom} className="px-4 py-2 text-xs flex items-center gap-2">
              <Plus size={14} />
              Ajouter une Chambre
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentDept?.rooms?.map((room, roomIdx) => (
            <div key={roomIdx} className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-6 rounded-[2rem] shadow-xl shadow-black/5 hover:border-brand-500/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
                      <Box size={18} />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 dark:text-white">{room.nom}</h4>
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{room.type}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleDeleteRoom(roomIdx)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {room.beds.map((bed, bedIdx) => (
                  <div key={bedIdx} className="aspect-square bg-brand-500/5 border border-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 relative group/bed">
                    <BedDouble size={20} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                  </div>
                ))}
                <button 
                  onClick={() => handleAddBed(roomIdx)}
                  className="aspect-square border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-300 hover:text-brand-500 hover:border-brand-500/50 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{room.beds.length} Lits configurés</span>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                 </div>
              </div>
            </div>
          ))}

          {(!currentDept?.rooms || currentDept.rooms.length === 0) && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/20">
               <BedDouble size={40} className="mx-auto mb-4 text-gray-200 font-thin" />
               <p className="text-sm text-gray-400">Aucune chambre n'a été assignée à ce département.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-center">
        <Hash className="text-amber-500 w-5 h-5 flex-shrink-0" />
        <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold tracking-wider leading-relaxed">
          Attention: La configuration des lits impactera directement la capacité de facturation et de gestion des admissions.
        </p>
      </div>
    </div>
  );
};
