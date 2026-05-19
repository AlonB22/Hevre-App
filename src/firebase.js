/**
 * FOOTY — Firebase Config
 * ─────────────────────────────────────────────────────────────────────────
 * Fill in your project credentials from the Firebase Console
 * (Project Settings → General → Your apps → Firebase SDK snippet → Config)
 *
 * When ready to go live:
 *  1. Replace the placeholder values below with your real config
 *  2. In App.jsx import { db } from './firebase' and swap the local-state
 *     helpers for Firestore calls (see comments in App.jsx)
 *  3. npm install firebase   (if not done already)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Firestore data model:
 *
 * /players/{uid}
 *   name, email, position, rating, goals, assists,
 *   neighborhood, gamesPlayed, cleanSheets
 *
 * /games/{gameId}
 *   title, date, time, format, locationId, status,
 *   playerIds[], teamA[], teamB[], scoreA, scoreB,
 *   pricePerPlayer, organizerId, paidIds[]
 *
 * /games/{gameId}/playerStats/{playerId}
 *   goals, assists
 *
 * /ratings/{gameId}/players/{ratedPlayerId}
 *   { [raterId]: score }      ← map of rater → score
 *
 * /locations/{locationId}
 *   name, address, lat, lng, type
 */

// import { initializeApp } from 'firebase/app'
// import { getFirestore }   from 'firebase/firestore'
// import { getAuth }        from 'firebase/auth'

const firebaseConfig = {
  apiKey:            'YOUR_API_KEY',
  authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
}

// const app  = initializeApp(firebaseConfig)
// export const db   = getFirestore(app)
// export const auth = getAuth(app)

export { firebaseConfig }

/* ── Example Firestore helpers (uncomment to use) ─────────────────────────

import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'

// Save a rating
export async function saveRating(db, gameId, ratedId, raterId, score) {
  const ref = doc(db, 'ratings', String(gameId), 'players', String(ratedId))
  await setDoc(ref, { [raterId]: score }, { merge: true })
}

// Load all ratings for a game
export async function loadRatings(db, gameId) {
  const snap = await getDocs(collection(db, 'ratings', String(gameId), 'players'))
  const out = {}
  snap.forEach(d => { out[d.id] = d.data() })
  return out
}

// RSVP to a game
export async function rsvpGame(db, gameId, playerId, joining) {
  const ref = doc(db, 'games', String(gameId))
  await updateDoc(ref, {
    playerIds: joining ? arrayUnion(playerId) : arrayRemove(playerId)
  })
}

──────────────────────────────────────────────────────────────────────────── */
