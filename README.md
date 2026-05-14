# BruinFun

A community-driven web platform where UCLA students discover and share fun activities in LA.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** TailwindCSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Photos:** Cloudinary
- **Hosting:** Vercel

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

3. Copy the env file:
```bash
   cp .env.example .env.local
```
   Fill in the values from Supabase and Cloudinary.

4. Run Prisma migrations:
```bash
   npx prisma migrate dev
```

5. Start dev server:
```bash
   npm run dev
```

Visit `http://localhost:3000`.

## Development Workflow

1. Branch off `main`:
```bash
   git checkout main
   git pull
   git checkout -b feature/US1-signup
```

2. Commit using Conventional Commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `refactor:` code changes that don't change behavior
   - `chore:` tooling, dependencies

3. Push and open a PR. Wait for at least 1 approval before merging.

## Team (not set)

- Person 1 — Authentication
- Person 2 — Activity Posting & Database
- Person 3 — Feed, Search, Map
- Person 4 — Activity Details, Ratings, Comments
- Person 5 — Bookmarks, Profile, Polish
EOF