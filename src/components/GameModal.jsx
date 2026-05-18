import { X } from 'lucide-react'
import { LOCATIONS, formatDate, initials, avatarColor } from '../data'

export default function GameModal({ game, players, user, ratings, onRate, onClose }) {
  const loc = LOCATIONS.find(l => l.id === game.locationId)
  const gameRatings = ratings[game.id] ?? {}

  const teamAPlayers = (game.teamA ?? []).map(id => players.find(p => p.id === id)).filter(Boolean)
  const teamBPlayers = (game.teamB ?? []).map(id => players.find(p => p.id === id)).filter(Boolean)

  // All players not on teamA/B but still in the game
  const knownIds = new Set([...(game.teamA ?? []), ...(game.teamB ?? [])])
  const extraPlayers = game.playerIds
    .filter(id => !knownIds.has(id))
    .map(id => players.find(p => p.id === id))
    .filter(Boolean)

  const isInGame = game.playerIds.includes(user.id)

  const avgRating = (playerId) => {
    const scores = Object.values(gameRatings[playerId] ?? {})
    if (!scores.length) return null
    return (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)
  }

  const myRatingOf = (playerId) => gameRatings[playerId]?.[user.id]

  const handleRate = (playerId, score) => {
    if (playerId === user.id) return
    onRate(game.id, playerId, score)
  }

  const resultLabel = () => {
    if (game.scoreA === undefined) return null
    if (!game.teamA?.includes(user.id) && !game.teamB?.includes(user.id)) return null
    const myTeam = game.teamA?.includes(user.id) ? 'A' : 'B'
    const myScore  = myTeam === 'A' ? game.scoreA : game.scoreB
    const oppScore = myTeam === 'A' ? game.scoreB : game.scoreA
    if (myScore > oppScore) return { label: 'WIN', cls: 'result-win' }
    if (myScore < oppScore) return { label: 'LOSS', cls: 'result-loss' }
    return { label: 'DRAW', cls: 'result-draw' }
  }
  const result = resultLabel()

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-hdr">
          <div className="modal-hdr-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="format-bdg">{game.format}</span>
              {result && <span className={`result-chip ${result.cls}`}>{result.label}</span>}
            </div>
            <h2>{game.title}</h2>
            <p>{formatDate(game.date)} · {game.time} · {loc?.name}</p>
          </div>
          {game.scoreA !== undefined && (
            <div className="modal-score">
              <div>
                <div className="score-num">{game.scoreA}</div>
                <div className="score-lbl">Team A</div>
              </div>
              <div className="score-vs">–</div>
              <div>
                <div className="score-num">{game.scoreB}</div>
                <div className="score-lbl">Team B</div>
              </div>
            </div>
          )}
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {!isInGame && (
          <div className="modal-note">You were not in this game. Viewing only.</div>
        )}

        {/* Teams */}
        <div className="modal-body">
          {teamAPlayers.length > 0 && (
            <TeamCol
              label="Team A"
              accent="green"
              players={teamAPlayers}
              game={game}
              user={user}
              isInGame={isInGame}
              avgRating={avgRating}
              myRatingOf={myRatingOf}
              onRate={handleRate}
            />
          )}
          {teamBPlayers.length > 0 && (
            <TeamCol
              label="Team B"
              accent="blue"
              players={teamBPlayers}
              game={game}
              user={user}
              isInGame={isInGame}
              avgRating={avgRating}
              myRatingOf={myRatingOf}
              onRate={handleRate}
            />
          )}
          {extraPlayers.length > 0 && (
            <TeamCol
              label="Players"
              accent="gray"
              players={extraPlayers}
              game={game}
              user={user}
              isInGame={isInGame}
              avgRating={avgRating}
              myRatingOf={myRatingOf}
              onRate={handleRate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function TeamCol({ label, accent, players, game, user, isInGame, avgRating, myRatingOf, onRate }) {
  return (
    <div className={`modal-team modal-team-${accent}`}>
      <div className="modal-team-label">{label}</div>
      {players.map(p => {
        const stats  = game.playerStats?.[p.id] ?? {}
        const avg    = avgRating(p.id)
        const myRate = myRatingOf(p.id)
        const isMe   = p.id === user.id
        const canRate = isInGame && !isMe

        return (
          <div key={p.id} className={`modal-player${isMe ? ' modal-player-me' : ''}`}>
            <div className="modal-player-left">
              <div className="modal-av" style={{ background: avatarColor(p.id) }}>
                {initials(p.name)}
              </div>
              <div>
                <strong>{p.name}{isMe ? ' (you)' : ''}</strong>
                <span>{p.position}</span>
              </div>
            </div>

            <div className="modal-player-mid">
              {stats.goals !== undefined && (
                <>
                  <div className="stat-pill">
                    <strong>{stats.goals}</strong><span>G</span>
                  </div>
                  <div className="stat-pill">
                    <strong>{stats.assists ?? 0}</strong><span>A</span>
                  </div>
                </>
              )}
              {avg && (
                <div className="stat-pill accent">
                  <strong>{avg}</strong><span>avg</span>
                </div>
              )}
            </div>

            {canRate && (
              <div className="rate-col">
                <span className="rate-label">
                  {myRate ? `Your rating: ${myRate}` : 'Rate'}
                </span>
                <div className="rate-btns">
                  {[5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      className={`rate-btn${myRate === n ? ' rate-active' : ''}`}
                      onClick={() => onRate(p.id, n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!canRate && !isMe && (
              <div className="rate-col">
                <span className="rate-label">
                  {avg ? `Rated ${avg}` : 'Not rated yet'}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
