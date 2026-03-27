# 🔐 Configuration Authentification Django pour TRIMED

## 📋 Vue d'ensemble

Ce guide explique comment configurer et utiliser le nouveau système d'authentification Django avec JWT tokens dans TRIMED.

## 🚀 Configuration rapide

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Copiez le fichier exemple
cp .env.example .env
```

Modifiez les valeurs selon votre environnement :

```env
# URL de votre backend Django
REACT_APP_API_BASE_URL=http://localhost:8000/api

# Environnement
NODE_ENV=development
```

### 2. Démarrage du backend Django

Assurez-vous que votre backend Django est démarré sur le port 8000 :

```bash
# Dans votre projet Django
python manage.py runserver 8000
```

### 3. Démarrage du frontend React

```bash
# Dans le projet TRIMED
npm run dev
```

## 🔧 Architecture du système

### Composants principaux

1. **`djangoAuthApi.ts`** - API calls vers Django
2. **`AuthContext.tsx`** - Context React pour l'état d'authentification
3. **`ProtectedRoute.tsx`** - Protection des routes selon les rôles
4. **`apiConfig.ts`** - Configuration Axios avec intercepteurs JWT

### Flux d'authentification

```
1. Utilisateur se connecte → djangoAuthApi.connexion()
2. Django retourne access_token + refresh_token
3. Tokens stockés dans localStorage
4. AuthContext met à jour l'état utilisateur
5. ProtectedRoute vérifie les permissions
6. Intercepteur Axios ajoute le token aux requêtes
7. Auto-refresh du token avant expiration
```

## 🎯 Utilisation

### Connexion

```typescript
import { useAuth } from '../context/AuthContext';

const { login, user, isAuthenticated } = useAuth();

const handleLogin = async () => {
  const result = await login(email, password);
  if (result.success) {
    // Redirection automatique
    navigate(result.redirectTo);
  }
};
```

### Protection des routes

```typescript
// Route accessible à tous les utilisateurs authentifiés
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Route accessible seulement aux médecins
<ProtectedRoute requiredRole="medecin">
  <Consultations />
</ProtectedRoute>

// Route accessible à plusieurs rôles
<ProtectedRoute requiredRole={['admin-systeme', 'proprietaire-hopital']}>
  <Configuration />
</ProtectedRoute>
```

### Appels API authentifiés

```typescript
import apiClient from '../api/apiConfig';

// Le token est automatiquement ajouté par l'intercepteur
const response = await apiClient.get('/patients/');
const patients = response.data.results;
```

## 🔑 Gestion des tokens

### Stockage

- **access_token** : JWT court terme (15-30 min)
- **refresh_token** : JWT long terme (7-30 jours)
- **user_data** : Informations utilisateur

### Auto-refresh

Le système rafraîchit automatiquement le token :
- Vérification toutes les minutes
- Refresh si expiration < 5 minutes
- Déconnexion si refresh token expiré

### Déconnexion

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout(); // Nettoie localStorage + appel API
  navigate('/connexion');
};
```

## 🛡️ Sécurité

### Bonnes pratiques implémentées

1. **JWT tokens** avec expiration courte
2. **Refresh tokens** pour renouvellement
3. **HTTPS** en production (à configurer)
4. **Validation côté serveur** des permissions
5. **Nettoyage automatique** des tokens expirés

### Gestion des erreurs

```typescript
// Erreur 401 → Tentative de refresh automatique
// Erreur 403 → Permissions insuffisantes
// Erreur réseau → Message utilisateur approprié
```

## 🎭 Rôles et permissions

### Rôles disponibles

```typescript
const ROLES = {
  'admin-systeme': 'Administrateur système',
  'proprietaire-hopital': 'Propriétaire hôpital', 
  'medecin': 'Médecin',
  'infirmier': 'Infirmier',
  'secretaire': 'Secrétaire',
  'patient': 'Patient'
};
```

### Matrice des permissions

| Page | Admin | Propriétaire | Médecin | Infirmier | Secrétaire | Patient |
|------|-------|--------------|---------|-----------|------------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Patients | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Consultations | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Médecins | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configuration | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🐛 Debugging

### Mode développement

En mode développement, des logs détaillés sont affichés :

```javascript
// Console logs automatiques
🔍 Tentative de connexion: user@example.com
✅ Connexion réussie pour: user@example.com
🔄 Rafraîchissement automatique du token...
```

### Variables d'environnement de debug

```env
NODE_ENV=development
REACT_APP_DEBUG=true
```

### Outils de développement

1. **React DevTools** - État AuthContext
2. **Network tab** - Requêtes API et tokens
3. **localStorage** - Tokens stockés
4. **Console** - Logs détaillés

## 🚨 Dépannage

### Problèmes courants

#### 1. "Impossible de se connecter au serveur"
```bash
# Vérifiez que Django est démarré
python manage.py runserver 8000

# Vérifiez l'URL dans .env
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

#### 2. "Token invalide"
```javascript
// Nettoyez le localStorage
localStorage.clear();
// Reconnectez-vous
```

#### 3. "Accès refusé"
```javascript
// Vérifiez le rôle utilisateur
console.log(user.role);
// Vérifiez les permissions de la route
```

#### 4. "Session expirée"
```javascript
// Le refresh automatique a échoué
// Reconnexion nécessaire
```

## 📚 API Endpoints utilisés

### Authentification
- `POST /api/comptes/login/` - Connexion
- `POST /api/comptes/inscription/` - Inscription
- `POST /api/comptes/logout/` - Déconnexion
- `POST /api/comptes/token/refresh/` - Refresh token

### Profil utilisateur
- `GET /api/comptes/utilisateurs/profile/` - Profil
- `PUT /api/comptes/utilisateurs/update_profile/` - Mise à jour

## 🔄 Migration depuis JSON Server

Si vous migrez depuis l'ancien système JSON Server :

1. **Sauvegardez** vos données de test
2. **Nettoyez** localStorage : `localStorage.clear()`
3. **Redémarrez** l'application
4. **Créez** de nouveaux comptes via l'inscription
5. **Testez** les fonctionnalités

## 📞 Support

En cas de problème :

1. Vérifiez les logs de la console
2. Consultez la documentation Django backend
3. Vérifiez les variables d'environnement
4. Testez avec un compte fraîchement créé

---

**✅ Système d'authentification Django configuré avec succès !**