# 🐛 Rapport de Bugs Backend — TRIMEDH

---

## Bug #1 : MAXIMUM RECURSION DEPTH EXCEEDED (🔴 CRITIQUE)

### Affecte: Inscription ET Login (toutes les routes)

### Symptôme
**TOUS les endpoints** qui retournent un objet `Utilisateur` crashent avec:
```
500 Internal Server Error
{"error": "Erreur interne du serveur", "detail": "maximum recursion depth exceeded"}
```

### Cause EXACTE
Les serializers ont une **référence circulaire** (boucle infinie):

```
UtilisateurSerializer 
  → hopital_detail → TenantSerializer
    → proprietaire_utilisateur → UtilisateurSerializer   ← BOUCLE!
      → hopital_detail → TenantSerializer
        → proprietaire_utilisateur → UtilisateurSerializer
          → ... ♾️ CRASH (maximum recursion depth exceeded)
```

Le `UtilisateurSerializer` inclut `hopital_detail` qui utilise le `TenantSerializer`.
Le `TenantSerializer` inclut `proprietaire_utilisateur` qui utilise le `UtilisateurSerializer`.
Cela crée une boucle infinie jusqu'au crash Python.

### Où chercher dans le code
Fichiers: `comptes/serializers.py` et `tenants/serializers.py`

Chercher quelque chose comme:
```python
# comptes/serializers.py
class UtilisateurSerializer(serializers.ModelSerializer):
    hopital_detail = TenantSerializer(source='hopital', read_only=True)  # ← inclut Tenant

# tenants/serializers.py  
class TenantSerializer(serializers.ModelSerializer):
    proprietaire_utilisateur = UtilisateurSerializer(read_only=True)  # ← inclut User → BOUCLE!
```

### Correction

**Option A (Recommandée) — Créer des serializers légers sans imbrication:**

```python
# comptes/serializers.py

# Serializer léger pour être imbriqué dans TenantSerializer (SANS hopital_detail)
class UtilisateurLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['utilisateur_id', 'nom_complet', 'email', 'role', 'is_active']
        # PAS de hopital_detail ici!

# Serializer complet pour les réponses API
class UtilisateurSerializer(serializers.ModelSerializer):
    hopital_detail = TenantLightSerializer(source='hopital', read_only=True)
    
    class Meta:
        model = Utilisateur
        fields = ['utilisateur_id', 'nom_complet', 'email', 'role', 'hopital',
                  'hopital_detail', 'cree_le', 'derniere_connexion', 'is_active',
                  'is_staff', 'last_login']
```

```python
# tenants/serializers.py

# Serializer léger pour être imbriqué dans UtilisateurSerializer (SANS proprietaire)
class TenantLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['tenant_id', 'nom', 'adresse', 'telephone', 'statut']
        # PAS de proprietaire_utilisateur ici!

# Serializer complet pour les réponses API Tenant
class TenantSerializer(serializers.ModelSerializer):
    proprietaire_utilisateur = UtilisateurLightSerializer(read_only=True)
    
    class Meta:
        model = Tenant
        fields = '__all__'
```

**Option B (Rapide) — Utiliser `depth=0` ou `StringRelatedField`:**
```python
class TenantSerializer(serializers.ModelSerializer):
    # Remplacer le serializer imbriqué par l'ID seulement
    proprietaire_utilisateur_id = serializers.IntegerField(source='proprietaire_utilisateur.id', read_only=True)
    
    class Meta:
        model = Tenant
        exclude = ['proprietaire_utilisateur']  # Exclure le champ qui cause la boucle
```

---

## Bug #2 : `is_active: false` est ignoré

### Symptôme
Le frontend envoie `"is_active": false` dans le payload d'inscription, mais le compte est toujours créé avec `is_active: true`.

### Correction
Dans `comptes/views.py` (InscriptionView):
```python
user = serializer.save()
if user.role == 'proprietaire-hopital':
    user.is_active = False  # Inactif jusqu'à vérification
    user.save(update_fields=['is_active'])
```

---

## Bug #3 : `hopital` et `hopital_detail` retournent `null` après inscription

### Symptôme
Après inscription réussie (quand ça marche), la réponse contient `hopital: null`.

### Correction
Dans `comptes/views.py`, s'assurer que le Tenant est créé ET associé AVANT la sérialisation:
```python
@transaction.atomic
def post(self, request):
    user = serializer.save()
    
    hopital_data = request.data.get('hopital_data')
    if hopital_data:
        tenant = Tenant.objects.create(**hopital_data, proprietaire_utilisateur=user)
        user.hopital = tenant
        user.save(update_fields=['hopital'])
    
    user.refresh_from_db()  # Recharger avant sérialisation
    return Response({
        'utilisateur': UtilisateurSerializer(user).data,  # Maintenant hopital_detail sera présent
        ...
    })
```

---

## Priorité de résolution

| # | Bug | Impact | Priorité |
|---|---|---|---|
| 1 | **Recursion infinie** dans serializers | 🔴 Login ET inscription crashent | Corriger EN PREMIER |
| 2 | `is_active` toujours `true` | 🟡 Comptes actifs sans vérification | Corriger après #1 |
| 3 | `hopital_detail` est `null` | 🟡 Frontend ne reçoit pas les infos hôpital | Corriger après #1 |

> ⚠️ **Le Bug #1 est la cause racine.** Une fois la récursion corrigée, les bugs #2 et #3 seront plus faciles à résoudre car les endpoints ne crasheront plus.
