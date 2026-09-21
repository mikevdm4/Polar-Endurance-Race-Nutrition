# Polar Endurance — Nutrition System

A single-page React app covering the full Polar Endurance formulation
reference: carb mix ratios, flavouring doses, electrolytes, PureFruit gels,
solid fuel (race/training/recovery bars), the savoury range, gut & fuelling
protocol, race day, caffeine, and sourcing.

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Deploy to Vercel

**Option A — Vercel CLI (fastest)**

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects the Vite framework from `vercel.json`.

**Option B — GitHub import (recommended for ongoing edits)**

1. Push this folder to a new GitHub repo.
2. Go to vercel.com → **Add New Project** → import the repo.
3. Vercel will auto-detect Vite; leave the build settings as default.
4. Deploy. Every push to `main` will auto-redeploy.

## Project structure

```
polar-app/
├── index.html          # Entry HTML — fonts load here, not in the component
├── vercel.json          # Tells Vercel this is a Vite app
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx          # React mount point
    └── App.jsx           # The entire app — all sections, all content
```

## Editing content

All the actual nutrition content — flavour doses, electrolyte specs, bar
recipes, protocols — lives in `src/App.jsx` as plain JS data objects near the
top of each section's component (e.g. `FLAVOUR_DATA` for the flavouring
calculator). Edit the values there; the UI updates automatically since the
calculators are driven by those objects, not hardcoded per flavour.

## Notes

- Fonts (Fraunces, Inter, IBM Plex Mono) load via `<link>` tags in
  `index.html` — this is the production-correct way, swapped from the
  `@import` used in the original Claude artifact preview.
- No external API calls, no environment variables needed. Fully static —
  Vercel will serve it from its edge network with zero configuration beyond
  the build command.
