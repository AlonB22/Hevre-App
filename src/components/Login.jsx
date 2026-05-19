import { useState } from 'react'
import { ChevronRight, Zap } from 'lucide-react'
import { PLAYERS, PASSWORD, initials, avatarColor } from '../data'

const QUICK = [
  { id: 1,  sub: 'CAM · Ramat Gan' },
  { id: 2,  sub: 'GK · Tel Aviv'   },
  { id: 3,  sub: 'ST · Givatayim'  },
]

export default function Login({ players, onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const prefill = (playerId) => {
    const p = players.find(x => x.id === playerId)
    if (p) { setEmail(p.email); setPassword(PASSWORD); setError('') }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const p = players.find(x => x.email === email.trim().toLowerCase())
    if (!p)              { setError('No account found with that email.'); return }
    if (password !== PASSWORD) { setError('Wrong password — use: footy123'); return }
    onLogin(p)
  }

  return (
    <div className="login">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-logo-wrap">
          <div className="login-logo">F</div>
          <h1>Footy</h1>
          <p>Your neighborhood soccer community, upgraded.</p>
        </div>
        <div className="login-metrics">
          <div><strong>30</strong><span>Players</span></div>
          <div><strong>15+</strong><span>Games</span></div>
          <div><strong>5</strong><span>Cities</span></div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-box">
          <h2>Sign in</h2>
          <p className="login-sub">Step onto the pitch.</p>

          <span className="ql-label">Quick demo — sign in as</span>
          <div className="ql-grid">
            {QUICK.map(q => {
              const p = players.find(x => x.id === q.id)
              return (
                <button key={q.id} className="ql-btn" onClick={() => prefill(q.id)}>
                  <div className="ql-avatar" style={{ background: avatarColor(q.id) }}>
                    {initials(p.name)}
                  </div>
                  <div>
                    <strong>{p.name}</strong>
                    <span>{q.sub}</span>
                  </div>
                  <Zap size={13} />
                </button>
              )
            })}
          </div>

          <div className="divider"><span>or enter credentials</span></div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                placeholder="alon@hevre.app"
                required
                onChange={e => { setEmail(e.target.value); setError('') }}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                placeholder="hevre123"
                required
                onChange={e => { setPassword(e.target.value); setError('') }}
              />
            </label>
            {error && <div className="login-err">{error}</div>}
            <button type="submit" className="login-submit">
              Sign In <ChevronRight size={16} />
            </button>
          </form>

          <p className="login-hint">
            All 30 accounts use password: <code>footy123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
