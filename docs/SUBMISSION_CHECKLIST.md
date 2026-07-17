# Submission Checklist

## Required Deliverables

- Source-code ZIP downloaded/exported from the GitHub repository.
- `README.md` included in the repository root.
- One PDF file with all project documents: `docs/Footy-Project-Book.pdf`.

## Do Not Include in ZIP

- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `.env`
- `.vite/`
- local logs
- editor folders such as `.vscode/` or `.idea/`

## Local Run Instructions

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Demo user:

```text
Email: ilia@footy.app
Password: footy123
```

## Validation Before Submission

```bash
npm test
npm run build
```

Both commands should pass before creating the ZIP.

Current verified status (17 Jul 2026):

- Tests: **65/65 passed**
- Build: **passes**
- GitHub: `https://github.com/AlonB22/Hevre-App` (branch `main`)
- Submission ZIP: `FINALS PRO/Footy-Submission.zip`
- Submission PDF: `hevre-v2/docs/Footy-Project-Book.pdf`

## What To Upload (2 files only)

1. **ZIP** — source code (`Footy-Submission.zip`)
2. **PDF** — project book (`Footy-Project-Book.pdf`)

Do **not** upload links instead of files. Only one team member should submit.

## Free Hosting

Recommended:

- Vercel for frontend hosting.
- Supabase for backend database.

Vercel settings:

```text
Build command: npm run build
Output directory: dist
```

Environment variables:

```text
VITE_DEMO_PASSWORD=footy123
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

