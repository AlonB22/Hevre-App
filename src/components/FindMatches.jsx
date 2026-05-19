import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'
import { LOCATIONS, formatDate, spotsLeft, fieldIcon } from '../data'

export default function FindMatches({ user, games, onRsvp }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const markersRef    = useRef({})

  const [selected,     setSelected]     = useState(null)
  const [fmtFilter,    setFmtFilter]    = useState('all')
  const [onlyOpen,     setOnlyOpen]     = useState(false)
  const [fieldFilter,  setFieldFilter]  = useState('all')

  const upcoming = games
    .filter(g => g.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))

  const filtered = upcoming.filter(g => {
    const loc = LOCATIONS.find(l => l.id === g.locationId)
    if (fmtFilter !== 'all'   && g.format     !== fmtFilter)   return false
    if (fieldFilter !== 'all' && loc?.type    !== fieldFilter)  return false
    if (onlyOpen              && spotsLeft(g) === 0)            return false
    return true
  })

  // Initialise Leaflet map once
  useEffect(() => {
    if (mapRef.current) return
    mapRef.current = L.map(containerRef.current, {
      center: [32.09, 34.81],
      zoom: 11,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  // Redraw markers whenever filter or selection changes
  useEffect(() => {
    if (!mapRef.current) return
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    filtered.forEach(game => {
      const loc = LOCATIONS.find(l => l.id === game.locationId)
      if (!loc) return
      const isSel  = selected?.id === game.id
      const isUser = game.playerIds.includes(user.id)
      const left   = spotsLeft(game)

      const icon = L.divIcon({
        className: '',
        html: `<div class="map-pin${isSel ? ' pin-sel' : ''}${isUser ? ' pin-user' : ''}">
          ${game.format}
          ${left > 0 ? `<span class="pin-spots">${left}</span>` : ''}
        </div>`,
        iconSize:   [76, 30],
        iconAnchor: [38, 15],
      })

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(mapRef.current)
        .on('click', () => setSelected(g => g?.id === game.id ? null : game))

      markersRef.current[game.id] = marker
    })
  }, [filtered, selected, user.id])

  // Fly to selected game
  useEffect(() => {
    if (!mapRef.current || !selected) return
    const loc = LOCATIONS.find(l => l.id === selected.locationId)
    if (loc) mapRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 0.7 })
  }, [selected])

  const toggleRsvp = (e, game) => {
    e.stopPropagation()
    onRsvp(game.id, !game.playerIds.includes(user.id))
  }

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>Find Matches</h1>
          <p>{filtered.length} upcoming games in Tel Aviv metro</p>
        </div>
        <div className="filter-bar">
          <select
            className="filter-sel"
            value={fmtFilter}
            onChange={e => setFmtFilter(e.target.value)}
          >
            <option value="all">All formats</option>
            <option value="5v5">5v5</option>
            <option value="6v6">6v6</option>
            <option value="7v7">7v7</option>
            <option value="8v8">8v8</option>
          </select>
          <select
            className="filter-sel"
            value={fieldFilter}
            onChange={e => setFieldFilter(e.target.value)}
          >
            <option value="all">Any surface</option>
            <option value="turf">Turf</option>
            <option value="grass">Grass</option>
            <option value="indoor">Indoor</option>
            <option value="sand">Sand / Beach</option>
          </select>
          <button
            className={`filter-btn${onlyOpen ? ' active' : ''}`}
            onClick={() => setOnlyOpen(o => !o)}
          >
            <Users size={13} /> Open spots only
          </button>
        </div>
      </div>

      <div className="find-layout">
        {/* Map */}
        <div className="map-wrap" ref={containerRef} />

        {/* Game cards */}
        <div className="games-list">
          {filtered.length === 0 && (
            <div className="empty-state">
              <p>No games match your filters.</p>
            </div>
          )}
          {(selected
            ? [selected, ...filtered.filter(g => g.id !== selected.id)]
            : filtered
          ).map(game => {
            const loc  = LOCATIONS.find(l => l.id === game.locationId)
            const isIn = game.playerIds.includes(user.id)
            const left = spotsLeft(game)
            const isSel = selected?.id === game.id
            const pct   = Math.round((game.playerIds.length / game.spotsTotal) * 100)

            return (
              <div
                key={game.id}
                className={`game-card${isSel ? ' selected' : ''}`}
                onClick={() => setSelected(g => g?.id === game.id ? null : game)}
              >
                <div className="gc-top">
                  <span className="format-bdg">{game.format}</span>
                  {isIn && <span className="bdg bdg-green">Joined</span>}
                  {!isIn && left === 0 && <span className="bdg bdg-red">Full</span>}
                  <span style={{ marginLeft: 'auto', fontSize: 13 }}>
                    {fieldIcon(loc?.type)} {loc?.type}
                  </span>
                </div>

                <div className="gc-title">{game.title}</div>

                <div className="gc-meta">
                  <span><CalendarDays size={12} /> {formatDate(game.date)}</span>
                  <span><Clock size={12} /> {game.time}</span>
                  <span><MapPin size={12} /> {loc?.name}</span>
                </div>

                <div className="gc-foot">
                  <div className="spots-wrap">
                    <div className="spots-bar">
                      <div className="spots-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span>{game.playerIds.length}/{game.spotsTotal} players</span>
                  </div>
                  <div className="gc-price">₪{game.pricePerPlayer}</div>
                  {left > 0 && (
                    <button
                      className={`rsvp-btn${isIn ? ' rsvp-leave' : ''}`}
                      onClick={e => toggleRsvp(e, game)}
                    >
                      {isIn ? 'Leave' : "I'm in"}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
