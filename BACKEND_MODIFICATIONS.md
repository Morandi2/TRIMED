# Modifications à apporter au backend TRIMED (Django REST)

Constats faits le 31 octobre 2026 sur `https://trimedh-service.onrender.com`, en préparant les données de
démonstration (`scripts/seed/seed-demo.mjs`, désormais dans le dépôt du backend). Chaque point indique ce qui se passe, la correction proposée
et la précaution de sécurité à garder. Aucun de ces changements n'ouvre d'accès supplémentaire : ils
corrigent des erreurs ou complètent des fonctions que le frontend utilise déjà.

Ordre conseillé : **0 (critique)** → 1 → 2 → 3, puis le reste.

## État au 4 novembre 2026

Le code du backend qui tourne sur Render est celui du dépôt `ruth10-haiti/Trimed`. Les corrections ci-dessous y
sont écrites et testées sur la branche `securite/acces-et-cloisonnement` (en local, en attente des droits
d'écriture pour la demande de fusion). Le détail du déploiement est dans `DEPLOIEMENT_PHASES.md`, à la racine
de cette branche.

| Point | État sur la branche |
|---|---|
| 0.1 Attribution des rôles | Fait (rôles du personnel et patient seulement depuis un hôpital) |
| 0.2 Données visibles entre hôpitaux | Fait (hôpitaux, chambres, lits, admissions, salles, réservations) |
| 0.3 Modification de son hôpital par le propriétaire | Non fait : seule l'équipe TRIMED modifie un hôpital |
| 0.5 Équipe TRIMED = `is_staff` | Fait |
| 0.6 Rendez-vous visibles par tous | Fait (le filtre cherchait `user.patient` au lieu de `patient_lie`) |
| 13 Profil en erreur 500 | Fait (`profile`, `update_profile`, `change_password`, `toggle_active`) |
| 15 Hospitalisations tenues par le secrétariat | Fait (statut des lits suivi par le serveur) |
| 16 Patient dans la liste des ordonnances | Fait |
| Journal d'audit, réinitialisation du mot de passe | Non faits |

Trouvé et corrigé en route : inscription qui permettait de se rattacher à un hôpital existant, profil qui
permettait de changer d'hôpital, compte patient qui voyait les allergies et signes vitaux de tous les patients,
routes `/patients/adresses/`, `allergies/`, `suivis/`… qui n'avaient jamais fonctionné, numéros de chambre et
codes de salle uniques sur toute la plateforme. Ajouts : visites (épisodes de soins), caisse, assurances,
téléconsultation.

Reste côté serveur : stockage durable des fichiers, `gunicorn` au lieu de `runserver`, retrait du mot de passe
de `create_superuser.py`, unicité du numéro de dossier patient par hôpital.

---

## 0. Accès entre rôles et entre hôpitaux (critique, à faire avant tout le reste)

Constats du 1er novembre 2026, vérifiés avec le compte propriétaire de démonstration de JCC.

**Origine.** Au début, le rôle « Administrateur » désignait l'administrateur d'un hôpital. En mars 2026,
le formulaire des utilisateurs l'a rebaptisé « Administrateur Systeme » et l'a relié à `admin-systeme`.
En mai 2026, le portail Admin TRIMED (hôpitaux, abonnements) a réservé ce rôle à l'équipe TRIMED. Depuis,
un propriétaire qui crée un « administrateur » pour son hôpital crée en réalité un administrateur de toute
la plateforme. Le frontend ne le propose plus, mais **seul le serveur peut fermer la porte** : n'importe qui
avec un compte propriétaire peut encore envoyer la requête à la main.

### 0.1 Attribution des rôles (`/api/comptes/utilisateurs/`)

**Constat.** `POST` et `PATCH` acceptent `role: "admin-systeme"` ou `"proprietaire-hopital"` de la part
d'un propriétaire. Un compte `admin-systeme` a ainsi été créé dans l'hôpital 1 (id 11, le 1er novembre).

**Correction.** Dans le serializer `Utilisateur` (création et modification) :
```python
ROLES_PERSONNEL = {"medecin", "infirmier", "secretaire", "personnel"}

def validate_role(self, role):
    demandeur = self.context["request"].user
    if est_equipe_trimed(demandeur):          # voir 0.5
        return role
    if role not in ROLES_PERSONNEL:
        raise serializers.ValidationError("Ce rôle ne peut pas être attribué depuis un hôpital.")
    return role

def validate(self, data):
    demandeur = self.context["request"].user
    if not est_equipe_trimed(demandeur):
        data["hopital"] = demandeur.hopital          # jamais un autre hôpital
        if self.instance and self.instance.role not in ROLES_PERSONNEL:
            data.pop("role", None)                    # on ne change pas le rôle d'un admin/propriétaire
        if self.instance and self.instance.pk == demandeur.pk:
            data.pop("role", None)                    # personne ne change son propre rôle
    return data
```
- `update_profile` : ignorer `role`, `hopital`, `is_staff` et `is_active`.
- `inscription` (publique) : forcer `role = "proprietaire-hopital"` et `is_active = False`, quel que soit le corps.
- Seule l'équipe TRIMED (0.5) peut créer un compte `admin-systeme` sans hôpital.

**Données à vérifier.** Les comptes `admin-systeme` rattachés à un hôpital sont désormais des administrateurs
d'hôpital (0.5). Vérifier qu'aucun n'a `is_staff` coché :
`Utilisateur.objects.filter(role="admin-systeme", hopital__isnull=False, is_staff=True)` doit être vide.

### 0.2 Données d'un hôpital visibles par les autres hôpitaux

**Constat** (vérifié avec les propriétaires de JCC, Mirebalais et Albert Schweitzer, et un médecin de JCC) :
- `GET /api/tenants/tenants/` : **tout compte connecté**, quel que soit son hôpital ou son rôle, reçoit
  la liste de tous les hôpitaux de la plateforme, avec courriel, adresse, direction, type d'abonnement et
  statut de vérification. Le détail (`/tenants/tenants/{id}/`) renvoie 404, même pour son propre hôpital.
- `GET /api/hospitalisation/chambres/`, `/hospitalisation/lits/` et `/salles-medicales/salles/` : le
  propriétaire de Mirebalais (hôpital vide) reçoit les 8 chambres, 19 lits et 8 salles de JCC. Le filtre
  `?tenant=` fonctionne, mais il est facultatif : rien n'empêche de l'omettre.
- Correctement séparés : patients, utilisateurs, admissions, paramètres.

**Correction.** Même `get_queryset` pour la liste et le détail, dans chaque ViewSet concerné :
```python
def get_queryset(self):
    u = self.request.user
    if est_equipe_trimed(u):                  # voir 0.5
        return Tenant.objects.all()
    return Tenant.objects.filter(pk=u.hopital_id)
```
Pour les chambres et salles : `Model.objects.filter(tenant=u.hopital)` ; pour les lits :
`Lit.objects.filter(chambre__tenant=u.hopital)`. À la création d'un lit, refuser une chambre d'un autre hôpital.

### 0.3 Modification de son hôpital par le propriétaire (`PATCH /api/tenants/tenants/{id}/`)

**Constat.** Refusée (403), ce qui est correct pour le statut, l'abonnement et la vérification. Mais le
propriétaire ne peut pas non plus corriger son téléphone ou son adresse.

**Correction (optionnelle).** Autoriser le propriétaire sur **son** hôpital pour `telephone`, `adresse`,
`email_professionnel`, `directeur`, `nombre_de_lits` seulement. Les champs `statut`, `type_abonnement`,
`statut_verification_document`, `verifie_par`, `nom_schema_base_de_donnees` restent réservés à `admin-systeme`.
En attendant, l'assistant de configuration affiche ces informations en lecture et propose d'écrire à l'équipe.

### 0.4 Rappel de principe

Chaque vue qui renvoie des données d'hôpital doit filtrer par `request.user.hopital` côté serveur, pour tous
les comptes sauf l'équipe TRIMED (0.5). Le frontend masque des menus, mais il ne protège rien à lui seul.

### 0.5 Équipe TRIMED = `is_staff`, pas le rôle

**Décision (1er novembre 2026).** Le portail Admin TRIMED est réservé aux comptes `admin-systeme` dont la case
« statut équipe » (`is_staff`) est cochée dans l'admin Django. Un `admin-systeme` sans `is_staff` est un
**administrateur d'hôpital** : il administre son hôpital, comme le propriétaire. Le frontend applique déjà
cette règle (`roleEffectif` dans `src/types/userRoles.ts`).

**Côté serveur.** L'accès à tous les hôpitaux doit suivre la même règle, jamais le seul rôle :
```python
def est_equipe_trimed(u):
    return u.is_authenticated and u.is_staff and u.role == "admin-systeme" and u.hopital_id is None
```
- `is_staff` reste en lecture seule dans tous les serializers (c'est déjà le cas) : il ne se coche que
  dans l'admin Django.
- Un `admin-systeme` rattaché à un hôpital ne voit et ne modifie que cet hôpital.
- Une fois ce point en place, le formulaire des utilisateurs pourra proposer « Administrateur de l'hôpital »
  au propriétaire (rôle serveur `admin-systeme`, toujours rattaché à son hôpital). D'ici là, il ne le propose pas.

**Test.** Le compte 11 (admin-systeme, hôpital JCC, `is_staff = false`) doit recevoir les 7 utilisateurs de
JCC sur `/api/comptes/utilisateurs/`, pas les 11 de la plateforme.

**Résultat du 2 novembre 2026 : échec.** Le compte 11 reçoit les 11 utilisateurs de la plateforme (hôpitaux 1,
3, 4 et les comptes sans hôpital), alors que le propriétaire de JCC en reçoit 7. Le serveur donne donc l'accès
global à tout `admin-systeme`, `is_staff` ou non. Sur les patients, rendez-vous, chambres et salles, le compte 11
voit les mêmes nombres que le propriétaire de JCC.


### 0.6 Rendez-vous visibles par tous les comptes de l'hôpital

**Constat** (comptes de démonstration de JCC) : `GET /api/rendez-vous/` renvoie les 8 rendez-vous de l'hôpital
au **patient** (avec le nom des autres patients) et au médecin, alors que les consultations, ordonnances et examens
sont déjà filtrés pour eux. `GET /api/rendez-vous/mes_rendez_vous/` répond 400 pour tous les rôles
(« Vous n'avez pas de rendez-vous associés »).

**Correction.** Dans le `get_queryset` des rendez-vous : un patient ne reçoit que ses rendez-vous
(`patient__utilisateur=request.user`) ; un médecin reçoit les siens par défaut. Corriger `mes_rendez_vous`
(lien compte → patient ou médecin). En attendant, le frontend filtre (`?patient=` ou `?medecin=`), mais
la fuite reste possible par l'API.

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

## 13. Profil du compte connecté : erreur 500

**Constat.** `GET /api/comptes/utilisateurs/profile/` et `PATCH /api/comptes/utilisateurs/update_profile/` renvoient 500
pour tous les comptes testés (administrateur TRIMED, médecin, patient). La fiche par identifiant
(`/api/comptes/utilisateurs/{id}/`) fonctionne : l'écran « Mon profil » l'utilise en attendant.

**Correction.** Rendre `hopital` / `hopital_detail` facultatifs dans le serializer du profil (`None` si absent).
Le frontend n'appelle plus ce profil pour un administrateur TRIMED, mais d'autres écrans pourraient en avoir besoin.

---

## 14. Mots de passe : changement en erreur 500, pas de réinitialisation

**Constat.** `POST /api/comptes/utilisateurs/{id}/change_password/` répond 500 quel que soit le corps
(« cannot access local variable 'permission_classes' where it is not associated with a value ») : personne ne
peut changer son mot de passe. Aucune route de réinitialisation par e-mail n'existe. L'ancien écran « Mot de passe
oublié » simulait un envoi ; il indique désormais de passer par l'équipe TRIMED.

**Correction.**
- `change_password` : définir `permission_classes` dans l'action ; demander l'ancien mot de passe
  (`check_password`) puis `set_password` ; seul le titulaire du compte (ou l'équipe TRIMED) peut l'appeler.
- Réinitialisation : `PasswordResetTokenGenerator` de Django + deux routes (demande par e-mail, confirmation
  avec jeton à durée limitée). Réponse identique que l'adresse existe ou non.
- Optionnel : permettre à l'administrateur d'un hôpital de définir un mot de passe provisoire pour son
  personnel (jamais pour un autre hôpital), avec changement obligatoire à la connexion suivante.

---

## 15. Disponibilité des lits et des salles (page « Lits et salles »)

**Besoin.** Le secrétariat tient à jour quand un lit ou une salle est libre, réservé, en nettoyage ou hors
service ; toute l'équipe le voit en temps réel. Un lit avec une hospitalisation en cours est « Occupé » tout seul.

**Constat.**
- Le secrétariat reçoit 403 sur `/hospitalisation/chambres/`, `/lits/` et `/admissions/` : il ne voit pas les lits.
- L'infirmier reçoit 403 sur `/salles-medicales/...` : il ne voit pas les salles.
- `Lit.statut`, `Chambre.statut` et `SalleMedicale.statut` sont des textes libres (valeurs par défaut « libre » et
  « disponible »). Le frontend utilise désormais : lits `libre | occupe | reserve | nettoyage | hors_service` ;
  salles `disponible | occupee | nettoyage | maintenance`. Les indisponibilités datées des salles passent par
  `ReservationSalle` (motif « Nettoyage », « Maintenance »…).

**Correction.**
- Secrétariat : lecture des chambres et des lits de son hôpital, et `PATCH` du seul champ `statut` d'un lit
  (pas de création, pas de suppression, pas d'autre champ).
- Secrétariat, hospitalisations (c'est lui qui admet et fait sortir les patients) sur `/hospitalisation/admissions/`
  de son hôpital seulement :
  - `GET` (en cours et historique) ;
  - `POST` avec `patient`, `lit`, `motif`, `notes`, `statut = "hospitalise"` ;
  - `PATCH` de `statut` (`sorti` ou `transfere`) avec `date_sortie`, et `PATCH` de `lit` (changement de lit) ;
  - pas de `DELETE` : une admission erronée se clôt, elle ne s'efface pas.
- Contrôles serveur sur `Admission` : refuser une admission (ou un changement de lit) vers un lit qui a déjà
  une admission `hospitalise`, ou un lit d'un autre hôpital ; refuser une deuxième admission en cours pour le
  même patient ; `date_sortie` obligatoire et postérieure à `date_admission` quand le statut passe à `sorti`
  ou `transfere`. Le frontend vérifie déjà juste avant d'enregistrer, mais deux postes peuvent agir en même temps.
- Médecin et infirmier : lecture seule des admissions, chambres et lits de leur hôpital (plus de création ni de
  modification). Propriétaire et administrateur de l'hôpital : inchangés (tout).
- Infirmier et médecin : lecture des salles et de leurs réservations.
- Ajouter des `choices` aux champs `statut` (valeurs ci-dessus) pour refuser les fautes de frappe.
- Signal sur `Admission` : à la création (`hospitalise`), `lit.statut = "occupe"` ; à la sortie, au transfert ou
  quand le patient quitte ce lit pour un autre, `lit.statut = "nettoyage"`. Le frontend le fait déjà après chaque changement dans Hospitalisation, mais une
  admission créée ailleurs ne serait pas répercutée.
- Optionnel : un modèle `IndisponibiliteLit` (lit, début, fin, motif) pour prévoir l'indisponibilité d'un lit
  à l'avance, comme pour les salles.

---

## 16. Liste des ordonnances sans patient

**Constat (tests fonctionnels du 2 novembre 2026).** `GET /api/medical/ordonnances/` renvoie pour chaque ordonnance
`ordonnance_id`, `date_ordonnance`, `recommandations`, `medecin_nom`, `medecin_prenom` et `nb_prescriptions`, mais
ni le patient ni la consultation. Le détail (`/ordonnances/{id}/`) les donne (`patient_detail`,
`consultation_detail`). Le frontend charge donc le détail de chaque ligne affichée, une requête par ordonnance,
et la recherche par nom de patient ne porte que sur les lignes déjà complétées.

**Correction.** Ajouter `patient_id`, `patient_nom`, `patient_prenom` et `consultation_id` au serializer de liste.

---

## Côté frontend (pour mémoire)

- L'assistant de configuration (`src/pages/GestionHopital/Configuration/`) est réservé à l'administrateur de
  l'hôpital (le propriétaire) et s'ouvre seul à sa première connexion, tant que l'hôpital n'a pas de
  `ParametreHopital`. Ses quatre étapes enregistrent sur le serveur : informations (lecture, voir 0.3),
  chambres et lits (`chambres`, `lits`), équipe (`utilisateurs`, rôles du personnel seulement), préférences
  (`parametres`). Les anciennes étapes « branches » et « départements » ont été retirées : aucun modèle ne
  les porte côté serveur.
- Le portail des abonnements (`src/pages/GestionHopital/GestionAbonnements/`) existe mais n'a pas de route :
  il attend les routes de facturation du point 6. Le lien « Abonnements » a été retiré du menu en attendant.
