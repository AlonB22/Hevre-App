import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { DEMO_PASSWORD, isDemoPasswordConfigured } from '../data'

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF']

const EMPTY_FORM = {
  name: '',
  email: '',
  position: 'CM',
  neighborhood: '',
  password: '',
  confirmPassword: '',
}

export default function Signup({ players, onSignup, onSignedUp }) {
  const [form, setForm]   = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const email = form.email.trim().toLowerCase()
    const name = form.name.trim()
    const neighborhood = form.neighborhood.trim()

    if (!name || !email || !neighborhood) {
      setError('Please fill in all signup fields.')
      return
    }
    if (players.some(player => player.email === email)) {
      setError('An account with that email already exists.')
      return
    }
    if (!isDemoPasswordConfigured) {
      setError('Demo password is not configured. Set VITE_DEMO_PASSWORD.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password !== DEMO_PASSWORD) {
      setError('Use the configured demo password to create a profile.')
      return
    }

    const result = onSignup?.({
      name,
      email,
      position: form.position,
      neighborhood,
    })

    if (result?.error) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    if (result?.player) onSignedUp?.(result.player)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        Full name
        <input
          type="text"
          value={form.name}
          placeholder="Your name"
          required
          onChange={event => update('name', event.target.value)}
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={form.email}
          placeholder="name@example.com"
          required
          onChange={event => update('email', event.target.value)}
        />
      </label>

      <div className="signup-grid">
        <label>
          Position
          <select
            value={form.position}
            onChange={event => update('position', event.target.value)}
          >
            {POSITIONS.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </label>

        <label>
          Neighborhood
          <input
            type="text"
            value={form.neighborhood}
            placeholder="Ramat Gan"
            required
            onChange={event => update('neighborhood', event.target.value)}
          />
        </label>
      </div>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          placeholder="password"
          required
          onChange={event => update('password', event.target.value)}
        />
      </label>

      <label>
        Confirm password
        <input
          type="password"
          value={form.confirmPassword}
          placeholder="Repeat password"
          required
          onChange={event => update('confirmPassword', event.target.value)}
        />
      </label>

      {error && <div className="login-err">{error}</div>}

      <button type="submit" className="login-submit">
        Create Account <ChevronRight size={16} />
      </button>
    </form>
  )
}
