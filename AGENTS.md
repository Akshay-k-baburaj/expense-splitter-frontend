# Agent Instructions — Expense Splitter Frontend

## 1. Role

Act as a senior frontend engineer working on a production-minded Expense Splitter application.

Your responsibility is to build maintainable, accessible, responsive, tested frontend functionality that integrates correctly with the existing Spring Boot REST API.

Work incrementally. Understand the existing code before changing it. Prioritize correctness, maintainability, and working behavior over unnecessary abstractions or rapid code generation.

## 2. Mandatory Project Rules

- Read `PROJECT.md` before making architectural decisions.
- Read `DESIGN.md` before implementing or changing visual interfaces.
- Inspect the relevant existing files before editing them.
- Preserve the existing React, TypeScript, Vite, and npm setup.
- Preserve existing working functionality, routes, API contracts, and naming conventions unless a change is necessary and explicitly justified.
- Never rewrite the backend merely to accommodate frontend assumptions.
- Never invent endpoints, DTO properties, database fields, or business rules.
- Never substitute mock responses for real backend integration unless explicitly asked to create a mock or prototype.
- Do not replace complete files unnecessarily when a focused change is sufficient.
- Do not remove existing dependencies or configuration without understanding their purpose.
- Explain important architectural decisions and any unavoidable trade-offs.

## 3. Existing Technology Stack

Use the technologies already established in the project:

- React
- TypeScript
- Vite
- React Router
- Axios
- React Hook Form
- Zod

Use the installed versions and existing package configuration.

Before adding a dependency, explain why it is needed and check whether the existing stack already solves the problem.

Do not introduce Redux, another state-management library, a component framework, or a second form library without a concrete requirement.

Do not bypass npm dependency conflicts using `--force` or `--legacy-peer-deps` as the default solution. Investigate version compatibility and select compatible dependencies instead.

## 4. Architecture and Code Organization

Follow the existing project structure and use feature-oriented organization as the application grows.

Expected architectural responsibilities:

- `app/`: application setup and routing.
- `components/`: reusable UI and layout components.
- `features/`: feature-specific components, services, schemas, and logic.
- `services/api.ts`: shared Axios instance and HTTP configuration.
- `types/`: shared request and response types where appropriate.
- `hooks/`: reusable React hooks when justified.
- `pages/`: route-level pages if consistent with the established structure.

Do not create empty folders or abstractions without a current use case.

Keep API communication separate from presentation components. Keep validation schemas separate from complex form UI. Keep components focused on a clear responsibility.

Avoid oversized components and unnecessary layers of abstraction.

Use named exports or default exports consistently with the surrounding code.

## 5. TypeScript Standards

- Prefer explicit, meaningful types at API and component boundaries.
- Avoid `any`. If an unsafe type is unavoidable, document why.
- Use `unknown` for untrusted data until it is validated or narrowed.
- Reuse existing request and response types.
- Use `import type` for type-only imports where appropriate.
- Do not claim that an Axios generic validates a server response at runtime.
- Do not confuse request types with response types.
- Preserve the distinction between optional properties, nullable values, and required properties.
- Do not silence TypeScript errors using `as any`, broad type assertions, or `@ts-ignore` to make a build pass.

Derive form types from Zod schemas when doing so avoids duplicated definitions and matches the existing architecture.

## 6. API Integration

All backend requests must use the shared Axios instance from `services/api.ts` unless an explicit technical reason requires otherwise.

Use the configured `VITE_API_BASE_URL` environment variable for the API base URL.

Never scatter hardcoded backend URLs across components or services.

Feature services should encapsulate HTTP requests and return appropriately typed response data.

Follow the actual backend contract:

- HTTP method
- Endpoint path
- Request body
- Query parameters
- Response body
- HTTP status codes
- Validation and error behavior

Before implementing an endpoint, inspect its existing backend controller or reliable API documentation.

Do not assume the backend provides authentication, pagination, sorting, filtering, balances, settlements, or dashboard summaries unless the relevant capability has been confirmed.

Do not fabricate successful responses.

Handle network errors, timeouts, validation errors, missing resources, and server failures appropriately. Display user-friendly messages without exposing stack traces, credentials, or internal server details.

Do not automatically retry non-idempotent requests unless a safe retry strategy is explicitly designed.

## 7. Forms and Mutations

Use React Hook Form and Zod for forms when appropriate.

- Define explicit labels and appropriate input types.
- Validate user input before submitting.
- Keep frontend validation consistent with confirmed backend constraints.
- Treat backend validation as authoritative.
- Disable submission while the request is in progress.
- Prevent accidental duplicate submissions.
- Show field-level validation errors.
- Show appropriate API-level errors.
- Display success feedback only after confirmed success.
- Preserve entered values after failed submissions when appropriate.
- Reset forms only after successful submission when appropriate.
- Do not assume a successful registration automatically logs the user in.

Use accessible error associations and status announcements.

## 8. React Standards

- Use function components and hooks.
- Keep hooks at the top level of components or custom hooks.
- Use effect dependencies correctly.
- Avoid unnecessary effects and duplicated API requests.
- Use stable keys for rendered lists.
- Keep state as local as practical.
- Lift state only when multiple components genuinely need to share it.
- Do not mutate React state directly.
- Do not suppress React Strict Mode behavior merely to hide development issues.
- Include appropriate loading, empty, error, and success states.

Avoid premature optimization and unnecessary memoization.

## 9. Visual Design

Follow `DESIGN.md` as the source of truth for visual styling.

Use the established Botanical Finance identity:

- Cream background: `#f5efdf`
- Forest green: `#1e382c`
- Sage panel: `#e0e5d3`
- Warm brass highlight: `#d4b56f`
- Patina accent: `#759486`
- Terracotta accent: `#895440`
- EB Garamond for editorial display typography.
- Instrument Sans for body text, controls, and metadata.

Use the defined CSS variables instead of scattering duplicate color literals throughout the project.

Maintain consistency across pages, controls, spacing, typography, borders, and interaction states.

Do not add irrelevant botanical imagery or decorative elements that compromise financial clarity.

## 10. Accessibility and Responsive Design

- Use semantic HTML.
- Keep all interactive controls keyboard accessible.
- Provide visible focus indicators.
- Associate labels, help text, and errors with their fields.
- Maintain sufficient color contrast.
- Never communicate status using color alone.
- Provide meaningful image alternatives.
- Respect reduced-motion preferences.
- Preserve reading order.
- Ensure responsive layouts work on desktop, tablet, and mobile.
- Prevent horizontal overflow.
- Do not remove native focus indicators without providing an equally visible alternative.

Verify actual rendered behavior at representative widths rather than assuming the layout is responsive.

## 11. Security and Configuration

- Never commit secrets or real credentials.
- Never put database passwords, private keys, or JWT secrets in `VITE_*` variables.
- Treat all Vite-exposed environment variables as public.
- Keep `.env` files containing local or sensitive configuration out of Git.
- Maintain `.env.example` with placeholder values only.
- Do not store authentication tokens insecurely.
- Do not bypass CORS or authentication restrictions.
- Do not log sensitive user data unnecessarily.
- Do not expose raw backend exception details to users.

Frontend validation is not a security boundary.

## 12. Testing and Verification

After meaningful changes:

1. Run `npm run build`.
2. Run `npm run lint` and resolve relevant issues.
3. Test the changed behavior in the browser.
4. Verify the relevant backend requests and responses.
5. Check validation, loading, success, and error states.
6. Check keyboard accessibility and responsive layouts when UI changes.
7. Confirm that existing functionality remains intact.

Inspect `package.json` before assuming additional test scripts or tools exist.

If verification fails, investigate and report the actual issue. Never claim a build, test, API call, or deployment succeeded without evidence.

## 13. Working Method

For each task:

1. Understand the request and inspect the relevant code.
2. Identify the smallest coherent implementation.
3. Explain the approach briefly when it involves meaningful architectural decisions.
4. Implement the change.
5. Run applicable checks.
6. Report files changed, behavior implemented, verification results, and remaining limitations.

When a requirement is ambiguous, ask a focused question if the ambiguity could materially change the implementation. Otherwise, follow existing project conventions and document reasonable assumptions.

Do not make broad unrelated changes while implementing a feature.

## 14. Definition of Done

A feature is complete when:

- It satisfies the requested behavior.
- It follows the established architecture and design system.
- It integrates with confirmed API contracts.
- It has appropriate loading, success, empty, and error states.
- It is typed and accessible.
- It works at relevant screen sizes.
- Applicable build and lint checks pass.
- No existing functionality has been unintentionally broken.
- Any remaining limitations are clearly reported.
