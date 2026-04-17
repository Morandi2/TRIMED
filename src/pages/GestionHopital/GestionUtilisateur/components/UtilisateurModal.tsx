import React, { useState, useEffect } from 'react';
import { Utilisateur, UtilisateurFormData, UtilisateurRole, UtilisateurStatut } from '../types/UtilisateurTypes';
import { validation } from '../../../../utils/validation';

interface UtilisateurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UtilisateurFormData) => Promise<void>;
  serverErrors?: Record<string, string>;
  generalError?: string;
  utilisateur?: Utilisateur | null;
  roles: UtilisateurRole[];
  statuts: UtilisateurStatut[];
}

export const UtilisateurModal: React.FC<UtilisateurModalProps> = ({
  isOpen,
  onClose,
  onSave,
  serverErrors,
  generalError,
  utilisateur,
  roles,
  statuts
}) => {
  const [formData, setFormData] = useState<UtilisateurFormData>({
    nom_complet: '',
    email: '',
    password: '',
    password_confirm: '',
    role_id: 3, // Défaut : Médecin
    statut_id: 1,
    telephone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medecinMatchWarning, setMedecinMatchWarning] = useState<string | null>(null);

  useEffect(() => {
    if (serverErrors) {
      setErrors(serverErrors);
    }
  }, [serverErrors]);

  useEffect(() => {
    if (formData.role_id !== 3 || !formData.email || formData.email.length < 5) {
      setMedecinMatchWarning(null);
      return;
    }
    
    // Check locally if a Medecin with this email already exists
    try {
      let found = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('medecins_cache_v')) {
          const parsed = JSON.parse(localStorage.getItem(key) || '{}');
          if (parsed && Array.isArray(parsed.data)) {
            const existingMedecin = parsed.data.find((m: any) => 
              (m.email_professionnel && m.email_professionnel.toLowerCase() === formData.email) ||
              (m.email && m.email.toLowerCase() === formData.email)
            );
            if (existingMedecin) {
              setMedecinMatchWarning(`Un profil Médecin existe déjà pour l'email "${formData.email}". La création de ce compte utilisateur sera automatiquement liée à ce médecin.`);
              found = true;
              break;
            }
          }
        }
      }
      if (!found) {
        setMedecinMatchWarning(`Attention: Aucun profil Médecin correspondant à "${formData.email}" n'a été trouvé. La création de cet utilisateur génèrera un nouveau profil Médecin vierge dans le système.`);
      }
    } catch (e) {
      setMedecinMatchWarning(null);
    }
  }, [formData.email, formData.role_id]);

  useEffect(() => {
    setErrors({});
    if (utilisateur) {
      setFormData({
        nom_complet: utilisateur.nom_complet || `${utilisateur.prenom} ${utilisateur.nom}`.trim(),
        email: utilisateur.email,
        password: '',
        password_confirm: '',
        role_id: utilisateur.role_id,
        statut_id: utilisateur.statut_id,
        telephone: utilisateur.telephone || ''
      });
    } else {
      setFormData({
        nom_complet: '',
        email: '',
        password: '',
        password_confirm: '',
        role_id: 3, // Défaut : Médecin
        statut_id: 1,
        telephone: ''
      });
    }
  }, [utilisateur, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom_complet) newErrors.nom_complet = 'Le nom complet est obligatoire.';
    if (!formData.email) newErrors.email = 'L\'email est obligatoire.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide.';

    if (!utilisateur) { // Seulement pour la création
      if (!formData.password) newErrors.password = 'Le mot de passe est obligatoire.';
      else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit faire au moins 8 caractères.';
      
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Les mots de passe ne correspondent pas.';
      }
    }

    // Validation téléphone haïtien
    if (formData.telephone && formData.telephone.trim() !== '') {
      const phoneVal = validation.validateHaitiPhone(formData.telephone);
      if (!phoneVal.valid) newErrors.telephone = phoneVal.message || 'Format téléphone invalide (+509 XXXX-XXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNomCompletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, nom_complet: e.target.value }));
    if (errors.nom_complet) setErrors(prev => ({ ...prev, nom_complet: '' }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
    setFormData(prev => ({ ...prev, email: value }));
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {utilisateur ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(generalError || serverErrors?.detail || serverErrors?.non_field_errors) && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {generalError || serverErrors?.detail || serverErrors?.non_field_errors}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              placeholder="Entrez le nom complet"
              value={formData.nom_complet}
              onChange={handleNomCompletChange}
              className={`w-full rounded-lg border ${errors.nom_complet ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400`}
            />
            {errors.nom_complet && <p className="mt-1 text-xs text-red-500">{errors.nom_complet}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              placeholder="exemple@hopital.com"
              value={formData.email}
              onChange={handleEmailChange}
              className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="+509 4030-2622"
              maxLength={14}
              value={formData.telephone}
              onChange={(e) => {
                const formatted = validation.formatHaitiPhone(e.target.value);
                setFormData(p => ({ ...p, telephone: formatted }));
                if (errors.telephone) setErrors(prev => ({ ...prev, telephone: '' }));
              }}
              className={`w-full rounded-lg border ${errors.telephone ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400`}
            />
            {errors.telephone && <p className="mt-1 text-xs text-red-500">{errors.telephone}</p>}
          </div>

          {!utilisateur && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer *
                </label>
                <input
                  type="password"
                  value={formData.password_confirm}
                  onChange={(e) => setFormData(p => ({ ...p, password_confirm: e.target.value }))}
                  className={`w-full rounded-lg border ${errors.password_confirm ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                />
                {errors.password_confirm && <p className="mt-1 text-xs text-red-500">{errors.password_confirm}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôle *
            </label>
            <select
              required
              value={formData.role_id}
              onChange={(e) => setFormData(prev => ({ ...prev, role_id: parseInt(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.nom}
                </option>
              ))}
            </select>
            
            {formData.role_id === 3 && medecinMatchWarning && (
              <div className={`mt-3 p-3 text-sm rounded-lg border ${
                medecinMatchWarning.includes('existe déjà') 
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-400'
              }`}>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{medecinMatchWarning}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut *
            </label>
            <select
              required
              value={formData.statut_id}
              onChange={(e) => setFormData(prev => ({ ...prev, statut_id: parseInt(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {statuts.map(statut => (
                <option key={statut.statut_id} value={statut.statut_id}>
                  {statut.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Chargement...' : (utilisateur ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};