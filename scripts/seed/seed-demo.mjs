// Remplit le backend TRIMED avec des données de démonstration, sans doublon (relançable à volonté).
//
//   TRIMED_ADMIN_EMAIL=… TRIMED_ADMIN_PASSWORD=… node scripts/seed/seed-demo.mjs
//   options : --comptes-seulement   établissements et comptes uniquement (pour tester le Setup Wizard)
//             --api=https://…/api   autre backend (par défaut : celui de Render)
//
// Les mots de passe des comptes créés sont écrits dans scripts/seed/comptes-demo.local.json
// (ignoré par git). Un compte déjà présent mais absent de ce fichier reçoit un nouveau mot de passe.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as D from './donnees-demo.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const FICHIER_COMPTES = path.join(ICI, 'comptes-demo.local.json');
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}`));
const API = (arg('api') || '').split('=')[1] || process.env.TRIMED_API || 'https://trimedh-service.onrender.com/api';
const COMPTES_SEULEMENT = !!arg('comptes-seulement');
const ALIAS_GMAIL = (alias) => `trimedhaiti+${alias}@gmail.com`;

const comptes = existsSync(FICHIER_COMPTES) ? JSON.parse(readFileSync(FICHIER_COMPTES, 'utf8')) : {};
const sauverComptes = () => writeFileSync(FICHIER_COMPTES, JSON.stringify(comptes, null, 2));
const motDePasse = () => 'Tm-' + randomBytes(9).toString('base64url') + '9!';
const bilan = { crees: 0, existants: 0, echecs: [] };

// Le service gratuit de Render coupe parfois les connexions : on réessaie les erreurs réseau.
async function avecReprise(requete, essais = 5) {
  for (let i = 1; ; i++) {
    try { return await requete(); } catch (e) {
      if (i >= essais) throw e;
      await new Promise((ok) => setTimeout(ok, 2000 * i));
    }
  }
}

async function appel(methode, chemin, { jeton, tenant, corps } = {}) {
  const entetes = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (jeton) entetes.Authorization = `Bearer ${jeton}`;
  if (tenant) entetes['X-Tenant-ID'] = String(tenant);
  const r = await avecReprise(() => fetch(API + chemin, { method: methode, headers: entetes, body: corps ? JSON.stringify(corps) : undefined }));
  const texte = await r.text();
  let donnees = texte; try { donnees = JSON.parse(texte); } catch { /* réponse HTML */ }
  return { statut: r.status, donnees };
}

async function connexion(email, password) {
  const r = await appel('POST', '/comptes/login/', { corps: { email, password } });
  if (r.statut !== 200) throw new Error(`connexion refusée pour ${email} (${r.statut})`);
  return r.donnees.access;
}

// Toutes les pages d’une liste DRF.
async function lister(chemin, ctx) {
  const r = await appel('GET', chemin, ctx);
  if (r.statut !== 200) return [];
  let page = r.donnees, tout = Array.isArray(page) ? page : page.results || [];
  while (page && page.next) {
    const suivante = await avecReprise(() => fetch(page.next.replace(/^http:/, 'https:'), { headers: { Authorization: `Bearer ${ctx.jeton}`, ...(ctx.tenant ? { 'X-Tenant-ID': String(ctx.tenant) } : {}) } }));
    page = await suivante.json(); tout = tout.concat(page.results || []);
  }
  return tout;
}

const idDe = (o, cle) => o[cle] ?? o.id ?? Object.entries(o).find(([k]) => k.endsWith('_id'))?.[1];

// Cherche un élément existant (critère) ou le crée ; renvoie l’objet.
// `lecture` : contexte utilisé pour lire la liste. Un médecin ne voit que ses propres actes : les
// listes se lisent donc avec le compte propriétaire, qui voit tout l’établissement.
// Certains serializers de création ne renvoient pas l’identifiant : on relit alors la liste.
async function assurer(chemin, ctx, critere, corps, libelle, lecture = ctx) {
  const url = chemin + (chemin.includes('?') ? '&' : '?') + 'page_size=200';
  const trouve = (await lister(url, lecture)).find(critere);
  if (trouve) { bilan.existants++; return trouve; }
  const r = await appel('POST', chemin, { ...ctx, corps });
  if (r.statut >= 200 && r.statut < 300) {
    bilan.crees++;
    if (Object.keys(r.donnees).some((k) => k === 'id' || k.endsWith('_id'))) return r.donnees;
    return (await lister(url, lecture)).find(critere) || r.donnees;
  }
  bilan.echecs.push(`${libelle} : HTTP ${r.statut} ${JSON.stringify(r.donnees).slice(0, 160)}`);
  return null;
}

// Fiche créée automatiquement par le backend à la création d’un compte médecin ou patient :
// son nom est mal découpé (« Dr Widlyne Joseph » → nom « Dr »). On la corrige au lieu d’en créer une seconde.
async function corrigerFiche(chemin, ctx, cle, compteId, corps, libelle) {
  for (const x of await lister(chemin + '?page_size=200', ctx)) {
    const detail = await appel('GET', `${chemin}${idDe(x, cle)}/`, ctx);
    if (detail.statut === 200 && detail.donnees.utilisateur === compteId) {
      const r = await appel('PATCH', `${chemin}${idDe(x, cle)}/`, { ...ctx, corps });
      if (r.statut >= 300) bilan.echecs.push(`${libelle} : HTTP ${r.statut} ${JSON.stringify(r.donnees).slice(0, 160)}`);
      return { ...detail.donnees, ...corps };
    }
  }
  return null;
}

const jour = (decalage, heure = '09:00') => {
  const d = new Date(); d.setDate(d.getDate() + decalage);
  const [h, m] = heure.split(':').map(Number); d.setHours(h, m, 0, 0);
  return d.toISOString();
};

async function main() {
  const admin = { jeton: await connexion(process.env.TRIMED_ADMIN_EMAIL, process.env.TRIMED_ADMIN_PASSWORD) };
  console.log(`Connecté à ${API} (administrateur système)`);

  // 1. Référentiels communs : alimentent les listes déroulantes de tous les établissements.
  const specialites = {};
  for (const [nom, description] of D.SPECIALITES) {
    const s = await assurer('/medical/specialites/', admin, (x) => x.nom_specialite === nom, { nom_specialite: nom, description, actif: true }, `spécialité ${nom}`);
    if (s) specialites[nom] = idDe(s, 'specialite_id');
  }
  // 2. Établissements et comptes.
  const utilisateurs = await lister('/comptes/utilisateurs/?page_size=200', admin);
  for (const e of D.ETABLISSEMENTS) {
    const t = await assurer('/tenants/tenants/', admin, (x) => x.nom === e.nom, {
      nom: e.nom, nombre_de_lits: e.nombre_de_lits, adresse: e.adresse, directeur: e.directeur,
      email_professionnel: ALIAS_GMAIL(e.cle), type_abonnement: e.type_abonnement, statut: 'actif'
    }, `établissement ${e.nom}`);
    if (!t) continue;
    const tenantId = idDe(t, 'tenant_id');
    const ids = {};
    for (const c of D.comptesPour(e)) {
      const email = ALIAS_GMAIL(c.alias);
      let u = utilisateurs.find((x) => x.email === email);
      if (!u) {
        comptes[email] = motDePasse();
        const r = await appel('POST', '/comptes/utilisateurs/', { ...admin, corps: { nom_complet: c.nom_complet, email, role: c.role, hopital: tenantId, is_active: true, password: comptes[email] } });
        if (r.statut >= 300) { bilan.echecs.push(`compte ${email} : HTTP ${r.statut} ${JSON.stringify(r.donnees).slice(0, 160)}`); continue; }
        u = r.donnees; bilan.crees++;
      } else if (!comptes[email]) {
        comptes[email] = motDePasse();
        const r = await appel('PATCH', `/comptes/utilisateurs/${idDe(u, 'utilisateur_id')}/`, { ...admin, corps: { password: comptes[email] } });
        if (r.statut >= 300) bilan.echecs.push(`mot de passe de ${email} : HTTP ${r.statut}`);
      } else bilan.existants++;
      ids[c.role] = idDe(u, 'utilisateur_id');
      sauverComptes();
    }
    // Propriétaire rattaché et documents marqués vérifiés : l’établissement est utilisable tout de suite.
    if (!t.proprietaire_utilisateur && ids['proprietaire-hopital'])
      await appel('PATCH', `/tenants/tenants/${tenantId}/`, { ...admin, corps: { proprietaire_utilisateur_id: ids['proprietaire-hopital'] } });
    if (t.statut_verification_document !== 'verifie') {
      const v = await appel('PATCH', `/tenants/tenants/${tenantId}/verifier_documents/`, { ...admin, corps: { action: 'approuver' } });
      if (v.statut >= 300) bilan.echecs.push(`vérification de ${e.nom} : HTTP ${v.statut} ${JSON.stringify(v.donnees).slice(0, 120)}`);
    }
    console.log(`• ${e.nom} (id ${tenantId}) : ${Object.keys(ids).length} compte(s)`);
    if (COMPTES_SEULEMENT || !e.donnees) continue;
    await remplirEtablissement(e, tenantId, ids, specialites);
  }
}

async function remplirEtablissement(e, tenant, ids, specialites) {
  const proprio = { jeton: await connexion(ALIAS_GMAIL(e.cle), comptes[ALIAS_GMAIL(e.cle)]), tenant };

  await assurer('/tenants/parametres/', proprio, () => true, { tenant, langue: 'fr', devise: 'HTG', fuseau_horaire: 'America/Port-au-Prince', duree_consultation_defaut: 30 }, 'paramètres');

  // Types et statuts de rendez-vous : propres à chaque établissement. L’API de création renvoie
  // actuellement une erreur 500 (voir BACKEND_MODIFICATIONS.md) ; ils ont été créés par l’admin Django.
  const typesRdv = {}, statutsRdv = {};
  for (const [nom, description, duree_defaut, couleur] of D.TYPES_RDV) {
    const t = await assurer('/rendez-vous/types/', proprio, (x) => x.nom === nom, { nom, description, duree_defaut, couleur, tenant }, `type de rendez-vous ${nom}`);
    if (t) typesRdv[nom] = idDe(t, 'type_id');
  }
  for (const [nom, description, couleur, est_annule, est_confirme, est_termine] of D.STATUTS_RDV) {
    const s = await assurer('/rendez-vous/statuts/', proprio, (x) => x.nom === nom, { nom, description, couleur, est_annule, est_confirme, est_termine, tenant }, `statut de rendez-vous ${nom}`);
    if (s) statutsRdv[nom] = idDe(s, 'statut_id');
  }

  const categories = {};
  for (const [nom, description] of D.CATEGORIES) {
    const c = await assurer('/medicaments/categories/', proprio, (x) => x.nom === nom, { nom, description, tenant }, `catégorie ${nom}`);
    if (c) categories[nom] = idDe(c, 'categorie_id');
  }
  const medicaments = {};
  for (const [nom, forme_pharmaceutique, dosage_standard, cat, dci, stock_actuel, stock_minimum, prix, necessite_ordonnance] of D.MEDICAMENTS) {
    const m = await assurer('/medicaments/', proprio, (x) => x.nom === nom, {
      nom, forme_pharmaceutique, dosage_standard, categorie: categories[cat], dci, stock_actuel, stock_minimum,
      prix_unitaire: String(prix), necessite_ordonnance, actif: true, tenant
    }, `médicament ${nom}`);
    if (m) medicaments[nom] = idDe(m, 'medicament_id');
  }

  const typesSalles = {};
  for (const [nom, description] of D.TYPES_SALLES) {
    const t = await assurer('/salles-medicales/type-salles/', proprio, (x) => x.nom === nom, { nom, description, tenant }, `type de salle ${nom}`);
    if (t) typesSalles[nom] = idDe(t, 'id');
  }
  for (const [nom, code, capacite, type, equipements] of D.SALLES)
    await assurer('/salles-medicales/salles/', proprio, (x) => x.code === code, { nom, code, capacite, equipements, tenant, type_salle: typesSalles[type] }, `salle ${code}`);
  for (const [numero, etage, type_chambre, capacite] of D.CHAMBRES) {
    const ch = await assurer('/hospitalisation/chambres/', proprio, (x) => x.numero === numero, { numero, etage, type_chambre, capacite, tenant }, `chambre ${numero}`);
    if (!ch) continue;
    const chambre = idDe(ch, 'id');
    for (let i = 0; i < capacite; i++) {
      const numero_lit = `${numero}-${'ABCD'[i]}`;
      await assurer(`/hospitalisation/lits/?chambre=${chambre}`, proprio, (x) => x.numero_lit === numero_lit, { numero_lit, chambre }, `lit ${numero_lit}`);
    }
  }

  const medecins = [];
  for (const [nom, prenom, sexe, specialite, lieAuCompte] of D.MEDECINS) {
    const corps = { nom, prenom, sexe, hopital: tenant, specialite_principale: specialites[specialite] };
    let m = (await lister('/medical/medecins/?page_size=200', proprio)).find((x) => x.nom === nom && x.prenom === prenom);
    if (!m && lieAuCompte) m = await corrigerFiche('/medical/medecins/', proprio, 'medecin_id', ids.medecin, { ...corps, email_professionnel: ALIAS_GMAIL(`${e.cle}.medecin`) }, `fiche du médecin ${prenom} ${nom}`);
    if (!m) m = await assurer('/medical/medecins/', proprio, (x) => x.nom === nom && x.prenom === prenom, corps, `médecin ${prenom} ${nom}`);
    else bilan.existants++;
    medecins.push(m ? idDe(m, 'medecin_id') : null);
  }
  const patients = [];
  for (const [i, [nom, prenom, sexe, date_naissance]] of D.PATIENTS.entries()) {
    const numero_dossier_medical = `JCC-2025-${String(i + 1).padStart(4, '0')}`;
    const corps = { nom, prenom, sexe, date_naissance, numero_dossier_medical, hopital: tenant };
    let p = (await lister('/patients/?page_size=200', proprio)).find((x) => x.numero_dossier_medical === numero_dossier_medical);
    if (!p && i === 0 && ids.patient) p = await corrigerFiche('/patients/', proprio, 'patient_id', ids.patient, corps, `fiche du patient ${numero_dossier_medical}`);
    if (!p) p = await assurer('/patients/', proprio, (x) => x.numero_dossier_medical === numero_dossier_medical, corps, `patient ${numero_dossier_medical}`);
    else bilan.existants++;
    patients.push(p ? idDe(p, 'patient_id') : null);
  }
  // Les listes renvoient le nom du patient, pas son identifiant.
  const memePatient = (x, ip) => x.patient === patients[ip] || (x.patient_nom === D.PATIENTS[ip][0] && x.patient_prenom === D.PATIENTS[ip][1]);

  // Actes médicaux : réservés au rôle médecin.
  const medecin = { jeton: await connexion(ALIAS_GMAIL(`${e.cle}.medecin`), comptes[ALIAS_GMAIL(`${e.cle}.medecin`)]), tenant };
  const consultations = [];
  for (const [ip, im, jours, motif, diagnostic_principal, notes] of D.CONSULTATIONS) {
    const c = await assurer('/medical/consultations/', medecin, (x) => x.motif === motif && memePatient(x, ip), {
      patient: patients[ip], medecin: medecins[im], date_consultation: jour(-jours, '10:00'), motif, diagnostic_principal, notes
    }, `consultation « ${motif} »`, proprio);
    consultations.push(c && c.consultation_id ? { id: c.consultation_id, ip, patient: patients[ip], medecin: medecins[im], jours } : null);
  }
  // La liste des ordonnances ne dit pas à quelle consultation elles appartiennent : on lit leur détail.
  const ordonnancesExistantes = async () => {
    const parConsultation = {};
    for (const x of await lister('/medical/ordonnances/?page_size=200', proprio)) {
      const d = await appel('GET', `/medical/ordonnances/${x.ordonnance_id}/`, proprio);
      if (d.statut === 200) parConsultation[d.donnees.consultation_detail?.consultation_id ?? d.donnees.consultation] = d.donnees;
    }
    return parConsultation;
  };
  let ordonnances = await ordonnancesExistantes();
  for (const [ic, lignes] of D.ORDONNANCES) {
    const c = consultations[ic]; if (!c) continue;
    if (!ordonnances[c.id]) {
      const r = await appel('POST', '/medical/ordonnances/', { ...medecin, corps: {
        consultation: c.id, patient: c.patient, medecin: c.medecin, date_ordonnance: jour(-c.jours, '10:30'), recommandations: 'Revenir en consultation si les symptômes persistent.'
      } });
      if (r.statut >= 300) { bilan.echecs.push(`ordonnance de la consultation ${c.id} : HTTP ${r.statut} ${JSON.stringify(r.donnees).slice(0, 160)}`); continue; }
      bilan.crees++; ordonnances = await ordonnancesExistantes();
    } else bilan.existants++;
    const o = ordonnances[c.id]; if (!o) continue;
    const dejaPrescrits = new Set((o.prescriptions || []).map((p) => p.medicament ?? p.medicament_detail?.medicament_id));
    for (const [med, dosage, frequence, duree, quantite] of lignes) {
      if (dejaPrescrits.has(medicaments[med])) { bilan.existants++; continue; }
      const r = await appel('POST', '/medical/prescriptions/', { ...medecin, corps: { ordonnance: o.ordonnance_id, medicament: medicaments[med], dosage, frequence, duree, quantite } });
      if (r.statut >= 300) bilan.echecs.push(`prescription ${med} : HTTP ${r.statut} ${JSON.stringify(r.donnees).slice(0, 160)}`); else bilan.crees++;
    }
  }
  for (const [ic, nom_examen, type_examen, resultat] of D.EXAMENS) {
    const c = consultations[ic]; if (!c) continue;
    const corps = {
      nom_examen, type_examen, tenant, patient: c.patient, consultation: c.id, medecin_prescripteur: c.medecin,
      date_examen: jour(-c.jours, '11:00'), ...(resultat ? { resultat, date_resultat: jour(-c.jours + 1, '15:00') } : {})
    };
    const x = await assurer('/medical/examens/', medecin, (x) => x.nom_examen === nom_examen && memePatient(x, c.ip), corps, `examen ${nom_examen}`, proprio);
    // Examen créé lors d’un passage précédent sans sa consultation : on le rattache.
    if (x && x.examen_id) await appel('PATCH', `/medical/examens/${x.examen_id}/`, { ...medecin, corps: { consultation: c.id, medecin_prescripteur: c.medecin } });
  }
  for (const [ip, im, jours, heure, type, statut, motif] of D.RENDEZ_VOUS) {
    if (!typesRdv[type] || !statutsRdv[statut]) { bilan.echecs.push(`rendez-vous « ${motif} » : type ou statut indisponible`); continue; }
    await assurer('/rendez-vous/', medecin, (x) => x.motif === motif && memePatient(x, ip), {
      patient: patients[ip], medecin: medecins[im], date_heure: jour(jours, heure), type: typesRdv[type], statut: statutsRdv[statut], motif, tenant
    }, `rendez-vous « ${motif} »`, proprio);
  }
}

main()
  .then(() => {
    sauverComptes();
    console.log(`\nCréés : ${bilan.crees} · déjà présents : ${bilan.existants} · échecs : ${bilan.echecs.length}`);
    for (const m of bilan.echecs) console.log('  ✗ ' + m);
    console.log(`Comptes et mots de passe : ${FICHIER_COMPTES}`);
  })
  .catch((e) => { sauverComptes(); console.error(e.message, e.cause ? `(${e.cause.code || e.cause.message})` : ''); process.exit(1); });
