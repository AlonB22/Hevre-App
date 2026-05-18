import { LOCATIONS, formatDate, initials, avatarColor } from '../data'

export default function MyStats({ user, games, players, ratings, onOpenModal }) {
  const myPast = games
    .filter(g => g.status === 'past' && g.playerIds.includes(user.id))
    .sort((a, b) => b.date.localeCompare(a.date))

  // Aggregate my stats from past games
  const totalGoals   = myPast.reduce((s, g) => s + (g.playerStats?.[user.id]?.goals   ?? 0), 0)
  const totalAssists = myPast.reduce((s, g) => s + (g.playerStats?.[user.id]?.assists  ?? 0), 0)

  // All ratings I've received
  const allReceivedRatings = myPast.flatMap(g => {
    const gameRatings = ratings[g.id]?.[user.id] ?? {}
    return Object.entries(gameRatings).map(([raterId, score]) => ({
      game: g, raterId: Number(raterId), score,
    }))
  })

  const avgReceived = allReceivedRatings.length
    ? (allReceivedRatings.reduce((s, r) => s + r.score, 0) / allReceivedRatings.length).toFixed(1)
    : null

  // All ratings I've given
  const allGivenRatings = myPast.flatMap(g => {
    const gameR = ratings[g.id] ?? {}
    return Object.entries(gameR).flatMap(([ratedId, raterMap]) =>
      Object.entries(raterMap)
        .filter(([raterId]) => Number(raterId) === user.id)
        .map(([, score]) => ({ game: g, ratedId: Number(ratedId), score }))
    )
  })

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>My Stats</h1>
          <p>{myPast.length} past games · {allReceivedRatings.length} ratings received</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-cards" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span>Avg Rating Received</span>
          <strong>{avgReceived ?? '—'}</strong>
          <div className="stat-card-sub">{allReceivedRatings.length} votes</div>
        </div>
        <div className="stat-card">
          <span>Goals (past games)</span>
          <strong>{totalGoals}</strong>
          <div className="stat-card-sub">{myPast.length} games</div>
        </div>
        <div className="stat-card">
          <span>Assists (past games)</span>
          <strong>{totalAssists}</strong>
          <div className="stat-card-sub">recorded</div>
        </div>
        <div className="stat-card">
          <span>Ratings Given</span>
          <strong>{allGivenRatings.length}</strong>
          <div className="stat-card-sub">players rated</div>
        </div>
      </div>

      {myPast.length === 0 && (
        <div className="empty-state">
          <p>No past games to show yet.</p>
        </div>
      )}

      {/* Per-game breakdown */}
      {myPast.length > 0 && (
        <>
          <div className="sec-title">Game by Game</div>
          <div className="mystats-list">
            {myPast.map(g => {
              const loc         = LOCATIONS.find(l => l.id === g.locationId)
              const myStats     = g.playerStats?.[user.id] ?? {}
              const gameRatings = ratings[g.id]?.[user.id] ?? {}
              const ratingVals  = Object.values(gameRatings)
              const gameAvg     = ratingVals.length
                ? (ratingVals.reduce((s, v) => s + v, 0) / ratingVals.length).toFixed(1)
                : null

              const myTeam = g.teamA?.includes(user.id) ? 'A' : g.teamB?.includes(user.id) ? 'B' : null
              const myScore  = myTeam === 'A' ? g.scoreA : myTeam === 'B' ? g.scoreB : null
              const oppScore = myTeam === 'A' ? g.scoreB : myTeam === 'B' ? g.scoreA : null
              const outcome  = myScore !== null && oppScore !== null
                ? myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw'
                : null

              const raters = Object.entries(gameRatings).map(([raterId, score]) => ({
                player: players.find(p => p.id === Number(raterId)),
                score,
              })).filter(r => r.player)

              return (
                <div
                  key={g.id}
                  className="mystats-row"
                  onClick={() => onOpenModal(g)}
                  title="Click to view full game"
                >
                  <div className="mystats-game-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="format-bdg dim">{g.format}</span>
                      {outcome && (
                        <span className={`result-chip result-${outcome}`}>
                          {outcome.toUpperCase()}
                        </span>
                      )}
                      {g.scoreA !== undefined && (
                        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 700 }}>
                          {g.scoreA}–{g.scoreB}
                        </span>
                      )}
                    </div>
                    <strong>{g.title}</strong>
                    <span>{formatDate(g.date)} · {loc?.name}</span>
                  </div>

                  <div className="mystats-numbers">
                    <div>
                      <strong>{myStats.goals ?? '—'}</strong>
                      <span>Goals</span>
                    </div>
                    <div>
                      <strong>{myStats.assists ?? '—'}</strong>
                      <span>Assists</span>
                    </div>
                    <div>
                      <strong style={{ color: gameAvg ? 'var(--green-hi)' : 'var(--text-3)' }}>
                        {gameAvg ?? '—'}
                      </strong>
                      <span>Avg Rating</span>
                    </div>
                  </div>

                  {raters.length > 0 && (
                    <div className="mystats-raters">
                      <span className="mystats-raters-label">Rated by</span>
                      {raters.map(({ player, score }) => (
                        <div key={player.id} className="rater-chip">
                          <div
                            className="rater-av"
                            style={{ background: avatarColor(player.id) }}
                            title={player.name}
                          >
                            {initials(player.name)}
                          </div>
                          <span>{score}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {raters.length === 0 && (
                    <div className="mystats-no-ratings">No ratings yet for this game</div>
                  )}

                  <div className="mystats-view-hint">Click to view →</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
