# F1 Fantasy Backend

A fantasy F1 platform: pick a 5-driver squad within a budget, captain doubles points, real race results (fetched live from the OpenF1 API) score your squad, league leaderboards rank everyone. Includes a working vanilla JS frontend served by the same backend.

## Stack

Node.js, Express, MySQL + Sequelize, Redis, JWT auth (access + refresh tokens), Zod validation, Winston logging, Docker Compose, OpenF1 API.

## Architecture

Feature-based modules under `src/modules/<feature>`, each with its own service/routes (and repository/validation where warranted). Controllers stay thin; business logic lives in services.

```
src/
  config/       env (Zod-validated), logger, redis client
  database/
    sequelize.js  Sequelize connection instance
    models.js     all models + associations (single registry file)
  middlewares/  error handling, Redis-backed rate limiting, auth guard
  modules/
    auth/       register/login/refresh/logout, JWT + Redis refresh tokens, bcrypt
    users/      current user profile
    races/      OpenF1 sync (races + drivers), lineup-open countdown, results
    leagues/    create/join (invite code)/list
    lineups/    5-driver squad, budget check, captain, race-lock enforcement
    scoring/    fixed points-by-position table, locks race after results entered
    leaderboard/ per-league ranking, computed on read from RaceResult + Lineup
  utils/        ApiError, ApiResponse, asyncHandler, formatIST
public/         vanilla JS/HTML frontend (multi-page, no build step)
scripts/        one-off maintenance scripts (see below)
```

## What's actually implemented (and verified against a live MySQL/Redis/OpenF1)

- **Auth**: register/login/refresh/logout. Access tokens (15m JWT) + refresh tokens (7d, stored in Redis so logout is an instant key delete, not a DB write). bcrypt password hashing. Redis-backed rate limiting on auth routes.
- **Races & Drivers**: synced live from the real OpenF1 API (`POST /races/sync?year=2026` pulls the actual season schedule, including future races already on the calendar). Only the current season is ever listed.
- **Lineup-open countdown**: each race's lineup window opens at that weekend's real Practice 1 session time (also pulled from OpenF1), not an arbitrary date. Submitting a lineup before Practice 1 is rejected with a clear error. Countdown timestamps are formatted in IST.
- **Driver pricing**: not flat — priced by team competitiveness tier (9–22 base) plus a premium for recognizable "star" drivers (up to 30 total), so squad-building involves real trade-offs.
- **Fantasy squads**: pick exactly 5 drivers within a 90-point budget, one marked captain (2x points). Budget and squad-size are enforced server-side, not just in the UI.
- **Scoring**: fixed points-by-finishing-position table (P1=25 down to P10=1). Submitting results locks the race against further lineup changes.
- **Leaderboard**: computed on read (not cached/pushed) — sums each league member's driver points across every lineup they've ever submitted, doubling captain picks.
- **Frontend**: plain HTML/CSS/vanilla JS, multi-page (`index.html` login → `dashboard.html` races → `lineup.html` squad builder → `leagues.html` → `leaderboard.html`), served directly by Express (`public/`), no separate frontend server or CORS setup needed.

## Known simplifications (by design, not oversights)

- No admin role check on `POST /scoring/results` — any authenticated user can submit results. Fine for a single-player/friends test setup; would need a role guard for anything public.
- No `scoring_rules` DB table — the points-by-position table is a constant in `scoring.service.js`.
- No Kafka, live race polling, notifications, or transfer windows — not built. `FantasyTeam` is one team per user, not one per league.
- Schema is kept in sync via `sequelize.sync()` on boot (and `npm run db:sync` standalone), not versioned migrations — fine for a college project, would want `sequelize-cli` migrations for a real production app.

## Getting started

1. Copy `.env.example` to `.env` and fill in real secrets. Note the MySQL port is `3307`, not the default `3306` — this avoids clashing with a native MySQL install that might already be using `3306`.
2. Start infrastructure: `docker compose up -d mysql redis`
3. Install dependencies: `npm install`
4. Sync the schema to the database: `npm run db:sync`
5. Run the API: `npm run dev`
6. Open **http://localhost:3000** — the frontend is served from there directly.

To run everything (including the backend) in Docker: `docker compose up --build`.

## Scripts

`scripts/db:sync` (`npm run db:sync`) — creates/alters tables to match the Sequelize models without booting the full HTTP server.

`scripts/repriceAndOpenSilverstone.js` — one-off maintenance script used during development: re-prices all existing driver rows with the current pricing formula (useful after tuning the formula), and force-opens a specific already-passed race's lineup window purely for manual end-to-end testing (submit a lineup + results on a race that already happened, to verify the scoring/leaderboard pipeline without waiting for a real race weekend).

## License

ISC
