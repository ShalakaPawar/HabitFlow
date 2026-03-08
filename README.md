# HabitFlow — Personal Habit Tracker

HabitFlow is a private, full-stack habit tracker built with Next.js for personal use across phone and laptop. It is designed to be deployed online with a hosted PostgreSQL database so your data stays available even when your laptop is off.

## Features

### Core
- **Habit Tracking** — Create habits with colors, categories, frequency, targets, and daily check-ins
- **GitHub-style Heatmap** — Monthly and yearly activity heatmaps
- **Goals & Targets** — Weekly/monthly goals with sub-tasks and progress tracking
- **Reminders** — Reminder-ready habit structure for future notification support

### Additional
- **Mood Tracker** — Daily mood + energy logging with calendar view
- **Water Intake** — Visual hydration tracker with monthly history
- **Journal** — Daily reflections and gratitude entries
- **Notes** — Quick notes with colors and pinning
- **Fitness / Amazfit** — Manual or watch-synced activity data via API

### Deployment-ready
- **Hosted PostgreSQL** via Prisma
- **App-wide password gate** for private personal access
- **PWA manifest** for installable mobile usage
- **Responsive UI** for desktop and mobile browsers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL via Prisma ORM
- **Icons**: Lucide React
- **Dates**: date-fns

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
APP_PASSWORD="choose-a-strong-personal-password"
APP_SESSION_SECRET="replace-with-a-long-random-secret"
APP_SESSION_COOKIE_NAME="habitflow_session"
```

## Local Development

```bash
npm install
npm run db:push
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client, push schema, and build app |
| `npm start` | Start production server |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:deploy` | Production-safe schema sync |
| `npm run db:studio` | Open Prisma Studio |

## Recommended Hosting

### App hosting
- **Vercel**

### Database
- **Neon Postgres** free tier

### Required production env vars
- `DATABASE_URL`
- `APP_PASSWORD`
- `APP_SESSION_SECRET`
- `APP_SESSION_COOKIE_NAME` (optional)

## Deploying

1. Create a free Neon project and copy the pooled PostgreSQL connection string.
2. Add the environment variables above to your hosting project.
3. Deploy the app.
4. On first build, Prisma will push the schema to the hosted database.
5. Open the deployed URL and unlock the app with your personal password.

## Project Structure

```text
src/
├── app/
│   ├── api/               # REST API routes
│   ├── login/             # Password unlock page
│   ├── habits/            # Habits page
│   ├── tracker/           # Heatmap tracker page
│   ├── goals/             # Goals page
│   ├── notes/             # Notes page
│   ├── mood/              # Mood tracker page
│   ├── water/             # Water intake page
│   ├── journal/           # Journal page
│   ├── fitness/           # Fitness page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── AppShell.tsx       # Layout wrapper that hides app chrome on login
│   └── Sidebar.tsx        # Navigation + app lock button
└── lib/
    ├── auth.ts            # Password/session helpers
    ├── prisma.ts          # Prisma client singleton
    └── utils.ts           # Utility functions
prisma/
└── schema.prisma          # PostgreSQL Prisma schema
```

## Amazfit Watch Integration

The fitness API accepts payloads like:

```json
{
  "date": "2025-01-15",
  "source": "amazfit",
  "steps": 10000,
  "heartRate": 72,
  "sleep": 7.5,
  "calories": 2100,
  "distance": 6.2
}
```

You can later connect Zepp OS or a third-party sync tool to `POST /api/fitness`.

## Notes

- The old local SQLite development database is not used in the hosted setup.
- For a brand-new deploy, Prisma will create the hosted tables automatically.
- The password gate is intended for personal-use privacy, not full multi-user auth.
