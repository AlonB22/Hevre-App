import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Dumbbell,
  Goal,
  Home,
  ListChecks,
  MapPin,
  Menu,
  MessageSquareText,
  Search,
  Shield,
  Shirt,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import './styles.css';

const navItems = [
  { label: 'Dashboard', icon: Home },
  { label: 'Games', icon: CalendarDays },
  { label: 'Teams', icon: Shirt },
  { label: 'Stats', icon: Trophy },
  { label: 'Payments', icon: CircleDollarSign },
  { label: 'Find Games', icon: Search },
  { label: 'Fields', icon: Goal },
];

const players = [
  { name: 'Alon', role: 'CAM', rating: 8.6, goals: 12, assists: 9, paid: true },
  { name: 'Ilya', role: 'GK', rating: 8.1, goals: 0, assists: 2, paid: true },
  { name: 'Yoel', role: 'ST', rating: 8.4, goals: 15, assists: 4, paid: false },
  { name: 'Noam', role: 'CB', rating: 7.8, goals: 2, assists: 5, paid: true },
  { name: 'Daniel', role: 'RW', rating: 7.9, goals: 9, assists: 6, paid: false },
  { name: 'Omer', role: 'CM', rating: 7.6, goals: 4, assists: 8, paid: true },
  { name: 'Amit', role: 'LB', rating: 7.4, goals: 1, assists: 3, paid: true },
  { name: 'Roi', role: 'ST', rating: 7.7, goals: 10, assists: 2, paid: false },
];

const nearbyGames = [
  { title: 'Ramat Gan 7v7', time: 'Tonight, 21:00', distance: '1.8 km', need: 'Need GK' },
  { title: 'Givatayim Turf', time: 'Tue, 20:30', distance: '3.2 km', need: '2 spots' },
  { title: 'Tel Aviv North', time: 'Thu, 22:00', distance: '5.1 km', need: 'Open' },
];

const teamASeed = ['Alon', 'Ilya', 'Noam', 'Daniel'];
const teamBSeed = ['Yoel', 'Omer', 'Amit', 'Roi'];

function App() {
  const [rsvp, setRsvp] = useState(false);
  const [published, setPublished] = useState(true);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [feedback, setFeedback] = useState('Balanced');

  const confirmedCount = rsvp ? 15 : 14;
  const teamA = useMemo(() => players.filter((player) => teamASeed.includes(player.name)), []);
  const teamB = useMemo(() => players.filter((player) => teamBSeed.includes(player.name)), []);
  const unpaid = players.filter((player) => !player.paid);
  const paidCount = players.length - unpaid.length;

  return (
    <div className="app">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebarOpen' : ''}`}>
        <div className="brand">
          <div className="brandMark">
            <Shield size={22} strokeWidth={2.2} />
          </div>
          <div>
            <strong>Hevre</strong>
            <span>Weekly football</span>
          </div>
        </div>

        <nav className="navList" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = activeNav === item.label;
            return (
              <button
                className={`navItem ${selected ? 'selected' : ''}`}
                key={item.label}
                onClick={() => {
                  setActiveNav(item.label);
                  setMobileNavOpen(false);
                }}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="fieldNote">
          <MapPin size={18} />
          <div>
            <strong>Sportek South</strong>
            <span>Pitch reserved until 22:30</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="iconButton mobileOnly"
            onClick={() => setMobileNavOpen((value) => !value)}
            aria-label="Toggle navigation"
            type="button"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div>
            <h1>Weekly Match</h1>
            <p>Manage tonight's lineups, payments, feedback, and nearby opportunities.</p>
          </div>

          <div className="topActions">
            <label className="searchBox">
              <Search size={18} />
              <input placeholder="Search players, games, fields" />
            </label>
            <button className="iconButton" aria-label="Notifications" type="button">
              <Bell size={19} />
              <span className="dot" />
            </button>
            <div className="avatar" aria-label="User profile">AB</div>
          </div>
        </header>

        <section className="contentGrid">
          <div className="leftColumn">
            <section className="matchPanel pitchLines">
              <div className="matchHeader">
                <div>
                  <div className="matchDate">
                    <CalendarDays size={18} />
                    <span>Tuesday, 21:00</span>
                  </div>
                  <h2>Ramat Gan weekly 8v8</h2>
                  <p><MapPin size={16} /> Sportek South Field · Ramat Gan</p>
                </div>
                <div className="statusStack">
                  <span className="status live">Open RSVP</span>
                  <span className="status">{confirmedCount}/16 confirmed</span>
                </div>
              </div>

              <div className="matchStats">
                <div>
                  <strong>{confirmedCount}</strong>
                  <span>confirmed</span>
                </div>
                <div>
                  <strong>2</strong>
                  <span>waitlist</span>
                </div>
                <div>
                  <strong>7.9</strong>
                  <span>avg rating</span>
                </div>
                <div>
                  <strong>₪45</strong>
                  <span>per player</span>
                </div>
              </div>

              <div className="matchActions">
                <button className={`primaryButton ${rsvp ? 'confirmed' : ''}`} onClick={() => setRsvp((value) => !value)} type="button">
                  {rsvp ? <Check size={18} /> : <ListChecks size={18} />}
                  {rsvp ? "You're in" : "I'm in"}
                </button>
                <button className="secondaryButton" type="button">
                  <Users size={18} />
                  Manage
                </button>
                <button className="secondaryButton" onClick={() => setPublished((value) => !value)} type="button">
                  <Shirt size={18} />
                  {published ? 'Published' : 'Publish teams'}
                </button>
              </div>
            </section>

            <section className="teamsPanel">
              <SectionHeader title="Team Split" action={published ? 'Visible to players' : 'Draft'} />
              <div className="teamsGrid">
                <TeamColumn name="Team A" score="31.9" players={teamA} accent="green" />
                <TeamColumn name="Team B" score="31.1" players={teamB} accent="blue" />
              </div>
            </section>

            <section className="statsPanel">
              <SectionHeader title="Leaderboard" action="Last 6 matches" />
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Role</th>
                      <th>Goals</th>
                      <th>Assists</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...players]
                      .sort((a, b) => b.goals - a.goals)
                      .slice(0, 5)
                      .map((player) => (
                        <tr key={player.name}>
                          <td>
                            <div className="playerCell">
                              <span>{initials(player.name)}</span>
                              {player.name}
                            </div>
                          </td>
                          <td>{player.role}</td>
                          <td>{player.goals}</td>
                          <td>{player.assists}</td>
                          <td><strong>{player.rating}</strong></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="rightRail">
            <section className="railPanel">
              <SectionHeader title="Payments" action={`${paidCount}/${players.length} paid`} />
              <div className="moneyHero">
                <span>Outstanding</span>
                <strong>₪{unpaid.length * 45}</strong>
              </div>
              <div className="paymentList">
                {unpaid.map((player) => (
                  <div className="paymentRow" key={player.name}>
                    <div>
                      <strong>{player.name}</strong>
                      <span>Field share</span>
                    </div>
                    <button type="button">Remind</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="railPanel">
              <SectionHeader title="Balance Feedback" action="After match" />
              <div className="segmented">
                {['Team A stronger', 'Balanced', 'Team B stronger'].map((option) => (
                  <button
                    className={feedback === option ? 'active' : ''}
                    key={option}
                    onClick={() => setFeedback(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
              <textarea placeholder="Add a short note for next week's split" />
              <button className="fullButton" type="button">
                <MessageSquareText size={17} />
                Save feedback
              </button>
            </section>

            <section className="railPanel">
              <SectionHeader title="Nearby Games" action="Ramat Gan" />
              <div className="nearbyList">
                {nearbyGames.map((game) => (
                  <button className="nearbyRow" key={game.title} type="button">
                    <div>
                      <strong>{game.title}</strong>
                      <span><Clock3 size={14} /> {game.time}</span>
                    </div>
                    <div>
                      <b>{game.need}</b>
                      <small>{game.distance}</small>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

function TeamColumn({ name, score, players: teamPlayers, accent }) {
  return (
    <div className={`teamColumn ${accent}`}>
      <div className="teamTop">
        <h3>{name}</h3>
        <span>{score} total rating</span>
      </div>
      <div className="playerList">
        {teamPlayers.map((player) => (
          <div className="teamPlayer" key={player.name}>
            <span className="dragHandle" />
            <div className="miniAvatar">{initials(player.name)}</div>
            <div>
              <strong>{player.name}</strong>
              <span>{player.role}</span>
            </div>
            <b>{player.rating}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="sectionHeader">
      <h2>{title}</h2>
      <span>{action}</span>
    </div>
  );
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

createRoot(document.getElementById('root')).render(<App />);
