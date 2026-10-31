// Données de démonstration TRIMED. Toutes les personnes sont fictives.
// Les établissements autres que JCC portent la mention « (démo) » : ils servent à tester
// le Setup Wizard et l'isolation des données, pas à représenter un partenariat réel.

export const ETABLISSEMENTS = [
  {
    cle: 'jcc', nom: 'Hôpital JCC – Carrefour', nombre_de_lits: 40, type_abonnement: 'standard',
    adresse: 'Carrefour, département de l’Ouest, Haïti', directeur: 'Direction de l’hôpital JCC',
    donnees: true // données de démonstration complètes
  },
  {
    cle: 'mirebalais', nom: 'Hôpital Universitaire de Mirebalais (démo)', nombre_de_lits: 300, type_abonnement: 'premium',
    adresse: 'Mirebalais, département du Centre, Haïti', directeur: 'Direction générale (démo)', donnees: false
  },
  {
    cle: 'stdamien', nom: 'Hôpital Saint-Damien (démo)', nombre_de_lits: 120, type_abonnement: 'standard',
    adresse: 'Tabarre, département de l’Ouest, Haïti', directeur: 'Direction générale (démo)', donnees: false
  },
  {
    cle: 'schweitzer', nom: 'Hôpital Albert Schweitzer (démo)', nombre_de_lits: 130, type_abonnement: 'basic',
    adresse: 'Deschapelles, département de l’Artibonite, Haïti', directeur: 'Direction générale (démo)', donnees: false
  }
];

// Comptes par établissement : le propriétaire partout, tous les rôles pour JCC.
// Adresses Gmail avec « + » : elles arrivent toutes dans la boîte trimedhaiti@gmail.com.
export const comptesPour = (e) => {
  const base = [{ role: 'proprietaire-hopital', alias: e.cle, nom_complet: `Direction – ${e.nom.replace(' (démo)', '')}` }];
  if (!e.donnees) return base;
  return base.concat([
    { role: 'medecin', alias: `${e.cle}.medecin`, nom_complet: 'Dr Widlyne Joseph' },
    { role: 'infirmier', alias: `${e.cle}.infirmier`, nom_complet: 'Rose-Mina Désir' },
    { role: 'secretaire', alias: `${e.cle}.secretaire`, nom_complet: 'Stéphanie Louis' },
    { role: 'personnel', alias: `${e.cle}.personnel`, nom_complet: 'Jonas Pierre-Louis' },
    { role: 'patient', alias: `${e.cle}.patient`, nom_complet: 'Marie-Carmelle Jean' }
  ]);
};

export const SPECIALITES = [
  ['Médecine générale', 'Consultations de premier recours et suivi des maladies courantes.'],
  ['Pédiatrie', 'Soins des nouveau-nés, des enfants et des adolescents.'],
  ['Gynécologie-obstétrique', 'Suivi de grossesse, accouchement et santé de la femme.'],
  ['Chirurgie générale', 'Interventions chirurgicales courantes et urgentes.'],
  ['Médecine interne', 'Maladies chroniques de l’adulte : hypertension, diabète.'],
  ['Cardiologie', 'Maladies du cœur et des vaisseaux.'],
  ['Infectiologie', 'Paludisme, tuberculose, VIH et infections courantes.'],
  ['Orthopédie-traumatologie', 'Fractures, entorses et maladies des os.'],
  ['Médecine d’urgence', 'Accueil et stabilisation des urgences.'],
  ['Dermatologie', 'Maladies de la peau.'],
  ['Ophtalmologie', 'Maladies des yeux.'],
  ['Psychiatrie', 'Santé mentale.']
];

export const TYPES_RDV = [
  ['Consultation', 'Première consultation ou consultation ponctuelle.', 30, '#2723FF'],
  ['Suivi', 'Contrôle d’un traitement ou d’une maladie chronique.', 20, '#06C27A'],
  ['Suivi prénatal', 'Visite de suivi de grossesse.', 30, '#9B59B6'],
  ['Vaccination', 'Administration d’un vaccin.', 15, '#3498DB'],
  ['Urgence', 'Prise en charge sans délai.', 30, '#E74C3C']
];

// Couleurs imposées par le backend : #2ecc71 #f39c12 #e74c3c #3498db #95a5a6 #9b59b6
export const STATUTS_RDV = [
  ['Planifié', 'Rendez-vous enregistré, en attente de confirmation.', '#3498db', false, false, false],
  ['Confirmé', 'Le patient a confirmé sa venue.', '#2ecc71', false, true, false],
  ['Terminé', 'La consultation a eu lieu.', '#95a5a6', false, true, true],
  ['Annulé', 'Rendez-vous annulé par le patient ou l’hôpital.', '#e74c3c', true, false, false],
  ['Reporté', 'Rendez-vous déplacé à une autre date.', '#f39c12', false, false, false]
];

export const MEDECINS = [
  ['Joseph', 'Widlyne', 'F', 'Médecine générale', true],
  ['Pierre', 'Jean-Robert', 'M', 'Pédiatrie'],
  ['Saint-Fleur', 'Nadège', 'F', 'Gynécologie-obstétrique'],
  ['Désir', 'Ricardo', 'M', 'Chirurgie générale'],
  ['Charles', 'Mirlande', 'F', 'Médecine interne'],
  ['Augustin', 'Fritz-Gérald', 'M', 'Médecine d’urgence']
];

export const PATIENTS = [
  ['Jean', 'Marie-Carmelle', 'F', '1988-03-14'], ['Baptiste', 'Wilson', 'M', '1975-11-02'], ['Étienne', 'Guerline', 'F', '1992-07-21'],
  ['Louis', 'Jean-Marc', 'M', '1966-01-30'], ['Exantus', 'Rose-Andrée', 'F', '2001-09-09'], ['Dorval', 'Kervens', 'M', '2015-05-17'],
  ['Michel', 'Nadia', 'F', '1983-12-05'], ['Joseph', 'Ernst', 'M', '1959-06-11'], ['François', 'Djeneba', 'F', '1997-02-26'],
  ['Pierre', 'Lovely', 'F', '2019-10-03'], ['Clervil', 'Junior', 'M', '2008-04-19'], ['Noël', 'Mireille', 'F', '1971-08-08'],
  ['Saintil', 'Ronald', 'M', '1990-03-27'], ['Jeune', 'Fabiola', 'F', '1985-11-15'], ['Lafortune', 'Ricot', 'M', '1979-01-09'],
  ['Valcourt', 'Esther', 'F', '1964-05-23'], ['Pétion', 'Samuel', 'M', '2012-12-01'], ['Delva', 'Cassandre', 'F', '1999-06-30'],
  ['Germain', 'Wisly', 'M', '1987-09-12'], ['Bien-Aimé', 'Sabine', 'F', '1993-04-04'], ['Toussaint', 'Jacques', 'M', '1955-02-18'],
  ['Célestin', 'Naïka', 'F', '2003-10-27'], ['Prophète', 'Emmanuel', 'M', '1981-07-07'], ['Alexis', 'Rachelle', 'F', '1976-03-03']
];

export const CATEGORIES = [
  ['Antalgiques et antipyrétiques', 'Douleur et fièvre.'],
  ['Antibiotiques', 'Infections bactériennes.'],
  ['Antipaludéens', 'Traitement du paludisme.'],
  ['Antihypertenseurs', 'Hypertension artérielle.'],
  ['Antidiabétiques', 'Diabète de type 2.'],
  ['Antiparasitaires', 'Parasitoses intestinales.'],
  ['Vitamines et suppléments', 'Carences et grossesse.'],
  ['Solutés et réhydratation', 'Perfusions et réhydratation orale.'],
  ['Gastro-entérologie', 'Acidité gastrique et troubles digestifs.'],
  ['Pneumologie', 'Asthme et maladies respiratoires.']
];

// [nom, forme, dosage, catégorie, DCI, stock, stock minimum, prix unitaire HTG, ordonnance]
// Trois produits sont volontairement sous leur seuil : ils déclenchent l’alerte « stock faible ».
export const MEDICAMENTS = [
  ['Paracétamol 500 mg', 'comprime', '500 mg', 'Antalgiques et antipyrétiques', 'Paracétamol', 1200, 300, 5, false],
  ['Ibuprofène 400 mg', 'comprime', '400 mg', 'Antalgiques et antipyrétiques', 'Ibuprofène', 640, 200, 8, false],
  ['Paracétamol sirop 120 mg/5 ml', 'sirop', '120 mg/5 ml', 'Antalgiques et antipyrétiques', 'Paracétamol', 85, 40, 175, false],
  ['Amoxicilline 500 mg', 'capsule', '500 mg', 'Antibiotiques', 'Amoxicilline', 900, 250, 12, true],
  ['Amoxicilline sirop 250 mg/5 ml', 'suspension', '250 mg/5 ml', 'Antibiotiques', 'Amoxicilline', 30, 40, 250, true],
  ['Ciprofloxacine 500 mg', 'comprime', '500 mg', 'Antibiotiques', 'Ciprofloxacine', 320, 100, 18, true],
  ['Métronidazole 250 mg', 'comprime', '250 mg', 'Antibiotiques', 'Métronidazole', 480, 150, 7, true],
  ['Chloroquine 250 mg', 'comprime', '250 mg', 'Antipaludéens', 'Chloroquine', 700, 200, 6, true],
  ['Artéméther-luméfantrine 20/120 mg', 'comprime', '20/120 mg', 'Antipaludéens', 'Artéméther + luméfantrine', 60, 80, 35, true],
  ['Amlodipine 5 mg', 'comprime', '5 mg', 'Antihypertenseurs', 'Amlodipine', 540, 150, 10, true],
  ['Hydrochlorothiazide 25 mg', 'comprime', '25 mg', 'Antihypertenseurs', 'Hydrochlorothiazide', 410, 120, 6, true],
  ['Metformine 500 mg', 'comprime', '500 mg', 'Antidiabétiques', 'Metformine', 760, 200, 7, true],
  ['Glibenclamide 5 mg', 'comprime', '5 mg', 'Antidiabétiques', 'Glibenclamide', 25, 60, 5, true],
  ['Albendazole 400 mg', 'comprime', '400 mg', 'Antiparasitaires', 'Albendazole', 300, 80, 15, false],
  ['Fer + acide folique', 'comprime', '60 mg/0,4 mg', 'Vitamines et suppléments', 'Sulfate ferreux + acide folique', 1000, 300, 3, false],
  ['Vitamine C 500 mg', 'comprime', '500 mg', 'Vitamines et suppléments', 'Acide ascorbique', 450, 100, 4, false],
  ['Sels de réhydratation orale', 'poudre', '20,5 g', 'Solutés et réhydratation', 'SRO', 350, 100, 25, false],
  ['Ringer lactate 500 ml', 'injectable', '500 ml', 'Solutés et réhydratation', 'Ringer lactate', 120, 50, 210, true],
  ['Oméprazole 20 mg', 'capsule', '20 mg', 'Gastro-entérologie', 'Oméprazole', 380, 100, 10, true],
  ['Salbutamol 100 µg', 'aerosol', '100 µg/dose', 'Pneumologie', 'Salbutamol', 45, 20, 450, true]
];

export const TYPES_SALLES = [
  ['Salle de consultation', 'Examen et entretien avec le patient.'],
  ['Bloc opératoire', 'Interventions chirurgicales.'],
  ['Salle d’accouchement', 'Travail et naissance.'],
  ['Laboratoire', 'Analyses biologiques.'],
  ['Imagerie', 'Radiographie et échographie.'],
  ['Urgences', 'Accueil des urgences.']
];

// [nom, code, capacité, type, équipements]
export const SALLES = [
  ['Consultation 1', 'CONS-01', 2, 'Salle de consultation', 'Table d’examen, tensiomètre, balance'],
  ['Consultation 2', 'CONS-02', 2, 'Salle de consultation', 'Table d’examen, tensiomètre'],
  ['Consultation pédiatrique', 'CONS-PED', 3, 'Salle de consultation', 'Table pédiatrique, toise, pèse-bébé'],
  ['Bloc opératoire', 'BLOC-01', 6, 'Bloc opératoire', 'Table opératoire, scialytique, respirateur'],
  ['Salle d’accouchement', 'ACC-01', 4, 'Salle d’accouchement', 'Table d’accouchement, couveuse, moniteur fœtal'],
  ['Laboratoire', 'LAB-01', 3, 'Laboratoire', 'Microscope, centrifugeuse, analyseur'],
  ['Échographie', 'IMG-01', 2, 'Imagerie', 'Échographe'],
  ['Urgences', 'URG-01', 8, 'Urgences', 'Brancards, oxygène, défibrillateur']
];

// [numéro, étage, type, capacité]
export const CHAMBRES = [
  ['101', 1, 'collective', 4], ['102', 1, 'collective', 4], ['103', 1, 'semi_privee', 2], ['104', 1, 'privee', 1],
  ['201', 2, 'collective', 4], ['202', 2, 'semi_privee', 2], ['203', 2, 'privee', 1], ['204', 2, 'privee', 1]
];

// [index patient, index médecin, jours avant aujourd’hui, motif, diagnostic, notes]
export const CONSULTATIONS = [
  [0, 0, 30, 'Fièvre et maux de tête depuis trois jours', 'Paludisme simple', 'Goutte épaisse positive.'],
  [1, 4, 26, 'Contrôle de la tension artérielle', 'Hypertension artérielle', 'TA 150/95, traitement poursuivi.'],
  [2, 2, 21, 'Suivi de grossesse, 24 semaines', 'Grossesse évolutive', 'Supplémentation en fer.'],
  [5, 1, 18, 'Diarrhée chez l’enfant', 'Gastro-entérite aiguë', 'Réhydratation orale.'],
  [3, 4, 15, 'Fatigue et soif importante', 'Diabète de type 2', 'Glycémie à jeun 1,62 g/L.'],
  [7, 0, 12, 'Toux persistante', 'Bronchite aiguë', 'Radiographie demandée.'],
  [9, 1, 9, 'Fièvre chez l’enfant', 'Infection ORL', 'Amoxicilline sirop.'],
  [12, 3, 6, 'Douleur abdominale', 'Suspicion d’appendicite', 'Échographie demandée.'],
  [13, 2, 4, 'Consultation prénatale', 'Grossesse évolutive', 'Échographie obstétricale.'],
  [20, 5, 2, 'Douleur thoracique', 'Douleur pariétale', 'ECG normal.']
];

// [index consultation, [[médicament, dosage, fréquence, durée, quantité]]]
export const ORDONNANCES = [
  [0, [['Artéméther-luméfantrine 20/120 mg', '4 comprimés', '2 fois par jour', '3 jours', 24], ['Paracétamol 500 mg', '1 comprimé', '3 fois par jour', '3 jours', 9]]],
  [1, [['Amlodipine 5 mg', '1 comprimé', '1 fois par jour', '30 jours', 30]]],
  [2, [['Fer + acide folique', '1 comprimé', '1 fois par jour', '30 jours', 30]]],
  [3, [['Sels de réhydratation orale', '1 sachet', 'après chaque selle', '3 jours', 6]]],
  [4, [['Metformine 500 mg', '1 comprimé', '2 fois par jour', '30 jours', 60]]],
  [6, [['Amoxicilline sirop 250 mg/5 ml', '5 ml', '3 fois par jour', '7 jours', 1], ['Paracétamol sirop 120 mg/5 ml', '5 ml', '3 fois par jour', '3 jours', 1]]]
];

// [index consultation, nom, type, résultat (vide = en attente)]
export const EXAMENS = [
  [0, 'Goutte épaisse', 'biologie', 'Positive à Plasmodium falciparum'],
  [4, 'Glycémie à jeun', 'biologie', '1,62 g/L'],
  [5, 'Radiographie du thorax', 'radiologie', 'Pas d’anomalie pulmonaire'],
  [7, 'Échographie abdominale', 'echographie', ''],
  [8, 'Échographie obstétricale', 'echographie', 'Grossesse de 28 semaines, croissance normale'],
  [9, 'Électrocardiogramme', 'ecg', 'Rythme sinusal normal']
];

// [index patient, index médecin, jours après aujourd’hui, heure, type, statut, motif]
export const RENDEZ_VOUS = [
  [1, 4, 2, '09:00', 'Suivi', 'Confirmé', 'Contrôle de la tension artérielle'],
  [2, 2, 3, '10:30', 'Suivi prénatal', 'Planifié', 'Visite prénatale'],
  [3, 4, 5, '08:30', 'Suivi', 'Planifié', 'Contrôle de la glycémie'],
  [9, 1, 1, '14:00', 'Vaccination', 'Confirmé', 'Rappel de vaccin'],
  [12, 3, 7, '11:00', 'Consultation', 'Planifié', 'Résultat d’échographie'],
  [16, 1, 4, '15:30', 'Consultation', 'Annulé', 'Fièvre'],
  [0, 0, -3, '09:30', 'Suivi', 'Terminé', 'Contrôle après traitement du paludisme'],
  [18, 0, 6, '13:00', 'Consultation', 'Reporté', 'Douleurs lombaires']
];
