import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from '../App'
import Dashboard from '../components/Dashboard'
import FindMatches from '../components/FindMatches'
import GameModal from '../components/GameModal'
import Login from '../components/Login'
import MatchManager from '../components/MatchManager'
import Payments from '../components/Payments'
import { GAMES, LOCATIONS, PLAYERS } from '../data'

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      remove: vi.fn(),
      flyTo: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    divIcon: vi.fn(options => options),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
  },
}))

describe('login flow', () => {
  it('logs in with configured demo credentials', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: PLAYERS[0].email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test-demo-password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('heading', { name: /Welcome back, Alon/i })).toBeInTheDocument()
  })

  it('signs up a new player and opens the dashboard', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('tab', { name: /sign up/i }))
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Maya Cohen' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'maya@footy.app' } })
    fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'ST' } })
    fireEvent.change(screen.getByLabelText(/neighborhood/i), { target: { value: 'Ramat Gan' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'test-demo-password' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'test-demo-password' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByRole('heading', { name: /Welcome back, Maya/i })).toBeInTheDocument()
  })

  it('shows an error for a wrong demo password', () => {
    const onLogin = vi.fn()
    render(<Login players={PLAYERS} onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: PLAYERS[0].email } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong-password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Wrong password.')).toBeInTheDocument()
    expect(onLogin).not.toHaveBeenCalled()
  })
})

describe('RSVP flow', () => {
  it('lets a user join and leave a dashboard game', () => {
    function DashboardHarness() {
      const user = PLAYERS.find(player => player.id === 1)
      const [games, setGames] = useState([
        {
          id: 9901,
          title: 'Stateful RSVP Game',
          status: 'upcoming',
          locationId: 1,
          date: '2026-07-04',
          time: '20:00',
          format: '5v5',
          playerIds: [2, 3],
          spotsTotal: 10,
          pricePerPlayer: 30,
        },
      ])
      const handleRsvp = (gameId, joining) => {
        setGames(prev => prev.map(game => {
          if (game.id !== gameId) return game
          return {
            ...game,
            playerIds: joining
              ? [...game.playerIds, user.id]
              : game.playerIds.filter(id => id !== user.id),
          }
        }))
      }

      return (
        <Dashboard
          user={user}
          games={games}
          players={PLAYERS}
          locations={LOCATIONS}
          onRsvp={handleRsvp}
          setView={vi.fn()}
          onViewPlayer={vi.fn()}
        />
      )
    }

    render(<DashboardHarness />)

    fireEvent.click(screen.getByRole('button', { name: /I'm in/i }))
    expect(screen.getByRole('button', { name: /You're in/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /You're in/i }))
    expect(screen.getByRole('button', { name: /I'm in/i })).toBeInTheDocument()
  })
})

describe('payment display', () => {
  it('shows owed, collectible, and paid-history amounts', () => {
    const user = PLAYERS.find(player => player.id === 1)
    const players = PLAYERS.slice(0, 4)
    const games = [
      {
        id: 9001,
        title: 'Unpaid player game',
        status: 'upcoming',
        locationId: 1,
        date: '2026-07-01',
        playerIds: [1, 2],
        paidIds: [2],
        organizerId: 2,
        pricePerPlayer: 40,
      },
      {
        id: 9002,
        title: 'Organizer collection game',
        status: 'upcoming',
        locationId: 2,
        date: '2026-07-02',
        playerIds: [1, 2, 3],
        paidIds: [1],
        organizerId: 1,
        pricePerPlayer: 50,
      },
      {
        id: 9003,
        title: 'Paid history game',
        status: 'past',
        locationId: 3,
        date: '2026-06-01',
        playerIds: [1],
        paidIds: [1],
        organizerId: 2,
        pricePerPlayer: 30,
      },
    ]

    render(<Payments user={user} games={games} players={players} locations={LOCATIONS} />)

    expect(screen.getByRole('heading', { name: 'I Owe' }).closest('.card')).toHaveTextContent('₪40')
    expect(screen.getByRole('heading', { name: 'To Collect' }).closest('.card')).toHaveTextContent('₪100')
    expect(screen.getByRole('heading', { name: 'Payment History' }).closest('.card')).toHaveTextContent('Total paid: ₪80')
    expect(screen.getAllByText('Organizer collection game')).toHaveLength(2)
  })
})

describe('team publish visibility', () => {
  const game = {
    ...GAMES.find(item => item.id === 1),
    teamA: [1, 3],
    teamB: [2, 4],
  }
  const user = PLAYERS.find(player => player.id === 5)
  const baseProps = {
    game,
    players: PLAYERS,
    locations: LOCATIONS,
    user,
    assignments: { teamA: [1, 3], teamB: [2, 4] },
    tsRatings: {},
    onAutoBalance: vi.fn(),
    onSwap: vi.fn(),
    onAssign: vi.fn(),
    onTogglePublish: vi.fn(),
    onClose: vi.fn(),
  }

  it('hides draft teams from regular players', () => {
    render(<MatchManager {...baseProps} published={false} />)

    expect(screen.getByText(/Teams haven't been published yet/i)).toBeInTheDocument()
    expect(screen.queryByText('Team A')).not.toBeInTheDocument()
  })

  it('shows published teams to regular players', () => {
    render(<MatchManager {...baseProps} published />)

    expect(screen.getByText('Teams Live')).toBeInTheDocument()
    expect(screen.getAllByText('Team A').length).toBeGreaterThan(0)
    expect(screen.getByText('Alon')).toBeInTheDocument()
  })
})

describe('rating submission', () => {
  it('submits a player rating from the game modal', () => {
    const onRate = vi.fn()
    const game = GAMES.find(item => item.id === 101)

    render(
      <GameModal
        game={game}
        players={PLAYERS}
        locations={LOCATIONS}
        user={PLAYERS.find(player => player.id === 1)}
        ratings={{}}
        onRate={onRate}
        onClose={vi.fn()}
        onViewPlayer={vi.fn()}
      />
    )

    fireEvent.click(screen.getAllByRole('button', { name: '9' })[0])

    expect(onRate).toHaveBeenCalledWith(101, 3, 9)
  })
})

describe('match filtering', () => {
  it('filters matches by format, surface, and open spots', () => {
    const onRsvp = vi.fn()
    const user = PLAYERS.find(player => player.id === 1)
    const games = [
      {
        id: 9101,
        title: 'Open Turf 5v5',
        status: 'upcoming',
        locationId: 1,
        date: '2026-07-01',
        time: '20:00',
        format: '5v5',
        playerIds: [2, 3],
        spotsTotal: 10,
        pricePerPlayer: 25,
      },
      {
        id: 9102,
        title: 'Full Turf 5v5',
        status: 'upcoming',
        locationId: 1,
        date: '2026-07-02',
        time: '20:00',
        format: '5v5',
        playerIds: [1, 2],
        spotsTotal: 2,
        pricePerPlayer: 25,
      },
      {
        id: 9103,
        title: 'Open Grass 7v7',
        status: 'upcoming',
        locationId: 2,
        date: '2026-07-03',
        time: '20:00',
        format: '7v7',
        playerIds: [2],
        spotsTotal: 14,
        pricePerPlayer: 35,
      },
    ]

    render(<FindMatches user={user} games={games} locations={LOCATIONS} onRsvp={onRsvp} />)

    expect(screen.getByText('Open Turf 5v5')).toBeInTheDocument()
    expect(screen.getByText('Full Turf 5v5')).toBeInTheDocument()
    expect(screen.getByText('Open Grass 7v7')).toBeInTheDocument()

    fireEvent.change(screen.getByDisplayValue('All formats'), { target: { value: '5v5' } })
    expect(screen.queryByText('Open Grass 7v7')).not.toBeInTheDocument()

    fireEvent.change(screen.getByDisplayValue('Any surface'), { target: { value: 'turf' } })
    expect(screen.getByText('Open Turf 5v5')).toBeInTheDocument()
    expect(screen.getByText('Full Turf 5v5')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Open spots only/i }))
    expect(screen.getByText('Open Turf 5v5')).toBeInTheDocument()
    expect(screen.queryByText('Full Turf 5v5')).not.toBeInTheDocument()

    fireEvent.click(within(screen.getByText('Open Turf 5v5').closest('.game-card')).getByRole('button', { name: /I'm in/i }))
    expect(onRsvp).toHaveBeenCalledWith(9101, true)
  })
})
