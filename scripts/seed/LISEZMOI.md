# Données de démonstration

Le script qui crée les hôpitaux de démonstration et leurs données (`seed-demo.mjs`, `donnees-demo.mjs`) se trouve
désormais dans le dépôt du backend, dans `scripts/seed/`. La CI du backend le lance à chaque modification sur une
base vide, deux fois de suite : il doit tout créer sans échec, puis ne rien créer en double.

```
TRIMED_ADMIN_EMAIL=… TRIMED_ADMIN_PASSWORD=… node scripts/seed/seed-demo.mjs
```

Les mots de passe des comptes de démonstration restent dans `comptes-demo.local.json`, ignoré par git : celui du
backend (`scripts/seed/comptes-demo.local.json`) est à jour ; celui de ce dossier est l’ancienne copie.
