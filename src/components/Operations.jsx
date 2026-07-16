import { useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Megaphone,
  Plus,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { formatDate, spotsLeft } from '../data'
import { canManageFields, canManageGame, isOrganizer, roleLabel } from '../roles'

const EMPTY_GAME = {
  title: '',
  date: '2026-08-24',
  time: '21:00',
  format: '7v7',
  locationId: 1,
  spotsTotal: 14,
  pricePerPlayer: 45,
  playerIds: [],
  paidIds: [],
  status: 'upcoming',
}

const DEFAULT_SLOTS = ['18:00', '19:30', '21:00']

export default function Operations({
  user,
  players,
  games,
  locations,
  teamAssignments,
  onSaveGame,
  onFinalizeGame,
  onUpdateLocation,
}) {
  const upcoming = games.filter(game => game.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date))
  const canCreateGames = isOrganizer(user)
  const canAdminFields = canManageFields(user)
  const manageableGames = upcoming.filter(game => canManageGame(user, game))
  const [draft, setDraft] = useState(() => ({
    ...EMPTY_GAME,
    organizerId: user.id,
    locationId: locations[0]?.id ?? 1,
    playerIds: [user.id],
  }))
  const [selectedFinalizeId, setSelectedFinalizeId] = useState(manageableGames[0]?.id ?? null)
  const [requestType, setRequestType] = useState('Need players')
  const [requestText, setRequestText] = useState('Need 3 players for a balanced 7v7 at Sportek tonight.')
  const [posts, setPosts] = useState([
    { id: 1, type: 'Need players', author: 'Alon Berla', text: 'Need a goalkeeper and two defenders for Tuesday 7v7.', status: 'Open' },
    { id: 2, type: 'Group request', author: 'Ramat Gan Crew', text: 'Group of 5 looking for a weekly 6v6 slot after 20:00.', status: 'Matching' },
  ])
  const [fieldAdmin, setFieldAdmin] = useState(() => buildFieldState(locations))
  const [selectedFieldId, setSelectedFieldId] = useState(locations[0]?.id ?? 1)
  const [sentNotifications, setSentNotifications] = useState([])

  const selectedGame = manageableGames.find(game => game.id === selectedFinalizeId) ?? manageableGames[0]
  const selectedLocation = locations.find(location => location.id === selectedFieldId) ?? locations[0]
  const selectedFieldState = fieldAdmin[selectedLocation?.id] ?? {}
  const availabilityDays = useMemo(() => buildAvailabilityDays(upcoming), [upcoming])
  const notificationPreview = buildNotificationPreview({ user, selectedGame, locations })

  const editGame = (game) => {
    if (!canManageGame(user, game)) return
    setDraft({
      ...game,
      playerIds: game.playerIds ?? [],
      paidIds: game.paidIds ?? [],
    })
  }

  const resetDraft = () => {
    setDraft({
      ...EMPTY_GAME,
      organizerId: user.id,
      locationId: locations[0]?.id ?? 1,
      playerIds: [user.id],
    })
  }

  const saveDraft = (event) => {
    event.preventDefault()
    if (!canCreateGames) return
    onSaveGame({
      ...draft,
      title: draft.title.trim() || `${draft.format} community match`,
    })
    resetDraft()
  }

  const togglePlayer = (playerId) => {
    setDraft(prev => {
      const playerIds = prev.playerIds.includes(playerId)
        ? prev.playerIds.filter(id => id !== playerId)
        : [...prev.playerIds, playerId]
      return { ...prev, playerIds }
    })
  }

  const publishPost = () => {
    const text = requestText.trim()
    if (!text) return
    setPosts(prev => [
      { id: Date.now(), type: requestType, author: user.name, text, status: 'Open' },
      ...prev,
    ])
    setRequestText('')
  }

  const updateField = (patch) => {
    if (!selectedLocation || !canAdminFields) return
    setFieldAdmin(prev => ({
      ...prev,
      [selectedLocation.id]: { ...prev[selectedLocation.id], ...patch },
    }))
    onUpdateLocation(selectedLocation.id, patch)
  }

  const sendNotification = (template) => {
    setSentNotifications(prev => [
      {
        id: Date.now(),
        template,
        target: template.includes('payment') ? 'Unpaid players' : 'Joined players',
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ])
  }

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>Operations</h1>
          <p>{roleLabel(user.role)} workspace for game operations, community requests, and field administration.</p>
        </div>
      </div>

      <div className="ops-grid">
        {canCreateGames && (
          <section className="card ops-card ops-wide">
            <SectionTitle icon={draft.id ? Edit3 : Plus} title={draft.id ? 'Edit game' : 'Create game'} />
            <form className="ops-form" onSubmit={saveDraft}>
            <label>
              Title
              <input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label>
              Date
              <input type="date" value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} />
            </label>
            <label>
              Time
              <input type="time" value={draft.time} onChange={event => setDraft({ ...draft, time: event.target.value })} />
            </label>
            <label>
              Format
              <select value={draft.format} onChange={event => setDraft({ ...draft, format: event.target.value })}>
                <option>5v5</option>
                <option>6v6</option>
                <option>7v7</option>
                <option>8v8</option>
              </select>
            </label>
            <label>
              Field
              <select value={draft.locationId} onChange={event => setDraft({ ...draft, locationId: Number(event.target.value) })}>
                {locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
            </label>
            <label>
              Spots
              <input type="number" min="2" max="22" value={draft.spotsTotal} onChange={event => setDraft({ ...draft, spotsTotal: event.target.value })} />
            </label>
            <label>
              Price
              <input type="number" min="0" value={draft.pricePerPlayer} onChange={event => setDraft({ ...draft, pricePerPlayer: event.target.value })} />
            </label>

            <div className="ops-player-picker">
              <div className="ops-inline-title">Players selected: {draft.playerIds.length}</div>
              <div className="ops-chip-list">
                {players.slice(0, 18).map(player => (
                  <button
                    key={player.id}
                    type="button"
                    className={`ops-chip${draft.playerIds.includes(player.id) ? ' active' : ''}`}
                    onClick={() => togglePlayer(player.id)}
                  >
                    {player.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="ops-actions">
              <button className="btn btn-primary" type="submit">{draft.id ? 'Save changes' : 'Create game'}</button>
              {draft.id && <button className="btn btn-outline" type="button" onClick={resetDraft}>Cancel edit</button>}
            </div>
            </form>
          </section>
        )}

        <section className="card ops-card">
          <SectionTitle icon={ClipboardList} title="Upcoming games" />
          <div className="ops-list">
            {upcoming.slice(0, 6).map(game => {
              const location = locations.find(loc => loc.id === game.locationId)
              return (
                <button
                  key={game.id}
                  className="ops-game-row"
                  onClick={() => editGame(game)}
                  disabled={!canManageGame(user, game)}
                  title={canManageGame(user, game) ? 'Edit game' : 'Organizer access required'}
                >
                  <strong>{game.title}</strong>
                  <span>{formatDate(game.date)} · {game.time} · {location?.name}</span>
                  <em>{spotsLeft(game)} spots open</em>
                </button>
              )
            })}
          </div>
        </section>

        {canCreateGames && (
          <section className="card ops-card ops-wide">
            <SectionTitle icon={CheckCircle2} title="Finalize result and stats" />
            <FinalizePanel
              game={selectedGame}
              players={players}
              locations={locations}
              assignments={selectedGame ? teamAssignments[selectedGame.id] : null}
              games={manageableGames}
              selectedId={selectedGame?.id ?? ''}
              onSelect={setSelectedFinalizeId}
              onFinalize={onFinalizeGame}
            />
          </section>
        )}

        <section className="card ops-card">
          <SectionTitle icon={Megaphone} title="Player and group requests" />
          <div className="ops-request-box">
            <select value={requestType} onChange={event => setRequestType(event.target.value)}>
              <option>Need players</option>
              <option>Group request</option>
              <option>Looking for field</option>
            </select>
            <textarea value={requestText} onChange={event => setRequestText(event.target.value)} rows={3} />
            <button className="btn btn-primary btn-full" onClick={publishPost}><Send size={14} /> Post request</button>
          </div>
          <div className="ops-feed">
            {posts.map(post => (
              <article key={post.id} className="ops-post">
                <div><strong>{post.type}</strong><span>{post.status}</span></div>
                <p>{post.text}</p>
                <small>{post.author}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="card ops-card ops-wide">
          <SectionTitle icon={CalendarDays} title="Field availability calendar" />
          <div className="availability-grid">
            <div className="availability-head">Field</div>
            {availabilityDays.map(day => <div key={day} className="availability-head">{formatDate(day)}</div>)}
            {locations.slice(0, 6).map(location => (
              <AvailabilityRow key={location.id} location={location} games={upcoming} days={availabilityDays} />
            ))}
          </div>
        </section>

        {canAdminFields && (
          <section className="card ops-card">
            <SectionTitle icon={ShieldCheck} title="Municipality field management" />
          {selectedLocation && (
            <div className="ops-admin-form">
              <label>
                Field
                <select value={selectedLocation.id} onChange={event => setSelectedFieldId(Number(event.target.value))}>
                  {locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </label>
              <label>
                Surface
                <select value={selectedLocation.type} onChange={event => updateField({ type: event.target.value })}>
                  <option value="turf">Turf</option>
                  <option value="grass">Grass</option>
                  <option value="indoor">Indoor</option>
                  <option value="sand">Sand</option>
                </select>
              </label>
              <label>
                Status
                <select value={selectedFieldState.status} onChange={event => updateField({ status: event.target.value })}>
                  <option>Open</option>
                  <option>Maintenance</option>
                  <option>Permit required</option>
                  <option>Closed</option>
                </select>
              </label>
              <label className="ops-check">
                <input
                  type="checkbox"
                  checked={Boolean(selectedFieldState.lights)}
                  onChange={event => updateField({ lights: event.target.checked })}
                />
                Lights available
              </label>
              <label>
                Permit note
                <textarea
                  rows={3}
                  value={selectedFieldState.note ?? ''}
                  onChange={event => updateField({ note: event.target.value })}
                />
              </label>
            </div>
          )}
          </section>
        )}

        <section className="card ops-card">
          <SectionTitle icon={Bell} title="Notification simulation" />
          <div className="ops-preview">
            {notificationPreview.map(item => (
              <button key={item.template} className="ops-reminder" onClick={() => sendNotification(item.template)}>
                <strong>{item.label}</strong>
                <span>{item.message}</span>
              </button>
            ))}
          </div>
          <div className="ops-sent-list">
            {sentNotifications.length === 0 && <p>No simulated sends yet.</p>}
            {sentNotifications.map(item => (
              <div key={item.id} className="ops-sent">
                <strong>{item.template}</strong>
                <span>{item.target} · {item.sentAt}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="ops-section-title">
      <Icon size={17} />
      <h2>{title}</h2>
    </div>
  )
}

function FinalizePanel({ game, players, locations, assignments, games, selectedId, onSelect, onFinalize }) {
  const teamA = assignments?.teamA ?? game?.teamA ?? []
  const teamB = assignments?.teamB ?? game?.teamB ?? []
  const participantIds = game?.playerIds ?? []
  const [scoreA, setScoreA] = useState(3)
  const [scoreB, setScoreB] = useState(2)
  const [stats, setStats] = useState({})
  const location = locations.find(loc => loc.id === game?.locationId)

  const setPlayerStat = (playerId, field, value) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        goals: 0,
        assists: 0,
        ...(prev[playerId] ?? {}),
        [field]: Number(value),
      },
    }))
  }

  if (!game) {
    return <div className="empty-state"><p>No upcoming games to finalize.</p></div>
  }

  return (
    <div className="ops-finalize">
      <div className="ops-finalize-top">
        <label>
          Game
          <select value={selectedId} onChange={event => onSelect(Number(event.target.value))}>
            {games.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <div className="ops-finalize-summary">
          <strong>{game.title}</strong>
          <span>{formatDate(game.date)} · {game.time} · {location?.name}</span>
        </div>
        <div className="ops-score-inputs">
          <input type="number" min="0" value={scoreA} onChange={event => setScoreA(event.target.value)} aria-label="Team A score" />
          <span>:</span>
          <input type="number" min="0" value={scoreB} onChange={event => setScoreB(event.target.value)} aria-label="Team B score" />
        </div>
      </div>

      <div className="ops-team-summary">
        <TeamNames label="Team A" ids={teamA} players={players} />
        <TeamNames label="Team B" ids={teamB} players={players} />
      </div>

      <div className="ops-stats-table">
        {participantIds.map(playerId => {
          const player = players.find(item => item.id === playerId)
          if (!player) return null
          return (
            <div key={player.id} className="ops-stat-row">
              <strong>{player.name}</strong>
              <label>G <input type="number" min="0" value={stats[player.id]?.goals ?? 0} onChange={event => setPlayerStat(player.id, 'goals', event.target.value)} /></label>
              <label>A <input type="number" min="0" value={stats[player.id]?.assists ?? 0} onChange={event => setPlayerStat(player.id, 'assists', event.target.value)} /></label>
            </div>
          )
        })}
      </div>

      <button
        className="btn btn-primary"
        onClick={() => onFinalize(game.id, { scoreA, scoreB, playerStats: normalizeStats(participantIds, stats) })}
      >
        Finalize match
      </button>
    </div>
  )
}

function TeamNames({ label, ids, players }) {
  return (
    <div>
      <strong>{label}</strong>
      <span>{ids.length ? ids.map(id => players.find(player => player.id === id)?.name.split(' ')[0]).filter(Boolean).join(', ') : 'No team assigned'}</span>
    </div>
  )
}

function AvailabilityRow({ location, games, days }) {
  return (
    <>
      <div className="availability-field">
        <strong>{location.name}</strong>
        <span>{location.type}</span>
      </div>
      {days.map(day => (
        <div key={`${location.id}-${day}`} className="availability-cell">
          {DEFAULT_SLOTS.map(slot => {
            const game = games.find(item => item.locationId === location.id && item.date === day && item.time === slot)
            return (
              <span key={slot} className={game ? 'slot booked' : 'slot open'}>
                {slot} {game ? 'booked' : 'open'}
              </span>
            )
          })}
        </div>
      ))}
    </>
  )
}

function buildFieldState(locations) {
  return Object.fromEntries(locations.map(location => [
    location.id,
    {
      status: location.id % 5 === 0 ? 'Maintenance' : 'Open',
      lights: location.type !== 'sand',
      note: location.type === 'indoor' ? 'Indoor permit handled by city desk.' : 'Community booking allowed.',
    },
  ]))
}

function buildAvailabilityDays(games) {
  const dates = [...new Set(games.map(game => game.date))].sort()
  return dates.slice(0, 4).length ? dates.slice(0, 4) : ['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27']
}

function buildNotificationPreview({ user, selectedGame, locations }) {
  const location = locations.find(loc => loc.id === selectedGame?.locationId)
  const gameLabel = selectedGame ? `${selectedGame.title} at ${location?.name}` : 'the next game'
  return [
    { template: '24h game reminder', label: 'Game reminder', message: `${user.name}, reminder: ${gameLabel} starts tomorrow.` },
    { template: 'payment reminder', label: 'Payment reminder', message: `Ask unpaid players to settle field cost before kickoff.` },
    { template: 'teams published', label: 'Teams published', message: `Notify joined players that teams are now live.` },
  ]
}

function normalizeStats(playerIds, stats) {
  return Object.fromEntries(playerIds.map(playerId => [
    playerId,
    {
      goals: Number(stats[playerId]?.goals ?? 0),
      assists: Number(stats[playerId]?.assists ?? 0),
    },
  ]))
}
