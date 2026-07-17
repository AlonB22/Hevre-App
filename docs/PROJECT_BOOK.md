# Footy Project Book

## 1. Introduction

Footy is a web application for organizing neighborhood soccer games. The project solves a real problem in amateur soccer groups: finding matches, managing RSVPs, building fair teams, tracking payments, rating players after games, and giving organizers better tools to run weekly games.

The project started as a smaller prototype named **Hevre**. Hevre showed the idea of one weekly match with teams, payments, balance feedback, and a player leaderboard. Footy expands this into a complete web platform with login, signup, map-based game discovery, profiles, admin operations, Supabase persistence, and a fair-match algorithm.

## 2. Before and After

### 2.1 Old Version - Hevre Prototype

The first version was a compact prototype focused on a weekly match. It included:

- Dashboard for one weekly match.
- Static player list.
- Static team split.
- Payments panel.
- Balance feedback panel.
- Leaderboard.
- Nearby games mock list.

Limitations:

- No real login/signup.
- No persistent database.
- No dynamic player profiles.
- No map-based RSVP flow.
- Team balancing was static and not based on game history.
- Player ratings did not update after matches.

Suggested screenshots for this section:

- Old dashboard / weekly match card.
- Old team split and balance feedback.
- Old leaderboard and nearby games.

These screenshots are embedded in the final PDF (`docs/Footy-Project-Book.pdf`), section 3.

### 2.2 Current Version - Footy

The current version upgrades the prototype into a larger soccer community platform:

- Login and signup.
- 45 demo players with roles, positions, bios, and stats.
- Map screen for finding matches.
- RSVP and payment state.
- Past game statistics and player ratings.
- Personal profile modal.
- Match Manager for team publishing and manual swaps.
- Operations page for organizers and admins.
- TrueSkill-style player ratings.
- Greedy team balancing using live skill scores.
- Optional Supabase backend.
- Vercel-ready frontend deployment.

Suggested screenshots for this section:

- Login / signup screen.
- Dashboard after logging in as Ilia.
- Find Matches map screen.
- Match Manager with team quality.
- Players page with TrueSkill labels.
- Operations page.

## 3. Roles and Responsibilities

### 3.1 Team Members

| Name | Student ID | Main Responsibility |
|---|---|---|
| Ilia Simhovich | 323637793 | Fair-match algorithm and player rating system |
| Alon Berla | 208544064 | Database, Supabase, data model and persistence |
| Yoel Kraitman | 209710615 | Server, deployment and production environment |

### Ilia Simhovich

Ilia was responsible for the fair-game algorithm and player rating logic:

- Designing the team balancing approach.
- Implementing the TrueSkill-style player rating model.
- Implementing the greedy team balancing function.
- Connecting live ratings to Match Manager.
- Showing rating certainty labels: Established, Calibrating, Unranked.
- Adding match quality percentage for balanced teams.

### Alon Berla

Alon was responsible for the database and persistence foundation:

- Supabase schema planning.
- Supabase migrations.
- Repository layer for loading and saving app data.
- Signup flow.
- Data model for players, games, RSVPs, profiles, ratings, team assignments, and feedback.
- Secret-handling improvements through `.env.example` and `.gitignore`.

### Yoel Kraitman

Yoel was responsible for server/deployment work:

- Preparing the project for external deployment.
- Vercel deployment flow.
- Environment variable setup.
- Production hosting checklist.
- Connecting frontend deployment with optional Supabase backend.

## 4. Architecture

The application is a React single-page app built with Vite.

Main layers:

- **UI layer**: React components under `src/components`.
- **Data layer**: local demo data in `src/data.js`.
- **Rating layer**: TrueSkill-style engine in `src/trueskill.js`.
- **Role layer**: permissions in `src/roles.js`.
- **Backend layer**: Supabase client and repository in `src/supabaseClient.js` and `src/supabaseRepository.js`.
- **Database migrations**: SQL files under `supabase/migrations`.

The app can run in two modes:

1. **Local demo mode**: uses static mock data from the repository.
2. **Supabase mode**: loads/saves real data when Supabase environment variables are configured.

## 5. Fair Match Algorithm

Footy combines two ideas:

1. A live player rating model.
2. A greedy team balancing algorithm.

### 5.1 Rating Model

Each player has two rating values:

- **mu**: estimated skill level.
- **sigma**: uncertainty in the estimate.

Players with many games have lower sigma, which means the system is more confident about their skill. New players have higher sigma, so their rating can move faster after a few games.

Labels:

- **Established**: low sigma, many games played.
- **Calibrating**: medium sigma.
- **Unranked**: high sigma, few games played.

When a game is finalized:

- Winners gain skill points.
- Losers lose skill points.
- If a weaker team beats a stronger team, the rating movement is larger.
- Sigma shrinks slightly because the system has more evidence.

### 5.2 Greedy Team Balancing

The balancer receives the players registered to a game and their live mu values.

Steps:

1. Sort players from strongest to weakest by mu.
2. Start with two empty teams.
3. For each player, place them on the team with the lower current total mu.
4. Continue until all players are assigned.

This produces a fast and understandable balance. It is not an exhaustive search, but it works well for pickup soccer because the number of players is small and organizers can still manually swap players.

### 5.3 Match Quality

The Match Manager shows a match quality percentage. It compares the average skill values of Team A and Team B. A higher percentage means a more even game.

## 6. Database Design

Supabase is used as the optional backend. The database stores:

- Players.
- Locations.
- Games.
- RSVPs.
- Team assignments.
- Published team status.
- Player profiles.
- Player ratings.
- Balance feedback.

The SQL migrations are included in:

```text
supabase/migrations/
```

The repository functions are included in:

```text
src/supabaseRepository.js
```

## 7. Deployment

The project is prepared for free deployment:

- **Frontend**: Vercel Free plan.
- **Backend**: Supabase Free plan.

Vercel build settings:

```text
Build command: npm run build
Output directory: dist
```

Environment variables:

```text
VITE_DEMO_PASSWORD
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## 8. Testing

The project uses Vitest and React Testing Library.

The test suite verifies:

- Data integrity.
- Player and game references.
- Utility functions.
- Signup flow.
- Component behavior.
- TrueSkill-style rating behavior.
- Greedy team split behavior.
- Game finalization flow.

Run:

```bash
npm test
```

## 9. Bibliography

The literature review was used to justify the algorithmic and architectural decisions in the project:

| # | Source | Used For |
|---|---|---|
| 1 | Herbrich, R., Minka, T., & Graepel, T. (2007). **TrueSkill: A Bayesian Skill Rating System**. Microsoft Research / NeurIPS. https://www.microsoft.com/en-us/research/publication/trueskilltm-a-bayesian-skill-rating-system/ | Basis for player skill rating with mu and sigma |
| 2 | Minka, T. et al. (2018). **TrueSkill 2: An improved Bayesian skill rating system**. Microsoft Research. https://www.microsoft.com/en-us/research/wp-content/uploads/2018/03/trueskill2.pdf | Extension ideas for future AI balancing using more player signals |
| 3 | Elo, A. (1978). **The Rating of Chessplayers, Past and Present**. | Comparison point: why Elo is less suitable for team games |
| 4 | Glickman, M. (2012). **Example of the Glicko-2 System**. http://www.glicko.net/glicko/glicko2.pdf | Alternative rating model with uncertainty |
| 5 | Gale, D., & Shapley, L. (1962). **College Admissions and the Stability of Marriage**. American Mathematical Monthly. | Alternative for matching players to games by preferences |
| 6 | Cormen, T., Leiserson, C., Rivest, R., & Stein, C. **Introduction to Algorithms** - Greedy Algorithms. | Greedy design pattern used in team split |
| 7 | React Documentation - https://react.dev | Frontend component model and UI architecture |
| 8 | Vite Documentation - https://vite.dev | Build tool and local development server |
| 9 | Supabase Documentation - https://supabase.com/docs | Backend-as-a-Service, database and API design |
| 10 | Leaflet Documentation - https://leafletjs.com | Map UI and match location display |

## 10. Submission Package

The final submission should include:

- Source-code ZIP exported from the GitHub repository.
- No generated folders such as `node_modules` or `dist`.
- `README.md` with installation and run instructions.
- One PDF containing all project documents.

