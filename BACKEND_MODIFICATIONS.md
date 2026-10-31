# Modifications à apporter au backend TRIMED (Django REST)

Constats faits le 31 octobre 2026 sur `https://trimedh-service.onrender.com`, en préparant les données de
démonstration (`scripts/seed/seed-demo.mjs`). Chaque point indique ce qui se passe, la correction proposée
et la précaution de sécurité à garder. Aucun de ces changements n'ouvre d'accès supplémentaire : ils
corrigent des erreurs ou complètent des fonctions que le frontend utilise déjà.

Ordre conseillé : 1 → 2 → 3, puis le reste.

---

## 1. Désactiver le mode DEBUG en production (urgent)

**Constat.** Toute URL inconnue renvoie la page d'erreur détaillée de Django. Elle affiche la liste
complète des routes, dont le chemin de l'administration (`/Trimedh/`), et des détails internes dans les
erreurs 500 (exemple : `name 'serializers' is not defined`).

**Correction.**
- `DEBUG = False` dans les paramètres de production (variable d'environnement sur Render).
- Vérifier `ALLOWED_HOSTS` (domaine Render) et `CSRF_TRUSTED_ORIGINS` (domaine Vercel).
- Les réponses d'erreur 500 ne doivent plus renvoyer le message de l'exception au client : le garder
  dans les journaux du serveur.

**Sécurité.** C'est la correction la plus importante : aujourd'hui, n'importe qui peut lire la structure
interne de l'API.

---

## 2. Création des types et statuts de rendez-vous (erreur 500)

**Constat.** `POST /api/rendez-vous/types/` et `POST /api/rendez-vous/statuts/` répondent
`500 — name 'serializers' is not defined`. `OPTIONS` répond 405. Les rendez-vous sont donc impossibles à
créer tant que ces tables sont vides. Pour la démonstration, les types et statuts ont été créés à la main
dans l'admin Django pour les quatre établissements.

**Correction.**
- Ajouter l'import manquant (`from rest_framework import serializers`) dans le module des vues ou des
  serializers de `rendez_vous`.
- Autoriser `OPTIONS` (métadonnées DRF) sur ces deux vues.
- Le serializer de statut n'accepte que six couleurs codées en dur : accepter toute couleur hexadécimale
  valide (`^#[0-9A-Fa-f]{6}$`).

**Sécurité.** Création réservée au propriétaire de l'établissement et à l'administrateur système, et
limitée à son propre établissement (`tenant` imposé côté serveur, jamais pris dans la requête).

---

## 3. Référentiels créés automatiquement avec chaque établissement

**Constat.** Un nouvel établissement n'a ni type ni statut de rendez-vous, ni type de notification : les
listes déroulantes restent vides jusqu'à une intervention manuelle.

**Correction.** Un signal `post_save` sur `Tenant` (création seulement) qui crée les valeurs par défaut :
- types de rendez-vous : Consultation, Suivi, Suivi prénatal, Vaccination, Urgence ;
- statuts : Planifié, Confirmé, Terminé, Annulé, Reporté (avec `est_confirme`, `est_termine`, `est_annule`) ;
- types de notification : Rappel de rendez-vous, Résultat d'examen disponible, Stock faible.

Les groupes sanguins (A+ … O−) et les plans d'abonnement (Basic 5 000, Standard 10 000, Premium
15 000 HTG/mois) sont communs : les créer par une migration de données pour toute nouvelle base.

Le Setup Wizard pourra ensuite modifier ces valeurs au lieu de partir de zéro.

---

## 4. Sous-ressources du patient inaccessibles (conflit de routes)

**Constat.** `GET /api/patients/allergies/` répond `404 — Pas trouvé.` alors que la route existe dans le
schéma OpenAPI. Même chose pour `adresses`, `antecedents`, `assurances`, `contacts` et `suivis`. La route
du patient (`/api/patients/{pk}/`) est déclarée avant : « allergies » est lu comme un identifiant.

**Correction.** Au choix :
- déclarer les sous-routes avant le `PatientViewSet` dans le routeur ;
- ou limiter l'identifiant du patient aux chiffres : `lookup_value_regex = r'\d+'` dans `PatientViewSet`.

**Sécurité.** Rien à changer : les permissions existantes de ces vues s'appliquent.

---

## 5. Journal d'audit absent

**Constat.** Le frontend appelle `GET /api/comptes/audit-logs/` (page « Journal d'audit », exigence EF4.1
du mémoire). La route n'existe pas (404).

**Correction.**
- Modèle `AuditLog` : utilisateur, établissement, action (consultation, création, modification,
  suppression, connexion), ressource, identifiant de la ressource, date, adresse IP.
- Enregistrement automatique à l'ouverture d'un dossier patient (`dossier_complet`) et à chaque création
  ou modification d'un acte médical (mixin de ViewSet ou signal).
- `GET /api/comptes/audit-logs/` en lecture seule, filtrable par date, utilisateur et ressource.

**Sécurité.** Lecture réservée au propriétaire (son établissement uniquement) et à l'administrateur
système. Aucune route d'écriture ni de suppression : le journal ne doit pas pouvoir être effacé par l'API.

---

## 6. Facturation non exposée

**Constat.** `api/facturation/` est déclaré dans les URL, mais aucune route n'apparaît dans le schéma. Le
frontend appelle `/api/facturation/abonnements/`, `/paiements/`, `/invoices/` et
`/tarifs-consultation/` : tous répondent 404. Les modèles existent dans l'admin (Abonnements, Factures,
Paiements, Plans).

**Correction.** Enregistrer les ViewSets dans `facturation/urls.py` :
- `plans/` en lecture pour tout utilisateur connecté ;
- `abonnements/` : l'établissement voit son propre abonnement (plan, date de début, échéance) ;
- `paiements/` et `invoices/` : lecture par le propriétaire de l'établissement ;
- création et modification réservées à l'administrateur système.

---

## 7. Rattachement du propriétaire à l'établissement

**Constat.** `PATCH /api/tenants/tenants/{id}/` avec `proprietaire_utilisateur_id` répond sans erreur,
mais `proprietaire_utilisateur` reste `null` sur les quatre établissements.

**Correction.** Rendre `proprietaire_utilisateur_id` réellement modifiable (champ `write_only` relié à
`proprietaire_utilisateur` dans le serializer), et le remplir automatiquement quand un compte
`proprietaire-hopital` est créé pour un établissement qui n'a pas encore de propriétaire.

---

## 8. Découpage du nom à la création d'un compte médecin ou patient

**Constat.** Créer un compte `medecin` ou `patient` crée aussi sa fiche, mais le nom est mal découpé :
« Dr Widlyne Joseph » devient `nom = "Dr"`, `prenom = "Widlyne Joseph"`.

**Correction.** Accepter `nom` et `prenom` séparés à la création du compte. À défaut, prendre le dernier
mot comme nom et ignorer les titres (« Dr », « Dre », « Pr »).

---

## 9. Erreur 500 sur `OPTIONS /api/comptes/utilisateurs/`

**Constat.** `cannot access local variable 'permission_classes' where it is not associated with a value`.
`get_permissions()` n'affecte `permission_classes` que pour certaines actions.

**Correction.** Initialiser une valeur par défaut au début de `get_permissions()` (par exemple
`[IsAuthenticated]`) avant les cas particuliers.

---

## 10. Réponses de création sans identifiant

**Constat.** Après `POST /api/medical/consultations/` et `POST /api/medical/ordonnances/`, la réponse ne
contient pas `consultation_id` ni `ordonnance_id`. Le frontend ne peut pas enchaîner (créer l'ordonnance
juste après la consultation) sans relire la liste.

**Correction.** Dans `create()`, renvoyer l'objet avec le serializer de lecture (qui contient
l'identifiant), ou ajouter l'identifiant en lecture seule au serializer de création.

---

## 11. Listes : identifiants manquants et pagination fixe

**Constat.**
- Les listes de consultations, d'examens et d'ordonnances renvoient le nom du patient et du médecin, mais
  pas leurs identifiants. Les filtres du frontend doivent alors comparer des noms.
- `page_size` est ignoré : 10 éléments par page quoi qu'on demande.

**Correction.**
- Ajouter `patient`, `medecin` et `consultation` (identifiants) aux serializers de liste.
- Pagination : `page_size_query_param = 'page_size'` et `max_page_size = 200`.

---

## 12. Points à confirmer (pas forcément des erreurs)

- **Visibilité des consultations.** Un médecin ne voit que ses propres consultations. Le dossier complet du
  patient doit cependant montrer tout l'historique aux soignants autorisés (exigences EF3.0 et EF4.0) :
  vérifier que `dossier_complet` le fait.
- **Suppression des actes médicaux.** Personne ne peut supprimer une consultation par l'API, pas même
  l'administrateur système. C'est souhaitable pour un dossier médical : prévoir plutôt une annulation
  (statut) avec trace dans le journal d'audit.
- **Vérification des documents.** `PATCH /api/tenants/tenants/{id}/verifier_documents/` attend
  `{"action": "approuver"}` ou `{"action": "rejeter"}`. Le documenter dans le schéma OpenAPI.

---

## Côté frontend (pour mémoire)

Le Setup Wizard (`src/pages/GestionHopital/Configuration/ConfigurationWizard.tsx`) n'enregistre que
l'identité de l'hôpital et les paramètres (étapes 1 et 5). Les étapes « Structure », « Physique » et
« Personnel » sont visuelles : les routes nécessaires existent déjà (`type-salles`, `salles`, `chambres`,
`lits`, `utilisateurs`). Le script `scripts/seed/seed-demo.mjs` montre les appels et l'ordre à respecter.
