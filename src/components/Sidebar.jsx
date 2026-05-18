import {
  Activity, CalendarDays, CircleDollarSign, Home, LogOut,
  Search, Trophy, Users,
} from 'lucide-react'
import { initials, avatarColor } from '../data'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',    icon: Home              },
  { id: 'find',      label: 'Find Matches', icon: Search            },
  { id: 'mygames',   label: 'My Games',     icon: CalendarDays      },
  { id: 'mystats',   label: 'My Stats',     icon: Activity          },
  { id: 'players',   label: 'Players',      icon: Users             },
  { id: 'stats',     label: 'Leaderboard',  icon: Trophy            },
  { id: 'payments',  label: 'Payments',     icon: CircleDollarSign  },
]

export default function Sidebar({ user, view, setView, open, onClose, onLogout }) {
  const goTo = (id) => { setView(id); onClose() }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sb-brand">
        <div className="sb-logo">F</div>
        <div className="sb-brand-txt">
          <strong>Footy</strong>
          <span>Soccer Community</span>
        </div>
      </div>

      <div className="sb-user">
        <div
          className="sb-avatar"
          style={{ background: avatarColor(user.id) }}
        >
          {initials(user.name)}
        </div>
        <div className="sb-user-info">
          <strong>{user.name}</strong>
          <span>{user.position} · {user.neighborhood}</span>
        </div>
      </div>

      <nav className="sb-nav">
        {NAV.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item${view === item.id ? ' active' : ''}`}
              onClick={() => goTo(item.id)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="sb-stats">
        <div>
          <strong>{user.rating}</strong>
          <span>Rating</span>
        </div>
        <div>
          <strong>{user.goals}</strong>
          <span>Goals</span>
        </div>
        <div>
          <strong>{user.assists}</strong>
          <span>Assists</span>
        </div>
      </div>

      <button className="sb-logout" onClick={onLogout}>
        <LogOut size={15} />
        Sign out
      </button>
    </aside>
  )
}
