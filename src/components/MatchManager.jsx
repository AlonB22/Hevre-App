import { EyeOff, RefreshCw, X } from 'lucide-react'
import { LOCATIONS as FALLBACK_LOCATIONS, formatDate, initials, avatarColor } from '../data'
import { matchQuality, qualityGrade, displayRating } from '../trueskill'
import { canManageGame } from '../roles'

export default function MatchManager({
  game,
  players,
  locations = FALLBACK_LOCATIONS,
  user,
  assignments,   // { teamA: [ids], teamB: [ids] }
  published,     // boolean
  tsRatings,     // live TrueSkill ratings map { [playerId]: Rating }
  onAutoBalance,
  onSwap,        // (gameId, playerId, fromTeam) — 'A' | 'B' | null
  onAssign,      // (gameId, playerId, toTeam) — for unassigned players
  onTogglePublish,
  onClose,
}) {
  const isAdmin   = canManageGame(user, game)
  const organizer = players.find(p => p.id === game.organizerId)
  const loc     = locations.find(l => l.id === game.locationId)

  const gamePlayers  = game.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean)
  const teamAPlayers = (assignments?.teamA ?? []).map(id => players.find(p => p.id === id)).filter(Boolean)
  const teamBPlayers = (assignments?.teamB ?? []).map(id => players.find(p => p.id === id)).filter(Boolean)

  const assignedIds = new Set([...(assignments?.teamA ?? []), ...(assignments?.teamB ?? [])])
  const unassigned  = gamePlayers.filter(p => !assignedIds.has(p.id))

  // Use TrueSkill μ for sums when available, else fall back to static rating
  const tsScore = (p) => tsRatings?.[p.id] ? tsRatings[p.id].mu / 5 : p.rating
  const sumA = teamAPlayers.reduce((s, p) => s + tsScore(p), 0)
  const sumB = teamBPlayers.reduce((s, p) => s + tsScore(p), 0)
  const diff = Math.abs(sumA - sumB)

  // TrueSkill quality — much more meaningful than a simple point diff
  const quality = matchQuality(teamAPlayers, teamBPlayers, tsRatings ?? {})
  const { label: balanceLabel, cls: balanceCls } = qualityGrade(quality)

  const canSeeTeams = isAdmin || published

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal mm-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {/* Header */}
        <div className="mm-hdr">
          <div className="mm-hdr-left">
            <div className="mm-hdr-badges">
              <span className="format-bdg">{game.format}</span>
              <span className={`mm-bal-badge ${balanceCls}`}>{balanceLabel}</span>
              {published && <span className="bdg bdg-green">Teams Live</span>}
              {!published && isAdmin && <span className="bdg bdg-gray">Draft</span>}
            </div>
            <h2 style={{ margin: '6px 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>{game.title}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {formatDate(game.date)} · {game.time} · {loc?.name}
            </p>
          </div>

          {isAdmin && (
            <div className="mm-admin-btns">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onAutoBalance(game.id)}
                title="Greedy algorithm: assigns next player to lowest-rated team"
              >
                <RefreshCw size={14} /> Auto-balance
              </button>
              <button
                className={`btn btn-sm ${published ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => onTogglePublish(game.id)}
              >
                {published ? '👁 Published' : '🔒 Draft'}
              </button>
            </div>
          )}
        </div>

        {/* TrueSkill balance bar — visible to all who can see teams */}
        {canSeeTeams && (
          <div className="mm-score-bar">
            <div className="mm-score-item">
              <span>Team A</span>
              <strong style={{ color: 'var(--green-hi)' }}>{sumA.toFixed(1)}</strong>
            </div>
            <div className="mm-score-center">
              <div className={`mm-score-diff ${balanceCls}`}>
                {diff < 0.05 ? '⚖ Even' : `Δ ${diff.toFixed(1)}`}
              </div>
              <div className="mm-quality-pct" title="TrueSkill match quality — probability both teams are evenly matched">
                🎯 {quality}% fair
              </div>
            </div>
            <div className="mm-score-item">
              <span>Team B</span>
              <strong style={{ color: 'var(--ochre)' }}>{sumB.toFixed(1)}</strong>
            </div>
          </div>
        )}

        {/* Teams or hidden state */}
        {!canSeeTeams ? (
          <div className="mm-hidden">
            <EyeOff size={36} style={{ opacity: 0.4 }} />
            <p>
              Teams haven't been published yet.
              {organizer && (
                <><br /><span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Organiser: <strong>{organizer.name}</strong> — ask them to publish!
                </span></>
              )}
            </p>
          </div>
        ) : (
          <div className="mm-teams-wrap">
            <TeamCol
              name="Team A"
              accent="green"
              players={teamAPlayers}
              total={sumA}
              isAdmin={isAdmin}
              user={user}
              tsRatings={tsRatings}
              onSwap={pid => onSwap(game.id, pid, 'A')}
            />

            <div className="mm-vs-col">
              <div className="mm-vs-total" style={{ color: 'var(--green-hi)' }}>{sumA.toFixed(1)}</div>
              <div className="mm-vs-label">VS</div>
              <div className="mm-vs-total" style={{ color: 'var(--ochre)' }}>{sumB.toFixed(1)}</div>
              <div className={`mm-vs-diff ${balanceCls}`}>
                {diff < 0.05 ? 'Even' : `Δ ${diff.toFixed(1)}`}
              </div>
            </div>

            <TeamCol
              name="Team B"
              accent="brown"
              players={teamBPlayers}
              total={sumB}
              isAdmin={isAdmin}
              user={user}
              tsRatings={tsRatings}
              onSwap={pid => onSwap(game.id, pid, 'B')}
            />
          </div>
        )}

        {/* Unassigned players (admin only) */}
        {isAdmin && unassigned.length > 0 && (
          <div className="mm-unassigned">
            <div className="sec-title" style={{ fontSize: 12, marginBottom: 8 }}>
              Unassigned ({unassigned.length})
            </div>
            <div className="mm-ua-list">
              {unassigned.map(p => (
                <div key={p.id} className="mm-ua-chip">
                  <div className="mm-av-sm" style={{ background: avatarColor(p.id) }}>
                    {initials(p.name)}
                  </div>
                  <span>{p.name.split(' ')[0]}</span>
                  <button className="mm-ua-btn green" onClick={() => onAssign(game.id, p.id, 'A')}>→ A</button>
                  <button className="mm-ua-btn brown" onClick={() => onAssign(game.id, p.id, 'B')}>→ B</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info footer */}
        {isAdmin && (
          <div className="mm-footer-note">
            Auto-balance uses live <strong>TrueSkill</strong> μ ratings — updated from real game results.
            Click ⇄ to manually swap players. Match quality % = TrueSkill draw probability.
          </div>
        )}
      </div>
    </div>
  )
}

function TeamCol({ name, accent, players, total, isAdmin, user, tsRatings, onSwap }) {
  return (
    <div className={`mm-team mm-team-${accent}`}>
      <div className="mm-team-hdr">
        <span className="mm-team-name">{name}</span>
        <span className="mm-team-total">{total.toFixed(1)} pts</span>
      </div>

      {players.length === 0 && (
        <div className="mm-empty-team">No players yet</div>
      )}

      {players.map(p => {
        const isMe    = p.id === user.id
        const tsR     = tsRatings?.[p.id]
        const liveRating = tsR ? displayRating(tsR) : p.rating.toFixed(1)
        const changed    = tsR && Math.abs(tsR.mu / 5 - p.rating) >= 0.05
        return (
          <div key={p.id} className={`mm-player${isMe ? ' mm-player-me' : ''}`}>
            <div className="mm-av" style={{ background: avatarColor(p.id) }}>
              {initials(p.name)}
            </div>
            <div className="mm-player-info">
              <strong>{p.name.split(' ')[0]}{isMe ? ' (you)' : ''}</strong>
              <span>{p.position}</span>
            </div>
            <div className="mm-rating" title={changed ? `Base: ${p.rating} → Live TrueSkill: ${liveRating}` : 'TrueSkill rating'}>
              {liveRating}
              {changed && <span className="mm-ts-dot" />}
            </div>
            {isAdmin && (
              <button
                className="mm-swap-btn"
                onClick={() => onSwap(p.id)}
                title="Move to other team"
              >
                ⇄
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
