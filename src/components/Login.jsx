import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { DEMO_PASSWORD, isDemoPasswordConfigured } from '../data'
import Signup from './Signup'

export default function Login({ players, onLogin, onSignup }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [mode, setMode]         = useState('signin')

  const handleSubmit = (e) => {
    e.preventDefault()
    const p = players.find(x => x.email === email.trim().toLowerCase())
    if (!p)              { setError('No account found with that email.'); return }
    if (!isDemoPasswordConfigured) { setError('Demo password is not configured. Set VITE_DEMO_PASSWORD.'); return }
    if (password !== DEMO_PASSWORD) { setError('Wrong password.'); return }
    onLogin(p)
  }

  return (
    <div className="login">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-logo-wrap">
          <div className="login-logo" role="img" aria-label="Footy soccer ball logo">
            <img src="/football-ball.png" alt="" className="soccer-ball-img" aria-hidden="true" />
          </div>
          <h1>Footy</h1>
          <p>Your neighborhood soccer community, upgraded.</p>
        </div>
        <div className="login-metrics">
          <div><strong>45</strong><span>Players</span></div>
          <div><strong>15+</strong><span>Games</span></div>
          <div><strong>5</strong><span>Cities</span></div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-box">
          <h2>Sign in</h2>
          <p className="login-sub">Step onto the pitch.</p>

          <div className="auth-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === 'signin' ? 'active' : ''}
              onClick={() => { setMode('signin'); setError('') }}
              role="tab"
              aria-selected={mode === 'signin'}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => { setMode('signup'); setError('') }}
              role="tab"
              aria-selected={mode === 'signup'}
            >
              Sign up
            </button>
          </div>

          {mode === 'signin' ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  required
                  onChange={e => { setEmail(e.target.value); setError('') }}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  placeholder="password"
                  required
                  onChange={e => { setPassword(e.target.value); setError('') }}
                />
              </label>
              {error && <div className="login-err">{error}</div>}
              <button type="submit" className="login-submit">
                Sign In <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            <Signup
              players={players}
              onSignup={onSignup}
              onSignedUp={(player) => {
                setEmail(player.email)
                setPassword('')
                setMode('signin')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
