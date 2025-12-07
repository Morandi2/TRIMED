# 🔧 Guide Pratique: Fichiers à Modifier pour Connecter React à Django API

## 📋 Vue d'Ensemble

Pour connecter votre application React TRIMED à une API Django, vous devez modifier **seulement quelques fichiers clés** dans chaque module. Voici la liste exacte et les raisons.

---

## 🎯 Fichiers Globaux à Créer/Modifier (Une Seule Fois)

### 1. **Configuration Axios** ⚙️
**Fichier**: `src/config/axios.ts` (À CRÉER)

**Pourquoi**: C'est le cœur de la communication avec l'API. Il gère:
- L'URL de base de l'API
- L'ajout automatique du token JWT
- L'ajout du tenant_id
- Le refresh automatique du token expiré

**Code**:
```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Ajouter token et tenant_id automatiquement
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const tenantId = localStorage.getItem('tenant_id');
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
  
  return config;
});

// Gérer refresh token automatique
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
        refresh: refreshToken,
      });
      localStorage.setItem('access_token', response.data.access);
      error.config.headers.Authorization = `Bearer ${response.data.access}`;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

### 2. **Service d'Authentification** 🔐
**Fichier**: `src/services/authService.ts` (À CRÉER)

**Pourquoi**: Gère la connexion, déconnexion, et vérification du token.

**Code**:
```typescript
import axiosInstance from '../config/axios';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  async login(username: string, password: string) {
    const response = await axiosInstance.post('/auth/login/', { username, password });
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    const decoded: any = jwtDecode(access);
    localStorage.setItem('tenant_id', decoded.tenant_id);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },
  
  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
    localStorage.clear();
  },
  
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};
```

---

### 3. **Context d'Authentification** 🔑
**Fichier**: `src/context/AuthContext.tsx` (À CRÉER)

**Pourquoi**: Permet à toute l'application d'accéder aux infos de l'utilisateur connecté.

**Code**:
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const userStr = localStorage.getItem('user');
      setUser(userStr ? JSON.parse(userStr) : null);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### 4. **App.tsx** 🏠
**Fichier**: `src/App.tsx` (À MODIFIER)

**Pourquoi**: Ajouter le AuthProvider pour toute l'application.

**Modification**:
```typescript
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          {/* ... reste du code ... */}
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}
```

---

### 5. **Variables d'Environnement** 🌍
**Fichier**: `.env` (À CRÉER à la racine)

**Pourquoi**: Stocker l'URL de l'API de manière sécurisée.

**Code**:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📦 Fichiers à Modifier PAR MODULE

Pour chaque module (Patient, Consultation, Ordonnance, etc.), vous devez modifier **2 fichiers seulement**:

### 1. **Service du Module** 🔧

**Exemple pour Patient**: `src/pages/GestionHopital/GestionPatients/services/PatientService.ts`

**Pourquoi**: Remplacer les données mockées par de vrais appels API.

**AVANT (Mock)**:
```typescript
export const patientService = {
  obtenirTousPatients(tenantId: number): Patient[] {
    return mockPatients.filter(p => p.tenant_id === tenantId);
  },
  
  creerPatient(data: PatientFormData, tenantId: number) {
    // Logique mock
  }
};
```

**APRÈS (API)**:
```typescript
import axiosInstance from '../../../../config/axios';

export const patientService = {
  async obtenirTousPatients(): Promise<Patient[]> {
    const response = await axiosInstance.get('/patients/');
    return response.data.results || response.data;
  },
  
  async creerPatient(data: PatientFormData): Promise<Patient> {
    const response = await axiosInstance.post('/patients/', data);
    return response.data;
  },
  
  async modifierPatient(id: number, data: Partial<PatientFormData>): Promise<Patient> {
    const response = await axiosInstance.patch(`/patients/${id}/`, data);
    return response.data;
  },
  
  async supprimerPatient(id: number): Promise<void> {
    await axiosInstance.delete(`/patients/${id}/`);
  },
};
```

---

### 2. **Composant Principal du Module** 📄

**Exemple pour Patient**: `src/pages/GestionHopital/GestionPatients/GestionPatiens.tsx`

**Pourquoi**: Gérer les états de chargement et les erreurs des appels API.

**Modifications à faire**:

```typescript
// 1. Ajouter les états de chargement
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// 2. Modifier loadData pour être async
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await patientService.obtenirTousPatients();
    setPatients(data);
  } catch (err) {
    setError('Erreur lors du chargement des patients');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// 3. Modifier handleSave pour être async
const handleSave = async (formData: PatientFormData) => {
  try {
    setLoading(true);
    if (editingPatient) {
      await patientService.modifierPatient(editingPatient.patient_id, formData);
    } else {
      await patientService.creerPatient(formData);
    }
    await loadData();
    setShowModal(false);
    showSuccessMessage('Opération réussie', 'Patient enregistré avec succès');
  } catch (err) {
    showSuccessMessage('Erreur', 'Une erreur est survenue', 'error');
  } finally {
    setLoading(false);
  }
};

// 4. Afficher un loader pendant le chargement
if (loading) {
  return <div>Chargement...</div>;
}

if (error) {
  return <div className="text-red-600">{error}</div>;
}
```

---

## 📊 Résumé: Fichiers à Modifier par Module

| Module | Fichier Service | Fichier Composant |
|--------|----------------|-------------------|
| **Patient** | `GestionPatients/services/PatientService.ts` | `GestionPatients/GestionPatiens.tsx` |
| **Consultation** | `GestionConsultations/services/ConsultationService.ts` | `GestionConsultations/GestionConsultations.tsx` |
| **Ordonnance** | `GestionOrdonnances/services/OrdonnanceService.ts` | `GestionOrdonnances/GestionOrdonnances.tsx` |
| **Medicament** | `GestionMedicaments/services/MedicamentService.ts` | `GestionMedicaments/GestionMedicaments.tsx` |
| **Rendez-vous** | `GestionRendezVous/services/RendezVousService.ts` | `GestionRendezVous/GestionRendezVous.tsx` |
| **Paiement** | `GestionPaiements/services/PaiementService.ts` | `GestionPaiements/GestionPaiements.tsx` |
| **Utilisateur** | `GestionUtilisateur/services/UtilisateurService.ts` | `GestionUtilisateur/GestionUtilisateur.tsx` |

---

## 🎯 Ordre de Modification Recommandé

### Phase 1: Configuration Globale (30 min)
1. ✅ Créer `src/config/axios.ts`
2. ✅ Créer `src/services/authService.ts`
3. ✅ Créer `src/context/AuthContext.tsx`
4. ✅ Modifier `src/App.tsx`
5. ✅ Créer `.env`

### Phase 2: Module par Module (15 min chacun)
Pour chaque module:
1. ✅ Modifier le fichier Service (remplacer mock par API)
2. ✅ Modifier le composant principal (ajouter async/await, loading, error)
3. ✅ Tester le module

**Ordre suggéré**:
1. Patient (le plus simple)
2. Consultation
3. Ordonnance
4. Medicament
5. Rendez-vous
6. Paiement
7. Utilisateur

---

## 🔍 Comment Identifier les Fichiers à Modifier

### Pour trouver le Service:
```
src/pages/GestionHopital/[NomModule]/services/[NomModule]Service.ts
```

### Pour trouver le Composant:
```
src/pages/GestionHopital/[NomModule]/Gestion[NomModule].tsx
```

### Exemple concret:
- **Module**: Consultation
- **Service**: `src/pages/GestionHopital/GestionConsultations/services/ConsultationService.ts`
- **Composant**: `src/pages/GestionHopital/GestionConsultations/GestionConsultations.tsx`

---

## ⚠️ Points d'Attention

### 1. **Ne PAS modifier**:
- Les fichiers de types (`types/*.ts`) - Ils restent identiques
- Les composants UI (`components/*.tsx`) - Ils restent identiques
- Le layout (`layout/*.tsx`) - Déjà configuré

### 2. **Toujours vérifier**:
- ✅ L'URL de l'API dans `.env`
- ✅ Le token est bien stocké après login
- ✅ Le tenant_id est bien envoyé dans les headers
- ✅ Les erreurs sont bien gérées

### 3. **Tester après chaque modification**:
```bash
# Démarrer le frontend
npm run dev

# Vérifier dans la console du navigateur:
# - Les requêtes API (Network tab)
# - Les erreurs éventuelles (Console tab)
```

---

## 🚀 Exemple Complet: Module Patient

### Étape 1: Modifier PatientService.ts

```typescript
// AVANT
export const patientService = {
  obtenirTousPatients(tenantId: number): Patient[] {
    return mockPatients.filter(p => p.tenant_id === tenantId);
  }
};

// APRÈS
import axiosInstance from '../../../../config/axios';

export const patientService = {
  async obtenirTousPatients(): Promise<Patient[]> {
    const response = await axiosInstance.get('/patients/');
    return response.data.results || response.data;
  }
};
```

### Étape 2: Modifier GestionPatiens.tsx

```typescript
// AVANT
const loadPatients = () => {
  const patientsData = patientService.obtenirPatientsParHopital(hopitalId);
  setPatients(patientsData);
};

// APRÈS
const loadPatients = async () => {
  try {
    setLoading(true);
    const patientsData = await patientService.obtenirTousPatients();
    setPatients(patientsData);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Checklist Finale

- [ ] Configuration globale terminée (axios, auth, context)
- [ ] Module Patient connecté et testé
- [ ] Module Consultation connecté et testé
- [ ] Module Ordonnance connecté et testé
- [ ] Module Medicament connecté et testé
- [ ] Module Rendez-vous connecté et testé
- [ ] Module Paiement connecté et testé
- [ ] Module Utilisateur connecté et testé
- [ ] Gestion des erreurs fonctionnelle
- [ ] Loading states affichés correctement
- [ ] Authentification JWT fonctionnelle
- [ ] Multi-tenant fonctionnel

---

**🎉 Avec ce guide, vous savez exactement quels fichiers modifier et pourquoi!**
