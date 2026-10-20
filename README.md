# 🏸 Badminton Dashboard

A personal, local-first web app for tracking your badminton matches — scores,
opponents, partners, and the stats that fall out of them. No server, no
accounts: your data lives in your browser (IndexedDB) with JSON
export/import for backup.

## Features

- **Dashboard** — win rate, current streak, points per set, recent form
  (W/L dots), points-per-match chart, recent matches
- **Match history** — searchable, filterable list (opponent, notes, format,
  result, date range)
- **Match detail** — set-by-set score breakdown with per-set winners
- **Add / edit matches** — date, singles/doubles, opponent name(s), partner
  (doubles), up to 3 sets, notes; live W/L preview while you type
- **Name autocomplete** — opponent and partner fields offer a dropdown of
  every name you've logged before (or type a new one)
- **Partner performance** — your doubles record by partner, and by the
  opposing pair
- **Backup & restore** — export/import all data as JSON; delete-all with
  double confirm

## Tech stack

| Layer     | Choice                          | Why                                    |
| --------- | ------------------------------- | -------------------------------------- |
| Framework | React 18 + TypeScript           | type-safe data model, fast DX          |
| Build     | Vite 6                          | instant dev server, one-command build  |
| Routing   | react-router-dom (hash router)  | works from any static host / `file://` |
| Storage   | IndexedDB via [`idb`](https://github.com/jakearchibald/idb) | durable, offline, no server |
| Charts    | Recharts                        | points-per-match trend                 |
| Dates     | date-fns                        | parsing/formatting                     |
| Styling   | hand-rolled CSS, dark theme     | zero build-step styling deps           |

## Quick start

```bash
npm install
npm run dev        # → http://localhost:5173
```

### Production build

```bash
npm run build      # type-checks (tsc -b) then bundles into dist/
npm run preview    # serve the built app locally
```

`dist/` is fully static — drop it on GitHub Pages, Netlify, any static host,
or open `dist/index.html` directly.

## Data model

A `Match` is stored in IndexedDB (`badminton` database, `matches` store):

```ts
interface Match {
  id: string;
  date: string;          // yyyy-mm-dd
  format: 'singles' | 'doubles';
  opponents: string[];   // 1 name for singles, up to 2 for doubles
  partner: string;       // your teammate (doubles only, '' otherwise)
  sets: { me: number; them: number }[];  // 1–3 sets, in order played
  notes: string;
  createdAt: string;     // ISO timestamp
  updatedAt: string;     // ISO timestamp
}
```

All other stats (win rate, streaks, sets, points, head-to-head, partner
records) are **derived at read time** — nothing is stored twice.

Result of a match = more sets won than lost (a level set count is a loss).

### Backup format

`Settings → Export JSON` produces:

```json
{
  "app": "badminton-dashboard",
  "version": 1,
  "exportedAt": "2026-01-15T10:00:00.000Z",
  "matches": [ /* Match objects */ ]
}
```

Import upserts by `id`, so re-importing an old backup won't duplicate.

## Project structure

```
src/
  main.tsx                 # entry point
  App.tsx                  # routes
  types.ts                 # Match / SetScore types
  styles.css               # dark theme
  lib/
    db.ts                  # IndexedDB CRUD + export/import
    stats.ts               # derived stats (summary, head-to-head, partner stats)
    format.ts              # date/score/name display helpers
  hooks/
    useMatches.ts          # shared data hook (list/add/remove/import/clear)
  components/
    Layout.tsx             # top nav
    MatchList.tsx          # filterable matches table
    SummaryCards.tsx       # dashboard stat cards
  views/
    Dashboard.tsx          # overview + chart + recent matches
    History.tsx            # full history with filters
    MatchDetail.tsx        # one match, set-by-set
    MatchEdit.tsx          # add/edit form (name autocomplete lives here)
    Partners.tsx           # partner performance view
    Settings.tsx           # backup & restore
```

## Roadmap ideas

- Live scoring mode (tap-to-increment, auto-declare sets)
- Head-to-head page per opponent
- CSV export
- PWA manifest (pin to home screen, use at the court)

## License

Private / personal project. All rights reserved.