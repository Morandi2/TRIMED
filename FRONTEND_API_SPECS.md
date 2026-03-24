# Spécifications de l'API pour le Backend (TRIMEDH)

Ce document détaille les attentes du Frontend (React) vis-à-vis du Backend.

## 0. Configuration Générale & Authentification

- **Headers** : Toutes les requêtes protégées doivent inclure `Authorization: Bearer <access_token>`.
- **Mécanisme de Token (JWT)** :
  - **Rafraîchissement** : En cas de `401`, le Front fait un `POST` vers `/comptes/token/refresh/` avec `{ "refresh": "..." }` et s'attend à recevoir `{ "access": "nouveau_token" }` (Standard *Django Rest Framework SimpleJWT*).
- **Pagination & Filtres** : Le front utilise des paramètres URL `?page=1&search=xyz` ou des filtres spécifiques pour les listes.
- **Réponses** :  
  - **Succès** : HTTP 200/201 (Renvoyer le JSON attendu, souvent paginé `count, next, previous, results` pour les listes Django).
  - **Erreur** : HTTP 400 (Retourner `{ "detail": "Message d'erreur" }` ou un dictionnaire d'erreurs) ou HTTP 500.

---

## 1. Authentification & Gestion des Comptes

Le code frontend simule actuellement beaucoup de choses avec un JSON Server. Voici l'implémentation attendue par le vrai backend :

### 1.1. Connexion (Login)
- **POST** `/auth/login/` *(ou `/comptes/token/`)*
- **Payload** : `{ "email": "...", "password": "..." }`
- **Réponse Attendue** : 
  Doit renvoyer les tokens JWT et les informations de l'utilisateur et du tenant (hôpital).
  ```json
  {
    "access": "token_jwt",
    "refresh": "token_refresh",
    "user": {
      "utilisateur_id": 1,
      "nom_complet": "Dr. Jean",
      "email": "jean@hopital.com",
      "role": "proprietaire-hopital",
      "hopital_id": 10
    },
    "tenant": {
      "nom": "Hôpital Général",
      "statut": "actif"
    }
  }
  ```

### 1.2. Inscription d'un Hôpital (Complet)
Le front tente actuellement de créer un utilisateur puis un tenant séparément. Le backend devrait exposer **un seul endpoint transactionnel** pour inscrire un hôpital et son admin.
- **POST** `/auth/inscription-hopital/` *(nom suggéré)*
- **Payload (Data du Front)** : `{ "nomHopital": "...", "adminEmail": "...", "password": "...", "prenomAdmin": "...", "nomAdmin": "...", "telephone": "...", ... }`
- **Réponse Attendue** : Même structure que le login (Tokens + User + Tenant) mais le `statut` du tenant doit être `inactif` ou `en_attente`.

---

## 2. Gestion Hospitalière (Tenants)

Tous ces endpoints doivent être préfixés et filtrer automatiquement les données par l'Hôpital (Tenant) de l'utilisateur connecté via le Token JWT.

### 2.1. Patients
- **GET** `/patients/?page=&search=&sexe=` -> Liste paginée des patients.
- **GET** `/patients/:id/` -> Détails d'un patient.
- **POST** `/patients/` -> Création. *(Le backend doit supporter le `multipart/form-data` si une `photo` (File) est présente).*
- **PUT** `/patients/:id/` -> Mise à jour.
- **DELETE** `/patients/:id/` -> Archiver ou supprimer.
- **GET** `/patients/:id/dossier_complet/` -> Renvoyer le patient + ses antécédents, allergies, assurances.
- **GET** `/patients/statistiques/` -> Retourner `{ "total": X, "nouveaux_ce_mois": Y, ...}`.

**Modèle Patient attendu** :
```json
{
  "patient_id": 1,
  "nom": "Doe",
  "prenom": "John",
  "telephone": "+509...",
  "date_naissance": "1990-01-01",
  "sexe": "M",
  "numero_dossier_medical": "DM-001",
  ... (champs adresse)
}
```

### 2.2. Médecins
*Attention : Le front utilise actuellement le préfixe `/medical/`.*
- **GET** `/medical/medecins/?page=&search=&specialite=` -> Liste paginée.
- **GET** `/medical/medecins/:id/` -> Détails.
- **POST** `/medical/medecins/` -> Création (support `multipart/form-data` pour la photo).
- **PUT** `/medical/medecins/:id/` -> Modification.
- **DELETE** `/medical/medecins/:id/` -> Suppression.
- **GET** `/medical/medecins/:id/statistiques/` -> Retourne `{ "total_patients": X, "consultations_ce_mois": Y }`

### 2.3. Rendez-vous
- **GET** `/rendez-vous/?page=&date_debut=&date_fin=&medecin=&statut=` -> Liste filtrée des rendez-vous.
- **POST** `/rendez-vous/`
- **PUT** `/rendez-vous/:id/`
- **POST** `/rendez-vous/:id/confirmer/`
- **POST** `/rendez-vous/:id/annuler/` -> Payload : `{ "raison": "..." }`
- **POST** `/rendez-vous/:id/reporter/` -> Payload : `{ "nouvelle_date_heure": "..." }`
- **GET** `/rendez-vous/creneaux_disponibles/?medecin_id=&date=&duree=30` -> Retourne une liste d'heures dispo : `["08:00", "08:30", ...]`
- **GET** `/rendez-vous/types/` -> Retourne types (Ex: Consultation standard).
- **GET** `/rendez-vous/statuts/` -> Retourne statuts (Attente, Confirmé, Terminé, Annulé).
- **GET** `/rendez-vous/statistiques/`

### 2.4. Consultations & Ordonnances & Examens
- **GET | POST | PUT | DELETE** `/consultations/` et `/consultations/:id/`
- **POST** `/consultations/:id/creer_ordonnance/` -> Payload : `ordonnanceData`
- **POST** `/consultations/:id/prescrire_examen/` -> Payload : `examenData`
- **GET | POST | PATCH | DELETE** `/ordonnances/`
- **GET** `/examens/`
- **POST** `/examens/:id/ajouter_resultat/` -> Payload : `{ "resultat": "...", "notes": "..." }`

### 2.5. Médicaments (Pharmacie)
*(Endpoints standard attendus)*
- **GET | POST | PUT | DELETE** `/medicaments/`
- **GET** `/medicaments/categories/`
- **GET** `/medicaments/statistiques/` -> `{ "total_medicaments": X, "medicaments_rupture": Y, ... }`

### 2.6. Facturation & Paiements
- **GET** `/facturation/invoices/`
- **GET** `/facturation/paiements/`
- **POST** `/facturation/paiements/` -> Créer un paiement
- **GET** `/facturation/tarifs-consultation/`
- **GET** `/facturation/paiements/statistiques/`

---
*Ce document sert de contrat de base pour recréer l'API attendue par l'interface utilisateur actuelle.*
