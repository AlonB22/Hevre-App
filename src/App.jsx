import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { PLAYERS, GAMES, INITIAL_RATINGS } from './data'
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

export default function App() {
  const [user,        setUser]        = useState(null)
  const [view,        setView]        = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [games,       setGames]       = useState(GAMES)
  const [players]                     = useState(PLAYERS)
  const [ratings,     setRatings]     = useState(INITIAL_RATINGS)
  const [modalGame,   setModalGame]   = useState(null)
  const [viewPlayer,  setViewPlayer]  = useState(null)
  const [userBios,    setUserBios]    = useState({})
  const [userPics,    setUserPics]    = useState({})

  const handleLogin  = (player) => { setUser(player); setView('dashboard') }
  const handleLogout = () => { setUser(null); setSidebarOpen(false); setViewPlayer(null) }

  const handleSaveBio = (bio) => setUserBios(prev => ({ ...prev, [user.id]: bio }))
  const handleSavePic = (pic) => setUserPics(prev => ({ ...prev, [user.id]: pic }))

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

  const pageProps = { user, players, games, ratings, onRsvp: handleRsvp, setView, onViewPlayer: setViewPlayer }

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
