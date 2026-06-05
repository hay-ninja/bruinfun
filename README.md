# BruinFun

A community-driven web platform where UCLA students discover and share fun activities in LA.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Manual cookie-based auth
- **Photos:** Cloudinary
- **Hosting:** Vercel

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

1. Clone the repo:
```bash
git clone https://github.com/your-org/bruinfun.git
cd bruinfun
```

2. Install dependencies:
```bash
npm install
```

3. Create your local env file:
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in the values — ask a teammate for the Supabase URL/keys and Cloudinary cloud name, API key, and API secret.

4. Start the dev server:
```bash
npm run dev
```

Visit `http://localhost:3000`.

> **Note:** Never commit `.env.local`. It's gitignored. Your real keys stay local only.

---

## Project Structure

```
app/                  # Next.js App Router pages and layouts
  layout.tsx          # Root layout (html, body, global styles)
  page.tsx            # Homepage — currently renders DemoPage
  globals.css         # Tailwind import + shadcn CSS variables

components/
  ui/                 # shadcn components (auto-populated via CLI)

lib/
  supabase.ts         # Supabase client (reads from .env.local)
  utils.ts            # cn() helper for merging Tailwind classes
```

---

## Branch Conventions

Always branch off `main`. Pull first so you're up to date.

```bash
git checkout main
git pull
git checkout -b <type>/<short-description>
```

### Branch types

| Type | When to use | Example |
|---|---|---|
| `feat/` | New feature or page | `feat/activity-card` |
| `fix/` | Bug fix | `fix/search-bar-overflow` |
| `chore/` | Config, deps, tooling | `chore/update-supabase` |
| `refactor/` | Restructuring without behavior change | `refactor/demo-cleanup` |
| `docs/` | README or comment updates | `docs/setup-instructions` |

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add activity card component
fix: sidebar nav active state not updating
chore: add cloudinary env var to example
refactor: move demo components into /demo folder
docs: update setup steps in README
```

### Pull Requests

- Open a PR against `main`
- At least **1 approval** before merging
- Delete the branch after merge

---

## Adding shadcn Components

```bash
npx shadcn add <component>
# examples:
npx shadcn add button
npx shadcn add dialog
npx shadcn add input card
```

Components land in `components/ui/` as your own code — edit them freely.

---

## Team

| Person | Area |
|---|---|
| ryder | Authentication |
| haydn | Database, http functions, cloundinary api, Activity Log |
| kai| DESIGN, Home page => Feed, Search, Map |
| TBD | Activity Details, Ratings, Comments |
| TBD | Bookmarks, Profile, Polish |
