/**
 * ─────────────────────────────────────────────────────────────────
 *  FOOTY — AI Team Balancer
 *  Current: Greedy rating algorithm (runs locally, zero API cost)
 *  Future:  OpenAI GPT-4o integration for smart, context-aware splits
 * ─────────────────────────────────────────────────────────────────
 *
 *  HOW THE CURRENT ALGORITHM WORKS
 *  ─────────────────────────────────
 *  See src/data.js → autoBalance()
 *
 *  1. Sort players by rating (highest first)
 *  2. For each player, assign to whichever team has the lower total rating
 *  3. Result: team totals are always within ~1 rating point of each other
 *
 *  Pros:  Fast, deterministic, works offline, free
 *  Cons:  Ignores position balance, player chemistry, fatigue, streaks
 *
 *
 *  PHASE 2 — POSITION-AWARE BALANCING (no API needed)
 *  ─────────────────────────────────────────────────────
 *  Extend autoBalance() to first guarantee:
 *  - One GK per team
 *  - Roughly equal defenders vs attackers
 *  Then apply the greedy rating step on remaining players.
 *
 *  Example hook — call this instead of autoBalance():
 */

export function positionAwareBalance(players) {
  const gks    = players.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating)
  const defs   = players.filter(p => ['CB','RB','LB'].includes(p.position)).sort((a, b) => b.rating - a.rating)
  const mids   = players.filter(p => ['CDM','CM','CAM'].includes(p.position)).sort((a, b) => b.rating - a.rating)
  const fwds   = players.filter(p => ['LW','RW','CF','ST'].includes(p.position)).sort((a, b) => b.rating - a.rating)

  const teamA = [], teamB = []

  // Alternate GKs
  gks.forEach((p, i) => (i % 2 === 0 ? teamA : teamB).push(p))

  // Greedy split within each group
  for (const group of [defs, mids, fwds]) {
    for (const player of group) {
      const sumA = teamA.reduce((s, p) => s + p.rating, 0)
      const sumB = teamB.reduce((s, p) => s + p.rating, 0)
      ;(sumA <= sumB ? teamA : teamB).push(player)
    }
  }

  return { teamA, teamB }
}

/**
 *  PHASE 3 — OpenAI GPT-4o INTEGRATION
 *  ─────────────────────────────────────
 *  When you're ready to connect to OpenAI:
 *
 *  1. Install: npm install openai
 *  2. Add to your .env:  VITE_OPENAI_KEY=sk-...
 *  3. Swap the autoBalance() call in App.jsx with suggestTeamsWithAI()
 *
 *  The AI can use:
 *   - Player ratings
 *   - Historical balance feedback ("Team A stronger last time")
 *   - Goals/assists (high scorers shouldn't all be on one team)
 *   - Positions (need a GK per side, balanced defence vs attack)
 *
 *  WHERE TO CALL IT:
 *    App.jsx → handleAutoBalance() → replace autoBalance() with suggestTeamsWithAI()
 *    (async call — show a loading spinner while waiting)
 *
 *  FIREBASE SWAP:
 *    Save the returned teams to Firestore → /games/{gameId}/teams
 *    so all users see the same split in real time.
 */

// Uncomment and fill in when ready:
//
// import OpenAI from 'openai'
//
// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_KEY,
//   dangerouslyAllowBrowser: true, // Move to a backend function in production
// })
//
// export async function suggestTeamsWithAI(players, pastFeedback = []) {
//   const playerSummary = players.map(p =>
//     `${p.name} (${p.position}, rating ${p.rating}, goals ${p.goals}, assists ${p.assists})`
//   ).join('\n')
//
//   const feedbackSummary = pastFeedback.length
//     ? `Past balance feedback:\n` + pastFeedback.map(f =>
//         `- ${f.date}: ${f.balance}${f.note ? ` — "${f.note}"` : ''}`
//       ).join('\n')
//     : 'No past feedback yet.'
//
//   const prompt = `
// You are a fair football team organiser. Given the players below, split them into
// two balanced teams (Team A and Team B) so that:
// - Total ratings are as equal as possible
// - Each team has at most one GK
// - Attackers and defenders are spread evenly
// - Consider any imbalance notes from past games
//
// Players:
// ${playerSummary}
//
// ${feedbackSummary}
//
// Respond ONLY with valid JSON like:
// { "teamA": ["Alon", "Yoel", ...], "teamB": ["Ilia", "Noam", ...] }
// `.trim()
//
//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [{ role: 'user', content: prompt }],
//     response_format: { type: 'json_object' },
//     temperature: 0.3, // Low temp = more consistent/fair splits
//   })
//
//   const { teamA: nameA, teamB: nameB } = JSON.parse(response.choices[0].message.content)
//   return {
//     teamA: players.filter(p => nameA.includes(p.name)),
//     teamB: players.filter(p => nameB.includes(p.name)),
//   }
// }

/**
 *  FEEDBACK LOOP (closes the AI improvement cycle)
 *  ─────────────────────────────────────────────────
 *  After each match, save balance feedback to Firebase:
 *
 *    /games/{gameId}/balanceFeedback
 *    {
 *      balance: 'Team A stronger' | 'Balanced' | 'Team B stronger',
 *      note: 'Yoel had no counter on his side',
 *      createdAt: serverTimestamp(),
 *    }
 *
 *  Pass this history as `pastFeedback` to suggestTeamsWithAI().
 *  Over time, the AI learns patterns like:
 *    "When Alon and Yoel are on the same team, they dominate."
 *  And adjusts future splits accordingly.
 *
 *  This turns the simple rating algorithm into a learning system.
 */
