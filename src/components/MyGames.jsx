import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { LOCATIONS, formatDate, spotsLeft } from '../data'

export default function MyGames({ user, games, onRsvp, setView, onOpenModal, onOpenManager, publishedGames }) {
  const myUpcoming = games
    .filter(g => g.status === 'upcoming' && g.playerIds.includes(user.id))
    .sort((a, b) => a.date.localeCompare(b.date))

  const myPast = games
    .filter(g => g.status === 'past' && g.playerIds.includes(user.id))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>My Games</h1>
          <p>{myUpcoming.length} upcoming · {myPast.length} played</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView('find')}>
          Find more games
        </button>
      </div>

      {myUpcoming.length === 0 && myPast.length === 0 && (
        <div className="empty-state">
          <p>You haven't joined any games yet.</p>
          <button className="btn btn-primary" onClick={() => setView('find')}>
            Browse matches
          </button>
        </div>
      )}

      {myUpcoming.length > 0 && (
        <section>
          <div className="sec-title">Upcoming ({myUpcoming.length})</div>
          <div className="gc-grid">
            {myUpcoming.map(g => (
              <GameCard
                key={g.id}
                game={g}
                user={user}
                onRsvp={onRsvp}
                onManage={() => onOpenManager(g)}
                isPublished={publishedGames?.has(g.id)}
              />
            ))}
          </div>
        </section>
      )}

      {myPast.length > 0 && (
        <section>
          <div className="sec-title">Match History ({myPast.length}) — click any game to view stats &amp; rate</div>
          <div className="gc-grid">
            {myPast.map(g => (
              <PastCard key={g.id} game={g} user={user} onClick={() => onOpenModal(g)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function GameCard({ game, user, onRsvp, onManage, isPublished }) {
  const loc      = LOCATIONS.find(l => l.id === game.locationId)
  const left     = spotsLeft(game)
  const paid     = game.paidIds?.includes(user.id)
  const pct      = Math.round((game.playerIds.length / game.spotsTotal) * 100)
  const isOrg    = user.id === game.organizerId

  return (
    <div className="game-card no-hover">
      <div className="gc-top">
        <span className="format-bdg">{game.format}</span>
        <span className="bdg bdg-green">Joined</span>
        {isOrg && <span className="bdg bdg-brown">Organizer</span>}
        {isPublished && !isOrg && <span className="bdg bdg-green" style={{ marginLeft: 'auto' }}>Teams Live</span>}
        {paid
          ? <span className="bdg bdg-green" style={{ marginLeft: 'auto' }}>Paid ✓</span>
          : <span className="bdg bdg-red"   style={{ marginLeft: 'auto' }}>Unpaid</span>
        }
      </div>
      <div className="gc-title">{game.title}</div>
      <div className="gc-meta">
        <span><CalendarDays size={12} /> {formatDate(game.date)}</span>
        <span><Clock size={12} /> {game.time}</span>
        <span><MapPin size={12} /> {loc?.name}</span>
        <span><Users size={12} /> {game.playerIds.length}/{game.spotsTotal}</span>
      </div>
      <div className="gc-price-row">
        <span>Field cost: <strong>₪{game.pricePerPlayer}</strong> per player</span>
      </div>
      <div className="spots-wrap" style={{ marginBottom: 14 }}>
        <div className="spots-bar">
          <div className="spots-fill" style={{ width: `${pct}%` }} />
        </div>
        <span>{left > 0 ? `${left} spots left` : 'Full'}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={onManage}
        >
          {isOrg ? '⚙ Manage teams' : '👥 View teams'}
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onRsvp(game.id, false)}
        >
          Leave
        </button>
      </div>
    </div>
  )
}

function PastCard({ game, user, onClick }) {
  const loc    = LOCATIONS.find(l => l.id === game.locationId)
  const result = game.scoreA !== undefined
    ? `${game.scoreA} – ${game.scoreB}`
    : 'Played'
  const paid = game.paidIds?.includes(user.id)

  return (
    <div className="game-card past" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div className="gc-top">
        <span className="format-bdg dim">{game.format}</span>
        <span className="bdg bdg-gray">{result}</span>
        {paid
          ? <span className="bdg bdg-green" style={{ marginLeft: 'auto' }}>Paid</span>
          : <span className="bdg bdg-red"   style={{ marginLeft: 'auto' }}>Unpaid</span>
        }
      </div>
      <div className="gc-title">{game.title}</div>
      <div className="gc-meta">
        <span><CalendarDays size={12} /> {formatDate(game.date)}</span>
        <span><MapPin size={12} /> {loc?.name}</span>
        <span><Users size={12} /> {game.playerIds.length} players</span>
      </div>
      <div className="gc-price-row">
        <span>Field cost: <strong>₪{game.pricePerPlayer}</strong></span>
        <span style={{ fontSize: 11, color: 'var(--green-hi)' }}>View stats →</span>
      </div>
    </div>
  )
}
