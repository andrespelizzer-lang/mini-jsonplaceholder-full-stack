# PRD — Nuxt 3 Frontend Migration

## Overview

Migrate the `web/` folder from plain HTML/CSS/vanilla JavaScript to a Nuxt 3 application. The backend (`api/`) remains unchanged. The new frontend must replicate all existing functionality.

## Current state (vanilla JS)

The frontend is a single `index.html` with three JS modules:
r

- `api.js` — fetch wrapper, one function per API call, auto-injects JWT token from localStorage
- `ui.js` — renders data into DOM using template literals and createElement
- `app.js` — orchestrator: navigation between sections, form handling, drill-down state, login/logout

### Current features

1. **Navigation** — 3 sections (Utenti, Post, Commenti) toggled via CSS class `.nascosta`
2. **Drill-down** — click user → see their posts → click post → see its comments (with breadcrumbs)
3. **CRUD for all 3 resources** — create (forms), read (card lists), update (edit form with PUT), delete (button on cards)
4. **Authentication** — login form, JWT token stored in localStorage, auto-refresh on 401
5. **Role-based UI** — admin sees all buttons, regular user sees only own content buttons
6. **Search** — real-time client-side filter on users by name/email/city
7. **Statistics bar** — shows count of users, posts, comments (updates after every CRUD operation)
8. **Pagination** — posts list with page navigation (Precedente/Successiva buttons)

## Target state (Nuxt 3)

### Pages (file-based routing)

| File                      | Route            | Description                              |
| ------------------------- | ---------------- | ---------------------------------------- |
| `pages/index.vue`         | `/`              | Home page with statistics and navigation |
| `pages/utenti/index.vue`  | `/utenti`        | User list with search, create form       |
| `pages/utenti/[id].vue`   | `/utenti/:id`    | Single user detail with their posts      |
| `pages/post/index.vue`    | `/post`          | Post list with pagination                |
| `pages/post/[id].vue`     | `/post/:id`      | Single post detail with its comments     |
| `pages/commenti.vue`      | `/commenti`      | Comments list                            |
| `pages/login.vue`         | `/login`         | Login form                               |
| `pages/registrazione.vue` | `/registrazione` | Registration form                        |

### Components

| Component              | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `CardUtente.vue`       | User card with name, email, city, CF, buttons    |
| `CardPost.vue`         | Post card with title, body, author, buttons      |
| `CardCommento.vue`     | Comment card with name, email, body, buttons     |
| `FormUtente.vue`       | Create/edit user form with CF validation         |
| `FormPost.vue`         | Create post form                                 |
| `FormCommento.vue`     | Create comment form                              |
| `BarraStatistiche.vue` | Statistics bar (Utenti: X, Post: X, Commenti: X) |
| `BarraNavigazione.vue` | Navigation bar with links and login state        |
| `Paginazione.vue`      | Pagination controls (Precedente/Successiva)      |
| `RicercaUtenti.vue`    | Search input for filtering users                 |

### Composables

| Composable       | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `useApi.ts`      | Fetch wrapper with base URL, token injection, 401 refresh logic |
| `useAuth.ts`     | Login, logout, register, token management, current user state   |
| `useUtenti.ts`   | CRUD functions for users                                        |
| `usePost.ts`     | CRUD functions for posts (with pagination)                      |
| `useCommenti.ts` | CRUD functions for comments                                     |

### Layout

| Layout                | Description                                             |
| --------------------- | ------------------------------------------------------- |
| `layouts/default.vue` | Navigation bar + statistics bar + slot for page content |

## Requirements

1. All existing features must work identically in the Nuxt version
2. The backend API contract does not change — same endpoints, same field names
3. Backend base URL configured via Nuxt runtime config: `http://localhost:3000/api`
4. JWT tokens stored in localStorage (same as current implementation)
5. Italian language for all UI text, error messages, and code comments
6. CSS styling should be clean and modern (can improve on current design)
7. Responsive design (mobile-friendly)

## Migration order

1. Initialize Nuxt 3 project in `web/`
2. Set up `nuxt.config.ts` with API base URL
3. Create layout with navigation
4. Create `useApi` and `useAuth` composables
5. Build pages one by one: login → utenti → post → commenti
6. Add components for cards and forms
7. Add statistics, search, pagination
8. Test all CRUD operations against the running backend

## API base URL

```
http://localhost:3000/api
```

The backend runs on port 3000. Nuxt dev server runs on port 3000 by default — change Nuxt to port 3001 or configure a proxy in `nuxt.config.ts`.
