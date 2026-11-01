# Expense Splitter — Frontend

A responsive React application for organizing shared expenses, tracking balances, and recording settlements. The Spring Boot API is maintained separately in [expense-splitter](https://github.com/Akshay-k-baburaj/expense-splitter).

## Live application

- Frontend: <https://expense-splitter-frontend-xi.vercel.app>
- Backend API: <https://expense-splitter-4frk.onrender.com>

The backend is on Render’s free plan and may sleep after inactivity. The first API request after it wakes can take a while.

## Features

- Auth0 Universal Login and authenticated API requests.
- User profiles and group creation, membership, and invite-code joining.
- One currency per group.
- Equal expense splits or custom amounts per participant.
- Expense history, member balances, suggested payments, and recorded settlement history.

Settlements record money already paid; the application does not transfer funds. Currency conversion between group currencies is not supported.

## Technology

- React, TypeScript, Vite, React Router
- Axios for API requests
- React Hook Form and Zod for forms and validation
- Auth0 React SDK for sign-in

## Run locally

Prerequisites: Node.js 22 or newer and npm.

```bash
npm ci
```

Copy `.env.example` to `.env.local`, fill in the values below, then start the development server:

```bash
npm run dev
```

Vite normally serves the app at <http://localhost:5173>.

### Environment variables

| Variable | Example / purpose |
| --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8080` locally; production API origin is `https://expense-splitter-4frk.onrender.com`. Do not append `/api/v1`; service calls include that path. |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain, such as `your-tenant.us.auth0.com`, without `https://`. |
| `VITE_AUTH0_CLIENT_ID` | Client ID from the Auth0 Single Page Application. |
| `VITE_AUTH0_AUDIENCE` | Auth0 API identifier, e.g. `https://expense-splitter-api`. |

All `VITE_*` values are included in the browser build and are public configuration. Never put database passwords, Auth0 client secrets, or other private credentials in them. `.env.local` is ignored by Git; `.env.example` contains placeholders only.

### Auth0 URL settings

For local development, allow `http://localhost:5173` in the SPA’s **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins**. For production, also allow `https://expense-splitter-frontend-xi.vercel.app` in all three fields. Match the app’s origin exactly, including whether a trailing slash is present. Keep the local origin if you still develop locally.

## Build and quality checks

```bash
npm run lint
npm run build
npm run preview
```

GitHub Actions runs lint and build on pushes and pull requests with Node.js 22.

## Deployment

The Vercel project is connected to this repository and deploys the Vite app from the repository root. Vercel project environment variables for both Production and Preview should include:

```text
VITE_API_BASE_URL=https://expense-splitter-4frk.onrender.com
VITE_AUTH0_DOMAIN=<your-auth0-domain-without-https>
VITE_AUTH0_CLIENT_ID=<your-auth0-spa-client-id>
VITE_AUTH0_AUDIENCE=https://expense-splitter-api
```

After changing Vercel environment variables, redeploy so they are included in the new frontend build. The backend’s `APP_CORS_ALLOWED_ORIGINS` must contain the exact Vercel origin. See the [backend README](https://github.com/Akshay-k-baburaj/expense-splitter#configuration) and its [security setup](https://github.com/Akshay-k-baburaj/expense-splitter/blob/main/SECURITY_SETUP.md).

## Project scripts

- `npm run dev` — start Vite’s development server.
- `npm run lint` — run Oxlint.
- `npm run build` — type-check and create the production bundle in `dist/`.
- `npm run preview` — preview the production bundle locally.
