# Prototype History

This file documents the older versions and experiments that led to the final Footy project.

## v0 - Hevre Original Prototype

Location used during development:

```text
../hevre-alon
```

Purpose:

- Show the first idea for a weekly soccer management screen.
- Present one weekly match.
- Show team split, payments, balance feedback, and leaderboard.

What worked:

- Clean initial dashboard.
- Simple payments panel.
- Visible team split.
- Balance feedback concept.

What was missing:

- No real user login.
- No persistent data.
- No dynamic team balancing.
- No profile pages.
- No map flow.
- No cloud deployment.

Screenshots captured for project book:

- Weekly Match dashboard.
- Team Split and Balance Feedback.
- Leaderboard and Nearby Games.

## v1 - Footy Web App

Purpose:

- Convert the idea into a full React/Vite web app.
- Add login, multiple pages, player data, games, maps, and payments.

What changed:

- Added 30+ demo players.
- Added Find Matches page.
- Added My Games and My Stats.
- Added profile modal.
- Added map with match markers.

## v2 - Fair Match Algorithm

Purpose:

- Make team creation smarter and explainable.

What changed:

- Added live player ratings.
- Added TrueSkill-style mu/sigma model.
- Added greedy team balancing based on live skill.
- Added match quality percentage.
- Added Established / Calibrating / Unranked labels.

Important decision:

- An external `ts-trueskill` package was tested, but the final project uses a local implementation to avoid dependency/security problems and keep the demo deterministic.

## v3 - Supabase and Operations

Purpose:

- Prepare the app for real users and production-like usage.

What changed:

- Added Supabase schema and repository layer.
- Added signup flow.
- Added roles: Player, Organizer, Municipality Admin.
- Added Operations page.
- Added game finalization, score entry, field operations and announcements.

## Final Version - Footy

Final project capabilities:

- Login/signup.
- 45 players.
- Map-based match discovery.
- RSVP and payments.
- Team manager.
- Live player ratings.
- Fair-match algorithm.
- Supabase-ready backend.
- Vercel-ready deployment.
- Automated tests.

