import { describe, it, expect } from 'vitest'
import {
  PLAYERS, GAMES, LOCATIONS, INITIAL_RATINGS, PASSWORD,
  avatarColor, initials, formatDate, spotsLeft, fieldIcon,
} from '../data'

// ─── Utility functions ───────────────────────────────────────────────

describe('initials()', () => {
  it('extracts two initials from a full name', () => {
    expect(initials('Alon Berla')).toBe('AB')
  })
  it('handles single-word names gracefully', () => {
    expect(initials('Ronaldo')).toBe('R')
  })
  it('caps output at 2 characters', () => {
    expect(initials('Alon Ben David Levi')).toBe('AB')
  })
  it('always returns uppercase', () => {
    expect(initials('john doe')).toBe('JD')
  })
})

describe('avatarColor()', () => {
  it('returns a hex colour string', () => {
    expect(avatarColor(1)).toMatch(/^#[0-9a-f]{6}$/i)
  })
  it('cycles — id 1 and id 9 share the same colour (8-slot cycle)', () => {
    expect(avatarColor(1)).toBe(avatarColor(9))
  })
  it('id 1 and id 2 produce different colours', () => {
    expect(avatarColor(1)).not.toBe(avatarColor(2))
  })
})

describe('spotsLeft()', () => {
  it('returns correct spots available', () => {
    const game = { spotsTotal: 14, playerIds: [1, 2, 3, 4] }
    expect(spotsLeft(game)).toBe(10)
  })
  it('returns 0 when game is full', () => {
    const game = { spotsTotal: 5, playerIds: [1, 2, 3, 4, 5] }
    expect(spotsLeft(game)).toBe(0)
  })
  it('returns 0 (not negative) when over-subscribed', () => {
    const game = { spotsTotal: 2, playerIds: [1, 2, 3] }
    expect(spotsLeft(game)).toBe(0)
  })
})

describe('formatDate()', () => {
  it('returns a human-readable string for a known date', () => {
    const result = formatDate('2026-05-19')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(4)
  })
  it('includes the day name', () => {
    // 2026-05-19 is a Tuesday
    const result = formatDate('2026-05-19')
    expect(result).toMatch(/tue/i)
  })
})

describe('fieldIcon()', () => {
  it('returns turf icon for turf', () => {
    expect(fieldIcon('turf')).toBe('🟩')
  })
  it('returns grass icon for grass', () => {
    expect(fieldIcon('grass')).toBe('🌿')
  })
  it('returns indoor icon for indoor', () => {
    expect(fieldIcon('indoor')).toBe('🏢')
  })
  it('returns sand icon for sand/beach', () => {
    expect(fieldIcon('sand')).toBe('🏖️')
  })
  it('falls back to ⚽ for unknown surface types', () => {
    expect(fieldIcon('astroturf')).toBe('⚽')
    expect(fieldIcon(undefined)).toBe('⚽')
  })
})

// ─── Data integrity ──────────────────────────────────────────────────

describe('PASSWORD', () => {
  it('is set to footy123', () => {
    expect(PASSWORD).toBe('footy123')
  })
})

describe('PLAYERS array', () => {
  it('has exactly 30 players', () => {
    expect(PLAYERS).toHaveLength(30)
  })
  it('every player has a unique id', () => {
    const ids = PLAYERS.map(p => p.id)
    expect(new Set(ids).size).toBe(30)
  })
  it('every player has all required fields', () => {
    const required = ['id','name','username','email','position','rating','goals','assists','gamesPlayed','neighborhood']
    for (const p of PLAYERS) {
      for (const field of required) {
        expect(p, `player ${p.id} missing "${field}"`).toHaveProperty(field)
      }
    }
  })
  it('ratings are numeric and between 1 and 10', () => {
    for (const p of PLAYERS) {
      expect(p.rating, `player ${p.id} rating out of range`).toBeGreaterThanOrEqual(1)
      expect(p.rating, `player ${p.id} rating out of range`).toBeLessThanOrEqual(10)
    }
  })
  it('goals and assists are non-negative integers', () => {
    for (const p of PLAYERS) {
      expect(p.goals).toBeGreaterThanOrEqual(0)
      expect(p.assists).toBeGreaterThanOrEqual(0)
    }
  })
  it('10 players have a bio field', () => {
    const withBio = PLAYERS.filter(p => p.bio && p.bio.trim().length > 0)
    expect(withBio.length).toBeGreaterThanOrEqual(10)
  })
  it('no duplicate emails', () => {
    const emails = PLAYERS.map(p => p.email)
    expect(new Set(emails).size).toBe(30)
  })
})

describe('LOCATIONS array', () => {
  it('has at least 10 locations', () => {
    expect(LOCATIONS.length).toBeGreaterThanOrEqual(10)
  })
  it('every location has lat/lng in the Tel Aviv metro range', () => {
    for (const loc of LOCATIONS) {
      expect(loc.lat, `${loc.name} lat out of range`).toBeGreaterThan(31.5)
      expect(loc.lat, `${loc.name} lat out of range`).toBeLessThan(33)
      expect(loc.lng, `${loc.name} lng out of range`).toBeGreaterThan(34.5)
      expect(loc.lng, `${loc.name} lng out of range`).toBeLessThan(35.5)
    }
  })
  it('surface types are valid', () => {
    const valid = new Set(['turf','grass','indoor','sand'])
    for (const loc of LOCATIONS) {
      expect(valid.has(loc.type), `${loc.name} has invalid type "${loc.type}"`).toBe(true)
    }
  })
})

describe('GAMES array', () => {
  const past     = GAMES.filter(g => g.status === 'past')
  const upcoming = GAMES.filter(g => g.status === 'upcoming')

  it('has at least 3 past games', () => {
    expect(past.length).toBeGreaterThanOrEqual(3)
  })
  it('has at least 5 upcoming games', () => {
    expect(upcoming.length).toBeGreaterThanOrEqual(5)
  })
  it('every game references a valid locationId', () => {
    const locIds = new Set(LOCATIONS.map(l => l.id))
    for (const g of GAMES) {
      expect(locIds.has(g.locationId), `game ${g.id} has invalid locationId ${g.locationId}`).toBe(true)
    }
  })
  it('every game references valid playerIds (all exist in PLAYERS)', () => {
    const playerIds = new Set(PLAYERS.map(p => p.id))
    for (const g of GAMES) {
      for (const pid of g.playerIds) {
        expect(playerIds.has(pid), `game ${g.id} references unknown player ${pid}`).toBe(true)
      }
    }
  })
  it('past games have a score', () => {
    for (const g of past) {
      expect(g, `past game ${g.id} missing scoreA`).toHaveProperty('scoreA')
      expect(g, `past game ${g.id} missing scoreB`).toHaveProperty('scoreB')
    }
  })
  it('past games have playerStats for at least one player', () => {
    for (const g of past) {
      expect(g.playerStats, `past game ${g.id} has no playerStats`).toBeTruthy()
      expect(Object.keys(g.playerStats).length).toBeGreaterThan(0)
    }
  })
  it('playerCount never exceeds spotsTotal for upcoming games', () => {
    for (const g of upcoming) {
      expect(
        g.playerIds.length,
        `game "${g.title}" is over-subscribed`
      ).toBeLessThanOrEqual(g.spotsTotal)
    }
  })
  it('game ids are unique', () => {
    const ids = GAMES.map(g => g.id)
    expect(new Set(ids).size).toBe(GAMES.length)
  })
})

describe('INITIAL_RATINGS', () => {
  it('has ratings for all 3 past games', () => {
    expect(Object.keys(INITIAL_RATINGS)).toHaveLength(3)
  })
  it('all rater ids exist in PLAYERS', () => {
    const playerIds = new Set(PLAYERS.map(p => p.id))
    for (const [, playerMap] of Object.entries(INITIAL_RATINGS)) {
      for (const [, raterMap] of Object.entries(playerMap)) {
        for (const raterId of Object.keys(raterMap)) {
          expect(playerIds.has(Number(raterId)), `unknown rater id ${raterId}`).toBe(true)
        }
      }
    }
  })
  it('all score values are between 1 and 10', () => {
    for (const [, playerMap] of Object.entries(INITIAL_RATINGS)) {
      for (const [, raterMap] of Object.entries(playerMap)) {
        for (const score of Object.values(raterMap)) {
          expect(score).toBeGreaterThanOrEqual(1)
          expect(score).toBeLessThanOrEqual(10)
        }
      }
    }
  })
})
