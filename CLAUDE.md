# CLAUDE.md — Development Rules

## Code Style
- No file over ~80 lines. If it grows, split it.
- One file = one responsibility. No multi-purpose files.
- No unused imports, variables, or dead code.
- Prefer explicit over clever. Readable > smart.
- TypeScript strict mode. No `any`.

## Architecture
- Backend: Bun + Hono. One file per route, one file per DB table.
- Frontend: Vite + React + TypeScript. One file per component.
- DB queries stay in `backend/db/`. Routes stay in `backend/routes/`. Never mix.
- Shared types live in `frontend/src/types.ts` only.
- API calls from frontend go through `frontend/src/api/client.ts` only. No raw fetch elsewhere.

## Do Not
- Do not add dependencies without a clear reason.
- Do not create large monolithic components.
- Do not put business logic in React components — keep components presentational.
- Do not regress existing features when adding new ones. Check affected files before editing.
- Do not add comments that just describe what the code does — make the code self-explanatory.
- Do not use `any` in TypeScript.
- Do not add placeholder/mock data that isn't removed before committing.

## Adding Features
- Before adding a feature, identify the smallest set of files that need to change.
- Add the DB schema change first, then the route, then the frontend.
- Keep the Ollama queue logic isolated in `backend/routes/ollama.ts`.
- New UI elements go in their own component file under `frontend/src/components/`.

## Database
- All schema is defined in `backend/db/client.ts` (CREATE TABLE IF NOT EXISTS).
- Migrations are just new `ALTER TABLE` or `CREATE TABLE` statements appended to `client.ts`.
- Never drop columns or tables without explicit instruction.

## Running
- `bun run dev` starts everything. Never require more than one command.
- Backend on `localhost:3000`, frontend on `localhost:5173`.
