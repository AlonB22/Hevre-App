import { useState } from 'react'
import { Medal, Shield, Target, Trophy } from 'lucide-react'
import { initials, avatarColor } from '../data'

const TABS = [
  { id: 'goals',        label: 'Top Scorers',  icon: Target,  key: 'goals'        },
  { id: 'assists',      label: 'Assisters',    icon: Trophy,  key: 'assists'       },
  { id: 'rating',       label: 'Best Rated',   icon: Medal,   key: 'rating'        },
  { id: 'cleanSheets',  label: 'Goalkeepers',  icon: Shield,  key: 'cleanSheets'   },
]

const LABEL = { goals: 'Goals', assists: 'Assists', rating: 'Rating', cleanSheets: 'Clean Sheets' }

export default function Stats({ players }) {
  const [tab, setTab] = useState('goals')

  const current = TABS.find(t => t.id === tab)

  const sorted = [...players]
    .filter(p => {
      if (tab === 'cleanSheets') return p.position === 'GK'
      return true
    })
    .sort((a, b) => b[current.key] - a[current.key])

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>Leaderboard</h1>
          <p>Season rankings across all community players</p>
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              className={`tab-btn${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="card lb-card">
        <div className="lb-hdr">
          <span>#</span>
          <span>Player</span>
          <span>Position</span>
          <span>Games</span>
          <span>{LABEL[tab]}</span>
        </div>
        {sorted.map((p, i) => (
          <div
            key={p.id}
            className={`lb-row${i === 0 ? ' gold' : ''}`}
          >
            <div className={`lb-rank${i === 0 ? ' r1' : i === 1 ? ' r2' : i === 2 ? ' r3' : ''}`}>
              {i + 1}
            </div>
            <div className="lb-plr">
              <div className="lb-av" style={{ background: avatarColor(p.id) }}>
                {initials(p.name)}
              </div>
              <div>
                <strong>{p.name}</strong>
                <span>{p.neighborhood}</span>
              </div>
            </div>
            <div className="lb-pos">{p.position}</div>
            <div className="lb-gp">{p.gamesPlayed}</div>
            <div className="lb-val">
              <strong>{p[current.key]}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
