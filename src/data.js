export const PASSWORD = 'footy123'

export const PLAYERS = [
  { id: 1,  name: 'Alon Berla',      username: 'alon_b',   email: 'alon@hevre.app',   position: 'CAM', rating: 8.6, goals: 24, assists: 18, cleanSheets: 0,  gamesPlayed: 28, neighborhood: 'Ramat Gan',      paid: true,  bio: "Grew up playing in Ramat Gan streets. Addicted to the through-ball. If you make the run, I'll find you." },
  { id: 2,  name: 'Ilia Simhovich',  username: 'ilia_s',   email: 'ilia@hevre.app',   position: 'GK',  rating: 8.1, goals: 0,  assists: 2,  cleanSheets: 14, gamesPlayed: 26, neighborhood: 'Tel Aviv',         paid: true,  bio: "Last line of defense. Played in the youth academy, now keeping it clean in the neighborhood. Shout at me if the wall's wrong." },
  { id: 3,  name: 'Yoel Kraitman',   username: 'yoel_k',   email: 'yoel@hevre.app',   position: 'ST',  rating: 8.4, goals: 31, assists: 8,  cleanSheets: 0,  gamesPlayed: 30, neighborhood: 'Givatayim',        paid: false, bio: "I score. That's it. Ask the defenders." },
  { id: 4,  name: 'Noam Cohen',      username: 'noam_c',   email: 'noam@hevre.app',   position: 'CB',  rating: 7.8, goals: 2,  assists: 3,  cleanSheets: 0,  gamesPlayed: 25, neighborhood: 'Tel Aviv',         paid: true,  bio: "Defending is an art. I read the game before the attacker knows where he's going. Clean sheets are my trophies." },
  { id: 5,  name: 'Daniel Levy',     username: 'daniel_l', email: 'daniel@hevre.app', position: 'RW',  rating: 7.9, goals: 11, assists: 9,  cleanSheets: 0,  gamesPlayed: 24, neighborhood: 'Ramat Gan',        paid: false },
  { id: 6,  name: 'Omer Katz',       username: 'omer_k',   email: 'omer@hevre.app',   position: 'CM',  rating: 7.6, goals: 5,  assists: 11, cleanSheets: 0,  gamesPlayed: 22, neighborhood: 'Petah Tikva',      paid: true  },
  { id: 7,  name: 'Amit Shapiro',    username: 'amit_s',   email: 'amit@hevre.app',   position: 'LB',  rating: 7.4, goals: 1,  assists: 4,  cleanSheets: 0,  gamesPlayed: 20, neighborhood: 'Tel Aviv',         paid: true  },
  { id: 8,  name: 'Roi Ben-David',   username: 'roi_bd',   email: 'roi@hevre.app',    position: 'ST',  rating: 7.7, goals: 15, assists: 5,  cleanSheets: 0,  gamesPlayed: 22, neighborhood: 'Givatayim',        paid: false, bio: "Give me the ball in the box, I'll do the rest. From Givatayim, born and raised on the pitch." },
  { id: 9,  name: 'Lior Mizrahi',    username: 'lior_m',   email: 'lior@hevre.app',   position: 'CDM', rating: 7.5, goals: 3,  assists: 7,  cleanSheets: 0,  gamesPlayed: 21, neighborhood: 'Bnei Brak',        paid: true  },
  { id: 10, name: 'Tal Peretz',      username: 'tal_p',    email: 'tal@hevre.app',    position: 'RB',  rating: 7.3, goals: 2,  assists: 5,  cleanSheets: 0,  gamesPlayed: 19, neighborhood: 'Ramat Gan',        paid: true  },
  { id: 11, name: 'Eran Goldberg',   username: 'eran_g',   email: 'eran@hevre.app',   position: 'LW',  rating: 8.0, goals: 13, assists: 12, cleanSheets: 0,  gamesPlayed: 26, neighborhood: 'Tel Aviv',         paid: true,  bio: "Left foot is the right foot. Wide open spaces are my church. If there's a cross to whip in, I'm already there." },
  { id: 12, name: 'Niv Israeli',     username: 'niv_i',    email: 'niv@hevre.app',    position: 'CF',  rating: 7.8, goals: 16, assists: 7,  cleanSheets: 0,  gamesPlayed: 23, neighborhood: 'Holon',            paid: false },
  { id: 13, name: 'Guy Amar',        username: 'guy_a',    email: 'guy@hevre.app',    position: 'CB',  rating: 7.2, goals: 1,  assists: 2,  cleanSheets: 0,  gamesPlayed: 18, neighborhood: 'Bat Yam',          paid: true  },
  { id: 14, name: 'Shay Bar',        username: 'shay_b',   email: 'shay@hevre.app',   position: 'CM',  rating: 7.9, goals: 7,  assists: 13, cleanSheets: 0,  gamesPlayed: 25, neighborhood: 'Tel Aviv',         paid: true  },
  { id: 15, name: 'Itai Levi',       username: 'itai_l',   email: 'itai@hevre.app',   position: 'GK',  rating: 7.1, goals: 0,  assists: 1,  cleanSheets: 8,  gamesPlayed: 18, neighborhood: 'Petah Tikva',      paid: false },
  { id: 16, name: 'Matan Cohen',     username: 'matan_c',  email: 'matan@hevre.app',  position: 'RW',  rating: 8.1, goals: 14, assists: 10, cleanSheets: 0,  gamesPlayed: 24, neighborhood: 'Ramat Gan',        paid: true,  bio: "Fast, clinical, always on the right side. Ramat Gan's finest winger — ask anyone who's tried to track me." },
  { id: 17, name: 'Avi Friedman',    username: 'avi_f',    email: 'avi@hevre.app',    position: 'ST',  rating: 7.6, goals: 18, assists: 6,  cleanSheets: 0,  gamesPlayed: 26, neighborhood: 'Tel Aviv',         paid: true,  bio: "Grew up watching Del Piero. Still trying to bend it like him. Every game is a new chance to score something beautiful." },
  { id: 18, name: 'Dror Stern',      username: 'dror_s',   email: 'dror@hevre.app',   position: 'CB',  rating: 7.3, goals: 1,  assists: 3,  cleanSheets: 0,  gamesPlayed: 20, neighborhood: 'Givatayim',        paid: true  },
  { id: 19, name: 'Ofir Klein',      username: 'ofir_k',   email: 'ofir@hevre.app',   position: 'LB',  rating: 7.5, goals: 3,  assists: 6,  cleanSheets: 0,  gamesPlayed: 22, neighborhood: 'Rishon LeZion',    paid: false },
  { id: 20, name: 'Yair Solomon',    username: 'yair_s',   email: 'yair@hevre.app',   position: 'CAM', rating: 8.2, goals: 20, assists: 16, cleanSheets: 0,  gamesPlayed: 27, neighborhood: 'Tel Aviv',         paid: true  },
  { id: 21, name: 'Boaz Adler',      username: 'boaz_a',   email: 'boaz@hevre.app',   position: 'CDM', rating: 7.4, goals: 2,  assists: 5,  cleanSheets: 0,  gamesPlayed: 19, neighborhood: 'Ramat Gan',        paid: true  },
  { id: 22, name: 'Ran Elias',       username: 'ran_e',    email: 'ran@hevre.app',    position: 'CM',  rating: 7.7, goals: 6,  assists: 12, cleanSheets: 0,  gamesPlayed: 23, neighborhood: 'Herzliya',         paid: true  },
  { id: 23, name: 'Nir Gal',         username: 'nir_g',    email: 'nir@hevre.app',    position: 'ST',  rating: 8.0, goals: 22, assists: 7,  cleanSheets: 0,  gamesPlayed: 28, neighborhood: 'Tel Aviv',         paid: false, bio: "Top scorer three seasons running. Numbers don't lie — neither does my left foot." },
  { id: 24, name: 'Asaf Manor',      username: 'asaf_m',   email: 'asaf@hevre.app',   position: 'RB',  rating: 7.2, goals: 1,  assists: 4,  cleanSheets: 0,  gamesPlayed: 17, neighborhood: 'Petah Tikva',      paid: true  },
  { id: 25, name: 'Lev Rosenberg',   username: 'lev_r',    email: 'lev@hevre.app',    position: 'LW',  rating: 7.6, goals: 9,  assists: 11, cleanSheets: 0,  gamesPlayed: 21, neighborhood: 'Ramat Gan',        paid: true  },
  { id: 26, name: 'Tom Hayat',       username: 'tom_h',    email: 'tom@hevre.app',    position: 'CF',  rating: 7.8, goals: 14, assists: 8,  cleanSheets: 0,  gamesPlayed: 24, neighborhood: 'Tel Aviv',         paid: false },
  { id: 27, name: 'Eden Cohen',      username: 'eden_c',   email: 'eden@hevre.app',   position: 'CB',  rating: 7.1, goals: 0,  assists: 2,  cleanSheets: 0,  gamesPlayed: 16, neighborhood: 'Givatayim',        paid: true  },
  { id: 28, name: 'Aviv Barel',      username: 'aviv_b',   email: 'aviv@hevre.app',   position: 'GK',  rating: 7.5, goals: 0,  assists: 1,  cleanSheets: 10, gamesPlayed: 22, neighborhood: 'Tel Aviv',         paid: true  },
  { id: 29, name: 'Yuval Dahan',     username: 'yuval_d',  email: 'yuval@hevre.app',  position: 'CM',  rating: 7.9, goals: 8,  assists: 14, cleanSheets: 0,  gamesPlayed: 26, neighborhood: 'Rishon LeZion',    paid: true,  bio: "Box-to-box midfielder. I run the most every game and I'm proud of it. Fitness is half the game." },
  { id: 30, name: 'Or Nachmani',     username: 'or_n',     email: 'or@hevre.app',     position: 'ST',  rating: 8.3, goals: 27, assists: 9,  cleanSheets: 0,  gamesPlayed: 29, neighborhood: 'Ramat Gan',        paid: true,  bio: "Born winner. Every ball is a chance, every chance is a goal. Ramat Gan in the blood." },
]

export const LOCATIONS = [
  { id: 1,  name: 'Sportek South',        address: 'Rokach Blvd 12, Tel Aviv',          lat: 32.0997, lng: 34.8004, type: 'turf'   },
  { id: 2,  name: 'Park HaYarkon North',  address: 'Rokach Blvd 50, Tel Aviv',          lat: 32.1032, lng: 34.8055, type: 'grass'  },
  { id: 3,  name: 'Ramat Gan Nat. Park',  address: 'Derech HaShalom 1, Ramat Gan',      lat: 32.0782, lng: 34.8155, type: 'turf'   },
  { id: 4,  name: 'Givatayim Arena',      address: 'HaHistadrut 43, Givatayim',         lat: 32.0697, lng: 34.8132, type: 'indoor' },
  { id: 5,  name: 'Petah Tikva Ground',   address: 'Jabotinsky 5, Petah Tikva',         lat: 32.0859, lng: 34.8878, type: 'turf'   },
  { id: 6,  name: 'Holon City Arena',     address: 'Golda Meir 1, Holon',               lat: 32.0180, lng: 34.7740, type: 'turf'   },
  { id: 7,  name: 'Bat Yam Beach Field',  address: 'Yigal Alon Promenade, Bat Yam',     lat: 32.0235, lng: 34.7505, type: 'sand'   },
  { id: 8,  name: 'Rishon LeZion FC',     address: 'Yitzhak Rabin 5, Rishon LeZion',    lat: 31.9730, lng: 34.8050, type: 'grass'  },
  { id: 9,  name: 'Herzliya Complex',     address: 'HaSpinot 10, Herzliya',             lat: 32.1653, lng: 34.8352, type: 'turf'   },
  { id: 10, name: 'Florentin Indoor',     address: 'Herzl 78, Tel Aviv',                lat: 32.0553, lng: 34.7682, type: 'indoor' },
  { id: 11, name: 'Jaffa Port Field',     address: 'Yefet 50, Jaffa',                   lat: 32.0508, lng: 34.7504, type: 'turf'   },
  { id: 12, name: 'Bnei Brak East',       address: 'Rabbi Akiva 20, Bnei Brak',         lat: 32.0865, lng: 34.8394, type: 'turf'   },
  { id: 13, name: 'North TA Pitch',       address: 'Einstein 40, Tel Aviv',             lat: 32.1192, lng: 34.8003, type: 'grass'  },
  { id: 14, name: 'Ramat HaSharon',       address: 'HaShikma 5, Ramat HaSharon',        lat: 32.1472, lng: 34.8394, type: 'turf'   },
  { id: 15, name: 'Netanya Beach Arena',  address: 'HaAtzmaut Sq, Netanya',             lat: 32.3215, lng: 34.8557, type: 'sand'   },
]

export const GAMES = [
  // Past games
  {
    id: 101, locationId: 1, title: 'Sportek Weekly 7v7', date: '2026-05-12', time: '21:00',
    format: '7v7', spotsTotal: 14, playerIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],
    pricePerPlayer: 45, organizerId: 1, status: 'past',
    scoreA: 4, scoreB: 3, teamA: [1,3,5,7,9,11,13], teamB: [2,4,6,8,10,12,14],
    paidIds: [1,2,4,5,6,7,9,10,11,12,14],
    playerStats: {
      1:  { goals: 2, assists: 1 }, 3:  { goals: 1, assists: 0 },
      5:  { goals: 0, assists: 2 }, 7:  { goals: 0, assists: 0 },
      9:  { goals: 0, assists: 1 }, 11: { goals: 1, assists: 0 },
      13: { goals: 0, assists: 0 }, 2:  { goals: 0, assists: 0 },
      4:  { goals: 1, assists: 0 }, 6:  { goals: 1, assists: 1 },
      8:  { goals: 1, assists: 0 }, 10: { goals: 0, assists: 1 },
      12: { goals: 0, assists: 1 }, 14: { goals: 0, assists: 0 },
    },
  },
  {
    id: 102, locationId: 2, title: 'Yarkon Park 8v8', date: '2026-05-05', time: '20:30',
    format: '8v8', spotsTotal: 16, playerIds: [1,2,3,4,5,6,7,8,9,10,11,12,15,16,17,18],
    pricePerPlayer: 50, organizerId: 2, status: 'past',
    scoreA: 2, scoreB: 2, teamA: [1,3,5,7,9,11,15,17], teamB: [2,4,6,8,10,12,16,18],
    paidIds: [1,2,3,4,5,6,7,8,9,10,11,12,16,17,18],
    playerStats: {
      1:  { goals: 1, assists: 0 }, 3:  { goals: 1, assists: 0 },
      5:  { goals: 0, assists: 1 }, 7:  { goals: 0, assists: 0 },
      9:  { goals: 0, assists: 1 }, 11: { goals: 0, assists: 0 },
      15: { goals: 0, assists: 0 }, 17: { goals: 0, assists: 0 },
      2:  { goals: 0, assists: 0 }, 4:  { goals: 0, assists: 1 },
      6:  { goals: 0, assists: 0 }, 8:  { goals: 1, assists: 0 },
      10: { goals: 0, assists: 0 }, 12: { goals: 1, assists: 0 },
      16: { goals: 0, assists: 0 }, 18: { goals: 0, assists: 0 },
    },
  },
  {
    id: 103, locationId: 4, title: 'Givatayim 5-a-side', date: '2026-04-28', time: '20:00',
    format: '5v5', spotsTotal: 10, playerIds: [1,2,3,16,17,18,19,20,21,22],
    pricePerPlayer: 35, organizerId: 16, status: 'past',
    scoreA: 5, scoreB: 2, teamA: [1,3,16,18,20], teamB: [2,17,19,21,22],
    paidIds: [1,2,3,16,17,18,19,21,22],
    playerStats: {
      1:  { goals: 2, assists: 1 }, 3:  { goals: 2, assists: 0 },
      16: { goals: 1, assists: 1 }, 18: { goals: 0, assists: 0 },
      20: { goals: 0, assists: 2 }, 2:  { goals: 0, assists: 0 },
      17: { goals: 1, assists: 0 }, 19: { goals: 1, assists: 0 },
      21: { goals: 0, assists: 1 }, 22: { goals: 0, assists: 0 },
    },
  },
  // Upcoming games
  {
    id: 1, locationId: 1, title: 'Sportek Tuesday 7v7', date: '2026-05-19', time: '21:00',
    format: '7v7', spotsTotal: 14, playerIds: [1,2,3,4,5,6,7,8,9,10,11],
    pricePerPlayer: 45, organizerId: 1, status: 'upcoming',
    paidIds: [1,2,4,6,7,9,10,11],
  },
  {
    id: 2, locationId: 3, title: 'Ramat Gan Night 5v5', date: '2026-05-20', time: '21:30',
    format: '5v5', spotsTotal: 10, playerIds: [5,6,7,14,20,21,22,23],
    pricePerPlayer: 35, organizerId: 20, status: 'upcoming',
    paidIds: [5,6,7,14,20,21],
  },
  {
    id: 3, locationId: 2, title: 'HaYarkon Mega 8v8', date: '2026-05-22', time: '20:30',
    format: '8v8', spotsTotal: 16, playerIds: [1,2,3,4,5,6,7,8,9,10,11,12,13],
    pricePerPlayer: 50, organizerId: 2, status: 'upcoming',
    paidIds: [1,2,3,4,5,6,7,8],
  },
  {
    id: 4, locationId: 9, title: 'Herzliya Sunday 6v6', date: '2026-05-24', time: '19:00',
    format: '6v6', spotsTotal: 12, playerIds: [22,23,24,25,26],
    pricePerPlayer: 40, organizerId: 22, status: 'upcoming',
    paidIds: [22,23,24],
  },
  {
    id: 5, locationId: 5, title: 'Petah Tikva Weeknight 7v7', date: '2026-05-26', time: '21:00',
    format: '7v7', spotsTotal: 14, playerIds: [6,9,15,24,25,29],
    pricePerPlayer: 45, organizerId: 6, status: 'upcoming',
    paidIds: [6,9,15],
  },
  {
    id: 6, locationId: 11, title: 'Jaffa Port Evening 6v6', date: '2026-05-28', time: '20:00',
    format: '6v6', spotsTotal: 12, playerIds: [11,12,13,16,17,25,26,27],
    pricePerPlayer: 40, organizerId: 12, status: 'upcoming',
    paidIds: [11,12,16,17],
  },
  {
    id: 7, locationId: 10, title: 'Florentin Indoor 5v5', date: '2026-05-30', time: '19:30',
    format: '5v5', spotsTotal: 10, playerIds: [14,20,22,29],
    pricePerPlayer: 40, organizerId: 14, status: 'upcoming',
    paidIds: [14,20],
  },
  {
    id: 8, locationId: 7, title: 'Bat Yam Beach Kickabout', date: '2026-06-02', time: '18:00',
    format: '6v6', spotsTotal: 12, playerIds: [3,8,23,30],
    pricePerPlayer: 30, organizerId: 3, status: 'upcoming',
    paidIds: [3,8],
  },
  {
    id: 9, locationId: 1, title: 'Sportek Friday 8v8', date: '2026-06-05', time: '21:30',
    format: '8v8', spotsTotal: 16, playerIds: [1,2,3,4],
    pricePerPlayer: 55, organizerId: 1, status: 'upcoming',
    paidIds: [1],
  },
  {
    id: 10, locationId: 8, title: 'Rishon Classic 7v7', date: '2026-06-09', time: '21:00',
    format: '7v7', spotsTotal: 14, playerIds: [19,29],
    pricePerPlayer: 45, organizerId: 19, status: 'upcoming',
    paidIds: [19],
  },
  {
    id: 11, locationId: 13, title: 'North TA Super 8v8', date: '2026-06-12', time: '20:00',
    format: '8v8', spotsTotal: 16, playerIds: [1,2,3,4,5,6,7,8],
    pricePerPlayer: 50, organizerId: 2, status: 'upcoming',
    paidIds: [1,2,3,4,5,6,7,8],
  },
  {
    id: 12, locationId: 15, title: 'Netanya Beach Trip', date: '2026-06-16', time: '17:00',
    format: '5v5', spotsTotal: 10, playerIds: [1,3,8,23,30],
    pricePerPlayer: 25, organizerId: 1, status: 'upcoming',
    paidIds: [1,3],
  },
  {
    id: 13, locationId: 12, title: 'Bnei Brak Community 7v7', date: '2026-06-19', time: '21:00',
    format: '7v7', spotsTotal: 14, playerIds: [9,15],
    pricePerPlayer: 40, organizerId: 9, status: 'upcoming',
    paidIds: [],
  },
  {
    id: 14, locationId: 6, title: 'Holon Night 6v6', date: '2026-06-23', time: '21:30',
    format: '6v6', spotsTotal: 12, playerIds: [12,13,19],
    pricePerPlayer: 40, organizerId: 12, status: 'upcoming',
    paidIds: [12],
  },
  {
    id: 15, locationId: 14, title: 'Ramat HaSharon Sunday', date: '2026-06-26', time: '10:00',
    format: '7v7', spotsTotal: 14, playerIds: [16,22,25,28,29,30],
    pricePerPlayer: 45, organizerId: 16, status: 'upcoming',
    paidIds: [16,22,25],
  },
]

// Pre-seeded ratings: { [gameId]: { [ratedPlayerId]: { [raterId]: score } } }
export const INITIAL_RATINGS = {
  101: {
    1:  { 2: 9.0, 3: 8.5, 4: 7.5, 8: 8.0 },
    3:  { 1: 8.0, 5: 7.5, 6: 8.0 },
    11: { 1: 8.0, 9: 7.5 },
    5:  { 1: 7.5, 9: 7.0 },
    6:  { 1: 8.0, 3: 8.0 },
    8:  { 4: 7.5, 6: 8.0 },
    2:  { 1: 7.0, 3: 7.5, 5: 8.0 },
  },
  102: {
    1:  { 3: 7.5, 11: 8.0 },
    3:  { 1: 7.5, 17: 8.0 },
    12: { 4: 8.0, 10: 7.0 },
    16: { 2: 8.5, 8: 7.5 },
    2:  { 1: 7.0, 5: 7.5, 9: 8.0 },
  },
  103: {
    1:  { 3: 9.0, 16: 9.0, 20: 8.5 },
    3:  { 1: 8.5, 16: 8.0 },
    16: { 1: 8.0, 3: 7.5 },
    20: { 1: 8.0, 3: 8.0, 16: 7.5 },
    2:  { 3: 7.5, 17: 8.0, 20: 7.0 },
  },
}

const AVATAR_COLORS = ['#16a34a','#2563eb','#7c3aed','#db2777','#ea580c','#0891b2','#059669','#d97706']

export function avatarColor(id) {
  return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length]
}

export function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function spotsLeft(game) {
  return Math.max(0, game.spotsTotal - game.playerIds.length)
}

export function fieldIcon(type) {
  const icons = { turf: '🟩', grass: '🌿', indoor: '🏢', sand: '🏖️' }
  return icons[type] ?? '⚽'
}
