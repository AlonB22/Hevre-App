import { isSupabaseConfigured, supabase } from './supabaseClient'

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
}

function throwIfError(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`)
  }
  return result.data ?? []
}

export async function loadFootyData() {
  if (!isSupabaseConfigured || !supabase) return null

  const [
    playersResult,
    locationsResult,
    gamesResult,
    gamePlayersResult,
    gamePaymentsResult,
    gameTeamsResult,
    playerStatsResult,
    ratingsResult,
  ] = await Promise.all([
    supabase.from('players').select('*').order('id'),
    supabase.from('locations').select('*').order('id'),
    supabase.from('games').select('*').order('date', { ascending: true }),
    supabase.from('game_players').select('*'),
    supabase.from('game_payments').select('*'),
    supabase.from('game_teams').select('*'),
    supabase.from('player_stats').select('*'),
    supabase.from('ratings').select('*'),
  ])

  const players = throwIfError('Load players', playersResult).map(rowToPlayer)
  const locations = throwIfError('Load locations', locationsResult).map(rowToLocation)
  const gamePlayers = throwIfError('Load game players', gamePlayersResult)
  const gamePayments = throwIfError('Load game payments', gamePaymentsResult)
  const gameTeams = throwIfError('Load game teams', gameTeamsResult)
  const playerStats = throwIfError('Load player stats', playerStatsResult)
  const ratingRows = throwIfError('Load ratings', ratingsResult)

  const playerIdsByGame = groupIds(gamePlayers, 'game_id', 'player_id')
  const paidIdsByGame = groupIds(gamePayments, 'game_id', 'player_id')
  const teamsByGame = groupTeams(gameTeams)
  const statsByGame = groupStats(playerStats)

  const games = throwIfError('Load games', gamesResult).map((row) => ({
    id: row.id,
    locationId: row.location_id,
    title: row.title,
    date: row.date,
    time: row.time,
    format: row.format,
    spotsTotal: row.spots_total,
    playerIds: playerIdsByGame[row.id] ?? [],
    pricePerPlayer: Number(row.price_per_player),
    organizerId: row.organizer_id,
    status: row.status,
    scoreA: row.score_a ?? undefined,
    scoreB: row.score_b ?? undefined,
    teamA: teamsByGame[row.id]?.teamA,
    teamB: teamsByGame[row.id]?.teamB,
    paidIds: paidIdsByGame[row.id] ?? [],
    playerStats: statsByGame[row.id],
    isPublished: row.is_published,
  }))

  return {
    players,
    locations,
    games,
    ratings: groupRatings(ratingRows),
  }
}

export async function saveRsvp(gameId, playerId, joining) {
  assertSupabase()
  const result = joining
    ? await supabase.from('game_players').upsert({ game_id: gameId, player_id: playerId })
    : await supabase.from('game_players').delete().match({ game_id: gameId, player_id: playerId })
  throwIfError('Save RSVP', result)
}

export async function saveRating(gameId, ratedPlayerId, raterId, score) {
  assertSupabase()
  const result = await supabase.from('ratings').upsert({
    game_id: gameId,
    rated_player_id: ratedPlayerId,
    rater_id: raterId,
    score,
  })
  throwIfError('Save rating', result)
}

export async function saveBalanceFeedback(gameId, userId, feedback) {
  assertSupabase()
  const result = await supabase.from('balance_feedback').upsert({
    game_id: gameId,
    user_id: userId,
    balance: feedback.balance ?? null,
    note: feedback.note ?? null,
  })
  throwIfError('Save balance feedback', result)
}

export async function savePublished(gameId, isPublished) {
  assertSupabase()
  const result = await supabase
    .from('games')
    .update({ is_published: isPublished })
    .eq('id', gameId)
  throwIfError('Save team publish state', result)
}

export async function saveTeamAssignments(gameId, assignments) {
  assertSupabase()
  const rows = [
    ...(assignments.teamA ?? []).map((playerId) => ({ game_id: gameId, player_id: playerId, team: 'A' })),
    ...(assignments.teamB ?? []).map((playerId) => ({ game_id: gameId, player_id: playerId, team: 'B' })),
  ]

  const deleteResult = await supabase.from('game_teams').delete().eq('game_id', gameId)
  throwIfError('Clear team assignments', deleteResult)

  if (rows.length === 0) return
  const insertResult = await supabase.from('game_teams').insert(rows)
  throwIfError('Save team assignments', insertResult)
}

export async function savePlayerProfile(playerId, updates) {
  assertSupabase()
  const result = await supabase
    .from('players')
    .update({
      bio: updates.bio,
      avatar_data_url: updates.avatarDataUrl,
    })
    .eq('id', playerId)
  throwIfError('Save profile', result)
}

function rowToPlayer(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    position: row.position,
    rating: Number(row.rating),
    goals: row.goals,
    assists: row.assists,
    cleanSheets: row.clean_sheets,
    gamesPlayed: row.games_played,
    neighborhood: row.neighborhood,
    paid: row.paid,
    role: row.role ?? undefined,
    bio: row.bio ?? undefined,
    avatarDataUrl: row.avatar_data_url ?? undefined,
  }
}

function rowToLocation(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: Number(row.lat),
    lng: Number(row.lng),
    type: row.type,
  }
}

function groupIds(rows, groupKey, idKey) {
  return rows.reduce((acc, row) => {
    acc[row[groupKey]] ??= []
    acc[row[groupKey]].push(row[idKey])
    return acc
  }, {})
}

function groupTeams(rows) {
  return rows.reduce((acc, row) => {
    acc[row.game_id] ??= { teamA: [], teamB: [] }
    if (row.team === 'A') acc[row.game_id].teamA.push(row.player_id)
    if (row.team === 'B') acc[row.game_id].teamB.push(row.player_id)
    return acc
  }, {})
}

function groupStats(rows) {
  return rows.reduce((acc, row) => {
    acc[row.game_id] ??= {}
    acc[row.game_id][row.player_id] = {
      goals: row.goals,
      assists: row.assists,
    }
    return acc
  }, {})
}

function groupRatings(rows) {
  return rows.reduce((acc, row) => {
    acc[row.game_id] ??= {}
    acc[row.game_id][row.rated_player_id] ??= {}
    acc[row.game_id][row.rated_player_id][row.rater_id] = Number(row.score)
    return acc
  }, {})
}
