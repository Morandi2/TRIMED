# 🔧 CORRECTION URGENTE — comptes/views.py (Backend Django)

## Problème Diagnostiqué

Le frontend envoie les données correctement (HTTP 201 reçu), mais le backend
répond avec un objet User à seulement 2 clés. Cela signifie que:

1. Le backend ne lit pas `hopital_data` depuis `request.data`
2. Le Tenant n'est jamais créé
3. L'utilisateur n'est pas associé à un hôpital

---

## Correction à apporter dans `comptes/views.py`

### Localiser la classe `InscriptionView` (ou équivalent)

Chercher la méthode `post()` de la vue d'inscription. Elle ressemble probablement à:

```python
class InscriptionView(APIView):
    def post(self, request):
        serializer = UtilisateurSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({...}, status=201)
```

### ✅ Code Corrigé — Remplacer par ceci:

```python
import json
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class InscriptionView(APIView):
    permission_classes = []  # Public endpoint

    @transaction.atomic
    def post(self, request):
        serializer = UtilisateurInscriptionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 1. Créer l'utilisateur
        user = serializer.save()

        # 2. Forcer is_active=False et le rôle
        user.is_active = False
        user.role = 'proprietaire-hopital'
        user.save(update_fields=['is_active', 'role'])

        # 3. Récupérer hopital_data (peut être JSON string depuis FormData, ou dict depuis JSON body)
        hopital_data_raw = request.data.get('hopital_data')
        hopital_data = None

        if hopital_data_raw:
            if isinstance(hopital_data_raw, str):
                try:
                    hopital_data = json.loads(hopital_data_raw)  # FormData → string JSON
                except json.JSONDecodeError:
                    hopital_data = None
            elif isinstance(hopital_data_raw, dict):
                hopital_data = hopital_data_raw  # JSON body → dict direct

        # 4. Créer le Tenant et l'associer à l'utilisateur
        tenant = None
        if hopital_data:
            from tenants.models import Tenant  # Ajuster l'import selon votre structure
            
            # S'assurer que nombre_de_lits >= 1
            nombre_lits = hopital_data.get('nombre_de_lits', 1)
            if not nombre_lits or int(nombre_lits) < 1:
                nombre_lits = 1

            tenant = Tenant.objects.create(
                nom=hopital_data.get('nom', ''),
                adresse=hopital_data.get('adresse', ''),
                telephone=hopital_data.get('telephone', ''),
                email_professionnel=hopital_data.get('email_professionnel', ''),
                directeur=hopital_data.get('directeur', ''),
                nombre_de_lits=int(nombre_lits),
                numero_enregistrement=hopital_data.get('numero_enregistrement', ''),
                statut='inactif',
                type_abonnement=hopital_data.get('type_abonnement', 'basic'),
                statut_verification_document='en_attente',
                nom_schema_base_de_donnees=hopital_data.get('nom_schema_base_de_donnees', ''),
                proprietaire_utilisateur=user,
                cree_par_utilisateur=user,
            )

            # 5. Associer le Tenant à l'utilisateur
            user.hopital = tenant
            user.save(update_fields=['hopital'])

        # 6. Envoyer l'email de vérification (si vous avez cette logique)
        # send_verification_email(user)

        # 7. Retourner la réponse complète
        user.refresh_from_db()
        return Response({
            'message': 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
            'user': {
                'id': user.pk,
                'email': user.email,
                'nom_complet': user.nom_complet,
                'role': user.role,
                'is_active': user.is_active,
                'hopital_id': tenant.pk if tenant else None,
                'hopital_nom': tenant.nom if tenant else None,
            },
            'tenant': {
                'id': tenant.pk,
                'nom': tenant.nom,
                'statut': tenant.statut,
            } if tenant else None
        }, status=status.HTTP_201_CREATED)
```

---

## Points critiques à vérifier

| Point | Détail |
|---|---|
| `hopital_data` via FormData | Il arrive en tant que **string JSON** → besoin de `json.loads()` |
| `nombre_de_lits` | Doit être `>= 1` sinon `MinValueValidator` plante silencieusement |
| `user.hopital = tenant` | Le champ `hopital` doit exister sur le modèle `Utilisateur` |
| `@transaction.atomic` | Si Tenant échoue, l'utilisateur est aussi annulé (rollback complet) |
| Import Tenant | Adapter le chemin selon votre structure: `from tenants.models import Tenant` |

---

## Vérification dans Django Admin

Après correction, tester et vérifier dans l'admin Django que:
- ✅ L'utilisateur est créé avec `role = proprietaire-hopital`
- ✅ `is_active = False`
- ✅ Le Tenant est créé avec `statut = inactif`
- ✅ `user.hopital` pointe vers le bon Tenant
