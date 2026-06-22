# Security Notes

## Demo Authentication

Footy's local demo login is controlled by `VITE_DEMO_PASSWORD`. The value is read from the local Vite environment and is intentionally not committed as a shared source-code password.

This is suitable only for a course/demo build. A production deployment must replace it with Firebase Auth, Supabase Auth, or another real identity provider, then enforce permissions on the backend with the authenticated user id and role.

## Roles

The app models three basic roles:

- `player`: can sign in, join/leave games, rate participants, edit their profile, and post community requests.
- `organizer`: can create games and manage/finalize only games they organize.
- `municipality_admin`: can manage any game and update field/permit metadata.

Client-side role checks improve UX and prevent accidental actions in the demo. They are not a security boundary by themselves. The same checks must be mirrored in Firestore Security Rules, Supabase Row Level Security policies, or server APIs before real users or real data are used.

## Firebase Public Config

Firebase web config values such as `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId` are public identifiers for the Firebase project. They are expected to ship in browser bundles and are not secrets.

They are safe only when paired with strict backend controls:

- Enable Firebase Auth and require `request.auth != null` for private reads/writes.
- Store role claims or role documents server-side and validate organizer/admin actions in rules.
- Limit writes by ownership, for example only the game organizer can update teams/results unless the user has the municipality/admin role.
- Validate all document shapes, enum values, numeric ranges, and immutable fields in rules.
- Keep service account keys and admin SDK credentials out of frontend code and `.env` files exposed to Vite.

Public Firebase config without strict rules is unsafe because anyone can initialize a client against the project and attempt reads or writes.

## Supabase Notes

The committed migration enables RLS, but the demo policies are intentionally permissive so the static demo can work without a real auth rollout. Before production, replace permissive demo policies with authenticated policies equivalent to the role rules above, and never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
