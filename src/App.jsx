import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { PLAYERS, GAMES, INITIAL_RATINGS, autoBalance } from './data'
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

export default function App() {
  const [user,        setUser]        = useState(null)
  const [view,        setView]        = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [games,       setGames]       = useState(GAMES)
  const [players]                     = useState(PLAYERS)
  const [ratings,     setRatings]     = useState(INITIAL_RATINGS)
  const [modalGame,   setModalGame]   = useState(null)
  const [viewPlayer,      setViewPlayer]      = useState(null)
  const [userBios,        setUserBios]        = useState({})
  const [userPics,        setUserPics]        = useState({})
  const [managerGame,     setManagerGame]     = useState(null)
  const [gameFeedback,    setGameFeedback]    = useState({})

  // Pre-balance every upcoming game that has players, so teams are always ready
  const [teamAssignments, setTeamAssignments] = useState(() => {
    const result = {}
    for (const game of GAMES.filter(g => g.status === 'upcoming' && g.playerIds.length >= 2)) {
      const gamePlayers = game.playerIds.map(id => PLAYERS.find(p => p.id === id)).filter(Boolean)
      const { teamA, teamB } = autoBalance(gamePlayers)
      result[game.id] = { teamA: teamA.map(p => p.id), teamB: teamB.map(p => p.id) }
    }
    return result
  })

  // Pre-publish the three biggest group games so players can see teams on first load
  const [publishedGames,  setPublishedGames]  = useState(() => new Set([1, 3, 11]))

  const handleLogin  = (player) => { setUser(player); setView('dashboard') }
  const handleLogout = () => { setUser(null); setSidebarOpen(false); setViewPlayer(null) }

  const handleSaveBio = (bio) => setUserBios(prev => ({ ...prev, [user.id]: bio }))
  const handleSavePic = (pic) => setUserPics(prev => ({ ...prev, [user.id]: pic }))

  const handleOpenManager = (game) => {
    setManagerGame(game)
  }

  const handleAutoBalance = (gameId) => {
    const game = games.find(g => g.id === gameId)
    const gamePlayers = game.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean)
    const { teamA, teamB } = autoBalance(gamePlayers)
    setTeamAssignments(prev => ({
      ...prev,
      [gameId]: { teamA: teamA.map(p => p.id), teamB: teamB.map(p => p.id) },
    }))
  }

  const handleSwapPlayer = (gameId, playerId, fromTeam) => {
    setTeamAssignments(prev => {
      const cur = prev[gameId] ?? { teamA: [], teamB: [] }
      return {
        ...prev,
        [gameId]: {
          teamA: fromTeam === 'A'
            ? cur.teamA.filter(id => id !== playerId)
            : [...cur.teamA, playerId],
          teamB: fromTeam === 'B'
            ? cur.teamB.filter(id => id !== playerId)
            : [...cur.teamB, playerId],
        },
      }
    })
  }

  const handleAssignPlayer = (gameId, playerId, toTeam) => {
    setTeamAssignments(prev => {
      const cur = prev[gameId] ?? { teamA: [], teamB: [] }
      return {
        ...prev,
        [gameId]: {
          teamA: toTeam === 'A' ? [...cur.teamA, playerId] : cur.teamA,
          teamB: toTeam === 'B' ? [...cur.teamB, playerId] : cur.teamB,
        },
      }
    })
  }

  const handleTogglePublish = (gameId) => {
    setPublishedGames(prev => {
      const next = new Set(prev)
      next.has(gameId) ? next.delete(gameId) : next.add(gameId)
      return next
    })
  }

  const handleSaveFeedback = (gameId, feedback) => {
    setGameFeedback(prev => ({ ...prev, [gameId]: feedback }))
  }

  const handleRsvp = (gameId, joining) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g
      const playerIds = joining
        ? [...g.playerIds, user.id]
        : g.playerIds.filter(id => id !== user.id)
      return { ...g, playerIds }
    }))
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
  }

  if (!user) {
    return <Login players={players} onLogin={handleLogin} />
  }

  const pageProps = {
    user, players, games, ratings,
    onRsvp: handleRsvp, setView,
    onViewPlayer: setViewPlayer,
    onOpenManager: handleOpenManager,
    teamAssignments, publishedGames,
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
      </div>

      {modalGame && (
        <GameModal
          game={modalGame}
          players={players}
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
          user={user}
          assignments={teamAssignments[managerGame.id]}
          published={publishedGames.has(managerGame.id)}
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
          bio={userBios[viewPlayer.id]}
          pic={userPics[viewPlayer.id]}
          onSaveBio={handleSaveBio}
          onSavePic={handleSavePic}
          onClose={() => setViewPlayer(null)}
        />
      )}
    </div>
  )
}
