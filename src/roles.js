export const ROLES = {
  PLAYER: 'player',
  ORGANIZER: 'organizer',
  MUNICIPALITY_ADMIN: 'municipality_admin',
}

export const ROLE_LABELS = {
  [ROLES.PLAYER]: 'Player',
  [ROLES.ORGANIZER]: 'Organizer',
  [ROLES.MUNICIPALITY_ADMIN]: 'Municipality/admin',
}

export function normalizeRole(role) {
  return Object.values(ROLES).includes(role) ? role : ROLES.PLAYER
}

export function roleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)]
}

export function isPlayer(user) {
  return Boolean(user?.id)
}

export function isOrganizer(user) {
  const role = normalizeRole(user?.role)
  return role === ROLES.ORGANIZER || role === ROLES.MUNICIPALITY_ADMIN
}

export function isMunicipalityAdmin(user) {
  return normalizeRole(user?.role) === ROLES.MUNICIPALITY_ADMIN
}

export function canManageGame(user, game) {
  if (!user || !game) return false
  return isMunicipalityAdmin(user) || (isOrganizer(user) && game.organizerId === user.id)
}

export function canManageFields(user) {
  return isMunicipalityAdmin(user)
}
