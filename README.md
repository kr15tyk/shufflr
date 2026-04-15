# Shufflr

> A multi-tenant shuffleboard league management platform built with **Turborepo**, **TypeScript**, **NestJS**, **React**, and **React Native + Expo**.

Shufflr lets organizations run their own branded shuffleboard leagues — managing seasons, divisions, teams, courts, schedules, scores, and standings — with full multi-tenancy so every club gets its own isolated environment.

---

## Monorepo Structure

```
shufflr/
├── apps/
│   ├── api/       ← NestJS REST API (port 3001)
│   ├── web/       ← React + TypeScript SPA powered by Vite (port 3000)
│   └── mobile/    ← React Native + Expo mobile app
└── packages/
    ├── config/    ← Shared ESLint, TypeScript & Prettier configs
    ├── types/     ← Shared TypeScript types/interfaces
    └── utils/     ← Shared utility functions
```

---

## Prerequisites

| Tool    | Version   |
|---------|-----------|
| Node.js | ≥ 20.0.0  |
| npm     | ≥ 10.0.0  |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs all workspace dependencies in a single command.

### 2. Set up environment variables

Copy the example env file in the API app and fill in your database connection string:

```bash
cp apps/api/.env.example apps/api/.env
```

### 3. Set up the database

```bash
# Generate the Prisma client
npm run db:generate --workspace=apps/api

# Run migrations
npm run db:migrate --workspace=apps/api

# (Optional) Seed with sample data
npm run db:seed --workspace=apps/api
```

### 4. Run all apps in development mode

```bash
npm run dev
```

Turborepo will start the API, web and mobile development servers in parallel.

| App    | URL / Notes                             |
|--------|-----------------------------------------|
| api    | http://localhost:3001/api               |
| web    | http://localhost:3000                   |
| mobile | Follow the Expo CLI prompts in terminal |

### 5. Run a single app

```bash
# API only
npm run dev --workspace=apps/api

# Web only
npm run dev --workspace=apps/web

# Mobile only
npm run dev --workspace=apps/mobile
```

---

## Available Scripts

All scripts are run from the **repository root** and orchestrated by Turborepo.

| Script                 | Description                                    |
|------------------------|------------------------------------------------|
| `npm run build`        | Build all apps and packages                    |
| `npm run dev`          | Start all apps in watch/dev mode               |
| `npm run lint`         | Run ESLint across the entire monorepo          |
| `npm run test`         | Run tests across the entire monorepo           |
| `npm run format`       | Format all files with Prettier                 |
| `npm run format:check` | Check formatting without making changes        |
| `npm run clean`        | Remove all build artefacts and `node_modules` |

---

## Packages

### @shufflr/config

Shared configuration files consumed by every app and package:

- `tsconfig.base.json` – strict TypeScript base config
- `eslint-preset.js` – ESLint rules for TypeScript projects
- `prettier.config.js` – Prettier formatting rules

### @shufflr/types

Shared TypeScript interfaces and types (e.g. `Organization`, `Season`, `Division`, `Team`, `Match`, `Court`, `ApiResponse`).

### @shufflr/utils

Shared, pure utility functions (e.g. `shuffle`, `formatDuration`, `truncate`, `isValidEmail`).

---

## TypeScript

TypeScript strict mode is enabled in all packages and apps via `@shufflr/config/tsconfig.base.json`:

```json
{
  "strict": true,
  "strictNullChecks": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

---

## Linting & Formatting

ESLint and Prettier are configured globally. Every app/package extends `@shufflr/config/eslint-preset.js`, and Prettier formatting is driven by the root `.prettierrc`.

```bash
# Lint everything
npm run lint

# Format everything
npm run format
```

---

## Testing

```bash
# Run all tests
npm run test

# Run tests for a specific workspace
npm run test --workspace=packages/utils
```

---

## Adding a New Package

1. Create a new directory under `packages/` or `apps/`.
2. Add a `package.json` with `"name": "@shufflr/<name>"`.
3. Add a `tsconfig.json` that extends `@shufflr/config/tsconfig.base.json`.
4. Add an `.eslintrc.js` that extends `@shufflr/config/eslint-preset`.
5. Run `npm install` from the root to link the workspace.

---

## Tech Stack

- **Monorepo tooling** – [Turborepo](https://turbo.build/)
- **Language** – [TypeScript 5](https://www.typescriptlang.org/) (strict mode)
- **Backend** – [NestJS 10](https://nestjs.com/) running on Node.js, with [Prisma](https://www.prisma.io/) ORM
- **Frontend** – [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Mobile** – [React Native](https://reactnative.dev/) + [Expo SDK 51](https://expo.dev/)
- **Linting** – [ESLint 9](https://eslint.org/) + [@typescript-eslint](https://typescript-eslint.io/)
- **Formatting** – [Prettier 3](https://prettier.io/)

---

## Roadmap

### Phase 1 — Foundation ✅ Complete

| # | Title | Status |
|---|-------|--------|
| #1 | Scaffold Turborepo monorepo with apps and packages structure | ✅ Done |
| #3 | Initialize NestJS API with auth, organization, and user modules | ✅ Done |
| #4 | Create Prisma schema for all core data models | ✅ Done |

### Phase 2 — Scheduling & Courts 🔄 In Progress

| # | Title | Status | Depends On |
|---|-------|--------|------------|
| #7 | Implement round-robin schedule generation service | 🟡 Open | #4 |
| #9 | Build Court Management CRUD API | 🟡 Open | #4 |

### Phase 2.5 — Division Model 🆕

| # | Title | Status | Depends On |
|---|-------|--------|------------|
| Issue A | Add Division model and integrate with teams, matches, and standings | 🆕 New | #4 |
| Issue B | Update round-robin schedule generator for divisions and constraints | 🆕 New | #7 + A |

### Phase 3 — Scores, Standings & Audit Trail 🆕

| # | Title | Status | Depends On |
|---|-------|--------|------------|
| Issue C | Implement score entry and approval workflow with audit trail | 🆕 New | Issue A |
| Issue D | Build standings calculation service with tiebreakers | 🆕 New | Issue C |

### Phase 3.5 — Branding & White-Label 🆕

| # | Title | Status | Depends On |
|---|-------|--------|------------|
| Issue E | Add ThemeSettings model and per-organization branding API | 🆕 New | #3 |
| Issue F | Implement tenant detection and branding in web frontend | 🆕 New | Issue E |

### Phase 4 — Playoffs 🆕

| # | Title | Status | Depends On |
|---|-------|--------|------------|
| Issue G | Implement single elimination playoff bracket generator | 🆕 New | Issue D |

### Phase 5 — Mobile & Notifications

| Order | Title | Depends On |
|-------|-------|------------|
| First | Notification service (email + in-app + Expo push) | Issue C |
| Second | Mobile app scaffold | Notification service |

### Phase 6 — DevOps

Docker, CI/CD, wildcard subdomain routing (`*.yourapp.com` → tenant by subdomain), path-based fallback (`/org/:slug`), and a runbook for provisioning new organizations with subdomain + SSL.
