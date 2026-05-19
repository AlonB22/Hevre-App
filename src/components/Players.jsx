import { useState } from 'react'
import { Search } from 'lucide-react'
import { initials, avatarColor } from '../data'

const POSITIONS = ['All','GK','CB','RB','LB','CDM','CM','CAM','LW','RW','CF','ST']

export default function Players({ players, onViewPlayer }) {
  const [query,    setQuery]    = useState('')
  const [position, setPosition] = useState('All')
  const [sortBy,   setSortBy]   = useState('rating')

  const filtered = players
    .filter(p => {
      if (position !== 'All' && p.position !== position) return false
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'rating')  return b.rating  - a.rating
      if (sortBy === 'goals')   return b.goals   - a.goals
      if (sortBy === 'assists') return b.assists  - a.assists
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>Players</h1>
          <p>{players.length} members in the community</p>
        </div>
        <div className="filter-bar">
          <div className="search-wrap">
            <Search size={14} />
            <input
              placeholder="Search players…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-sel"
            value={position}
            onChange={e => setPosition(e.target.value)}
          >
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select
            className="filter-sel"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="rating">Sort: Rating</option>
            <option value="goals">Sort: Goals</option>
            <option value="assists">Sort: Assists</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No players match your search.</p>
        </div>
      )}

      <div className="players-grid">
        {filtered.map(p => (
          <div key={p.id} className="player-card player-clickable" onClick={() => onViewPlayer?.(p)}>
            <div className="pc-top">
              <div className="pc-av" style={{ background: avatarColor(p.id) }}>
                {initials(p.name)}
              </div>
              <div className="pc-info">
                <strong>{p.name}</strong>
                <span>{p.neighborhood}</span>
              </div>
            </div>
            <div className="pc-pos">{p.position}</div>
            <div className="pc-stats">
              <div>
                <strong>{p.rating}</strong>
                <span>Rating</span>
              </div>
              <div>
                <strong>{p.goals}</strong>
                <span>Goals</span>
              </div>
              <div>
                <strong>{p.assists}</strong>
                <span>Assists</span>
              </div>
              <div>
                <strong>{p.gamesPlayed}</strong>
                <span>Games</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
