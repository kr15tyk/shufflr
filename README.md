# Shufflr

> A multi-platform music shuffle app built with **Turborepo**, **TypeScript**, **NestJS**, **React**, and **React Native + Expo**.

---

## Monorepo Structure

```
shufflr/
├── apps/
│   ├── api/        ← NestJS REST API (port 3001)
│   ├── web/        ← React + TypeScript SPA powered by Vite (port 3000)
│   └── mobile/     ← React Native + Expo mobile app
└── packages/
    ├── config/     ← Shared ESLint, TypeScript & Prettier configs
    ├── types/      ← Shared TypeScript types/interfaces
    └── utils/      ← Shared utility functions
```

---

## Prerequisites

| Tool        | Version     |
|-------------|-------------|
| Node.js     | ≥ 20.0.0    |
| npm         | ≥ 10.0.0    |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs all workspace dependencies in a single command.

### 2. Run all apps in development mode

```bash
npm run dev
```

Turborepo will start the API, web and mobile development servers in parallel.

| App    | URL / Notes                              |
|--------|------------------------------------------|
| api    | <http://localhost:3001/api>              |
| web    | <http://localhost:3000>                  |
| mobile | Follow the Expo CLI prompts in terminal  |

### 3. Run a single app

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

| Script               | Description                                      |
|----------------------|--------------------------------------------------|
| `npm run build`      | Build all apps and packages                      |
| `npm run dev`        | Start all apps in watch/dev mode                 |
| `npm run lint`       | Run ESLint across the entire monorepo            |
| `npm run test`       | Run tests across the entire monorepo             |
| `npm run format`     | Format all files with Prettier                   |
| `npm run format:check` | Check formatting without making changes        |
| `npm run clean`      | Remove all build artefacts and `node_modules`    |

---

## Packages

### `@shufflr/config`

Shared configuration files consumed by every app and package:

- `tsconfig.base.json` – strict TypeScript base config
- `eslint-preset.js` – ESLint rules for TypeScript projects
- `prettier.config.js` – Prettier formatting rules

### `@shufflr/types`

Shared TypeScript interfaces and types (e.g. `User`, `Track`, `Playlist`, `ApiResponse`).

### `@shufflr/utils`

Shared, pure utility functions (e.g. `shuffle`, `formatDuration`, `truncate`, `isValidEmail`).

---

## TypeScript

TypeScript **strict mode** is enabled in all packages and apps via `@shufflr/config/tsconfig.base.json`:

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

ESLint and Prettier are configured globally. Every app/package extends `@shufflr/config/eslint-preset.js` and `@shufflr/config/prettier.config.js`.

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
- **Backend** – [NestJS 10](https://nestjs.com/) running on Node.js
- **Frontend** – [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Mobile** – [React Native](https://reactnative.dev/) + [Expo SDK 51](https://expo.dev/)
- **Linting** – [ESLint 8](https://eslint.org/) + [@typescript-eslint](https://typescript-eslint.io/)
- **Formatting** – [Prettier 3](https://prettier.io/)
