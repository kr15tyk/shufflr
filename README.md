# Shufflr — Internal Development Docs

> **Private repository. Do not share access.**

---

## What is this?

Shufflr is a SaaS platform for managing shuffleboard leagues. Organizations sign up and get their own isolated environment (subdomain, branding, data) to run seasons, divisions, teams, courts, scheduling, scores, and standings.

Hosted on a Hostinger VPS. Each org is accessed via `orgslug.yourdomain.com`.

---

## Monorepo Structure

```
shufflr/
├── apps/
│   ├── api/       ← NestJS REST API (port 3001)
│   ├── web/       ← React + Vite frontend (port 3000)
│   └── mobile/    ← React Native + Expo app
└── packages/
    ├── config/    ← Shared ESLint, TypeScript & Prettier configs
    ├── types/     ← Shared TypeScript types
    └── utils/     ← Shared utility functions
```

---

## Local Dev Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp apps/api/.env.example apps/api/.env
# Fill in DATABASE_URL and any other required vars
```

### 3. Set up the database
```bash
npm run db:generate --workspace=apps/api
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api   # optional
```

### 4. Run everything
```bash
npm run dev
```

| App    | URL                                     |
|--------|-----------------------------------------|
| API    | http://localhost:3001/api               |
| Web    | http://localhost:3000                   |
| Mobile | Follow Expo CLI prompts in terminal     |

---

## Available Scripts

| Script                 | Description                              |
|------------------------|------------------------------------------|
| `npm run build`        | Build all apps and packages              |
| `npm run dev`          | Start all apps in dev mode               |
| `npm run lint`         | Lint the entire monorepo                 |
| `npm run test`         | Run all tests                            |
| `npm run format`       | Format with Prettier                     |
| `npm run clean`        | Remove build artefacts and node_modules  |

---

## Tech Stack

- **Monorepo** — Turborepo
- **Language** — TypeScript 5 (strict)
- **API** — NestJS 10 + Prisma ORM (PostgreSQL)
- **Web** — React 18 + Vite
- **Mobile** — React Native + Expo SDK 51
- **Linting** — ESLint 9 + @typescript-eslint
- **Formatting** — Prettier 3
- **Hosting** — Hostinger VPS (nginx, wildcard subdomains)

---

## Current Build Status

| Phase | Area | Status |
|-------|------|--------|
| 1 | Monorepo scaffold, NestJS API, Prisma schema | ✅ Done |
| 2 | Round-robin scheduling, Court management | 🔄 In progress |
| 2.5 | Division model | 🆕 Next |
| 3 | Scores, standings, audit trail | 🔜 Planned |
| 3.5 | Per-org branding / white-label | 🔜 Planned |
| 4 | Playoff brackets | 🔜 Planned |
| 5 | Notifications + mobile app | 🔜 Planned |
| 6 | Docker, CI/CD, subdomain routing | 🔜 Planned |
