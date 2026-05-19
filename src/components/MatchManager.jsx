import { EyeOff, RefreshCw, X } from 'lucide-react'
import { LOCATIONS, formatDate, initials, avatarColor } from '../data'

export default function MatchManager({
  game,
  players,
  user,
  assignments,   // { teamA: [ids], teamB: [ids] }
  published,     // boolean
  onAutoBalance,
  onSwap,        // (gameId, playerId, fromTeam) — 'A' | 'B' | null
  onAssign,      // (gameId, playerId, toTeam) — for unassigned players
  onTogglePublish,
  onClose,
}) {
  const isAdmin   = user.id === game.organizerId
  const organizer = players.find(p => p.id === game.organizerId)
  const loc     = LOCATIONS.find(l => l.id === game.locationId)

  const gamePlayers  = game.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean)
  const teamAPlayers = (assignments?.teamA ?? []).map(id => players.find(p => p.id === id)).filter(Boolean)
  const teamBPlayers = (assignments?.teamB ?? []).map(id => players.find(p => p.id === id)).filter(Boolean)

  const assignedIds = new Set([...(assignments?.teamA ?? []), ...(assignments?.teamB ?? [])])
  const unassigned  = gamePlayers.filter(p => !assignedIds.has(p.id))

  const sumA = teamAPlayers.reduce((s, p) => s + p.rating, 0)
  const sumB = teamBPlayers.reduce((s, p) => s + p.rating, 0)
  const diff = Math.abs(sumA - sumB)

  const [balanceLabel, balanceCls] =
    diff < 0.5 ? ['Perfectly balanced', 'bal-great'] :
    diff < 1.5 ? ['Well balanced',      'bal-ok']    :
    diff < 3.0 ? ['Slightly uneven',    'bal-warn']  :
                 ['Uneven — fix needed','bal-bad']

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

        {/* Balance score bar — visible to all */}
        {canSeeTeams && (
          <div className="mm-score-bar">
            <div className="mm-score-item">
              <span>Team A</span>
              <strong style={{ color: 'var(--green-hi)' }}>{sumA.toFixed(1)}</strong>
            </div>
            <div className={`mm-score-diff ${balanceCls}`}>
              {diff < 0.05 ? '⚖ Even' : `Δ ${diff.toFixed(1)} pts`}
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
            Click a player's ⇄ button to move them to the other team.
            Auto-balance uses a greedy rating algorithm.
            {' '}<a href="#ai" style={{ color: 'var(--green-hi)' }}>AI balancing →</a>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamCol({ name, accent, players, total, isAdmin, user, onSwap }) {
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
        const isMe = p.id === user.id
        return (
          <div key={p.id} className={`mm-player${isMe ? ' mm-player-me' : ''}`}>
            <div className="mm-av" style={{ background: avatarColor(p.id) }}>
              {initials(p.name)}
            </div>
            <div className="mm-player-info">
              <strong>{p.name.split(' ')[0]}{isMe ? ' (you)' : ''}</strong>
              <span>{p.position}</span>
            </div>
            <div className="mm-rating">{p.rating}</div>
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
