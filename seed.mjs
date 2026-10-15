#!/usr/bin/env node
/* =============================================================================
 * seed.mjs — Génère des données de démonstration pour Mofawid via l'API.
 *
 *   Aucune modification du back-end. Tout passe par les endpoints REST :
 *   - création d'un établissement + son administrateur (SUPER_ADMIN)
 *   - création d'utilisateurs ASSISTANT / COLLABORATEUR (ADMIN)
 *   - création de dossiers et de missions (ADMIN)
 *   - création de documents (ADMIN)
 *   - démarrage / terminaison de missions + observations (COLLABORATEUR)
 *
 *   Usage : npm run seed
 * ========================================================================== */

const BASE = process.env.MOFAWID_API || 'https://mofawid-backend.onrender.com'
const DEMO_PASSWORD = 'Admin@123' // mot de passe admin démo
const PREFIX = 'demo'

async function req(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${method} ${path}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

async function login(username, password) {
  const res = await req('POST', '/api/auth/login', null, { username, password })
  return res.token
}

const out = (msg) => console.log(`  ${msg}`)
const line = (msg = '') => console.log(msg)

let step = 0
const stepLog = (msg) => line(`\n[${++step}] ${msg}`)

/* ---------------------------------------------------------------------- */

try {
  line('═══════════════════════════════════════════════════════════════')
  line('  Mofawid — génération des données de démonstration')
  line(`  Cible API : ${BASE}`)
  line('═══════════════════════════════════════════════════════════════')

  stepLog('Connexion en tant que superadmin')
  const superToken = await login('superadmin', 'Admin@123')
  out('OK superadmin')

  stepLog('Recherche / création de l\'établissement démo')
  let tenantsPage = await req('GET', `/api/tenants?page=0&size=100`, superToken)
  let tenant = (tenantsPage.content || []).find((t) => t.slug === 'demo-casablanca')
  if (!tenant) {
    tenant = await req('POST', '/api/tenants', superToken, {
      name: 'Cabinet Démo — Casablanca',
      slug: 'demo-casablanca',
      status: 'active',
      adress: '45, Boulevard Mohammed V, Casablanca',
      phone: '+212 5 22 00 12 34',
    })
    out(`Établissement créé : ${tenant.name} (${tenant.id})`)
  } else {
    out(`Établissement existant réutilisé : ${tenant.name}`)
  }

  stepLog('Création / récupération de l\'administrateur démo')
  let adminToken = null
  try {
    adminToken = await login('admin.demo', DEMO_PASSWORD)
    out('admin.demo déjà existant — connecté')
  } catch {
    await req('POST', `/api/tenants/${tenant.id}/admin`, superToken, {
      username: 'admin.demo',
      email: 'admin.demo@mofawid.ma',
      password: DEMO_PASSWORD,
      nom: 'Bennani',
      prenom: 'Karim',
      phone: '+212 6 61 00 00 01',
      role: 'ADMIN',
    })
    adminToken = await login('admin.demo', DEMO_PASSWORD)
    out('admin.demo créé et connecté')
  }

  stepLog('Création des utilisateurs (assistant + collaborateurs)')
  const usersPage = await req('GET', '/api/users?page=0&size=200', adminToken)
  const existingByUsername = new Map(
    (usersPage.content || []).map((u) => [u.username, u]),
  )

  const usersToCreate = [
    { username: 'assistant.demo', email: 'assistant.demo@mofawid.ma', password: 'Assist@123', nom: 'Alaoui', prenom: 'Nadia', role: 'ASSISTANT' },
    { username: 'collab.ahmed', email: 'collab.ahmed@mofawid.ma', password: 'Ahmed@123', nom: 'El Fassi', prenom: 'Ahmed', role: 'COLLABORATEUR' },
    { username: 'collab.sara', email: 'collab.sara@mofawid.ma', password: 'Sara@123', nom: 'Berrada', prenom: 'Sara', role: 'COLLABORATEUR' },
    { username: 'collab.driss', email: 'collab.driss@mofawid.ma', password: 'Driss@123', nom: 'Tazi', prenom: 'Driss', role: 'COLLABORATEUR' },
  ]

  const collaborators = {}
  for (const u of usersToCreate) {
    if (existingByUsername.has(u.username)) {
      out(`${u.username} existe déjà`)
      if (u.role === 'COLLABORATEUR') collaborators[u.username] = existingByUsername.get(u.username)
      continue
    }
    const created = await req('POST', '/api/users', adminToken, u)
    out(`${u.username} créé`)
    if (u.role === 'COLLABORATEUR') collaborators[u.username] = created
  }

  const collabList = Object.values(collaborators)
  if (collabList.length === 0) {
    throw new Error('Aucun collaborateur disponible — impossible de créer des missions.')
  }

  stepLog('Création des dossiers (si aucun)')
  const casesPage = await req('GET', '/api/cases?page=0&size=200', adminToken)
  let cases = casesPage.content || []

  if (cases.length === 0) {
    const today = new Date()

    const caseDefinitions = [
      { clientName: 'SA Atlass Textile', clientIce: '001234567000045', address: 'Zone Indus. Ain Sebaâ, Casablanca', phone: '+212 5 22 35 40 10', subject: 'Litige commercial fournisseur', description: 'Demande de paiement impayé pour livraison de tissus.', deadline: addDays(today, 20) },
      { clientName: 'Immobilière Anfa', clientIce: '001112233000012', address: 'Rue des Orangers, Casablanca', phone: '+212 5 22 27 55 60', subject: 'Contestation de bail commercial', description: 'Renégociation du loyer et des charges du local commercial.', deadline: addDays(today, 15) },
      { clientName: 'Omar Benjelloun', clientIce: '', address: 'Quartier Maârif, Casablanca', phone: '+212 6 62 10 20 30', subject: 'Recouvrement de créance', description: 'Recouvrement d’une créance de 85 000 MAD.', deadline: addDays(today, 30) },
      { clientName: 'Transports Maghreb Express', clientIce: '001987654000021', address: 'Autoroute A5, Nouaceur', phone: '+212 5 22 53 80 90', subject: 'Accident de circulation', description: 'Indemnisation suite à un accident de la route.', deadline: addDays(today, 10) },
      { clientName: 'Pharmacie du Centre', clientIce: '001556677000033', address: 'Place Mohammed V, Casablanca', phone: '+212 5 22 20 45 70', subject: 'Résiliation de contrat de prestation', description: 'Contestation de facturation de la société de sécurité.', deadline: addDays(today, 25) },
    ]

    cases = []
    for (const c of caseDefinitions) {
      const created = await req('POST', '/api/cases', adminToken, c)
      cases.push(created)
      out(`${created.ref} — ${created.clientName}`)
    }
  } else {
    out(`${cases.length} dossier(s) existant(s) — étape sautée`)
  }

  stepLog('Création des missions')
  const missionsPage = await req('GET', '/api/missions?page=0&size=200', adminToken)
  let missions = missionsPage.content || []

  if (missions.length === 0) {
    const titles = [
      'Vérification des pièces du dossier de recouvrement',
      'Constat sur site — litige bail commercial',
      'Entretien avec le client sur les pièces manquantes',
      'Dépôt de la requête auprès du tribunal',
      'Vérification de l’état du véhicule accidenté',
    ]

    missions = []
    for (let i = 0; i < cases.length; i++) {
      const collab = collabList[i % collabList.length]
      const mission = await req('POST', '/api/missions', adminToken, {
        caseId: cases[i].id,
        collaborateurId: collab.id,
        title: titles[i % titles.length],
        description: `Mission ${i + 1} liée au dossier ${cases[i].ref}.`,
        scheduledAt: localDateTime(addDays(new Date(), 2)),
      })
      missions.push(mission)
      out(`« ${mission.title} » → ${collab.username}`)
    }
  } else {
    out(`${missions.length} mission(s) existante(s) — étape sautée`)
  }

  stepLog('Création des documents de démonstration')
  const docCase = cases[0]
  const docsPage = await req('GET', `/api/cases/${docCase.id}/documents?page=0&size=10`, adminToken)
  if ((docsPage.content || []).length === 0) {
    const docDefinitions = [
      {
        kind: 'PROCES_VERBAL',
        content:
          'Procès-verbal de constat\n\nLe présent procès-verbal atteste des diligences accomplies dans le cadre du dossier susvisé. '
          + 'Les constatations sont consignées conformément aux dispositions en vigueur.',
      },
      {
        kind: 'MISE_EN_DEMEURE',
        content:
          'Mise en demeure\n\nMonsieur/Madame, nous vous mettons en demeure de régulariser votre situation '
          + 'dans un délai de huit (08) jours à compter de la réception de la présente.',
      },
    ]
    for (const d of docDefinitions) {
      const created = await req('POST', `/api/cases/${docCase.id}/documents`, adminToken, d)
      out(`${created.kind} — dossier ${docCase.ref}`)
    }
  } else {
    out(`${(docsPage.content || []).length} document(s) existant(s) — étape sautée`)
  }

  stepLog('Génération d\'un code de suivi client (dossier de démonstration)')
  try {
    const tracking = await req('POST', `/api/cases/${docCase.id}/tracking-code`, adminToken)
    out(`Code de suivi pour ${tracking.caseRef} : ${tracking.trackingCode}`)
    line(`         → Vue client : http://localhost:5173/suivi/${tracking.trackingCode}`)
  } catch (err) {
    if (err.status === 500) {
      out('Un code de suivi existe déjà pour ce dossier (il n\'est pas réaffichable).')
    } else {
      out(`Suivi client : ${err.message}`)
    }
  }

  stepLog('Simulation du travail des collaborateurs (missions + observations)')
  const ahmed = collaborators['collab.ahmed']
  const myMissions = missions.filter((m) => ahmed && m.assignedToId === ahmed.id)
  const ahmedToken = await login('collab.ahmed', 'Ahmed@123')

  for (const m of myMissions) {
    try {
      await req('PATCH', `/api/missions/${m.id}/start`, ahmedToken)
      await req('POST', `/api/missions/${m.id}/observations`, ahmedToken, {
        kind: 'DIRECT',
        description: 'Visite effectuée, la situation a été constatée sur place.',
      })
      out(`${m.title} : démarrage + observation`)
    } catch (err) {
      out(`${m.title} : ${err.message}`)
    }
  }

  if (myMissions.length >= 2) {
    try {
      await req('PATCH', `/api/missions/${myMissions[1].id}/complete`, ahmedToken)
      out(`${myMissions[1].title} : mission terminée`)
    } catch (err) {
      out(`Terminaison : ${err.message}`)
    }
  }

  line()
  line('═══════════════════════════════════════════════════════════════')
  line('  ✔ Données de démonstration prêtes')
  line('═══════════════════════════════════════════════════════════════')
  line()
  out('Connexion à l\'application sur http://localhost:5173')
  line()
  line('  Comptes de test :')
  line('  ────────────────────────────────────────────────────────')
  line('  superadmin        / Admin@123      (Super administrateur)')
  line(`  admin.demo        / ${DEMO_PASSWORD}         (Administrateur — ${tenant.name})`)
  line('  assistant.demo    / Assist@123      (Assistant)')
  line('  collab.ahmed      / Ahmed@123       (Collaborateur)')
  line('  collab.sara       / Sara@123        (Collaborateur)')
  line('  collab.driss      / Driss@123       (Collaborateur)')
  line()
  line('  La plupart des données se créent une seule fois : relancer')
  line('  « npm run seed » est sans danger (les doublons sont évités).')
  line('═══════════════════════════════════════════════════════════════')
} catch (err) {
  console.error(`\nEchec du script : ${err.message}`)
  if (err.data) console.error('Détail serveur :', JSON.stringify(err.data))
  process.exit(1)
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// Date/heure locale au format attendu par LocalDateTime (sans fuseau).
function localDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}