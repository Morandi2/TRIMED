// Textes du portail TRIMED. Ils reprennent le mémoire du projet (fonctionnalités, tarifs, étude de coûts) :
// toute modification de fond doit rester cohérente avec lui. Vocabulaire courant, sans jargon technique.

export const NAVIGATION = [
  { libelle: 'Le gardien', ancre: '#histoire' },
  { libelle: 'Modules', ancre: '#modules' },
  { libelle: 'Démarrer', ancre: '#parcours' },
  { libelle: 'Sécurité', ancre: '#securite' },
  { libelle: 'Tarifs', ancre: '#tarifs' },
  { libelle: 'Questions', ancre: '#questions' }
];

export const CONTACT = {
  email: 'trimedht@gmail.com',
  telephones: ['+509 4030 2622', '+509 4347 9901']
};

export const OUVERTURE = {
  surtitre: 'Soins, gestion, innovation',
  titre: ['Chaque dossier', 'à sa place.'],
  texte: 'TRIMED réunit le dossier de chaque patient, les consultations, les ordonnances, les rendez-vous et la pharmacie dans une seule plateforme en ligne, pensée pour les hôpitaux d’Haïti.'
};

// Les trois chapitres que traverse le robot gardien.
export const HISTOIRE = [
  {
    etiquette: 'Aujourd’hui',
    titre: 'Des dossiers qui se perdent.',
    texte: 'À l’hôpital, le dossier d’un patient est souvent une fiche papier qui passe de service en service. Une page égarée, un doublon, et son histoire médicale se brise.'
  },
  {
    etiquette: 'Avec TRIMED',
    titre: 'Tout se rassemble.',
    texte: 'Le gardien réunit chaque information au même endroit. L’accueil, le médecin, l’infirmier et la pharmacie travaillent sur le même dossier, au même moment.'
  },
  {
    etiquette: 'En sécurité',
    titre: 'Chacun voit ce qu’il doit voir.',
    texte: 'Chaque hôpital dispose de son propre espace, séparé de celui des autres. Et chaque membre du personnel n’accède qu’à ce que son rôle permet.'
  }
];

export const MODULES = [
  { icone: 'dossier', titre: 'Dossiers patients', texte: 'Un numéro unique par patient, avec son historique, ses allergies et ses examens, retrouvé en quelques secondes.' },
  { icone: 'stethoscope', titre: 'Consultations et ordonnances', texte: 'Le médecin note le motif et le diagnostic, puis prépare l’ordonnance, prête à imprimer.' },
  { icone: 'agenda', titre: 'Rendez-vous', texte: 'Planifier, confirmer ou reporter : l’accueil et les médecins partagent le même agenda.' },
  { icone: 'pharmacie', titre: 'Pharmacie', texte: 'Le stock de chaque médicament est à jour, avec une alerte avant la rupture.' },
  { icone: 'lit', titre: 'Lits et salles', texte: 'Chambres, lits et salles d’examen disponibles, visibles d’un coup d’œil.' },
  { icone: 'equipe', titre: 'Équipe et accès', texte: 'Chaque membre du personnel a son compte, et l’administrateur décide qui fait quoi.' }
] as const;

export const PARCOURS = [
  { titre: 'Choisissez votre formule', texte: 'Basic, Standard ou Premium, selon la taille de votre établissement.' },
  { titre: 'Nous préparons votre hôpital', texte: 'Paramétrage, formation de votre équipe et reprise de vos dossiers existants.' },
  { titre: 'Vous travaillez en ligne', texte: 'Depuis un ordinateur, une tablette ou un téléphone Android, avec une assistance quand vous en avez besoin.' }
];

export const SECURITE = [
  { icone: 'cle', titre: 'Une connexion personnelle', texte: 'Chaque utilisateur entre avec son propre compte et son mot de passe.' },
  { icone: 'espace', titre: 'Un espace par hôpital', texte: 'Les données de votre établissement restent séparées de celles des autres hôpitaux.' },
  { icone: 'role', titre: 'Des accès selon le rôle', texte: 'Médecin, infirmier, secrétaire, administrateur : chacun ne voit que ce dont il a besoin.' },
  { icone: 'cadenas', titre: 'Des échanges protégés', texte: 'Les informations circulent par une connexion sécurisée, comme pour une banque en ligne.' }
] as const;

export const TARIFS = {
  note: 'Prix mensuels, en gourdes. La mise en service, payée une seule fois (300 000 HTG), comprend le paramétrage, la formation de l’équipe et la reprise de vos dossiers.',
  formules: [
    { nom: 'Basic', prix: '5 000', public: 'Petites cliniques', points: ['Dossiers patients', 'Consultations et ordonnances', 'Rendez-vous', 'Pharmacie'] },
    { nom: 'Standard', prix: '10 000', public: 'Hôpitaux de taille moyenne', points: ['Tous les modules', 'Lits et salles', 'Application Android', 'Formation de l’équipe'], conseille: true },
    { nom: 'Premium', prix: '15 000', public: 'Grands établissements', points: ['Tout le plan Standard', 'Support prioritaire', 'Formation continue du personnel'] }
  ]
};

export const MOBILE = {
  titre: 'TRIMED dans la poche.',
  texte: 'L’application Android accompagne le personnel d’un service à l’autre et permet au patient de consulter son dossier et ses rendez-vous.',
  points: ['Le dossier du patient au chevet', 'L’agenda du jour', 'Le même compte que sur le Web']
};

// Chiffres de l’étude de faisabilité du mémoire (chapitres 2 et 6) : des estimations, présentées comme telles.
export const ETUDE = {
  titre: 'Ce que montre notre étude.',
  chiffres: [
    { valeur: '1 702 000', unite: 'HTG', legende: 'd’économies estimées sur quatre ans pour l’hôpital JCC' },
    { valeur: '3×', unite: 'moins cher', legende: 'que de renforcer le système papier : 780 000 HTG contre 2 482 000 HTG sur quatre ans' },
    { valeur: '7', unite: 'rôles', legende: 'du médecin au patient, chacun avec ses propres accès' }
  ],
  source: 'Estimations issues de l’étude de faisabilité du projet TRIMED (2024-2025), à confirmer après la mise en service.'
};

export const QUESTIONS = [
  { q: 'Faut-il une connexion Internet ?', r: 'Oui. TRIMED fonctionne en ligne, depuis un navigateur ou l’application Android. Un mode hors ligne est prévu dans une prochaine version.' },
  { q: 'Faut-il acheter un serveur ?', r: 'Non. TRIMED est hébergé en ligne : un ordinateur, une tablette ou un téléphone suffisent.' },
  { q: 'Le patient peut-il voir son dossier ?', r: 'Oui. L’hôpital crée son compte ; le patient consulte alors son dossier et ses rendez-vous, sans pouvoir les modifier.' },
  { q: 'Nos données sont-elles visibles par d’autres hôpitaux ?', r: 'Non. Chaque établissement a son propre espace, séparé des autres.' },
  { q: 'Que comprend la mise en service ?', r: 'Le paramétrage de votre hôpital, la formation du personnel et la reprise de vos dossiers existants, pour 300 000 HTG payés une seule fois.' },
  { q: 'Combien de temps pour démarrer ?', r: 'Le temps de paramétrer votre établissement et de former votre équipe : nous fixons le calendrier ensemble.' }
];

export const APPEL = {
  titre: ['Parlons de', 'votre hôpital.'],
  texte: 'Nous vous montrons TRIMED avec les situations de votre établissement.'
};
