/**
 * TrueSkill Integration for Footy
 * --------------------------------
 * WHY TRUESKILL?
 *   Standard ELO was designed for 1v1. In a team game like ours (5v5, 7v7, 8v8),
 *   ELO can't distinguish a player who won because they were great from a player
 *   who won because their teammates carried them.
 *
 *   TrueSkill (Microsoft Research, 2006) is a Bayesian skill rating system built
 *   specifically for team-based multiplayer. It tracks two numbers per player:
 *     μ (mu)    — the estimated skill level (mean of the belief distribution)
 *     σ (sigma) — the uncertainty in that estimate (standard deviation)
 *
 *   After each game, BOTH update:
 *     - μ rises for winners, falls for losers (proportional to upset factor)
 *     - σ shrinks for everyone — we're now more certain about each player's true level
 *
 * SCALE
 *   We map our existing 1–10 player ratings to TrueSkill's internal mu scale:
 *     internal_mu = player.rating × 5   →   rating 7.0 = mu 35, rating 8.6 = mu 43
 *   Display: divide internal_mu back by 5 to show a familiar 0–10 number.
 *
 * QUALITY
 *   env.quality([[teamA], [teamB]]) returns a 0–1 "draw probability":
 *     1.0 = teams are perfectly matched (50/50 game)
 *     0.0 = completely one-sided
 *   We show this as a "Match Quality %" in the MatchManager.
 */

import { TrueSkill, Rating } from 'ts-trueskill'

// ── Environment ────────────────────────────────────────────────────────────
// mu=35 (midpoint of our 7–9 range × 5), sigma=6 (tighter than default 8.33
// because our player base is more homogeneous — all regular, semi-serious players).
// beta=3 (half of sigma) controls how much a single game changes ratings.
// tau=0.3 keeps ratings from freezing over time (dynamic factor).
// drawProbability=0.15 (15% of soccer games end in a draw — realistic for 5-a-side).
export const env = new TrueSkill(35, 6, 3, 0.3, 0.15)

// ── Initialise a player's TrueSkill rating from their static data.js rating ─
// Sigma formula: 6 − (gamesPlayed × 0.2), floored at 1.2.
// This maps experience to certainty:
//   6  games → σ ≈ 4.8  → Unranked     (brand new)
//   12 games → σ ≈ 3.6  → Unranked
//   15 games → σ ≈ 3.0  → Calibrating
//   20 games → σ ≈ 2.0  → Calibrating (border)
//   22 games → σ ≈ 1.6  → Established
//   25+ games→ σ = 1.2  → Established (floor)
export function initialRating(player) {
  const mu    = player.rating * 5
  const sigma = Math.max(1.2, 6 - player.gamesPlayed * 0.2)
  return env.createRating(mu, sigma)
}

// ── Convert TrueSkill mu back to our 0–10 display scale ─────────────────────
export function displayRating(tsRating) {
  return (tsRating.mu / 5).toFixed(1)
}

// ── Conservative rating (mu - sigma) shown for new/uncertain players ─────────
// This is Microsoft's "skill score" — it represents the MINIMUM you can reasonably
// expect from this player with 99% confidence.
export function conservativeScore(tsRating) {
  return ((tsRating.mu - tsRating.sigma) / 5).toFixed(1)
}

// ── Uncertainty label ─────────────────────────────────────────────────────────
// Thresholds aligned with the initialRating sigma formula:
//   σ < 2.2  → Established  (22+ games played)
//   σ < 3.2  → Calibrating  (14–21 games)
//   otherwise → Unranked     (<14 games)
export function certaintyLabel(sigma) {
  if (sigma < 2.2) return { label: 'Established', cls: 'ts-certain' }
  if (sigma < 3.2) return { label: 'Calibrating', cls: 'ts-mid' }
  return                  { label: 'Unranked',    cls: 'ts-uncertain' }
}

// ── Replay a single past game and return updated tsRatings map ────────────────
// teamAIds / teamBIds: arrays of player IDs
// winner: 'A' | 'B' | 'draw'
export function processGameResult(tsRatings, teamAIds, teamBIds, winner) {
  const ratingOf = (id) => tsRatings[id] ?? env.createRating()

  const teamA = teamAIds.map(ratingOf)
  const teamB = teamBIds.map(ratingOf)

  const ranks = winner === 'A' ? [0, 1]
              : winner === 'B' ? [1, 0]
              :                  [0, 0]  // draw

  const [newA, newB] = env.rate([teamA, teamB], ranks)

  const updated = { ...tsRatings }
  teamAIds.forEach((id, i) => { updated[id] = newA[i] })
  teamBIds.forEach((id, i) => { updated[id] = newB[i] })
  return updated
}

// ── Initialise ratings for all players and replay every past game ─────────────
// This is called once on app startup and gives each player a "live" rating
// that already reflects what happened in the three past games.
export function buildInitialRatings(players, pastGames) {
  let ratings = {}
  for (const p of players) {
    ratings[p.id] = initialRating(p)
  }
  for (const game of pastGames) {
    if (!game.teamA || !game.teamB) continue
    const winner = game.scoreA > game.scoreB ? 'A'
                 : game.scoreA < game.scoreB ? 'B'
                 : 'draw'
    ratings = processGameResult(ratings, game.teamA, game.teamB, winner)
  }
  return ratings
}

// ── Match quality — how fair is this split? ──────────────────────────────────
// Returns 0–100 (percentage). 100 = perfectly even game, 0 = total mismatch.
export function matchQuality(teamAPlayers, teamBPlayers, tsRatings) {
  if (!teamAPlayers.length || !teamBPlayers.length) return 0
  const rOf = (p) => tsRatings[p.id] ?? env.createRating()
  const teamA = teamAPlayers.map(rOf)
  const teamB = teamBPlayers.map(rOf)
  return Math.round(env.quality([teamA, teamB]) * 100)
}

// ── TrueSkill-aware team balancer ─────────────────────────────────────────────
// Uses TrueSkill μ instead of the static rating field.
// Algorithm: greedy snake draft — sort by μ descending, alternate picks
// so the strongest players are split across both teams.
export function autoBalanceTS(players, tsRatings) {
  const getMu = (p) => (tsRatings[p.id]?.mu ?? p.rating * 5)
  const sorted = [...players].sort((a, b) => getMu(b) - getMu(a))

  const teamA = [], teamB = []
  for (const player of sorted) {
    const sumA = teamA.reduce((s, p) => s + getMu(p), 0)
    const sumB = teamB.reduce((s, p) => s + getMu(p), 0)
    if (sumA <= sumB) teamA.push(player)
    else teamB.push(player)
  }
  return { teamA, teamB }
}

// ── Quality grade label ───────────────────────────────────────────────────────
export function qualityGrade(pct) {
  if (pct >= 80) return { label: `${pct}% · Elite matchup`,   cls: 'bal-great' }
  if (pct >= 60) return { label: `${pct}% · Well balanced`,   cls: 'bal-ok'    }
  if (pct >= 40) return { label: `${pct}% · Slightly uneven`, cls: 'bal-warn'  }
  return               { label: `${pct}% · Needs rebalance`,  cls: 'bal-bad'   }
}
