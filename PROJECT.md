# Expense Splitter — Frontend Project Specification

## 1. Project Overview

Expense Splitter is a full-stack application for organizing shared expenses among users and groups.

The frontend provides the user interface for interacting with an existing Java Spring Boot REST API backed by PostgreSQL.

The goal is to build a maintainable, responsive, production-minded application suitable for GitHub, portfolio presentation, and eventual deployment.

This is an existing backend project with a separately maintained React frontend. The frontend must integrate with the backend's real capabilities instead of replacing or duplicating its business logic.

## 2. Repository Structure

The application uses two independent projects.

### Backend

Repository/project: `expense-splitter`

Technology:

- Java
- Spring Boot
- Maven
- PostgreSQL
- Spring Data JPA
- Jakarta Bean Validation
- Flyway migrations, where configured

The backend owns business rules, persistence, API validation, and server-side behavior.

### Frontend

Repository/project: `expense-splitter-frontend`

Technology:

- React
- TypeScript
- Vite
- React Router
- Axios
- React Hook Form
- Zod

The frontend owns presentation, client-side form validation, navigation, local UI state, and HTTP communication with the backend.

The projects must remain independently buildable and deployable.

The current application includes a public product overview and sign-in page, an authenticated home page linking to groups, group invite codes, group-level currency selection, equal or custom-amount expense splits, balances, and settlement records. Each group uses one currency; foreign-exchange conversion is not provided.

## 3. Core Engineering Principles

- Preserve the existing backend and its API contracts.
- Keep the frontend and backend responsibilities separate.
- Use real API responses for application functionality.
- Avoid duplicated business rules where possible.
- Prefer explicit types and reusable components.
- Maintain a consistent design system.
- Prioritize data correctness, accessibility, and usability.
- Keep dependencies and architecture proportionate to the application's needs.
- Build incrementally and verify each feature before expanding.

## 4. Frontend Architecture

Use feature-oriented organization.

Suggested structure as the project grows:

```text
expense-splitter-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── router.tsx
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── users/
│   │   ├── groups/
│   │   ├── group-members/
│   │   └── expenses/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── AGENTS.md
├── DESIGN.md
├── PROJECT.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

This is a target structure, not a requirement to create every directory immediately. Inspect the existing project and retain working files and conventions. Introduce folders as actual features require them.

## 5. Existing Frontend Configuration

The project was initialized using Vite's React + TypeScript template.

Its package scripts currently include:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

Installed or selected application libraries include:

- React and React DOM
- React Router
- Axios
- React Hook Form
- Zod
- `@hookform/resolvers`

Use the installed versions in `package.json`. Do not assume additional dependencies or scripts exist.

The project should continue to pass its TypeScript production build and lint checks.

## 6. API Configuration

Use a shared Axios instance at:

`src/services/api.ts`

The backend base URL is configured through:

`VITE_API_BASE_URL`

Local development may use:

`http://localhost:8080`

This is a default assumption and must be checked against the actual backend configuration.

Production deployment must use the actual deployed backend URL.

Never hardcode the base URL separately in feature components or services.

The shared API client should centralize common request configuration and may be extended with consistent error handling or authentication behavior when justified.

## 7. Confirmed User API

The existing Spring Boot `UserController` exposes the following endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/users` | Create a user account |
| GET | `/api/v1/users/{id}` | Retrieve a user by ID |
| PUT | `/api/v1/users/{id}` | Update user details |
| DELETE | `/api/v1/users/{id}` | Deactivate a user |

The POST, GET, PUT, and DELETE behavior must follow the actual backend implementation.

### User request

The existing `UserRequest` contains:

- `username`: required, nonblank string.
- `email`: required, nonblank valid email address.

The entity imposes a maximum username length of 50 characters and a maximum email length of 255 characters.

Frontend validation should reflect these confirmed constraints.

### User response

The existing `UserResponse` contains:

- `username`
- `email`

Do not assume the response includes an ID or other fields unless the backend DTO is changed and confirmed.

### User entity behavior

The existing entity includes:

- Generated database ID.
- Unique username.
- Unique email.
- Active status.
- Creation timestamp.

The frontend must not attempt to set server-managed database IDs, creation timestamps, or account-active state through the existing user creation request.

### Registration behavior

The registration page should:

- Accept username and email.
- Validate fields using the frontend schema.
- Submit through the existing `createUser()` service.
- Display success only after a successful backend response.
- Handle backend rejection and network failures.
- Avoid claiming that registration automatically logs the user in.

Do not invent login, password, authentication, or account recovery functionality. Those require confirmed backend capabilities and security design.

## 8. User Feature Organization

Suggested files:

```text
src/features/users/
├── UserRegistrationPage.tsx
├── userSchema.ts
└── userService.ts

src/services/
└── api.ts

src/types/
└── user.ts
```

The exact placement may evolve to match the existing project conventions.

Responsibilities:

- `UserRegistrationPage.tsx`: registration interface and submission behavior.
- `userSchema.ts`: Zod validation schema and inferred form type.
- `userService.ts`: HTTP functions for confirmed user endpoints.
- `api.ts`: shared Axios instance.
- `user.ts`: shared request and response types.

Do not duplicate API requests across UI components.

## 9. Application Features

The long-term product may include the following feature areas, depending on the capabilities implemented by the backend.

### Users

- User registration.
- User detail retrieval.
- User detail updates.
- Account deactivation.

### Groups

- View groups.
- Create or update groups where supported.
- View group details.
- Delete groups where supported.

### Group members

- View group membership.
- Add members.
- Remove members.

### Expenses

- Create expenses.
- View expense history.
- Edit or remove expenses where supported.
- Display payer, amount, group, and other confirmed expense details.

### Financial summaries

- Display relevant expense totals or balances only when they can be calculated correctly from available backend data.
- Distinguish amounts owed from amounts owed to the user.
- Avoid claiming a payment or settlement has occurred without confirmed data.

This list is a product direction, not proof that all endpoints already exist. Before implementing a feature, inspect the backend controller, service, DTOs, and actual response contract.

## 10. Routing

Use React Router for navigation as the application gains multiple pages.

Keep route definitions centralized and preserve any existing routes.

Potential route destinations include registration, dashboard, groups, group details, and expenses, but implement only routes that correspond to real or explicitly planned features.

Do not create dead links or imply that unsupported features are functional.

Authentication guards should not be implemented until authentication behavior is confirmed.

## 11. Forms and Validation

Use React Hook Form for form state and submission management.

Use Zod for reusable validation schemas and inferred form types.

Keep frontend constraints aligned with confirmed backend rules. Treat backend validation as authoritative.

Forms must provide:

- Accessible labels.
- Appropriate input types.
- Field-level validation.
- Submission loading state.
- Duplicate-submission prevention.
- Clear success and error feedback.
- Sensible preservation or reset of values after submission.

Do not expose internal server errors or raw exception messages to users.

## 12. UI Design

`DESIGN.md` is the authoritative source for the visual design system.

Use the Botanical Finance visual identity:

- Cream ground: `#f5efdf`
- Forest-green ink: `#1e382c`
- Sage panels: `#e0e5d3`
- Warm brass highlights: `#d4b56f`
- Patina accent: `#759486`
- Terracotta accent: `#895440`
- EB Garamond for display typography.
- Instrument Sans for body text, controls, and metadata.

Use generous spacing, fine borders, clear financial hierarchy, restrained rounded panels, and accessible interactions.

The design must support a financial application. Avoid unrelated botanical imagery, unnecessary decoration, and visual treatments that reduce the legibility of amounts or transaction data.

## 13. Error Handling and UI States

Data-driven pages should support the relevant states:

- Loading.
- Success.
- Empty results.
- Validation errors.
- API rejection.
- Network failure.
- Unexpected server failure.

Provide useful feedback without exposing internal details.

Do not treat failed requests as successful or replace unavailable production data with fabricated values.

## 14. Environment and Deployment

The frontend and backend are separate applications and may be deployed independently.

Local development commonly uses:

- Frontend: Vite development server, typically port `5173`.
- Backend: Spring Boot, commonly port `8080`.

Actual ports depend on configuration.

Before deployment:

- Configure the correct frontend API base URL.
- Configure backend CORS for the deployed frontend origin.
- Provide the backend with valid database configuration.
- Keep credentials and secrets out of Git.
- Ensure the frontend does not contain server-side secrets.
- Verify the deployed frontend can reach the backend.
- Test API error handling and protected requests if authentication is introduced.
- Run the production build.

The frontend should use `.env.example` to document required public configuration variables without exposing sensitive values.

## 15. Verification Requirements

After implementing a feature:

1. Run `npm run build`.
2. Run `npm run lint`.
3. Test the changed behavior in the browser.
4. Verify relevant API requests and responses.
5. Test appropriate loading, success, empty, and failure states.
6. Check keyboard accessibility and responsive layouts.
7. Confirm existing features still work.

Do not report checks as passing unless they have actually been executed successfully.

## 16. Project Success Criteria

The frontend should ultimately be:

- Visually consistent.
- Responsive across screen sizes.
- Accessible by keyboard and assistive technology.
- Strongly typed.
- Organized around clear feature boundaries.
- Integrated with the actual Spring Boot API.
- Reliable when requests fail.
- Free of committed secrets.
- Independently buildable and deployable.
- Easy to explain during technical interviews.

Prioritize a small number of complete, correctly integrated features over a large number of unfinished screens.

## Final Principle

Build a real Expense Splitter frontend around the existing backend, not a disconnected demonstration.

Preserve the working API, use confirmed contracts, follow the established design system, verify behavior, and improve the application incrementally.
