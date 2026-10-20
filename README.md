# 🏸 Badminton Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB-3ecf8e)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#license)

A fast, personal, **local-first web application** for tracking your badminton matches — scores, opponents, partner chemistry, and derived stats. 

**Zero server, no account creation, no tracking:** your data stays 100% in your browser (IndexedDB) with instant JSON export and import for seamless backups and device transfers.

---

## ✨ Features

- **📊 Comprehensive Dashboard** — Win rate %, current streak (wins/losses), average points per set, recent form indicators (W/L dots), interactive points-per-match Recharts graph, and recent matches table.
- **🔍 Filterable Match History** — Full-text search across opponents, partners, and personal notes. Filter by format (Singles/Doubles), result (Wins/Losses), and date ranges, with a 1-click filter reset.
- **🏸 Singles & Doubles Support** — Track singles sparrings or doubles pairings. Name autocomplete provides instant dropdown suggestions based on previous matches.
- **🤝 Partner Chemistry & Opponent Breakdown** — Dedicated partner performance view showing your record, set ratios, and win percentage with each partner and against specific opponent pairs.
- **📝 Match Detail & Set Breakdown** — Clean set-by-set breakdown highlighting set winners in green, total points for/against, and match notes.
- **⚖️ BWF-Compliant Rules & Validation** — Prevents tied sets (badminton sets cannot end in a draw) and ensures best-of-3 matches have a decisive winner.
- **🔄 Cross-Tab Synchronization** — Real-time state syncing across open browser tabs via Web `BroadcastChannel`. Adding or editing a match in one tab instantly updates all other tabs.
- **📱 Responsive & Court-Ready** — Mobile-first layout with smooth horizontal touch-scrolling data tables, accessible modal dialogs (no disruptive native browser popups), and an eye-friendly dark theme.
- **💾 Backup & Restore** — Fast batch import and export via structured JSON. Re-importing existing files safely upserts by `id` with zero duplicates.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
| :--- | :--- | :--- |
| **Framework** | React 18 + TypeScript | Strict type safety, predictable component model, fast DX |
| **Build Tool** | Vite 6 | Sub-second HMR, optimized production builds |
| **Routing** | React Router (`HashRouter`) | Client-side routing that works out-of-the-box on GitHub Pages and static hosts with zero server redirect configuration |
| **Storage** | IndexedDB via [`idb`](https://github.com/jakearchibald/idb) | Durable, high-capacity client-side database; zero backend required |
| **Realtime Sync** | `BroadcastChannel` API | Automatic cross-tab sync without polling or server connections |
| **Visualizations**| Recharts | Lightweight point trend and score difference charts |
| **Dates** | `date-fns` v4 | Modern, timezone-safe date parsing and formatting |
| **Performance** | `React.lazy` + Manual Chunking | Initial JS payload under **6 kB**, deferring heavy chart libraries until needed |
| **Styling** | Vanilla CSS (Dark Theme) | Zero CSS runtime overhead, pure CSS variables, fully responsive |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, pnpm, or yarn

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/t4nnnna/badminton-dashboard.git
cd badminton-dashboard

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

### Production Build

```bash
# Type-check and bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

`dist/` is completely static. Because the app uses `HashRouter`, you can deploy it directly to **GitHub Pages**, **Cloudflare Pages**, **Netlify**, **Vercel**, or serve it from any static file server without special redirect rules.

---

## 📐 Data Model

Every match is stored in IndexedDB under the `badminton` database (`matches` store):

```ts
interface SetScore {
  me: number;
  them: number;
}

interface Match {
  id: string;               // Unique ID (UUID or timestamp-seeded)
  date: string;             // ISO calendar date: YYYY-MM-DD
  format: 'singles' | 'doubles';
  opponents: string[];      // 1 name for singles, up to 2 for doubles
  partner: string;          // Teammate name (doubles only, '' for singles)
  sets: SetScore[];         // 1 to 3 sets in order played
  notes: string;            // Notes, venue, or court observations
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}
```

> **Derived Stats Philosophy**:
> All statistics (win rate, winning/losing streaks, sets won/lost, points differential, partner records, and head-to-head metrics) are **derived at read time**. This prevents data duplication, cache invalidation bugs, and stale database records.

---

## 📦 Backup & Data Format

Navigating to **Settings → Export JSON** downloads a formatted JSON file:

```json
{
  "app": "badminton-dashboard",
  "version": 1,
  "exportedAt": "2026-10-20T20:00:00.000Z",
  "matches": [
    {
      "id": "e9b27d42-4217-4835-bd84-3c5825310e30",
      "date": "2026-10-20",
      "format": "singles",
      "opponents": ["Viktor Axelsen"],
      "partner": "",
      "sets": [
        { "me": 21, "them": 19 },
        { "me": 18, "them": 21 },
        { "me": 21, "them": 17 }
      ],
      "notes": "Tough 3-setter, great footwork on drop shots.",
      "createdAt": "2026-10-20T19:30:00.000Z",
      "updatedAt": "2026-10-20T19:30:00.000Z"
    }
  ]
}
```

* **Upsert on Import**: Importing an existing backup file updates matches by `id` rather than duplicating them.
* **Batch Transactions**: Imports are processed in a single fast IndexedDB transaction.

---

## 📂 Project Structure

```
src/
├── main.tsx                 # Application entry point
├── App.tsx                  # HashRouter routes with React.lazy code-splitting
├── types.ts                 # TypeScript domain interfaces (Match, SetScore, GameFormat)
├── styles.css               # Dark theme, layout, responsive utilities, animations
├── lib/
│   ├── db.ts                # IndexedDB CRUD, batch transactions, cross-tab sync
│   ├── stats.ts             # Pure derived analytics (win rate, streaks, H2H, partners)
│   └── format.ts            # Date formatting, score presentation, ID generation
├── hooks/
│   └── useMatches.ts        # Primary data hook with cross-tab event listeners
├── components/
│   ├── Layout.tsx           # Sticky navigation header and container layout
│   ├── MatchList.tsx        # Filterable match table with responsive scroll
│   ├── SummaryCards.tsx     # Stat cards (matches, win rate, streak, avg points)
│   └── ConfirmModal.tsx     # Accessible, themed confirmation dialog
└── views/
    ├── Dashboard.tsx        # Overview cards, recent form, Recharts trend graph
    ├── History.tsx          # Full match history with multi-parameter filters
    ├── MatchDetail.tsx      # Set-by-set breakdown and match actions
    ├── MatchEdit.tsx        # Add / edit match form with live validation
    ├── Partners.tsx         # Doubles partner chemistry and record by opponent
    └── Settings.tsx         # JSON backup export, import, and data management
```

---

## 🔮 Roadmap Ideas

- [ ] **Head-to-Head (H2H) Explorer** — Dedicated opponent profile page with rivalry stats, score margins, and past matches.
- [ ] **Live Court-Side Scorekeeper** — Tap-to-score live clicker with BWF service court indicator (even/odd), auto set switches, and 1-tap save.
- [ ] **PWA Offline Support** — Installable to home screen via service worker (`vite-plugin-pwa`) for offline court use in low-reception gyms.
- [ ] **CSV / Spreadsheet Export** — Export match logs directly to `.csv` for analysis in Excel or Google Sheets.
- [ ] **Singles vs. Doubles Filter on Dashboard** — Toggle dashboard analytics specifically for singles or doubles play.

---

## 📄 License

Personal / private project. All rights reserved.
