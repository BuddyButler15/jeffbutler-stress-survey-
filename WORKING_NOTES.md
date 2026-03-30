# Working Notes — BAIS:3300 Undergraduate Business Student Survey

> **Internal document — not public-facing.**
> Not for distribution. Update this file at the end of every working session.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before making any suggestions or changes.
2. Read `README.md` for public-facing context, tech stack overview, and setup instructions.
3. Do not change the folder structure, file naming conventions, or routing approach without discussing it with the developer first.
4. Follow all conventions in the **Conventions** section exactly — do not introduce new patterns.
5. Do not suggest anything listed under **What Was Tried and Rejected**.
6. Ask before making any large structural changes (e.g., adding a state management library, changing the router, splitting files into new directories).
7. This project was AI-assisted. Refactor conservatively — prefer small, targeted changes over wholesale rewrites.
8. The Supabase column for major is `major` (not `majors`) — this has caused repeated bugs. Never change this name without updating every reference.

---

## Current State

**Last Updated:** 2026-03-30

The app is fully functional end-to-end in the Replit development environment. Supabase is connected with the correct anon public key, the database table and RLS policies are in place, and all three pages render without errors.

### What Is Working
- [x] Home page with "Take the Survey" and "View Results" buttons
- [x] Survey form with four questions, inline validation, and thank-you screen
- [x] "Other" major text field appears on check and auto-focuses
- [x] Supabase INSERT on form submission
- [x] Results page loads data from Supabase and renders three Recharts charts
- [x] Stress level vertical bar chart (1–10)
- [x] Majors horizontal bar chart with "Other" write-ins normalized
- [x] Sleep hours horizontal bar chart
- [x] Footer on all pages: "Survey by Buddy Butler, BAIS:3300 - spring 2026"
- [x] `staticwebapp.config.json` added for Azure Static Web Apps SPA routing
- [x] README.md and WORKING_NOTES.md in project root

### What Is Partially Built
- [ ] Azure Static Web Apps deployment — `staticwebapp.config.json` is in place but build environment variables and GitHub Actions workflow are not yet configured
- [ ] Exercise question normalization — accepts free text (Y/N/yes/no etc.) without enforcing a canonical value

### What Is Not Started
- [ ] Duplicate submission prevention
- [ ] Supabase Realtime subscription for live chart updates
- [ ] Instructor dashboard / protected admin view
- [ ] CSV export of results
- [ ] GitHub Actions workflow for Azure SWA CI/CD

---

## Current Task

Setting up this project to deploy to **Azure Static Web Apps**. The `staticwebapp.config.json` SPA routing fallback is done. The next steps are: (1) configure the Azure SWA build with the correct `app_location`, `output_location`, and `app_build_command`; (2) add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `BASE_PATH` as Azure Application Settings; (3) configure Supabase allowed origins to include the Azure domain.

**Next single step:** Configure Azure Application Settings with the three required environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `BASE_PATH=/`).

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 19 | Component-based UI, industry standard for this stack |
| TypeScript | 5 | Type safety; catches schema/column name mismatches early |
| Vite | 7 | Fast dev server; required by the Replit monorepo template |
| Tailwind CSS | 4 | Utility-first; scoped styles without a separate CSS module system |
| Wouter | 3.3 | Lightweight router; no need for React Router's full feature set |
| Recharts | 2.15 | Declarative React charting; simple API for bar charts |
| Supabase JS | 2.100 | Official client; handles auth header injection for anon access |
| Supabase (PostgreSQL) | hosted | Free tier sufficient; RLS handles anon read/write security |
| pnpm workspaces | 10 | Monorepo tool used by Replit template; do not switch to npm/yarn |

---

## Project Structure Notes

```
/ (repo root)
├── README.md                        # Public-facing documentation
├── WORKING_NOTES.md                 # This file
├── pnpm-workspace.yaml              # Workspace definition — do not edit
├── package.json                     # Root workspace package
└── artifacts/
    └── survey/                      # The only active frontend artifact
        ├── SUPABASE_SETUP.sql       # One-time DB setup script — keep for reference
        ├── vite.config.ts           # Reads PORT and BASE_PATH from env — both required
        ├── tsconfig.json
        ├── package.json             # Pruned to only actual dependencies
        └── src/
            ├── main.tsx             # Entry point
            ├── App.tsx              # Router + persistent footer
            ├── index.css            # ALL styles live here — no CSS modules
            └── lib/
            │   ├── supabase.ts      # Client + SurveyResponse type definition
            │   └── utils.ts         # Utility helpers (currently minimal)
            └── pages/
                ├── home.tsx         # Landing page
                ├── survey.tsx       # Form + thank-you screen (single file)
                ├── results.tsx      # Charts page — fetches on mount
                └── not-found.tsx    # 404 fallback
        └── public/
            ├── favicon.svg
            ├── opengraph.jpg
            └── staticwebapp.config.json   # Azure SWA SPA routing fallback
```

### Non-Obvious Decisions

- **All styles in `index.css`** — No CSS modules, no component-scoped styles. All class names are BEM-like semantic names (`.form-group`, `.chart-container`, etc.). Keep it this way.
- **No shared component library** — The original scaffold included 45+ shadcn/UI components. All were deleted because none are used by this app. Do not re-add them.
- **Single `src/pages/survey.tsx` file** — The form and the thank-you screen are in one file, toggled by a `submitted` boolean. This was intentional to keep state co-located.
- **`dist/public` as build output** — This is set in `vite.config.ts` and is the path Azure SWA's `output_location` must point to (relative to `app_location`).

### Files/Folders That Must Not Be Changed Without Discussion

- `artifacts/survey/vite.config.ts` — PORT and BASE_PATH env var handling is required by Replit and Azure
- `artifacts/survey/src/lib/supabase.ts` — Column names in `SurveyResponse` type must match DB schema exactly
- `artifacts/survey/SUPABASE_SETUP.sql` — Source of truth for DB schema; update here if schema changes
- `pnpm-workspace.yaml` and root `package.json` — Managed by Replit monorepo; do not edit

---

## Data / Database

### Table: `survey_responses` (Supabase / PostgreSQL)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | auto | `gen_random_uuid()` default; primary key |
| `exercise` | `text` | yes | Free-text input — not normalized; values like "Y", "yes", "Yeah" all appear as-is |
| `sleep_hours` | `text` | yes | One of six fixed dropdown values from `SLEEP_OPTIONS` constant |
| `stress_level` | `integer` | yes | 1–10; enforced by `CHECK` constraint in DB and radio buttons in UI |
| `major` | `text[]` | yes | Array; one or more values from `MAJOR_OPTIONS`; "Other" entries use `other_major` |
| `other_major` | `text` | no | Populated only when `major` contains "Other"; normalized to Title Case on display |
| `created_at` | `timestamptz` | auto | `now()` default |

**RLS Policies:**
- `anon_insert`: anon role can INSERT, `WITH CHECK (true)`
- `anon_select`: anon role can SELECT, `USING (true)`

**Critical naming note:** The column is `major` (singular). Earlier development accidentally used `majors` in several places, causing 401/query errors. Always use `major` in all Supabase selects, inserts, and TypeScript types.

---

## Conventions

### Naming Conventions

- **Files:** `kebab-case.tsx` for pages (`not-found.tsx`), `camelCase.ts` for libs (`supabase.ts`)
- **Components:** PascalCase function names matching file name (`export default function Results()`)
- **CSS classes:** semantic BEM-like lowercase with hyphens (`.form-group`, `.btn-primary`, `.chart-container`)
- **Supabase column:** always `major` (not `majors`)

### Code Style

- TypeScript strict mode; no `any` types
- React functional components only; no class components
- Inline event handlers for simple cases; named functions for validation and submission logic
- `aria-describedby` on all inputs that can show an error; `role="alert"` on error spans
- No external UI component library — all UI is plain HTML + Tailwind + `index.css`

### Framework Patterns

- Routing: Wouter `<Link href="...">` for navigation; `<Route>` in `App.tsx`
- Supabase calls: always `await supabase.from(...).select(...)` or `.insert(...)` inside async functions; destructure `{ data, error }`
- Form state: individual `useState` per field (not a single form object); validated on submit only
- Charts: `<ResponsiveContainer>` wrapping all Recharts components; height calculated from data length for horizontal charts

### Git Commit Style

```
type: short description in present tense

Types: feat | fix | chore | docs | refactor | style
Examples:
  feat: add sleep hours chart to results page
  fix: rename majors column reference to major
  docs: update WORKING_NOTES with Azure deployment status
```

---

## Decisions and Tradeoffs

- **Wouter over React Router:** React Router adds ~40KB and features (loaders, actions) not needed for a 3-page static app. Do not suggest switching.
- **All styles in one CSS file:** Easier for a solo developer to scan and change. The app is small enough that a single file is not a maintenance problem. Do not suggest CSS modules or styled-components.
- **Free-text exercise question:** The original spec asked for a text input with placeholder "Y/N". It was not converted to a radio/checkbox to match the spec exactly. Do not change the input type without confirmation.
- **No duplicate prevention:** Adding session/cookie-based duplicate prevention was considered but rejected as out of scope for a classroom survey. Do not suggest implementing it unless asked.
- **Results fetch on mount (no cache/realtime):** Supabase Realtime was considered but adds complexity. A simple `useEffect` fetch on page load is sufficient for the class context. Do not suggest adding Realtime unless asked.
- **Deleted all shadcn/UI scaffold components:** 45+ auto-generated components were removed because they were flagged by code review as bloat and none were used. Do not suggest re-adding any of them.

---

## What Was Tried and Rejected

- **`majors` as the Supabase column name** — Was used initially; caused repeated bugs across insert payload, select query, and type definitions. Renamed to `major`. Do not suggest using `majors` again.
- **Em dash (`—`) in footer text** — Initially used `&mdash;`. Spec required a plain hyphen (`-`). Changed to literal `-`. Do not revert.
- **shadcn/UI component library** — Scaffold included 45+ components. All deleted. Code review rejected the build twice for this reason. Do not suggest re-adding.
- **`use-toast.ts` / `use-mobile.tsx` hooks** — Came with scaffold; imported deleted UI components; neither was used by the app. Deleted. Do not re-add.
- **`tw-animate-css` import in `index.css`** — Was in the scaffold template. Package was removed from `package.json` but import remained, causing a build failure. Import was removed. Do not add it back.
- **Service role key in `VITE_SUPABASE_ANON_KEY`** — User initially set the Supabase `service_role` secret key. Supabase rejected it with "Forbidden use of secret API key in browser". Replaced with the `anon public` (`sb_publishable_...`) key.

---

## Known Issues and Workarounds

**Issue 1: Exercise question accepts any free text**
- Problem: The field is a plain text input. "Y", "Yes", "yes", "yeah" are all stored as distinct values and shown separately on the Results page if a chart were added for exercise.
- Workaround: No chart for exercise currently exists on Results page, so the raw values are not visualized.
- Do not remove this note; exercise normalization is in the roadmap.

**Issue 2: No duplicate submission prevention**
- Problem: A student can submit the survey multiple times. Each submission is stored independently.
- Workaround: None. Accepted for classroom use where social pressure and honor system are sufficient.
- Do not remove this note.

**Issue 3: Results page refetches on every visit**
- Problem: Each time a user navigates to `/results`, a new Supabase SELECT is issued. There is no caching or realtime subscription.
- Workaround: The page shows a "Loading results…" indicator during the fetch. For classroom sizes this is fast enough.
- Do not remove this note; Realtime is in the roadmap.

**Issue 4: `BASE_PATH` env var required by Vite config**
- Problem: `vite.config.ts` throws at startup if `BASE_PATH` is not set. This is a Replit monorepo convention. On Azure it must be explicitly set to `/` as an Application Setting at build time.
- Workaround: Replit sets it automatically in development. For Azure, add `BASE_PATH=/` to Application Settings.
- Do not remove this guard from `vite.config.ts`.

---

## Browser / Environment Compatibility

### Front-End

- **Tested in:** Chrome (latest), via Replit preview iframe
- **Expected support:** All evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Known incompatibilities:** None identified. No CSS features requiring polyfills; no experimental APIs used.

### Back-End / Build Environment

- **OS:** Linux (NixOS via Replit container)
- **Node.js:** 20+
- **Package manager:** pnpm 10 (workspace-aware); do not use npm or yarn
- **Environment variables required at dev time:** `PORT`, `BASE_PATH`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Environment variables required at Azure build time:** `BASE_PATH`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (PORT not needed for static builds)

---

## Open Questions

- What Azure subdomain/custom domain will the app live on? (Needed to configure Supabase allowed origins.)
- Should the exercise question be converted to radio buttons (Y / N / Sometimes) to make the data more useful? This would be a breaking schema change if existing data uses free text.
- Is a response timestamp chart useful for showing when during the semester students responded?
- Should the instructor have a read-only view with more detail than the public Results page?

---

## Session Log

### 2026-03-30

**Accomplished:**
- Built complete three-page survey app (Home, Survey form, Results) from scratch
- Connected Supabase with anon public key and RLS policies
- Fixed repeated `majors` → `major` column name bug across insert, select, and TypeScript types
- Removed 45+ unused shadcn/UI scaffold components and unused hooks
- Fixed footer text from em dash to hyphen per spec
- Added `staticwebapp.config.json` for Azure SPA routing fallback
- Generated `README.md` and `WORKING_NOTES.md`

**Left Incomplete:**
- Azure Static Web Apps full deployment (build config, env vars, GitHub Actions workflow)

**Decisions Made:**
- Use anon public key (`sb_publishable_...`), not service role key, for `VITE_SUPABASE_ANON_KEY`
- `staticwebapp.config.json` placed in `artifacts/survey/public/` so Vite copies it to `dist/public/` at build time

**Next Step:** Configure Azure Application Settings with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `BASE_PATH=/`

---

## Useful References

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [Wouter GitHub](https://github.com/molefrog/wouter)
- [Vite Configuration Reference](https://vitejs.dev/config/)
- [Azure Static Web Apps — Build Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Azure SWA — Configuration File (`staticwebapp.config.json`)](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration)
- [Azure SWA — Environment Variables at Build Time](https://learn.microsoft.com/en-us/azure/static-web-apps/application-settings)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- **AI Tools Used:** Replit AI Agent (Anthropic Claude) — used throughout for scaffolding, debugging, and code review. All output was reviewed and corrected by the developer. Treat AI-generated code as a starting point, not a finished product.
