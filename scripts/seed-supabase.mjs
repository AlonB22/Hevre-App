import { createClient } from '@supabase/supabase-js'
import { GAMES, INITIAL_RATINGS, LOCATIONS, PLAYERS } from '../src/data.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const publishedGameIds = new Set([1, 3, 11])

await upsert('players', PLAYERS.map((player) => ({
  id: player.id,
  name: player.name,
  username: player.username,
  email: player.email,
  position: player.position,
  rating: player.rating,
  goals: player.goals,
  assists: player.assists,
  clean_sheets: player.cleanSheets ?? 0,
  games_played: player.gamesPlayed,
  neighborhood: player.neighborhood,
  paid: player.paid ?? false,
  role: player.role ?? 'player',
  bio: player.bio ?? null,
})))

await upsert('locations', LOCATIONS.map((location) => ({
  id: location.id,
  name: location.name,
  address: location.address,
  lat: location.lat,
  lng: location.lng,
  type: location.type,
})))

await upsert('games', GAMES.map((game) => ({
  id: game.id,
  location_id: game.locationId,
  title: game.title,
  date: game.date,
  time: game.time,
  format: game.format,
  spots_total: game.spotsTotal,
  price_per_player: game.pricePerPlayer,
  organizer_id: game.organizerId,
  status: game.status,
  score_a: game.scoreA ?? null,
  score_b: game.scoreB ?? null,
  is_published: publishedGameIds.has(game.id),
})))

await replaceTable('game_players', GAMES.flatMap((game) =>
  game.playerIds.map((playerId) => ({
    game_id: game.id,
    player_id: playerId,
  }))
))

await replaceTable('game_payments', GAMES.flatMap((game) =>
  (game.paidIds ?? []).map((playerId) => ({
    game_id: game.id,
    player_id: playerId,
  }))
))

await replaceTable('game_teams', GAMES.flatMap((game) => [
  ...(game.teamA ?? []).map((playerId) => ({ game_id: game.id, player_id: playerId, team: 'A' })),
  ...(game.teamB ?? []).map((playerId) => ({ game_id: game.id, player_id: playerId, team: 'B' })),
]))

await replaceTable('player_stats', GAMES.flatMap((game) =>
  Object.entries(game.playerStats ?? {}).map(([playerId, stats]) => ({
    game_id: game.id,
    player_id: Number(playerId),
    goals: stats.goals ?? 0,
    assists: stats.assists ?? 0,
  }))
))

await replaceTable('ratings', Object.entries(INITIAL_RATINGS).flatMap(([gameId, playerMap]) =>
  Object.entries(playerMap).flatMap(([ratedPlayerId, raterMap]) =>
    Object.entries(raterMap).map(([raterId, score]) => ({
      game_id: Number(gameId),
      rated_player_id: Number(ratedPlayerId),
      rater_id: Number(raterId),
      score,
    }))
  )
))

console.log('Supabase seed completed.')

async function upsert(table, rows) {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).upsert(rows)
  if (error) throw new Error(`${table}: ${error.message}`)
}

async function replaceTable(table, rows) {
  const { error: deleteError } = await supabase.from(table).delete().neq('game_id', -1)
  if (deleteError) throw new Error(`${table} delete: ${deleteError.message}`)
  if (rows.length === 0) return
  const { error: insertError } = await supabase.from(table).insert(rows)
  if (insertError) throw new Error(`${table} insert: ${insertError.message}`)
}
