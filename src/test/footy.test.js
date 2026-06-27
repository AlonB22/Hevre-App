import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  PLAYERS, GAMES, LOCATIONS, INITIAL_RATINGS, DEMO_PASSWORD, isDemoPasswordConfigured,
  avatarColor, initials, formatDate, spotsLeft, fieldIcon,
} from '../data'
import {
  initialRating, displayRating, conservativeScore,
  certaintyLabel, matchQuality, autoBalanceTS, buildInitialRatings,
} from '../trueskill'
import {
  ROLES, canManageFields, canManageGame, isMunicipalityAdmin, isOrganizer, roleLabel,
} from '../roles'

const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))

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

describe('demo password', () => {
  it('is loaded from Vite environment, not a source literal', () => {
    expect(DEMO_PASSWORD).toBe('test-demo-password')
    expect(isDemoPasswordConfigured).toBe(true)
  })
})

describe('Footy branding', () => {
  it('uses Footy package identity', () => {
    expect(packageJson.name).toBe('footy')
  })
})

describe('PLAYERS array', () => {
  it('has exactly 45 players', () => {
    expect(PLAYERS).toHaveLength(45)
  })
  it('every player has a unique id', () => {
    const ids = PLAYERS.map(p => p.id)
    expect(new Set(ids).size).toBe(45)
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
    expect(new Set(emails).size).toBe(45)
  })
  it('uses the Footy demo email domain for every player', () => {
    for (const player of PLAYERS) {
      expect(player.email).toMatch(/@footy\.app$/)
    }
  })
  it('all organizerIds point to organizer-capable users', () => {
    for (const game of GAMES) {
      const organizer = PLAYERS.find(p => p.id === game.organizerId)
      expect(isOrganizer(organizer), `game ${game.id} organizer lacks role`).toBe(true)
    }
  })
})

describe('roles', () => {
  const player = PLAYERS.find(p => !p.role)
  const organizer = PLAYERS.find(p => p.role === ROLES.ORGANIZER)
  const municipalityAdmin = PLAYERS.find(p => p.role === ROLES.MUNICIPALITY_ADMIN)
  const organizerGame = GAMES.find(g => g.organizerId === organizer.id)
  const otherGame = GAMES.find(g => g.organizerId !== organizer.id)

  it('defaults users without role metadata to player', () => {
    expect(roleLabel(player.role)).toBe('Player')
    expect(isOrganizer(player)).toBe(false)
    expect(canManageFields(player)).toBe(false)
  })

  it('lets organizers manage only their own games', () => {
    expect(canManageGame(organizer, organizerGame)).toBe(true)
    expect(canManageGame(organizer, otherGame)).toBe(false)
  })

  it('lets municipality/admin users manage fields and any game', () => {
    expect(isMunicipalityAdmin(municipalityAdmin)).toBe(true)
    expect(canManageFields(municipalityAdmin)).toBe(true)
    expect(canManageGame(municipalityAdmin, otherGame)).toBe(true)
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

describe('TrueSkill', () => {
  const veteran  = PLAYERS.find(p => p.gamesPlayed >= 25)   // e.g. Alon (28 games)
  const newcomer = PLAYERS.find(p => p.gamesPlayed <= 8)    // e.g. Liron (6 games)

  it('initialRating gives veterans lower sigma than newcomers', () => {
    const vRating = initialRating(veteran)
    const nRating = initialRating(newcomer)
    expect(vRating.sigma).toBeLessThan(nRating.sigma)
  })

  it('veteran is labelled Established', () => {
    const r = initialRating(veteran)
    expect(certaintyLabel(r.sigma).label).toBe('Established')
  })

  it('newcomer is labelled Unranked', () => {
    const r = initialRating(newcomer)
    expect(certaintyLabel(r.sigma).label).toBe('Unranked')
  })

  it('displayRating converts mu back to 0–10 scale', () => {
    const r = initialRating(veteran)
    const displayed = parseFloat(displayRating(r))
    expect(displayed).toBeCloseTo(veteran.rating, 0)
  })

  it('conservativeScore is always less than displayRating', () => {
    for (const p of PLAYERS) {
      const r = initialRating(p)
      expect(parseFloat(conservativeScore(r))).toBeLessThan(parseFloat(displayRating(r)))
    }
  })

  it('matchQuality returns 0 for empty teams', () => {
    expect(matchQuality([], [], {})).toBe(0)
  })

  it('matchQuality returns 0–100 for two real teams', () => {
    const tsR = buildInitialRatings(PLAYERS, [])
    const teamA = PLAYERS.slice(0, 5)
    const teamB = PLAYERS.slice(5, 10)
    const q = matchQuality(teamA, teamB, tsR)
    expect(q).toBeGreaterThanOrEqual(0)
    expect(q).toBeLessThanOrEqual(100)
  })

  it('autoBalanceTS splits players into two groups covering all input players', () => {
    const tsR = buildInitialRatings(PLAYERS, [])
    const group = PLAYERS.slice(0, 10)
    const { teamA, teamB } = autoBalanceTS(group, tsR)
    expect(teamA.length + teamB.length).toBe(10)
    const covered = new Set([...teamA.map(p => p.id), ...teamB.map(p => p.id)])
    for (const p of group) expect(covered.has(p.id)).toBe(true)
  })

  it('balanced teams have close TrueSkill mu sums (diff < 10 internal pts)', () => {
    const tsR = buildInitialRatings(PLAYERS, [])
    const group = PLAYERS.slice(0, 14)
    const { teamA, teamB } = autoBalanceTS(group, tsR)
    const sumA = teamA.reduce((s, p) => s + tsR[p.id].mu, 0)
    const sumB = teamB.reduce((s, p) => s + tsR[p.id].mu, 0)
    expect(Math.abs(sumA - sumB)).toBeLessThan(10)
  })

  it('buildInitialRatings returns a rating for every player', () => {
    const pastGames = GAMES.filter(g => g.status === 'past')
    const ratings = buildInitialRatings(PLAYERS, pastGames)
    for (const p of PLAYERS) {
      expect(ratings[p.id]).toBeDefined()
    }
  })

  it('after replaying past games winners have higher mu than their initial', () => {
    // Game 101: Team A won 4-3. Player 1 (Alon) was on Team A.
    const alonInitial = initialRating(PLAYERS[0]).mu
    const pastGames   = GAMES.filter(g => g.status === 'past')
    const ratings     = buildInitialRatings(PLAYERS, pastGames)
    expect(ratings[1].mu).toBeGreaterThan(alonInitial)
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
