# Undergraduate Business Student Survey — BAIS:3300

## Descriptionye

A lightweight, three-page web survey built for BAIS:3300 (Business Analytics & Information Systems) at the University of Iowa. It collects anonymous responses from undergraduate business students on exercise habits, sleep duration, stress levels, and academic major, then displays aggregated results as interactive charts in real time. The app is designed to support in-class data collection and discussion without requiring students to create an account.

## Badges

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-8A3BDB?style=for-the-badge)

## Features

- **Anonymous by design** — no login required; no personally identifiable information is collected
- **Four-question survey** — exercise habits, sleep hours (dropdown), stress level (1–10 radio), and major (multi-select checkboxes with free-text "Other")
- **Inline validation** — clear, accessible error messages appear instantly when a field is skipped or incomplete
- **Thank-you summary screen** — confirms the student's answers on submission before they navigate away
- **Live aggregated results** — three Recharts visualizations update automatically as new responses arrive
- **Stress distribution bar chart** — vertical bar chart across levels 1–10
- **Majors breakdown** — horizontal bar chart with "Other" write-ins normalized and sorted by frequency
- **Sleep hours distribution** — horizontal bar chart showing the spread across common sleep ranges

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| TypeScript | Type safety across the entire codebase |
| Vite 7 | Dev server and production bundler |
| Tailwind CSS 4 | Utility-first styling |
| Wouter | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| Recharts | Declarative bar charts on the Results page |
| Supabase | Hosted PostgreSQL database + Row Level Security + REST API |
| `@supabase/supabase-js` | Supabase client for INSERT and SELECT operations |
| Replit | Hosting, secrets management, and deployment |

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)
- A [Supabase](https://supabase.com/) project (free tier works fine)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/bais3300-survey.git
   cd bais3300-survey
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables** — create a `.env` file in `artifacts/survey/`:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_<your-anon-key>
   ```

4. **Create the database table** — open the Supabase SQL Editor and run:
   ```sql
   CREATE TABLE IF NOT EXISTS survey_responses (
     id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
     exercise     text        NOT NULL,
     sleep_hours  text        NOT NULL,
     stress_level integer     NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
     major        text[]      NOT NULL,
     other_major  text,
     created_at   timestamptz DEFAULT now()
   );

   ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "anon_insert"
     ON survey_responses FOR INSERT TO anon WITH CHECK (true);

   CREATE POLICY "anon_select"
     ON survey_responses FOR SELECT TO anon USING (true);
   ```

5. **Start the development server**
   ```bash
   pnpm --filter @workspace/survey run dev
   ```

6. **Open the app** — visit `http://localhost:<PORT>` (the port is printed in the terminal)

## Usage

| Route | Description |
|---|---|
| `/` | Home page — introduction and navigation |
| `/survey` | Four-question anonymous survey form |
| `/results` | Aggregated charts pulled live from Supabase |

**Configuration options:**

| Variable | Where | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` / Replit Secrets | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` / Replit Secrets | Supabase **anon public** key (not the service_role key) |

To build for production:
```bash
pnpm --filter @workspace/survey run build
```

## Project Structure

```
artifacts/survey/
├── SUPABASE_SETUP.sql          # One-time SQL to run in Supabase SQL Editor
├── vite.config.ts              # Vite config (port from env, base path, Tailwind plugin)
├── tsconfig.json               # TypeScript project config
├── package.json                # Dependencies: React, Recharts, Wouter, Supabase JS
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Root layout: router + persistent footer
    ├── index.css               # Global styles, design tokens, component classes
    └── lib/
    │   ├── supabase.ts         # Supabase client + SurveyResponse type
    │   └── utils.ts            # Shared utility helpers
    └── pages/
        ├── home.tsx            # Landing page with CTA buttons
        ├── survey.tsx          # Survey form with validation + thank-you screen
        ├── results.tsx         # Aggregated results with three Recharts charts
        └── not-found.tsx       # 404 fallback page
```

## Changelog

### v1.0.0 — 2026-03-30

- Initial release
- Home, Survey, and Results pages fully implemented
- Supabase integration with Row Level Security (anon INSERT + SELECT)
- Survey form: exercise, sleep hours, stress level (1–10), major (multi-select + Other)
- Results: stress bar chart, majors bar chart (normalized write-ins), sleep bar chart
- Inline form validation with accessible error messages
- Thank-you summary screen on successful submission
- Footer: "Survey by Buddy Butler, BAIS:3300 - spring 2026"

## Known Issues / To-Do

- [ ] The exercise question accepts free-text — responses like "yes", "Yes", "Y" are treated as distinct values and are not normalized before display
- [ ] No duplicate-submission prevention — a single student can submit the survey multiple times
- [ ] The Results page re-fetches from Supabase on every visit rather than caching or using a live subscription

## Roadmap

- Add Supabase Realtime subscription to the Results page so charts update without a full page reload
- Normalize exercise responses (Y/N/Sometimes) into a fixed set of options with a radio group
- Add an instructor-only dashboard protected by Supabase Row Level Security and email-based auth
- Export results as a CSV download directly from the Results page
- Add a response timestamp chart showing survey participation over time

## Contributing

Contributions are welcome for bug fixes and improvements. Please keep changes focused and well-tested. Fork the repository, make your changes on a feature branch, and open a pull request with a clear description of what was changed and why.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Buddy Butler**
University of Iowa — Tippie College of Business
Course: BAIS:3300 — Business Analytics & Information Systems, Spring 2026

## Contact

GitHub: [@BuddyButler15](https://github.com/BuddyButler15)

## Acknowledgements

- [Supabase Docs](https://supabase.com/docs) — Row Level Security setup and JS client reference
- [Recharts](https://recharts.org/) — composable charting library for React
- [Wouter](https://github.com/molefrog/wouter) — minimalist React router
- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework
- [Vite](https://vitejs.dev/) — fast dev server and build tool
- [shields.io](https://shields.io/) — badge generation
- [Replit](https://replit.com/) — cloud development environment and hosting
- OpenAI / Anthropic AI assistants — used during development for code guidance and debugging
