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

Current verified status:

- Tests: **65/65 passed**
- Build: **passes**
- GitHub repo: `https://github.com/AlonB22/Hevre-App`
- Live Vercel URL: **deploy manually** (see README → Live Demo)
- Submission PDF: `docs/Footy-Project-Book.pdf`
- English project book (separate folder): `Footy-English-Project-Book/Footy-English-Project-Book.pdf`

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

