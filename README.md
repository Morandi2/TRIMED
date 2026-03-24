git checkout dev
git checkout -b feature/login
# travay sou login lan
git add .
git commit -m "Ajoute login modal ak validation"
git push -u origin feature/login





__TRIMED - Système de Gestion Hospitalière (Version 2.0.2)__

Voici ce que contient ce projet:

## 📋 Vue d'ensemble

TRIMED est une application web complète de gestion hospitalière développée avec React 19, TypeScript et Vite. Le système est conçu pour les hôpitaux haïtiens (exemple: Hôpital Général de Port-au-Prince).

## 🏥 Modules principaux du système

### 1. __GestionPatients__ (Gestion des patients)

- Création, modification, suppression de dossiers patients
- Numéro de dossier médical
- Informations personnelles complètes
- Historique médical
- Impression et visualisation des dossiers
- Statistiques des patients

### 2. __GestionMedecins__ (Gestion des médecins)

- Profils des médecins
- Spécialités
- Coordonnées et disponibilités
- Statistiques

### 3. __GestionConsultations__ (Gestion des consultations)

- Enregistrement des consultations
- Motifs de visite
- Diagnostics et examens
- Impression des rapports
- Statistiques des consultations

### 4. __GestionOrdonnances__ (Gestion des prescriptions)

- Création d'ordonnances
- Liste des médicaments prescrits
- Posologie et instructions
- Impression des ordonnances

### 5. __GestionMedicaments__ (Gestion des médicaments)

- Inventaire des médicaments
- Mouvements de stock
- Gestion des quantités

### 6. __GestionRendezVous__ (Gestion des rendez-vous)

- Planification des rendez-vous
- Calendrier intégré (FullCalendar)

### 7. __GestionPaiements__ (Gestion des paiements)

- Enregistrement des paiements
- Historique des transactions

### 8. __GestionAbonnements__ (Gestion des abonnements)

- Abonnements des patients
- Renouvellements

### 9. __GestionUtilisateur__ (Gestion des utilisateurs)

- Comptes utilisateurs du système
- Rôles et permissions

### 10. __Autres modules__

- GestionCoupons (Coupons)
- GestionEssais (Essais)
- GestionInvoices (Factures)
- TenantPaiement (Paiements multi-tenant)

## 🛠️ Technologies utilisées

__Frontend:__

- React 19.0
- TypeScript 5.7
- Vite 6.1 (Build tool)
- React Router 7.9 (Navigation)

__UI/Styling:__

- Tailwind CSS 4.0
- DaisyUI 5.3 (Components)
- Lucide React (Icons)

__Fonctionnalités:__

- FullCalendar (Calendriers)
- ApexCharts (Graphiques)
- React DnD (Drag & Drop)
- Flatpickr (Date picker)
- Swiper (Carousels)

## 📁 Structure du projet

```javascript
TRIMED/
├── src/
│   ├── pages/
│   │   ├── GestionHopital/     # Tous les modules hospitaliers
│   │   ├── Dashboard/          # Tableaux de bord
│   │   ├── AuthPages/          # Authentification
│   │   └── ...
│   ├── components/             # Composants réutilisables
│   ├── layout/                 # Layout (Sidebar, Header)
│   ├── hooks/                  # Custom hooks
│   └── context/                # Context API (Theme, Sidebar)
└── public/                     # Assets statiques
```

## 🚀 Commandes disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build pour production
- `npm run preview` - Preview du build
- `npm run lint` - Linter le code

## 📝 Caractéristiques clés

- Interface multilingue (Français)
- Mode sombre/clair (dark/light theme)
- Design responsive
- Système multi-tenant (plusieurs hôpitaux)
- Impression de documents (rapports, ordonnances)
- Statistiques et tableaux de bord
- Recherche et filtres avancés
- Formulaires progressifs/multi-étapes
- Export/Import de données

Le projet est actuellement configuré pour l'Hôpital Général de Port-au-Prince comme exemple de tenant.
