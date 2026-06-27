import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { PLAYERS, GAMES, LOCATIONS, INITIAL_RATINGS, autoBalance } from './data'
import { buildInitialRatings, autoBalanceTS, processGameResult } from './trueskill'
import { canManageFields, canManageGame, isOrganizer } from './roles'
import { isSupabaseConfigured } from './supabaseClient'
import {
  loadFootyData,
  saveBalanceFeedback,
  savePlayerProfile,
  savePublished,
  saveRating,
  saveRsvp,
  saveTeamAssignments,
} from './supabaseRepository'
import Login     from './components/Login'
import Sidebar   from './components/Sidebar'
import Dashboard from './components/Dashboard'
import FindMatches from './components/FindMatches'
import MyGames   from './components/MyGames'
import MyStats   from './components/MyStats'
import Players   from './components/Players'
import Stats     from './components/Stats'
import Payments  from './components/Payments'
import GameModal    from './components/GameModal'
import ProfileModal from './components/ProfileModal'
import MatchManager from './components/MatchManager'
import Operations from './components/Operations'

export default function App() {
  const [user,        setUser]        = useState(null)
  const [view,        setView]        = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [games,       setGames]       = useState(GAMES)
  const [players,     setPlayers]     = useState(PLAYERS)
  const [locations,   setLocations]   = useState(LOCATIONS)
  const [ratings,     setRatings]     = useState(INITIAL_RATINGS)
  const [modalGame,   setModalGame]   = useState(null)
  const [dataSource,  setDataSource]  = useState(isSupabaseConfigured ? 'loading' : 'local')

  // TrueSkill live ratings — initialised once by replaying all past games
  const [tsRatings, setTsRatings] = useState(() => {
    const pastGames = GAMES.filter(g => g.status === 'past')
    return buildInitialRatings(PLAYERS, pastGames)
  })
  const [viewPlayer,      setViewPlayer]      = useState(null)
  const [userBios,        setUserBios]        = useState({})
  const [userPics,        setUserPics]        = useState({})
  const [managerGame,     setManagerGame]     = useState(null)
  const [gameFeedback,    setGameFeedback]    = useState({})

  // Pre-balance every upcoming game using TrueSkill μ so teams are always ready
  const [teamAssignments, setTeamAssignments] = useState(() => {
    const pastGames = GAMES.filter(g => g.status === 'past')
    const tsInit    = buildInitialRatings(PLAYERS, pastGames)
    const result = {}
    for (const game of GAMES.filter(g => g.status === 'upcoming' && g.playerIds.length >= 2)) {
      const gamePlayers = game.playerIds.map(id => PLAYERS.find(p => p.id === id)).filter(Boolean)
      const { teamA, teamB } = autoBalanceTS(gamePlayers, tsInit)
      result[game.id] = { teamA: teamA.map(p => p.id), teamB: teamB.map(p => p.id) }
    }
    return result
  })

  // Pre-publish the three biggest group games so players can see teams on first load
  const [publishedGames,  setPublishedGames]  = useState(() => new Set([1, 3, 11]))

  const handleLogin  = (player) => { setUser(player); setView('dashboard') }
  const handleLogout = () => { setUser(null); setSidebarOpen(false); setViewPlayer(null) }

  useEffect(() => {
    let cancelled = false

    async function loadFromSupabase() {
      if (!isSupabaseConfigured) return
      try {
        const data = await loadFootyData()
        if (!data || cancelled) return

        setPlayers(data.players)
        setLocations(data.locations)
        setGames(data.games)
        setRatings(data.ratings)

        const pastGames = data.games.filter(g => g.status === 'past')
        const nextTsRatings = buildInitialRatings(data.players, pastGames)
        setTsRatings(nextTsRatings)

        const nextAssignments = {}
        for (const game of data.games.filter(g => g.status === 'upcoming' && g.playerIds.length >= 2)) {
          if (game.teamA?.length || game.teamB?.length) {
            nextAssignments[game.id] = { teamA: game.teamA ?? [], teamB: game.teamB ?? [] }
          } else {
            const gamePlayers = game.playerIds.map(id => data.players.find(p => p.id === id)).filter(Boolean)
            const { teamA, teamB } = autoBalanceTS(gamePlayers, nextTsRatings)
            nextAssignments[game.id] = { teamA: teamA.map(p => p.id), teamB: teamB.map(p => p.id) }
          }
        }
        setTeamAssignments(nextAssignments)
        setPublishedGames(new Set(data.games.filter(g => g.isPublished).map(g => g.id)))
        setDataSource('supabase')
      } catch (error) {
        console.warn('Falling back to local seed data because Supabase loading failed:', error)
        if (!cancelled) setDataSource('local')
      }
    }

    loadFromSupabase()
    return () => { cancelled = true }
  }, [])

  const persistOrWarn = (operation) => {
    if (!isSupabaseConfigured) return
    operation().catch(error => {
      console.warn('Supabase write failed:', error)
    })
  }

  const handleSaveBio = (bio) => {
    setUserBios(prev => ({ ...prev, [user.id]: bio }))
    persistOrWarn(() => savePlayerProfile(user.id, { bio, avatarDataUrl: userPics[user.id] }))
  }

  const handleSavePic = (pic) => {
    setUserPics(prev => ({ ...prev, [user.id]: pic }))
    persistOrWarn(() => savePlayerProfile(user.id, { bio: userBios[user.id] ?? user.bio ?? null, avatarDataUrl: pic }))
  }

  const handleOpenManager = (game) => {
    setManagerGame(game)
  }

  const handleAutoBalance = (gameId) => {
    const game = games.find(g => g.id === gameId)
    if (!canManageGame(user, game)) return
    const gamePlayers = game.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean)
    const { teamA, teamB } = autoBalanceTS(gamePlayers, tsRatings)
    const nextAssignments = { teamA: teamA.map(p => p.id), teamB: teamB.map(p => p.id) }
    setTeamAssignments(prev => ({
      ...prev,
      [gameId]: nextAssignments,
    }))
    persistOrWarn(() => saveTeamAssignments(gameId, nextAssignments))
  }

  // When a past game result is saved, update TrueSkill ratings for all participants
  const handleGameResult = (game, winner) => {
    if (!game.teamA || !game.teamB) return
    setTsRatings(prev => processGameResult(prev, game.teamA, game.teamB, winner))
  }

  const handleSwapPlayer = (gameId, playerId, fromTeam) => {
    const game = games.find(g => g.id === gameId)
    if (!canManageGame(user, game)) return
    setTeamAssignments(prev => {
      const cur = prev[gameId] ?? { teamA: [], teamB: [] }
      const nextAssignments = {
        teamA: fromTeam === 'A'
          ? cur.teamA.filter(id => id !== playerId)
          : [...cur.teamA, playerId],
        teamB: fromTeam === 'B'
          ? cur.teamB.filter(id => id !== playerId)
          : [...cur.teamB, playerId],
      }
      persistOrWarn(() => saveTeamAssignments(gameId, nextAssignments))
      return {
        ...prev,
        [gameId]: nextAssignments,
      }
    })
  }

  const handleAssignPlayer = (gameId, playerId, toTeam) => {
    const game = games.find(g => g.id === gameId)
    if (!canManageGame(user, game)) return
    setTeamAssignments(prev => {
      const cur = prev[gameId] ?? { teamA: [], teamB: [] }
      const nextAssignments = {
        teamA: toTeam === 'A' ? [...cur.teamA, playerId] : cur.teamA,
        teamB: toTeam === 'B' ? [...cur.teamB, playerId] : cur.teamB,
      }
      persistOrWarn(() => saveTeamAssignments(gameId, nextAssignments))
      return {
        ...prev,
        [gameId]: nextAssignments,
      }
    })
  }

  const handleTogglePublish = (gameId) => {
    const game = games.find(g => g.id === gameId)
    if (!canManageGame(user, game)) return
    setPublishedGames(prev => {
      const next = new Set(prev)
      next.has(gameId) ? next.delete(gameId) : next.add(gameId)
      persistOrWarn(() => savePublished(gameId, next.has(gameId)))
      return next
    })
  }

  const handleSaveFeedback = (gameId, feedback) => {
    setGameFeedback(prev => ({ ...prev, [gameId]: feedback }))
    persistOrWarn(() => saveBalanceFeedback(gameId, user.id, feedback))
  }

  const handleRsvp = (gameId, joining) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g
      const playerIds = joining
        ? [...g.playerIds, user.id]
        : g.playerIds.filter(id => id !== user.id)
      return { ...g, playerIds }
    }))
    persistOrWarn(() => saveRsvp(gameId, user.id, joining))
  }

  const handleSaveGame = (draft) => {
    if (!isOrganizer(user)) return

    setGames(prev => {
      const normalized = {
        ...draft,
        locationId: Number(draft.locationId),
        spotsTotal: Number(draft.spotsTotal),
        pricePerPlayer: Number(draft.pricePerPlayer),
        organizerId: canManageFields(user) ? Number(draft.organizerId) : user.id,
        playerIds: [...new Set(draft.playerIds.map(Number))],
        paidIds: draft.paidIds?.map(Number) ?? [],
        status: draft.status ?? 'upcoming',
      }

      if (normalized.id) {
        return prev.map(game => game.id === normalized.id ? { ...game, ...normalized } : game)
      }

      const nextId = Math.max(...prev.map(game => game.id), 0) + 1
      return [{ ...normalized, id: nextId }, ...prev]
    })
  }

  const handleFinalizeGame = (gameId, finalData) => {
    const targetGame = games.find(game => game.id === gameId)
    if (!canManageGame(user, targetGame)) return

    const winner = finalData.scoreA > finalData.scoreB ? 'A' : finalData.scoreB > finalData.scoreA ? 'B' : 'draw'
    const assignments = teamAssignments[gameId] ?? {}

    setGames(prev => prev.map(game => {
      if (game.id !== gameId) return game
      const teamA = assignments.teamA?.length ? assignments.teamA : game.teamA ?? []
      const teamB = assignments.teamB?.length ? assignments.teamB : game.teamB ?? []
      const playerIds = [...new Set([...game.playerIds, ...teamA, ...teamB])]
      return {
        ...game,
        status: 'past',
        scoreA: Number(finalData.scoreA),
        scoreB: Number(finalData.scoreB),
        teamA,
        teamB,
        playerIds,
        playerStats: finalData.playerStats,
      }
    }))

    if (assignments.teamA?.length && assignments.teamB?.length) {
      setTsRatings(prev => processGameResult(prev, assignments.teamA, assignments.teamB, winner))
    }
  }

  const handleUpdateLocation = (locationId, patch) => {
    if (!canManageFields(user)) return
    setLocations(prev => prev.map(location =>
      location.id === locationId ? { ...location, ...patch } : location
    ))
  }

  // ratings: { [gameId]: { [ratedPlayerId]: { [raterId]: score } } }
  const handleRate = (gameId, ratedPlayerId, score) => {
    setRatings(prev => ({
      ...prev,
      [gameId]: {
        ...(prev[gameId] ?? {}),
        [ratedPlayerId]: {
          ...(prev[gameId]?.[ratedPlayerId] ?? {}),
          [user.id]: score,
        },
      },
    }))
    persistOrWarn(() => saveRating(gameId, ratedPlayerId, user.id, score))
  }

  if (!user) {
    return <Login players={players} onLogin={handleLogin} />
  }

  const pageProps = {
    user, players, games, ratings,
    locations,
    tsRatings,
    onRsvp: handleRsvp, setView,
    onViewPlayer: setViewPlayer,
    onOpenManager: handleOpenManager,
    teamAssignments, publishedGames,
    dataSource,
  }

  return (
    <div className="app">
      <button
        className="menu-btn"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar
        user={user}
        view={view}
        setView={setView}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenProfile={() => setViewPlayer(user)}
        userPic={userPics[user?.id] ?? null}
      />

      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main">
        {view === 'dashboard' && <Dashboard {...pageProps} onOpenModal={setModalGame} />}
        {view === 'find'      && <FindMatches {...pageProps} />}
        {view === 'mygames'   && <MyGames  {...pageProps} onOpenModal={setModalGame} />}
        {view === 'mystats'   && <MyStats  {...pageProps} onOpenModal={setModalGame} />}
        {view === 'players'   && <Players  {...pageProps} />}
        {view === 'stats'     && <Stats    {...pageProps} />}
        {view === 'payments'  && <Payments {...pageProps} />}
        {view === 'operations' && (
          <Operations
            {...pageProps}
            onSaveGame={handleSaveGame}
            onFinalizeGame={handleFinalizeGame}
            onUpdateLocation={handleUpdateLocation}
          />
        )}
      </div>

      {modalGame && (
        <GameModal
          game={modalGame}
          players={players}
          locations={locations}
          user={user}
          ratings={ratings}
          onRate={handleRate}
          onClose={() => setModalGame(null)}
          onViewPlayer={setViewPlayer}
          feedback={gameFeedback[modalGame?.id]}
          onSaveFeedback={handleSaveFeedback}
        />
      )}

      {managerGame && (
        <MatchManager
          game={managerGame}
          players={players}
          locations={locations}
          user={user}
          assignments={teamAssignments[managerGame.id]}
          published={publishedGames.has(managerGame.id)}
          tsRatings={tsRatings}
          onAutoBalance={handleAutoBalance}
          onSwap={handleSwapPlayer}
          onAssign={handleAssignPlayer}
          onTogglePublish={handleTogglePublish}
          onClose={() => setManagerGame(null)}
        />
      )}

      {viewPlayer && (
        <ProfileModal
          player={viewPlayer}
          isOwn={viewPlayer.id === user?.id}
          bio={userBios[viewPlayer.id] ?? viewPlayer.bio}
          pic={userPics[viewPlayer.id] ?? viewPlayer.avatarDataUrl}
          tsRating={tsRatings[viewPlayer.id]}
          onSaveBio={handleSaveBio}
          onSavePic={handleSavePic}
          onClose={() => setViewPlayer(null)}
        />
      )}
    </div>
  )
}
