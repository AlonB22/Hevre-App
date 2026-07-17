# Footy - Soccer Community Web App

Footy is a React/Vite web application for managing neighborhood soccer games. It includes player profiles, match discovery, RSVP, team management, balance feedback, live player ratings, payments status, operations tools, and optional Supabase persistence.

## Project Summary

Footy started from an early prototype named **Hevre**, which focused on one weekly match screen with basic teams, payments, and feedback. The current version expands it into a fuller web app:

- Login and signup flow with a shared demo password.
- 45 demo players across several neighborhoods and positions.
- Upcoming and past games with map-based match discovery.
- Player profiles with bios, photos, personal stats, and received ratings.
- Organizer/admin tools for creating games and finalizing scores.
- TrueSkill-style player ratings and greedy team balancing.
- Optional Supabase backend for players, games, RSVPs, teams, ratings, and feedback.

## Team Responsibilities

- **Ilia Simhovich** - fair-match algorithm, player rating logic, TrueSkill-style score model, greedy team balancing, Match Manager behavior.
- **Alon Berla** - database foundation, Supabase schema, repository layer, signup flow, data persistence and project groundwork.
- **Yoel Kraitman** - server/deployment responsibility, production hosting flow, Vercel/Supabase environment setup.

## Requirements

- Node.js 18 or newer
- npm
- Optional: Supabase project for persistent cloud data

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Edit `.env` and set at least:

```env
VITE_DEMO_PASSWORD=footy123
```

Supabase is optional. Without Supabase keys, the app runs from local demo data. To enable Supabase persistence, set:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Demo login:

```text
Email: ilia@footy.app
Password: footy123
```

## Build

To compile the project:

```bash
npm run build
```

The compiled output is created in `dist/`. Do not include `dist/` in the submission ZIP.

## Tests

Run the automated test suite:

```bash
npm test
```

The tests cover data integrity, game references, player ratings, TrueSkill-style behavior, signup flow, organizer operations, and UI flows.

## Supabase Setup

The database schema is under:

```text
supabase/migrations/
```

Seed data script:

```bash
npm run db:seed
```

The seed command requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`. Do not expose that key in the browser or commit it to Git.

## Repository

```text
https://github.com/AlonB22/Hevre-App
```

## Live Demo

The app is **Vercel-ready** but is **not deployed online yet** from this workspace. There is no live `*.vercel.app` URL in the repo right now.

To publish before submission:

1. Sign in at [vercel.com](https://vercel.com).
2. Click **Add New → Project** and import `AlonB22/Hevre-App`.
3. Keep the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable:
   - `VITE_DEMO_PASSWORD=footy123`
5. Deploy and copy the production URL (for example `https://hevre-app.vercel.app`).

Optional Supabase variables:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Until Vercel is connected, graders can run the app locally with the steps below.

## Deployment

Recommended free deployment:

- Frontend: Vercel Free plan
- Backend: Supabase Free plan

Vercel settings:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
```

Required environment variables in Vercel:

```text
VITE_DEMO_PASSWORD=footy123
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Submission Notes

The submission ZIP should include the source code only. Do not include generated or local files such as:

- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `.env`
- `.vite/`
- local logs and editor files

The repository already includes `.gitignore` rules for those files.

## Main Technologies

- React 19
- Vite
- Supabase
- Leaflet / OpenStreetMap
- Vitest and React Testing Library
- Local TrueSkill-style rating engine

