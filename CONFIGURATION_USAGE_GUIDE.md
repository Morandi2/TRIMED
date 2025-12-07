# 🎨 Guide d'Utilisation: Personnalisation Tenant

## 📋 Comment ça Fonctionne

### 1. **Flux de Configuration**

```
Admin se connecte (1ère fois)
         ↓
Vérifie si configuré (is_configured = false)
         ↓
Redirige vers /configuration
         ↓
Remplit 3 étapes du wizard
         ↓
Clique "Terminer la Configuration"
         ↓
Config sauvegardée dans:
  - localStorage (frontend)
  - Base de données (backend via API)
         ↓
Personnalisation appliquée automatiquement
         ↓
Redirige vers /home
```

---

## 🎨 Personnalisation Appliquée

### **1. Couleur Principale**
Quand l'admin choisit une couleur (ex: `#FF5733`), elle est appliquée à:

```typescript
// Variables CSS générées automatiquement
--primary-color: #FF5733
--brand-500: #FF5733
--brand-600: #D94D2B (plus foncé)
--brand-700: #B34323 (encore plus foncé)
```

**Où c'est utilisé:**
- ✅ Boutons principaux
- ✅ Links actifs dans sidebar
- ✅ Headers
- ✅ Badges
- ✅ Progress bars
- ✅ Focus states

### **2. Logo**
```typescript
// Stocké dans config
logo: "https://cdn.example.com/hospital-logo.png"

// Affiché dans:
- Sidebar (haut)
- Header
- Documents imprimés (factures, rapports)
- Page de connexion
```

### **3. Devise**
```typescript
devise: "HTG" // ou "USD", "EUR"

// Utilisé pour:
- Affichage des prix
- Factures
- Rapports financiers
- Format: 5,000 HTG
```

### **4. Langue**
```typescript
langue_defaut: "fr" // ou "ht", "en"

// Change:
- Labels des formulaires
- Messages d'erreur
- Notifications
- Format de date
```

---

## 💾 Où est Stockée la Config

### **Frontend (localStorage)**
```javascript
// Clé: 'tenant_config'
{
  "tenant_id": 1,
  "nom": "Hôpital Général",
  "couleur_principale": "#0066CC",
  "langue_defaut": "fr",
  "devise": "HTG",
  "fuseau_horaire": "America/Port-au-Prince",
  "is_configured": true
}
```

### **Backend (Base de données)**
```sql
-- Table: tenant_config
tenant_id | nom              | couleur_principale | devise | is_configured
----------|------------------|-------------------|--------|---------------
1         | Hôpital Général  | #0066CC          | HTG    | true
```

---

## 🔄 Comment Utiliser la Config dans les Composants

### **1. Accéder à la Config**

```typescript
import { useTenant } from '../context/TenantContext';

function MonComposant() {
  const { tenantConfig, primaryColor, currency, language } = useTenant();
  
  return (
    <div>
      <h1>Bienvenue à {tenantConfig?.nom}</h1>
      <button style={{ backgroundColor: primaryColor }}>
        Payer en {currency}
      </button>
    </div>
  );
}
```

### **2. Appliquer la Couleur Principale**

```typescript
// Méthode 1: Via CSS variable
<button className="bg-[var(--primary-color)]">
  Bouton
</button>

// Méthode 2: Via context
const { primaryColor } = useTenant();
<button style={{ backgroundColor: primaryColor }}>
  Bouton
</button>

// Méthode 3: Via Tailwind (si configuré)
<button className="bg-brand-500 hover:bg-brand-600">
  Bouton
</button>
```

### **3. Formater les Prix**

```typescript
import { useTenant } from '../context/TenantContext';

function PriceDisplay({ amount }: { amount: number }) {
  const { currency } = useTenant();
  
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };
  
  return <span>{formatPrice(amount)}</span>;
}

// Affiche: 5 000,00 HTG
```

---

## 🔐 Vérifier si Configuré

### **Au Login**

```typescript
// src/services/authService.ts
export const authService = {
  async login(username: string, password: string) {
    const response = await axiosInstance.post('/auth/login/', { username, password });
    const { access, refresh, user, tenant_config } = response.data;
    
    // Sauvegarder tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Sauvegarder config tenant
    if (tenant_config) {
      localStorage.setItem('tenant_config', JSON.stringify(tenant_config));
    }
    
    return { user, tenant_config };
  },
};
```

### **Route Protégée**

```typescript
// src/components/auth/ConfiguredRoute.tsx
import { Navigate } from 'react-router';
import { useTenant } from '../../context/TenantContext';

export const ConfiguredRoute = ({ children }) => {
  const { isConfigured } = useTenant();
  
  if (!isConfigured) {
    return <Navigate to="/configuration" replace />;
  }
  
  return children;
};
```

### **Utilisation dans App.tsx**

```typescript
<Route element={<AppLayout />}>
  <Route element={<ConfiguredRoute />}>
    <Route path="/home" element={<RoleBasedHome />} />
    <Route path="/patient" element={<Patient />} />
    {/* ... autres routes */}
  </Route>
  
  {/* Route config accessible sans vérification */}
  <Route path="/configuration" element={<Configuration />} />
</Route>
```

---

## 🎯 Exemple Complet: Facture Personnalisée

```typescript
import { useTenant } from '../context/TenantContext';

function Invoice({ patient, items, total }) {
  const { tenantConfig, currency, primaryColor } = useTenant();
  
  return (
    <div className="invoice">
      {/* Header avec logo et couleur */}
      <div style={{ backgroundColor: primaryColor }} className="p-4">
        {tenantConfig?.logo && (
          <img src={tenantConfig.logo} alt="Logo" className="h-16" />
        )}
        <h1 className="text-white">{tenantConfig?.nom}</h1>
      </div>
      
      {/* Contenu */}
      <div className="p-6">
        <h2>Facture pour {patient.nom}</h2>
        
        <table>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{formatPrice(item.price, currency)}</td>
            </tr>
          ))}
        </table>
        
        <div className="total">
          Total: {formatPrice(total, currency)}
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-sm text-gray-600">
        {tenantConfig?.adresse} | {tenantConfig?.telephone}
      </div>
    </div>
  );
}
```

---

## 🔧 Backend: Endpoint Configuration

```python
# apps/tenants/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def save_configuration(request):
    tenant = request.tenant
    config_data = request.data
    
    # Sauvegarder config
    tenant.nom = config_data.get('nom')
    tenant.couleur_principale = config_data.get('couleur_principale')
    tenant.devise = config_data.get('devise')
    tenant.langue_defaut = config_data.get('langue_defaut')
    tenant.is_configured = True
    tenant.save()
    
    # Sauvegarder branches
    for branch_data in config_data.get('branches', []):
        Branch.objects.create(
            tenant=tenant,
            **branch_data
        )
    
    return Response({
        'success': True,
        'message': 'Configuration enregistrée',
        'config': {
            'tenant_id': tenant.id,
            'nom': tenant.nom,
            'couleur_principale': tenant.couleur_principale,
            'devise': tenant.devise,
            'is_configured': tenant.is_configured,
        }
    })

@api_view(['GET'])
def get_configuration(request):
    tenant = request.tenant
    
    return Response({
        'tenant_id': tenant.id,
        'nom': tenant.nom,
        'logo': tenant.logo.url if tenant.logo else None,
        'couleur_principale': tenant.couleur_principale,
        'devise': tenant.devise,
        'langue_defaut': tenant.langue_defaut,
        'is_configured': tenant.is_configured,
    })
```

---

## ✅ Checklist Intégration

- [x] TenantContext créé
- [x] TenantProvider ajouté dans App.tsx
- [x] Configuration wizard fonctionnel
- [x] Sauvegarde dans localStorage
- [x] Application des styles CSS
- [ ] Endpoint API backend créé
- [ ] Vérification au login
- [ ] Route protégée ConfiguredRoute
- [ ] Upload de logo
- [ ] Preview en temps réel

---

## 🎨 Résumé

**Après configuration:**
1. ✅ Couleur principale appliquée partout
2. ✅ Logo affiché dans sidebar/header
3. ✅ Devise utilisée pour tous les prix
4. ✅ Langue appliquée aux labels
5. ✅ Config accessible via `useTenant()` hook
6. ✅ Redirection automatique vers /home
7. ✅ Personnalisation persistante (localStorage + DB)

**L'admin peut modifier la config plus tard dans:**
- `/configuration` (re-accéder au wizard)
- `/settings/tenant` (page paramètres avancés)
