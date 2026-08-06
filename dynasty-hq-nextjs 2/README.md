# Dynasty HQ — Next.js port

A direct port of the Apps Script version to Next.js (App Router, TypeScript)
for deployment on Vercel. Nothing about the app was redesigned — same CSS,
same tab schemas, same parsing logic. Only the platform-specific plumbing
changed:

| Apps Script | Next.js |
|---|---|
| `SpreadsheetApp.getActiveSpreadsheet()` / `openByUrl()` | `googleapis` Sheets API v4, authenticated via OAuth2 refresh token (`src/lib/sheets.ts`) |
| `doGet()` returning `Index.html` | `src/app/page.tsx` + `src/app/layout.tsx` |
| `<style>` block in `Stylesheet.html` | `src/app/globals.css` (verbatim) |
| `google.script.run.getDashboardData()` | `GET /api/dashboard` (`src/app/api/dashboard/route.ts`), fetched client-side on mount exactly like the original's `boot()` |
| Vanilla-JS `render()` rebuilding `innerHTML` from a global `state` object | React components + `useState` in `src/components/DashboardApp.tsx` (state fields map 1:1: `tab`, `subtab`, `statType`, `colors`, `showColorPicker`, `season`) |
| `PropertiesService` (ranking-movement snapshots — unused in the original too) | `src/lib/snapshot.ts`, same in-memory shape, documented as needing a real KV store if this dead code path is ever wired back in |

## Where everything lives

- `src/lib/parsers.ts` — every `parse*_` function from `Code.gs`, unchanged row/column logic.
- `src/lib/sheets.ts` — the Sheets API v4 client and the settings/assets readers.
- `src/lib/dashboard.ts` — `getDashboardData()` / `buildStoryBrief_` / `getMyTeamName()`, ported as-is.
- `src/lib/gating.ts` — `gateInfo()` / `tabLocked()` / `subtabLockedIds()` / `TABS` / `PRESETS`.
- `src/lib/format.ts` — `initials()`, `toPct()`, `favoriteLine()`, `numOr()`, `isMine()`. (`esc()` was dropped — JSX escapes text automatically, so every `${esc(x)}` call site is just `{x}` now.)
- `src/components/tabs/*` — one file per tab, each a direct translation of the matching `render*()` function.
- `src/components/shared/*` — the small repeated pieces (`badge()`, `sectionLabel()`, the `.row`/`.thead` grid pattern, `lockedCard()`, the color-picker modal).

Two render functions in the original were defined but never wired into the
tab router (`renderContent`/`toggleContent`, `renderCoachMoves`) — same here:
`src/components/tabs/Content.tsx` and the `CoachMoves` export in
`CoachingCorner.tsx` exist for parity but aren't imported by `DashboardApp`.
Same story for `moveIndicator()` / the ranking-movement snapshot functions —
ported to `src/components/shared/MoveIndicator.tsx` and `src/lib/snapshot.ts`,
neither called anywhere, matching the original.

## One behavioral note: dates/times

Apps Script's `getValues()` returns real `Date` objects for date/time-
formatted cells, which `fmtTime_`/`fmtDate_` then reformatted. The Sheets API
v4 has no wire format for `Date` — instead, `tabValues()` requests
`valueRenderOption: 'FORMATTED_VALUE'`, which returns each cell exactly as
the spreadsheet displays it (e.g. `"7:00 PM"`, `"29 Aug"`). That's the same
string `fmtTime_`/`fmtDate_` produced, so `fmtTime()`/`fmtDate()` in
`parsers.ts` are now pass-throughs — no behavior change, just where the
formatting happens.

## Setup

1. `npm install`
2. In Google Cloud Console, create an OAuth client ID (APIs & Services >
   Credentials > Create Credentials > OAuth client ID > **Desktop app**).
   Service-account keys aren't an option here due to org policy, so this
   uses a normal OAuth2 refresh token instead — same read-only scope, just
   authorized as a Google account rather than a service account.
3. Generate a refresh token via the
   [OAuth Playground](https://developers.google.com/oauthplayground) (steps
   in `.env.example`), signed in as whichever Google account has Viewer
   access to your sheets.
4. Make sure that account has Viewer access on the **Master Control**
   spreadsheet (SETTINGS/ASSETS/GRAPHICS/BOWLS) and whatever spreadsheet
   `SETTINGS!CURRENT_SHEET_LINK` currently points at — re-share the latter
   every time you switch to a new week's spreadsheet, same as before.
5. Copy `.env.example` to `.env.local` and fill in `MASTER_SPREADSHEET_ID`,
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.
6. `npm run dev`

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel, or run
   `vercel` from this directory.
2. Add the three env vars from `.env.example` in Vercel's Project Settings →
   Environment Variables (paste the private key with its `\n` sequences
   literal, same as `.env.local`).
3. Deploy. The API route runs on the Node.js runtime (set explicitly in
   `src/app/api/dashboard/route.ts`) since `googleapis`' JWT signing needs
   Node's `crypto` module — it won't run on the Edge runtime.

## Known pre-existing quirks (kept intentionally)

Ported as-is because the task was to preserve existing behavior, not fix it:

- `readAssets()` (`readAssets_` in `Code.gs`) filters rows on column index 2
  (`TEAM_MASCOT`), even though its own comment says "TEAM_NAME must exist."
- `parsePlayoffBracket()` starts scanning at row index 1, skipping row 0
  entirely.
- `buildStoryBrief()`'s ranking-movement branch can never fire today, since
  `getDashboardData()` never calls `computeMovement_`/`applyMovement_` to
  populate `changeDir`/`changeNum`/`enteredPoll` on poll entries.
