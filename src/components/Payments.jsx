import { LOCATIONS as FALLBACK_LOCATIONS, formatDate, initials, avatarColor } from '../data'
import { canManageGame, isOrganizer } from '../roles'

export default function Payments({ user, games, players, locations = FALLBACK_LOCATIONS }) {
  const allMyGames = games.filter(g => g.playerIds.includes(user.id))

  // What I owe (upcoming + unpaid)
  const iOwe = allMyGames.filter(
    g => g.status === 'upcoming' && !g.paidIds?.includes(user.id)
  )
  const totalOwed = iOwe.reduce((s, g) => s + g.pricePerPlayer, 0)

  // Games I organise where others haven't paid
  const myOrganised = games.filter(
    g => isOrganizer(user) && canManageGame(user, g) && g.status === 'upcoming'
  )
  const toCollect = myOrganised
    .map(g => ({
      game: g,
      unpaid: g.playerIds
        .filter(id => id !== user.id && !g.paidIds?.includes(id))
        .map(id => players.find(p => p.id === id))
        .filter(Boolean),
    }))
    .filter(x => x.unpaid.length > 0)

  const totalCollect = toCollect.reduce(
    (s, { game, unpaid }) => s + unpaid.length * game.pricePerPlayer, 0
  )

  // Payment history (games I paid for)
  const history = allMyGames
    .filter(g => g.paidIds?.includes(user.id))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page">
      <div className="page-hdr">
        <div>
          <h1>Payments</h1>
          <p>Field costs, outstanding amounts, and history</p>
        </div>
      </div>

      <div className="pay-grid">
        {/* I owe */}
        <div className="card">
          <div className="card-hdr">
            <h2>I Owe</h2>
            {totalOwed > 0
              ? <span className="money-bdg red">₪{totalOwed}</span>
              : <span className="money-bdg green">All clear ✓</span>
            }
          </div>
          {iOwe.length === 0
            ? <div className="empty-sm">You're fully paid up 🎉</div>
            : (
              <div className="pay-list">
                {iOwe.map(g => {
                  const loc = locations.find(l => l.id === g.locationId)
                  return (
                    <div key={g.id} className="pay-row">
                      <div>
                        <strong>{g.title}</strong>
                        <span>{formatDate(g.date)} · {loc?.name}</span>
                      </div>
                      <div className="pay-right">
                        <strong>₪{g.pricePerPlayer}</strong>
                        <button className="btn btn-primary btn-sm">Pay now</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>

        {/* To collect */}
        <div className="card">
          <div className="card-hdr">
            <h2>To Collect</h2>
            {totalCollect > 0
              ? <span className="money-bdg yellow">₪{totalCollect}</span>
              : <span className="money-bdg green">All collected ✓</span>
            }
          </div>
          {myOrganised.length === 0 ? (
            <div className="empty-sm">You haven't organised any games.</div>
          ) : toCollect.length === 0 ? (
            <div className="empty-sm">Everyone has paid up! ✓</div>
          ) : (
            <div className="pay-list">
              {toCollect.map(({ game, unpaid }) => (
                <div key={game.id} className="pay-group">
                  <div className="pay-group-title">{game.title}</div>
                  {unpaid.map(p => (
                    <div key={p.id} className="pay-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: avatarColor(p.id),
                            display: 'grid', placeItems: 'center',
                            fontSize: 10, fontWeight: 800, color: '#fff',
                            flexShrink: 0,
                          }}
                        >
                          {initials(p.name)}
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.position}</span>
                        </div>
                      </div>
                      <div className="pay-right">
                        <strong>₪{game.pricePerPlayer}</strong>
                        <button className="btn btn-outline btn-sm">Remind</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-hdr">
            <h2>Payment History</h2>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Total paid: ₪{history.reduce((s, g) => s + g.pricePerPlayer, 0)}
            </span>
          </div>
          {history.length === 0 ? (
            <div className="empty-sm">No payment history yet.</div>
          ) : (
            <div className="pay-list">
              {history.map(g => {
                const loc = locations.find(l => l.id === g.locationId)
                return (
                  <div key={g.id} className="pay-row">
                    <div>
                      <strong>{g.title}</strong>
                      <span>{formatDate(g.date)} · {loc?.name}</span>
                    </div>
                    <div className="pay-right">
                      <strong className="paid-amt">–₪{g.pricePerPlayer}</strong>
                      <span className="bdg bdg-green">Paid</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
