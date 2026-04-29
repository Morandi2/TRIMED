import React, { useState } from 'react';
import { UserPlus, Trash2, Shield, User, ChevronDown } from 'lucide-react';
import { HospitalConfig } from '../types/ConfigTypes';
import Button from '../../../../components/ui/button/Button';
import Label from '../../../../components/form/Label';
import Input from '../../../../components/form/input/InputField';

interface Props {
  config: Partial<HospitalConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

interface StaffMember {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'pharmacist' | 'receptionist';
}

export const StaffSetupStep: React.FC<Props> = ({ config, setConfig }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newMember, setNewMember] = useState<Partial<StaffMember>>({ role: 'doctor' });

  const handleAddMember = () => {
    if (newMember.nom && newMember.email) {
      setStaff([...staff, { ...newMember, id: `S${Math.floor(Math.random() * 1000)}` } as StaffMember]);
      setNewMember({ role: 'doctor' });
    }
  };

  const handleRemoveMember = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const roles = {
    admin: { label: 'Administrateur', color: 'bg-red-500/10 text-red-500' },
    doctor: { label: 'Médecin', color: 'bg-blue-500/10 text-blue-500' },
    nurse: { label: 'Infirmier(e)', color: 'bg-green-500/10 text-green-500' },
    pharmacist: { label: 'Pharmacien', color: 'bg-purple-500/10 text-purple-500' },
    receptionist: { label: 'Réceptionniste', color: 'bg-orange-500/10 text-orange-500' },
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Quick Add Form */}
      <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Ajouter un Membre Clé</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom Complet</Label>
            <Input 
              value={newMember.nom || ''} 
              onChange={(e) => setNewMember({ ...newMember, nom: e.target.value })}
              placeholder="Dr. Jean Robert"
              className="w-full"
            />
          </div>
          <div>
            <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Professionnel</Label>
            <Input 
              value={newMember.email || ''} 
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="jean.robert@hopital.ht"
              className="w-full"
            />
          </div>
          <div>
            <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Wòl / Fonksyon</Label>
            <div className="relative">
              <select 
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                className="w-full h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none focus:ring-2 focus:ring-brand-500/20"
              >
                {Object.entries(roles).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
           <Button onClick={handleAddMember} className="px-8 py-3 text-xs flex items-center gap-2">
              <UserPlus size={16} />
              Enregistrer le Membre
           </Button>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500">
              <User size={16} />
           </div>
           <h3 className="font-bold text-gray-900 dark:text-white">Équipe Configurée</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {staff.map((member) => (
            <div key={member.id} className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-4 rounded-2xl flex items-center justify-between hover:border-brand-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-xs">
                   {member.nom.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{member.nom}</h4>
                  <p className="text-[10px] text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${roles[member.role].color}`}>
                    {roles[member.role].label}
                 </span>
                 <button onClick={() => handleRemoveMember(member.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))}

          {staff.length === 0 && (
             <div className="py-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/20">
                <User size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-xs text-gray-400">Aucun membre n'a été ajouté à cette étape.</p>
             </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4 items-center">
        <Shield className="text-brand-500 w-5 h-5 flex-shrink-0" />
        <p className="text-[10px] text-brand-600 dark:text-brand-400 uppercase font-bold tracking-wider leading-relaxed">
          Sécurité: Les membres ajoutés recevront une invitation par email pour configurer leur mot de passe une fois le système activé.
        </p>
      </div>
    </div>
  );
};
