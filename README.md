# Dive Analyzer

Dive Analyzer turns single dive Subsurface SSRF/XML exports into a clear, interactive profile analysis. Anyone can upload or choose a real sample dive and inspect it without an account. Sign in only to save dives to a private logbook.

## Features

- Browser-side parsing of one dive from Subsurface `.ssrf` or `.xml` exports
- Ten real sample logs spanning DL7, Shearwater Teric, and sparse manual profiles
- Depth profile plus available pressure, NDL, and temperature charts
- Summary metrics, depth bands, ascent/descent rates, and source-reported SAC
- Imperial or metric units throughout analysis (imperial by default)
- Email/password signup and login with Supabase Auth
- Private saved dive list with reopen, edit title/notes, and delete actions
- Responsive layout and clear handling of missing measurements

## Technology

React, TypeScript, Vite, Recharts, Lucide, Supabase Auth and Postgres, Vitest.

## Local setup

Use Node.js 20 or newer and npm.

```sh
npm install
cp .env.example .env.local
# Set both values in .env.local using your Supabase project settings.
npm run dev
```

Required frontend environment variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key; safe for browser use with RLS enabled |

Never put a service role key in frontend configuration. `.env.local` is ignored by Git.

## Supabase schema

This repository includes `supabase/migrations/20260927000000_saved_dives.sql`. It creates `public.saved_dives`, enables row level security, and restricts select/insert/update/delete to the owning authenticated user. The linked project can be updated with:

```sh
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Registration confirmation behavior is controlled in Supabase Auth settings. For local development, configure the app URL and allowed redirect URLs in the Supabase dashboard.

## Tests and build

```sh
npm test
npm run typecheck
npm run build
```

Tests exercise actual SSRF fixtures (DL7, sparse manual, and rich Teric), error cases, unit parsing, and calculations.

## Sample dives

`public/sample-dives/` contains ten real single-dive Subsurface exports. The app loads those exact files through the same parser used for uploaded files. DL7 logs have depth and intermittent temperature; Teric logs include pressure and NDL samples; the manual edge case has no sensor data. Unavailable measurements and charts are omitted instead of inferred.

## Architecture

The React client reads files in the browser and `src/parser.ts` normalizes Subsurface fields into a typed dive model. `src/analysis.ts` computes profile statistics. Recharts renders only available sample series. Supabase handles email authentication and stores original XML, listing metadata, and notes. Row level security keeps each record private to its owner; no custom server or privileged key is used.

## Deployment

Netlify builds with `npm run build` and publishes `dist`; `netlify.toml` includes SPA routing. Set the two frontend environment variables in Netlify. Deployed URL: **pending Netlify site URL**.
