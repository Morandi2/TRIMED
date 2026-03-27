# DOCUMENTATION INTERFACE GRAPHIQUE
## SYSTÈME DE GESTION HOSPITALIÈRE TRIMED
### Version 2.0.2

---

## TABLE DES MATIÈRES

1. [Applicabilité du manuel](#1-applicabilité-du-manuel)
2. [Conventions](#2-conventions)
3. [Procédure pour signaler et rapporter les erreurs](#3-procédure-pour-signaler-et-rapporter-les-erreurs)
4. [Les fonctionnalités offertes aux utilisateurs du système](#4-les-fonctionnalités-offertes-aux-utilisateurs-du-système)
5. [Information connexe](#5-information-connexe)
6. [Messages d'erreur, problèmes connus](#6-messages-derreur-problèmes-connus)
7. [Maquettes](#7-maquettes)
8. [Estimation des Ressources et du Budget](#8-estimation-des-ressources-et-du-budget)

---

## 1. APPLICABILITÉ DU MANUEL

### 1.1 Version du logiciel
Ce guide correspond à la **version 2.0.2** du système TRIMED (Système de Gestion Hospitalière).

### 1.2 Environnement matériel requis
- **Processeur** : Intel Core i3 ou équivalent AMD (minimum)
- **Mémoire RAM** : 4 GB minimum, 8 GB recommandé
- **Espace disque** : 2 GB d'espace libre
- **Résolution d'écran** : 1366x768 minimum, 1920x1080 recommandé
- **Connexion Internet** : Haut débit pour les fonctionnalités cloud

### 1.3 Environnement logiciel
- **Système d'exploitation** : Windows 10/11, macOS 10.15+, Linux Ubuntu 18.04+
- **Navigateurs supportés** :
  - Google Chrome 90+ (recommandé)
  - Mozilla Firefox 88+
  - Microsoft Edge 90+
  - Safari 14+ (macOS)
- **Node.js** : Version 18.0+ (pour le développement)
- **Base de données** : Compatible avec PostgreSQL, MySQL, SQLite

### 1.4 Technologies utilisées
- **Frontend** : React 19.0, TypeScript 5.7, Vite 6.1
- **Interface utilisateur** : Tailwind CSS 4.0, DaisyUI 5.3
- **Graphiques** : ApexCharts, FullCalendar
- **Navigation** : React Router 7.9
- **Icônes** : Lucide React

---

## 2. CONVENTIONS

### 2.1 Conventions de codage

#### 2.1.1 Nomenclature des composants
```typescript
// Convention PascalCase pour les composants React
export const GestionPatients: React.FC = () => {
  // Logique du composant
};

// Convention camelCase pour les fonctions
const handleCreatePatient = (formData: PatientFormData) => {
  // Logique de création
};
```

#### 2.1.2 Structure des fichiers
```
src/
├── pages/
│   └── GestionHopital/
│       └── GestionPatients/
│           ├── GestionPatiens.tsx          # Composant principal
│           ├── components/                 # Sous-composants
│           │   ├── PatientModal.tsx
│           │   ├── PatientTable.tsx
│           │   └── PatientStats.tsx
│           ├── services/                   # Services métier
│           │   └── PatientService.tsx
│           └── types/                      # Définitions TypeScript
│               └── PatientTypes.ts
```

### 2.2 Conventions d'interface utilisateur

#### 2.2.1 Palette de couleurs
- **Primaire** : Bleu (#3B82F6)
- **Secondaire** : Gris (#6B7280)
- **Succès** : Vert (#10B981)
- **Erreur** : Rouge (#EF4444)
- **Avertissement** : Orange (#F59E0B)

#### 2.2.2 Typographie
```css
/* Titres principaux */
.title-main { font-size: 1.5rem; font-weight: 600; }

/* Sous-titres */
.title-sub { font-size: 1.125rem; font-weight: 500; }

/* Texte normal */
.text-body { font-size: 0.875rem; font-weight: 400; }
```

#### 2.2.3 Espacement et grille
- **Unité de base** : 4px (0.25rem)
- **Espacement standard** : 16px (1rem)
- **Grille responsive** : 12 colonnes avec breakpoints Tailwind

### 2.3 Conventions de syntaxe des commandes

#### 2.3.1 Actions utilisateur
```typescript
// Convention pour les gestionnaires d'événements
onClick={handleActionName}
onSubmit={handleFormSubmit}
onChange={handleInputChange}

// Convention pour les props
interface ComponentProps {
  isVisible: boolean;        // Booléens avec préfixe "is"
  onAction: () => void;      // Callbacks avec préfixe "on"
  dataItems: Item[];         // Collections avec préfixe "data"
}
```

#### 2.3.2 États et données
```typescript
// Convention pour les états React
const [patients, setPatients] = useState<Patient[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
```

---

## 3. PROCÉDURE POUR SIGNALER ET RAPPORTER LES ERREURS

### 3.1 Canaux de support

#### 3.1.1 Support technique immédiat
- **Email** : support@trimed-hospital@gmail.com
- **Téléphone** : +509 2811-2233 (Lundi-Vendredi, 8h-17h)


#### 3.1.2 Rapports de bugs
- **Système de tickets** : https://support.trimed-hospital@gmail.com
- **GitHub Issues** : https://github@.com/trimed/hospital-system/issues
- **Email dédié** : bugs@trimed-hospital@gmail.com

### 3.2 Informations à fournir lors du signalement

#### 3.2.1 Informations obligatoires

1. **Navigateur et version** : Exemple "Chrome 120.0.6099.109"
2. **Système d'exploitation** : Windows 11, macOS Sonoma, etc.
3. **Description détaillée** : Étapes pour reproduire l'erreur
4. **Captures d'écran** : Si applicable
5. **Messages d'erreur** : Texte exact affiché

#### 3.2.2 Template de rapport d'erreur
```
TITRE : [Résumé bref du problème]

ENVIRONNEMENT :
- Version TRIMED : 2.0.2
- Navigateur : Chrome 120.0.6099.109
- OS : Windows 11
- Résolution : 1920x1080

ÉTAPES POUR REPRODUIRE :
1. Aller dans le module Gestion des Patients
2. Cliquer sur "Nouveau Patient"
3. Remplir le formulaire
4. Cliquer sur "Enregistrer"

RÉSULTAT ATTENDU :
Le patient devrait être enregistré et apparaître dans la liste

RÉSULTAT OBTENU :
Message d'erreur "Erreur de validation" sans détails

CAPTURES D'ÉCRAN :
[Joindre les images]
```

### 3.3 Suggestions d'amélioration

#### 3.3.1 Canal dédié
- **Email** : suggestions@trimed-hospital.com
- **Forum communautaire** : https://community.trimed-hospital.com
- **Enquêtes utilisateur** : Envoyées trimestriellement

#### 3.3.2 Processus de traitement
1. **Accusé de réception** : Sous 24h
2. **Évaluation technique** : 3-5 jours ouvrables
3. **Notification** : Mise à jour envoyée au demandeur

---

## 4. LES FONCTIONNALITÉS OFFERTES AUX UTILISATEURS DU SYSTÈME

### 4.1 Scénario 1 : Gestion des Patients

#### 4.1.1 Portée et limites de la tâche
**Objectif** : Créer, modifier, consulter et supprimer les dossiers patients
**Limites** : 
- Maximum 10,000 patients par hôpital
- Historique conservé pendant 7 ans
- Accès restreint selon les rôles utilisateur

#### 4.1.2 Matériel nécessaire
**Documents requis** :
- Pièce d'identité du patient
- Carnet de vaccination (si applicable)
- Dossiers médicaux antérieurs

**Matériel informatique** :
- Ordinateur avec navigateur web
- Connexion Internet stable
- Imprimante (pour les rapports)

**Logiciels et interfaces** :
- Navigateur web compatible
- Accès au système TRIMED
- Lecteur PDF (pour les rapports)

#### 4.1.3 Préparations préalables

**Activités techniques** :
1. Vérifier la connexion Internet
2. S'assurer que le navigateur est à jour
3. Préparer les documents du patient

**Activités administratives** :
1. Obtenir les autorisations d'accès nécessaires
2. Vérifier les droits d'écriture dans le module
3. Préparer le numéro de dossier médical

#### 4.1.4 Avertissements et mises en garde

⚠️ **ATTENTION** : Les données patients sont confidentielles. Respecter la RGPD et les lois locales sur la protection des données.

⚠️ **IMPORTANT** : Toujours vérifier l'identité du patient avant de modifier son dossier.

⚠️ **SÉCURITÉ** : Ne jamais partager vos identifiants de connexion.

#### 4.1.5 Méthode et étapes d'utilisation

##### Étape 1 : Accès au module Gestion des Patients

**Action utilisateur** :
1. Se connecter au système TRIMED
2. Cliquer sur "Gestion Hospitalière" dans le menu principal
3. Sélectionner "Gestion des Patients"

**Fonction invoquée** : Navigation vers GestionPatients.tsx

**Terminaison normale** : Affichage de la liste des patients avec statistiques

**Résultats attendus** :
- Liste paginée des patients existants
- Statistiques en temps réel (nombre total, nouveaux patients, etc.)
- Barre de recherche fonctionnelle
- Bouton "Nouveau Patient" visible (si autorisé)

**Erreurs possibles** :
- "Accès refusé" : Vérifier les permissions utilisateur
- "Erreur de chargement" : Vérifier la connexion réseau

##### Étape 2 : Création d'un nouveau patient

**Action utilisateur** :
1. Cliquer sur le bouton "Nouveau Patient"
2. Remplir le formulaire progressif (3 étapes)
3. Valider chaque étape
4. Confirmer l'enregistrement

**Fonction invoquée** : PatientProgressForm avec PatientService.creerPatientComplet()

**Terminaison normale** : Message de confirmation "Patient enregistré avec succès"

**Résultats attendus** :
- Génération automatique du numéro de dossier médical
- Patient ajouté à la liste
- Mise à jour des statistiques
- Possibilité d'imprimer le dossier

**Erreurs possibles et solutions** :
- "Numéro d'identification déjà existant" : Vérifier les données saisies
- "Champs obligatoires manquants" : Compléter tous les champs requis
- "Format de date invalide" : Utiliser le format JJ/MM/AAAA

##### Étape 3 : Recherche et consultation

**Action utilisateur** :
1. Utiliser la barre de recherche
2. Saisir nom, prénom, ou numéro de dossier
3. Cliquer sur l'icône "Voir" pour consulter

**Fonction invoquée** : Filtrage en temps réel + PatientViewModal

**Terminaison normale** : Affichage du dossier complet en modal

**Résultats attendus** :
- Informations complètes du patient
- Historique des consultations
- Boutons d'action (Modifier, Imprimer, Supprimer)

### 4.2 Scénario 2 : Gestion des Consultations

#### 4.2.1 Portée et limites
**Objectif** : Enregistrer et gérer les consultations médicales
**Limites** :
- Une consultation par patient par jour par médecin
- Historique illimité
- Modification possible pendant 24h après création

#### 4.2.2 Matériel nécessaire
**Documents** :
- Dossier patient existant
- Notes médicales du médecin
- Résultats d'examens (si applicable)

**Matériel** :
- Accès au module Consultations
- Imprimante pour les rapports
- Scanner (pour joindre des documents)

#### 4.2.3 Étapes d'utilisation

##### Création d'une consultation

**Action utilisateur** :
1. Accéder au module "Gestion des Consultations"
2. Cliquer sur "Nouvelle Consultation"
3. Sélectionner le patient (recherche par nom ou numéro)
4. Choisir le médecin
5. Remplir les détails de la consultation
6. Enregistrer

**Résultats attendus** :
- Consultation enregistrée avec horodatage
- Génération automatique du rapport
- Mise à jour de l'historique patient
- Possibilité de créer une ordonnance liée

### 4.3 Scénario 3 : Gestion des Ordonnances

#### 4.3.1 Processus de prescription

**Étapes** :
1. Accéder depuis une consultation existante
2. Ajouter les médicaments (recherche dans la base)
3. Spécifier posologie et durée
4. Valider et imprimer l'ordonnance

**Sécurité** : Vérification des interactions médicamenteuses automatique

### 4.4 Scénario 4 : Gestion des Rendez-vous

#### 4.4.1 Planification

**Interface** : Calendrier FullCalendar intégré
**Fonctionnalités** :
- Vue mensuelle, hebdomadaire, journalière
- Glisser-déposer pour reprogrammer
- Notifications automatiques
- Gestion des conflits d'horaires

### 4.5 Scénario 5 : Tableau de bord et statistiques

#### 4.5.1 Dashboards par rôle

**Médecin** :
- Patients du jour
- Consultations en attente
- Statistiques personnelles

**Réceptionniste** :
- Rendez-vous du jour
- Nouveaux patients
- Paiements en attente

**Administrateur** :
- Vue d'ensemble de l'hôpital
- Statistiques financières
- Gestion des utilisateurs

---

## 5. INFORMATION CONNEXE

### 5.1 Regroupements de tâches

#### 5.1.1 Workflow médical complet
1. **Accueil patient** → Vérification/création dossier
2. **Consultation** → Enregistrement diagnostic
3. **Prescription** → Création ordonnance
4. **Paiement** → Facturation et encaissement
5. **Suivi** → Planification rendez-vous de contrôle

#### 5.1.2 Tâches administratives
- Gestion des utilisateurs et permissions
- Configuration des services hospitaliers
- Sauvegarde et archivage des données
- Génération des rapports périodiques

### 5.2 Tâches connexes et similaires

#### 5.2.1 Modules interconnectés
- **Patients ↔ Consultations** : Historique médical
- **Consultations ↔ Ordonnances** : Prescriptions liées
- **Patients ↔ Paiements** : Facturation des soins
- **Médecins ↔ Rendez-vous** : Planning personnel

#### 5.2.2 Fonctionnalités transversales
- **Recherche globale** : Disponible dans tous les modules
- **Impression** : Rapports standardisés pour tous les documents
- **Export/Import** : Données au format CSV, PDF, Excel
- **Audit trail** : Traçabilité de toutes les modifications

### 5.3 Notes et contraintes

#### 5.3.1 Limitations techniques
- **Performance** : Recommandé max 50 utilisateurs simultanés
- **Stockage** : Limite de 100 GB par hôpital (plan standard)
- **Sauvegarde** : Automatique toutes les 6 heures
- **Synchronisation** : Temps réel avec délai max 5 secondes

#### 5.3.2 Contraintes réglementaires
- **RGPD** : Consentement patient obligatoire pour certaines données
- **Archivage** : Conservation légale des dossiers médicaux (7 ans minimum)
- **Accès** : Logs d'audit obligatoires pour toutes les consultations de données

---

## 6. MESSAGES D'ERREUR, PROBLÈMES CONNUS

### 6.1 Erreurs communes et solutions

#### 6.1.1 Erreurs d'authentification

**Message** : "Identifiants invalides"
**Cause** : Nom d'utilisateur ou mot de passe incorrect
**Solution** :
1. Vérifier la saisie (majuscules/minuscules)
2. Utiliser "Mot de passe oublié" si nécessaire
3. Contacter l'administrateur si le compte est bloqué

**Message** : "Session expirée"
**Cause** : Inactivité prolongée (>30 minutes)
**Solution** :
1. Se reconnecter avec ses identifiants
2. Les données non sauvegardées sont perdues
3. Activer "Se souvenir de moi" pour éviter les déconnexions fréquentes

#### 6.1.2 Erreurs de validation de données

**Message** : "Format de date invalide"
**Cause** : Date saisie dans un format non reconnu
**Solution** :
1. Utiliser le format JJ/MM/AAAA
2. Utiliser le sélecteur de date intégré
3. Vérifier que la date est cohérente (pas dans le futur pour une naissance)

**Message** : "Numéro de téléphone invalide"
**Cause** : Format non conforme aux standards haïtiens
**Solution** :
1. Format attendu : +509 XXXX-XXXX
2. Supprimer les espaces supplémentaires
3. Vérifier que le numéro contient 8 chiffres après l'indicatif

#### 6.1.3 Erreurs de réseau

**Message** : "Impossible de se connecter au serveur"
**Cause** : Problème de connexion Internet ou serveur indisponible
**Solution** :
1. Vérifier la connexion Internet
2. Actualiser la page (F5)
3. Attendre quelques minutes et réessayer
4. Contacter le support si le problème persiste

### 6.2 Problèmes connus

#### 6.2.1 Performance sur navigateurs anciens
**Symptôme** : Interface lente, animations saccadées
**Navigateurs affectés** : Internet Explorer, Chrome < 90
**Solution temporaire** : Mettre à jour le navigateur ou utiliser Chrome/Firefox récent

#### 6.2.2 Impression sur certaines imprimantes
**Symptôme** : Mise en page incorrecte des rapports PDF
**Imprimantes affectées** : Modèles anciens sans support CSS3
**Solution** : Télécharger le PDF et imprimer depuis un lecteur PDF externe

#### 6.2.3 Synchronisation en temps réel
**Symptôme** : Données non mises à jour immédiatement
**Cause** : Latence réseau élevée (>500ms)
**Solution** : Actualiser manuellement ou attendre la synchronisation automatique (max 30 secondes)

### 6.3 Codes d'erreur système

| Code | Description | Action recommandée |
|------|-------------|-------------------|
| ERR_001 | Erreur de base de données | Contacter le support technique |
| ERR_002 | Permissions insuffisantes | Demander l'accès à l'administrateur |
| ERR_003 | Données corrompues | Restaurer depuis la sauvegarde |
| ERR_004 | Limite de stockage atteinte | Archiver les anciennes données |
| ERR_005 | Conflit de concurrence | Actualiser et réessayer |

---

## 7. MAQUETTES

### 7.1 Maquette 1 : Processus de création d'un patient

#### 7.1.1 Vue d'ensemble du module Gestion des Patients

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIMED - Gestion des Patients                          [🌙] [👤] │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Hôpital Général de Port-au-Prince                            │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   📋 Total  │ │ 👥 Nouveaux │ │ 🏥 Actifs   │ │ 📈 Ce mois  │ │
│ │    1,247    │ │     23      │ │    1,198    │ │     156     │ │
│ │  Patients   │ │ Cette sem.  │ │  Patients   │ │  Patients   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────┐ [🔍 Rechercher...] │
│ │                                         │ [+ Nouveau Patient] │
│ │ ┌─────────────────────────────────────┐ │                    │
│ │ │ Nom          │ Dossier │ Téléphone  │ │                    │
│ │ ├─────────────────────────────────────┤ │                    │
│ │ │ Jean Baptiste│ P001247 │ +509 3456  │ │ [👁️] [✏️] [🗑️]     │
│ │ │ Marie Dupont │ P001246 │ +509 2811  │ │ [👁️] [✏️] [🗑️]     │
│ │ │ Pierre Louis │ P001245 │ +509 4567  │ │ [👁️] [✏️] [🗑️]     │
│ │ └─────────────────────────────────────┘ │                    │
│ └─────────────────────────────────────────┘                    │
│                                          [◀️] 1 2 3 ... 25 [▶️] │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.1.2 Formulaire de création patient (Étape 1/3)

```
┌─────────────────────────────────────────────────────────────────┐
│ Nouveau Patient - Informations Personnelles            [✖️]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Étape 1 sur 3: Informations de base                            │
│ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Nom *                                                       │ │
│ │ [_________________________________]                        │ │
│ │                                                             │ │
│ │ Prénom *                                                    │ │
│ │ [_________________________________]                        │ │
│ │                                                             │ │
│ │ Date de naissance *          │ Sexe *                       │ │
│ │ [📅 JJ/MM/AAAA]             │ ⚪ Masculin ⚪ Féminin        │ │
│ │                              │                              │ │
│ │ Numéro d'identification nationale                           │ │
│ │ [_________________________________]                        │ │
│ │                                                             │ │
│ │ Téléphone                    │ Email                        │ │
│ │ [+509 ________________]      │ [___________________]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                    [Annuler] [Suivant ▶️]       │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.1.3 Confirmation et génération du dossier

```
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Patient créé avec succès !                          [✖️]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🎉 Le dossier patient a été créé avec succès                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📋 Numéro de dossier médical: P001248                      │ │
│ │                                                             │ │
│ │ 👤 Patient: Jean Baptiste PIERRE                           │ │
│ │ 📅 Date de naissance: 15/03/1985                           │ │
│ │ 📞 Téléphone: +509 3456-7890                               │ │
│ │ 🏥 Hôpital: Hôpital Général de Port-au-Prince              │ │
│ │ ⏰ Créé le: 15/12/2024 à 14:30                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Que souhaitez-vous faire maintenant ?                          │
│                                                                 │
│ [🖨️ Imprimer le dossier] [📋 Créer une consultation]           │
│ [📅 Planifier un RDV]   [✅ Terminer]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Maquette 2 : Processus de consultation médicale

#### 7.2.1 Sélection du patient pour consultation

```
┌─────────────────────────────────────────────────────────────────┐
│ Nouvelle Consultation                                   [✖️]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Étape 1: Sélection du patient                                  │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Rechercher un patient                                    │ │
│ │ [Jean Baptiste_________________________] [🔍 Rechercher]    │ │
│ │                                                             │ │
│ │ Résultats de la recherche:                                  │ │
│ │                                                             │ │
│ │ ⚪ Jean Baptiste PIERRE (P001248)                           │ │
│ │    📅 15/03/1985 | 📞 +509 3456-7890                       │ │
│ │    Dernière consultation: 10/12/2024                       │ │
│ │                                                             │ │
│ │ ⚪ Jean Claude MOÏSE (P001156)                              │ │
│ │    📅 22/07/1978 | 📞 +509 2811-3344                       │ │
│ │    Dernière consultation: 05/11/2024                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                    [Annuler] [Continuer ▶️]     │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.2.2 Saisie des informations de consultation

```
┌─────────────────────────────────────────────────────────────────┐
│ Consultation - Jean Baptiste PIERRE (P001248)          [✖️]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 👨‍⚕️ Dr. Marie JOSEPH | 📅 15/12/2024 | ⏰ 14:45                │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Motif de la consultation *                                  │ │
│ │ [Douleur abdominale_____________________] [🔽]              │ │
│ │                                                             │ │
│ │ Symptômes observés                                          │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ - Douleur dans la région épigastrique                  │ │ │
│ │ │ - Nausées depuis 2 jours                               │ │ │
│ │ │ - Perte d'appétit                                      │ │ │
│ │ │                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ Diagnostic *                                                │ │
│ │ [Gastrite aiguë________________________] [🔽]              │ │
│ │                                                             │ │
│ │ Traitement prescrit                                         │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ - Oméprazole 20mg, 1 cp matin à jeun                  │ │ │
│ │ │ - Régime alimentaire léger                             │ │ │
│ │ │ - Contrôle dans 1 semaine                              │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [📋 Créer ordonnance] [Annuler] [💾 Enregistrer consultation]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. ESTIMATION DES RESSOURCES ET DU BUDGET

### 8.1 Outils de développement utilisés (Gratuits/Open Source)

#### 8.1.1 Outils actuellement implémentés

| Outil | Usage | Coût | Justification |
|-------|-------|------|---------------|
| **React 19** | Framework frontend | Gratuit | Interface moderne et performante |
| **TypeScript** | Langage de programmation | Gratuit | Sécurité du code et maintenance |
| **Vite** | Build tool | Gratuit | Développement rapide |
| **Tailwind CSS** | Framework CSS | Gratuit | Design responsive et cohérent |
| **DaisyUI** | Composants UI | Gratuit | Interface professionnelle |
| **json-server** | Simulation API | Gratuit | Tests et développement local |
| **ESLint** | Analyse de code | Gratuit | Qualité et standards du code |
| **Git** | Contrôle de version | Gratuit | Suivi des modifications |
| **VS Code** | Éditeur de code | Gratuit | Environnement de développement |

### 8.2 Infrastructure minimale recommandée

#### 8.2.1 Solution d'hébergement économique

| Service | Spécification | Prix mensuel (USD) | Prix annuel (USD) |
|---------|---------------|-------------------|------------------|
| **Hébergement web** | VPS 4GB RAM, 80GB SSD<br/>DigitalOcean/Vultr | 20 | 240 |
| **Base de données** | PostgreSQL hébergé<br/>2GB RAM, 20GB stockage | 15 | 180 |
| **Nom de domaine** | .com + certificat SSL | 2 | 24 |
| **Sauvegarde cloud** | 50GB stockage<br/>Google Drive Business | 6 | 72 |
| **Email professionnel** | 5 comptes email<br/>Google Workspace | 30 | 360 |

**Total hébergement annuel : 876 USD**

#### 8.2.2 Matériel de base nécessaire

| Équipement | Spécification | Quantité | Prix unitaire (USD) | Total (USD) |
|------------|---------------|----------|-------------------|-------------|
| **Ordinateurs** | PC assemblé<br/>- Intel i3 ou AMD Ryzen 3<br/>- 8GB RAM, 256GB SSD | 5 | 400 | 2,000 |
| **Écrans** | 22" Full HD | 5 | 120 | 600 |
| **Imprimante** | HP DeskJet réseau | 1 | 150 | 150 |
| **Routeur** | TP-Link AC1750 | 1 | 80 | 80 |
| **UPS** | APC 650VA | 2 | 90 | 180 |

**Total matériel : 3,010 USD**

### 8.3 Ressources humaines (Équipe réduite)

#### 8.3.1 Développement et finalisation (3 mois)

| Rôle | Profil | Salaire mensuel (USD) | Durée | Total (USD) |
|------|--------|---------------------|-------|-------------|
| **Développeur principal** | Étudiant finissant/Junior | 800 | 3 mois | 2,400 |
| **Assistant développeur** | Stagiaire | 300 | 2 mois | 600 |
| **Testeur** | Temps partiel | 200 | 2 mois | 400 |

**Total développement : 3,400 USD**

#### 8.3.2 Support et maintenance (Première année)

| Service | Description | Prix mensuel (USD) | Prix annuel (USD) |
|---------|-------------|-------------------|------------------|
| **Support technique** | 20h/mois, télétravail | 400 | 4,800 |
| **Maintenance système** | Mises à jour, sauvegardes | 150 | 1,800 |

**Total support annuel : 6,600 USD**

### 8.4 Formation simplifiée

#### 8.4.1 Formation utilisateurs

| Type | Participants | Format | Coût total (USD) |
|------|-------------|--------|------------------|
| **Administrateurs** | 2 personnes | 2 jours sur site | 600 |
| **Utilisateurs finaux** | 15 personnes | 1 jour formation + vidéos | 800 |
| **Documentation** | Manuel PDF + vidéos | Création interne | 200 |

**Total formation : 1,600 USD**

### 8.5 Fonctionnalités futures (Versions ultérieures)

#### 8.5.1 Améliorations prévues (Version 3.0)

| Fonctionnalité | Description | Estimation coût (USD) | Priorité |
|----------------|-------------|---------------------|----------|
| **API REST complète** | Remplacement json-server | 2,000 | Haute |
| **Application mobile** | Flutter | 3,500 | Moyenne |
| **Rapports avancés** | Graphiques complexes | 1,500 | Moyenne |
| **Intégration paiement** | Mo, cartes | 2,500 | Basse |
| **Télémédecine** | Consultations vidéo | 4,000 | Basse |

**Total améliorations futures : 13,500 USD**

### 8.6 Récapitulatif budgétaire réaliste

#### 8.6.1 Investissement initial minimal

| Catégorie | Montant (USD) | Pourcentage |
|-----------|---------------|-------------|
| **Matériel informatique** | 3,010 | 32.8% |
| **Développement final** | 3,400 | 37.1% |
| **Formation initiale** | 1,600 | 17.4% |
| **Hébergement (1 an)** | 876 | 9.6% |
| **Contingence (10%)** | 289 | 3.1% |

**TOTAL INVESTISSEMENT INITIAL : 9,175 USD**

#### 8.6.2 Coûts de fonctionnement annuels

| Catégorie | Montant (USD) | Pourcentage |
|-----------|---------------|-------------|
| **Hébergement et services** | 876 | 11.7% |
| **Support technique** | 6,600 | 88.3% |

**TOTAL COÛTS ANNUELS : 7,476 USD**

#### 8.6.3 Retour sur investissement

**Bénéfices estimés pour un petit hôpital :**
- **Réduction papier** : 2,000 USD/an
- **Gain de temps** : 8,000 USD/an
- **Réduction erreurs** : 3,000 USD/an
- **Amélioration efficacité** : 5,000 USD/an

**Total bénéfices annuels : 18,000 USD**

**ROI = (18,000 - 7,476) / 9,175 = 114.7% par an**

**Période de retour : 6 mois**

#### 8.6.4 Options de financement adaptées

**Option 1 : Autofinancement (Recommandé)**
- Investissement : 9,175 USD
- Paiement échelonné sur 6 mois
- Avantage : Coût total minimal

**Option 2 : Financement partiel**
- Fonds propres : 5,000 USD
- Crédit : 4,175 USD sur 12 mois
- Mensualité : ~380 USD

**Option 3 : Déploiement progressif**
- Phase 1 : Modules essentiels (5,000 USD)
- Phase 2 : Modules avancés (4,175 USD)
- Étalement sur 12 mois

---

## CONCLUSION

Cette documentation présente l'interface graphique du système TRIMED dans sa version 2.0.2, en détaillant tous les aspects nécessaires à son utilisation optimale. Le système offre une solution complète et moderne pour la gestion hospitalière, avec une interface intuitive développée avec des technologies open source performantes.

### Bilan financier réaliste

L'investissement estimé de **9,175 USD** pour la mise en œuvre complète représente une solution accessible et adaptée au contexte haïtien. Ce budget inclut :

- **Matériel de base** : 3,010 USD (ordinateurs assemblés, équipements essentiels)
- **Développement final** : 3,400 USD (équipe réduite d'étudiants/juniors)
- **Formation et déploiement** : 1,600 USD (formation simplifiée)
- **Hébergement cloud** : 876 USD/an (VPS économique)

### Retour sur investissement exceptionnel

Avec un **ROI de 114.7% par an** et une **période de retour de seulement 6 mois**, le système TRIMED offre :

- **Gains de productivité** : Réduction de 80% du temps de traitement des dossiers
- **Économies opérationnelles** : 18,000 USD/an en bénéfices nets
- **Amélioration qualité** : Réduction significative des erreurs médicales
- **Modernisation** : Transition vers le numérique sans investissement massif

### Technologies durables et évolutives

Le choix d'outils gratuits et open source (React, TypeScript, PostgreSQL, json-server) garantit :

- **Pérennité** : Pas de dépendance aux licences coûteuses
- **Évolutivité** : Architecture modulaire permettant l'ajout de fonctionnalités
- **Maintenance** : Coûts de support réduits (7,476 USD/an)
- **Formation** : Technologies standards facilitant le recrutement

### Perspectives d'évolution

Les versions futures (3.0+) pourront intégrer progressivement :
- API REST complète (2,000 USD)
- Application mobile (3,500 USD)
- Télémédecine (4,000 USD)
- Intégration paiements mobiles (2,500 USD)

Cette approche par phases permet un développement maîtrisé selon les besoins et les capacités financières de chaque établissement.

### Recommandation finale

TRIMED 2.0.2 représente une solution optimale pour les hôpitaux haïtiens souhaitant se moderniser avec un budget maîtrisé. L'investissement initial de moins de 10,000 USD, remboursé en 6 mois, en fait un projet à la fois ambitieux et réaliste pour améliorer significativement la qualité des soins et l'efficacité administrative.

---

**Document préparé par :** Équipe de développement TRIMED  
**Date de création :** 15 décembre 2024  
**Version du document :** 1.0  
**Budget total révisé :** 9,175 USD (investissement initial)  
**Prochaine révision :** 15 mars 2025