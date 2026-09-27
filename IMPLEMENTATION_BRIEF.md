# Dive Analyzer Implementation Brief

## Goal
Build a polished web application called Dive Analyzer.

The app analyzes single-dive Subsurface SSRF/XML files and optionally saves analyzed dives to a user's Supabase-backed profile.

## Core user flows

### Anonymous user
- Open the app.
- Upload a single-dive Subsurface SSRF/XML file OR choose one of the sample dives.
- Parse the file entirely in the browser.
- View a useful dive analysis.
- Be prompted to create an account only if they want to save the dive.

### Authenticated user
- Register.
- Log in.
- Log out.
- Analyze uploads exactly like an anonymous user.
- Save analyzed dives to their profile.
- View a "My Dives" page.
- Reopen any saved dive.
- Edit user-controlled metadata and notes.
- Delete saved dives.

## Parser requirements
Input format is single-dive Subsurface SSRF/XML.

Real parser fixtures exist in:
public/sample-dives/

The parser must support the actual XML structures found in these fixtures.

It must:
- handle missing fields gracefully
- never fabricate unavailable metrics
- tolerate sparse/manual dives
- support both older DL7-derived exports and newer Teric-derived exports
- preserve raw parsed metadata where useful
- fail with a clear human-readable error for unsupported or malformed files

## Analysis
Display metrics when source data allows them:

- date/time
- site/location
- duration
- maximum depth
- average depth
- minimum and maximum temperature
- gas mix / oxygen percentage
- cylinder information
- starting pressure
- ending pressure
- gas used
- minimum NDL
- average NDL where meaningful
- maximum ascent rate
- maximum descent rate
- time spent in depth bands
- dive computer / device information

If enough data exists, calculate:
- SAC/RMV
- pressure consumption rate
- ascent/descent statistics

Do not calculate a metric if the required source data is missing or ambiguous.

## Visualizations
Provide polished interactive charts where applicable:

- depth vs time
- pressure vs time
- NDL vs time
- temperature vs time

Charts should:
- share a sensible time axis
- have tooltips
- use readable units
- gracefully omit unavailable series
- work well on desktop and mobile

## Sample dives
Expose the sample dives as a polished demo/test selector.

Use friendly display names derived from the files rather than only showing raw filenames.

Do not hard-code parser results for sample dives. They must pass through the same parser used for uploaded files.

## Database
Use Supabase.

Store only what is useful for saved dives.

Suggested model:
- authenticated user owns many saved dives
- each saved dive has:
  - id
  - user_id
  - created_at
  - updated_at
  - title
  - notes
  - source filename
  - original dive XML or equivalent preserved source payload
  - normalized summary metadata for listing/searching

Use Row Level Security so users can only access their own dives.

## Authentication
Use Supabase Auth.

Support:
- email/password registration
- email/password login
- logout
- persisted session

Do not block anonymous analysis behind authentication.

## CRUD
Authenticated users must be able to:
- Create/save a dive
- Read/list/reopen their dives
- Update title and notes
- Delete a dive

## Frontend
Use React + Vite.

Keep the design modern, clean, professional, and dive-themed without looking gimmicky.

Suggested pages:
- Landing / Analyze
- Analysis results
- Login
- Register
- My Dives
- Saved Dive detail

Use responsive design.

## Error handling
Handle:
- invalid XML
- unsupported Subsurface structure
- files containing zero dives
- files containing more than one dive
- missing profile samples
- missing pressure data
- missing temperature data
- Supabase failures
- auth failures

Never crash the UI for malformed input.

## Testing
Create automated tests for:
- parser behavior using multiple real fixtures
- sparse/manual dive
- rich Teric dive
- malformed input
- multi-dive file rejection
- calculations
- important auth-independent utility logic

## Deployment
The repository is already connected to Netlify.

Expected build:
npm run build

Expected publish directory:
dist

Netlify already has:
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

## Git workflow
Make regular meaningful commits during development.

Do not make the entire application in one giant final commit.

Use commits that reflect real milestones such as:
- frontend scaffold
- parser implementation
- charts and analysis
- Supabase schema/auth
- saved dive CRUD
- tests
- documentation/deployment fixes

Push progress to origin/main.

## Documentation
README must include:
- project name
- description
- features
- technology stack
- local setup
- environment variables
- Supabase setup/migration instructions
- test instructions
- build instructions
- deployed application link placeholder if not yet known
- sample dive information
- brief architecture overview

## Important constraints
- Do not expose Supabase secret/service-role keys in frontend code.
- Do not commit .env.local.
- Do not replace the real sample fixtures with synthetic data.
- Do not invent dive metrics.
- Do not require a custom backend server unless truly necessary.
- Keep the project understandable enough for a short class demo.
