import { CalendarDays, ChevronRight, Clock, MapPin, Users } from 'lucide-react'
import { LOCATIONS, formatDate, initials, avatarColor, spotsLeft } from '../data'

export default function Dashboard({ user, games, players, onRsvp, setView, onViewPlayer }) {
  const upcoming = games
    .filter(g => g.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))

  const myGames = upcoming.filter(g => g.playerIds.includes(user.id))
  const nextGame = myGames[0] ?? upcoming[0]
  const nextLoc = nextGame ? LOCATIONS.find(l => l.id === nextGame.locationId) : null
  const isInNext = nextGame?.playerIds.includes(user.id)

  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5)

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p>Your soccer community at a glance.</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <span>Rating</span>
          <strong>{user.rating}</strong>
          <div className="stat-card-sub">Season avg</div>
        </div>
        <div className="stat-card">
          <span>Goals</span>
          <strong>{user.goals}</strong>
          <div className="stat-card-sub">This season</div>
        </div>
        <div className="stat-card">
          <span>Assists</span>
          <strong>{user.assists}</strong>
          <div className="stat-card-sub">This season</div>
        </div>
        <div className="stat-card">
          <span>Games</span>
          <strong>{user.gamesPlayed}</strong>
          <div className="stat-card-sub">Played total</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Next game hero */}
        {nextGame && (
          <div className="card next-game-card">
            <div className="card-hdr">
              <h2>Next Game</h2>
              {myGames.length > 1 && (
                <button className="link-btn" onClick={() => setView('mygames')}>
                  +{myGames.length - 1} more <ChevronRight size={13} />
                </button>
              )}
            </div>
            <div className="ng-body">
              <div className="ng-format">{nextGame.format}</div>
              <h3>{nextGame.title}</h3>
              <div className="ng-meta">
                <div><CalendarDays size={14} /> {formatDate(nextGame.date)}</div>
                <div><Clock size={14} /> {nextGame.time}</div>
                <div><MapPin size={14} /> {nextLoc?.name}</div>
                <div><Users size={14} /> {nextGame.playerIds.length}/{nextGame.spotsTotal} confirmed</div>
              </div>
              <div className="ng-actions">
                <button
                  className={`btn ${isInNext ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => onRsvp(nextGame.id, !isInNext)}
                >
                  {isInNext ? "You're in ✓" : "I'm in"}
                </button>
                <button className="btn btn-ghost" onClick={() => setView('find')}>
                  Browse all games
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top scorers */}
        <div className="card">
          <div className="card-hdr">
            <h2>Top Scorers</h2>
            <button className="link-btn" onClick={() => setView('stats')}>
              Full table <ChevronRight size={13} />
            </button>
          </div>
          <div className="scorer-list">
            {topScorers.map((p, i) => (
              <div key={p.id} className="scorer-row player-clickable" onClick={() => onViewPlayer?.(p)}>
                <div className="scorer-rank">{i + 1}</div>
                <div className="scorer-av" style={{ background: avatarColor(p.id) }}>
                  {initials(p.name)}
                </div>
                <div className="scorer-info">
                  <strong>{p.name}</strong>
                  <span>{p.position} · {p.neighborhood}</span>
                </div>
                <div className="scorer-goals">
                  <strong>{p.goals}</strong>
                  <span>goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming games list */}
        <div className="card">
          <div className="card-hdr">
            <h2>Upcoming Games</h2>
            <button className="link-btn" onClick={() => setView('find')}>
              Find more <ChevronRight size={13} />
            </button>
          </div>
          <div className="up-list">
            {upcoming.slice(0, 6).map(g => {
              const loc = LOCATIONS.find(l => l.id === g.locationId)
              const left = spotsLeft(g)
              const isIn = g.playerIds.includes(user.id)
              return (
                <div key={g.id} className="up-row">
                  <div className="up-date">
                    <strong>{formatDate(g.date).split(',')[0]}</strong>
                    <span>{g.time}</span>
                  </div>
                  <div className="up-info">
                    <strong>{g.title}</strong>
                    <span>{loc?.name}</span>
                  </div>
                  <div className="up-right">
                    {isIn && <span className="bdg bdg-green bdg-sm">In</span>}
                    {left > 0
                      ? <span className="bdg bdg-gray bdg-sm">{left} left</span>
                      : <span className="bdg bdg-red bdg-sm">Full</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Community snapshot */}
        <div className="card">
          <div className="card-hdr">
            <h2>Community</h2>
            <button className="link-btn" onClick={() => setView('players')}>
              All {players.length} players <ChevronRight size={13} />
            </button>
          </div>
          <div className="mini-grid">
            {players.slice(0, 11).map(p => (
              <div key={p.id} className="mini-player player-clickable" title={`${p.name} · ${p.position}`} onClick={() => onViewPlayer?.(p)}>
                <div className="mini-av" style={{ background: avatarColor(p.id) }}>
                  {initials(p.name)}
                </div>
                <span>{p.name.split(' ')[0]}</span>
              </div>
            ))}
            <div className="mini-more">+{players.length - 11}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
