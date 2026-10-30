# Expense Splitter — Frontend Design System

## 1. Project Context

Build a polished, production-minded Expense Splitter frontend using the existing project stack:

- React
- TypeScript
- Vite
- React Router
- Axios
- React Hook Form
- Zod

The frontend communicates with an existing Spring Boot REST API backed by PostgreSQL.

This is a financial utility for managing shared expenses, groups, members, transactions, and balances. It should feel like a thoughtfully designed personal finance application, not a generic admin dashboard or a plant-themed website.

### Non-negotiable constraints

- Preserve the existing technology stack and project configuration.
- Preserve existing API contracts, routes, request and response types, and application behavior.
- Do not invent backend endpoints or response fields.
- Do not replace working API integration with mock data.
- Do not rewrite the backend to accommodate frontend design decisions.
- Do not add unnecessary dependencies.
- Keep components reusable, accessible, responsive, and maintainable.
- Inspect existing files before modifying them.
- Implement the design incrementally without breaking working functionality.

## 2. Design Identity — Botanical Finance

The visual identity combines editorial typography, warm paper-like surfaces, forest-green structure, sage panels, warm brass highlights, and a restrained patina accent.

The interface should feel calm, trustworthy, elegant, and modern. Use generous whitespace, clear financial hierarchy, subtle borders, and carefully composed layouts.

The Botanical aesthetic is expressed through color, typography, shapes, and editorial composition. Do not introduce irrelevant plant illustrations, gardening imagery, or decorative foliage into the expense-management interface.

### Core colors

Use these authoritative CSS custom properties:

```css
:root {
  --dp-color-ground: #f5efdf;
  --dp-color-ink: #1e382c;
  --dp-color-panel: #e0e5d3;
  --dp-color-warm-field: #d4b56f;
  --dp-color-patina: #759486;
  --dp-color-accent: #895440;
  --dp-color-rule: #d4d0bd;
  --dp-color-ornament-line: #b5baa4;
  --dp-color-field-line: #697961;

  --dp-typography-display: "Botanical Garamond", Georgia, serif;
  --dp-typography-reading: "Botanical Instrument", sans-serif;

  --dp-typography-body: 16px;
  --dp-typography-metadata: 13px;
  --dp-typography-label: 12px;
  --dp-typography-compact-leading: 1.5;
  --dp-typography-label-tracking: 0.12em;

  --dp-spacing-panel-inline: max(30px, 4.2cqw);
  --dp-radius-panel: 34px;
  --dp-radius-panel-narrow: 27px;
  --dp-radius-round: 50%;
  --dp-border-hairline: 1px;

  --dp-motion-interaction: 0.35s;
  --dp-motion-easing: ease;
}
```

Do not replace this palette with generic SaaS blue, bright neon green, pure-white everywhere, or excessive gradients.

Use the forest-green ink color for primary text and major actions. Use the cream ground for the main canvas, sage for grouped content, warm brass for highlights, and patina for secondary accents.

Ensure text contrast remains accessible. Do not use pale accent colors for small text on light surfaces.

## 3. Typography

Use EB Garamond for editorial headings and Instrument Sans for body text, form controls, navigation, and metadata.

Define the font faces as:

- `"Botanical Garamond"` — EB Garamond, regular and italic.
- `"Botanical Instrument"` — Instrument Sans, regular and semibold.

Load fonts through a reliable font provider or local font files. Include sensible fallback fonts and avoid blocking the application if an external font cannot load.

### Typography rules

- Use large, expressive serif headings for page titles and key editorial moments.
- Use italic serif text selectively for emphasis.
- Use clean sans-serif typography for monetary values, forms, tables, and operational information.
- Use compact uppercase labels sparingly for metadata and section markers.
- Use readable line heights and clear hierarchy.
- Avoid oversized typography that makes financial data difficult to scan.
- Use tabular numerals for monetary amounts where supported.

The landing page may use an editorial heading around 78–100px on large screens, scaling fluidly. Internal dashboard headings should be smaller and appropriate to the density of the page.

## 4. Application Shell and Navigation

Create a cohesive application shell that works across all authenticated or application pages.

### Desktop

- Use a restrained navigation sidebar or top-level navigation suited to the existing routes.
- Keep the main content area spacious and aligned.
- Display the application name, navigation items, and relevant account actions clearly.
- Use thin dividers, understated active states, and forest-green accents.
- Make the active route unmistakable without relying on color alone.

### Navigation destinations

Use only routes and features that exist in the application or are being implemented against confirmed backend capabilities.

Potential destinations include:

- Dashboard
- Groups
- Expenses
- Members
- Account settings

Do not add nonfunctional links or imply that an unimplemented feature already works.

### Mobile

- Collapse the desktop navigation into an accessible compact menu or appropriate mobile navigation.
- Preserve all existing routes and essential actions.
- Keep controls comfortably tappable.
- Avoid horizontal scrolling at normal mobile widths.

## 5. Dashboard Design

The dashboard should make the user's shared-expense situation understandable at a glance.

Where supported by actual backend data, use a clear visual hierarchy for:

- Total tracked expenses
- Amount the user owes
- Amount owed to the user
- Recent expenses
- Recent groups
- Outstanding balances or settlements

Do not calculate financial summaries from incomplete or unrelated data. Use only values supported by the existing API or correct calculations over confirmed data.

### Layout

- Use an editorial page heading with a concise supporting description.
- Arrange summary metrics in restrained sage or cream panels.
- Give important monetary amounts strong typographic emphasis.
- Use thin borders and subtle surface differences instead of heavy shadows.
- Present recent transactions in a readable list or table.
- Use terracotta sparingly for emphasis, warnings, or relevant negative financial states.

If a dashboard endpoint does not exist, do not fabricate one. Either derive the information from available endpoints when logically valid or defer the affected section until the backend supports it.

## 6. Groups and Members

Groups represent shared activities such as trips, rent, dinners, or household expenses.

### Group listing

- Present groups as clean cards or editorial rows.
- Use a clear group name, concise description, and available member information.
- Use restrained visual variation between cards.
- Keep actions such as opening a group easy to recognize.
- Provide meaningful empty states when the user has no groups.

### Group details

Where supported, present:

- Group name and description
- Member list
- Expense history
- Relevant balances
- Available group actions

Keep the page organized into clear sections. Avoid placing every item inside a separate card.

### Member management

- Use readable member rows or compact profiles.
- Keep add-member and remove-member actions clear.
- Confirm destructive actions where appropriate.
- Respect the actual membership rules enforced by the backend.

Do not assume that authentication, invitations, avatars, or user search are available unless implemented.

## 7. Expenses and Transactions

Expense management is a core feature. Prioritize clarity, accuracy, and ease of scanning over decoration.

### Expense lists

Use a clean list or table with appropriate information supported by the API, such as:

- Expense title
- Amount
- Payer
- Group
- Date
- Available actions

Use typography and spacing to distinguish the expense title, monetary amount, and supporting metadata.

Use subtle horizontal rules instead of heavy card borders for dense transaction lists.

### Expense creation and editing

Forms should have:

- Explicit labels
- Clear field grouping
- Appropriate input types
- Inline validation messages
- Visible required-field indicators where relevant
- Loading and disabled states during submission
- Clear success and error feedback

For monetary inputs, use appropriate numeric input behavior and validate values before submission. Preserve the backend's accepted formats and business rules.

Do not assume that a particular split method, currency, category, or settlement workflow exists until it is confirmed by the application.

### Financial status

Use color and text together to communicate financial states.

- Forest green: positive or completed states where appropriate.
- Terracotta: warnings, amounts owed, or destructive emphasis where appropriate.
- Sage: secondary information and neutral grouping.
- Cream: primary surfaces.

Never communicate a financial status through color alone.

Do not imply that a user has paid, settled, or received money unless the underlying application data supports that status.

## 8. Forms and Validation

Use the existing React Hook Form and Zod setup where appropriate.

- Keep validation schemas separate from page components.
- Use TypeScript types consistent with the actual API contracts.
- Display field-level errors near their respective inputs.
- Associate labels and errors with their controls.
- Prevent accidental duplicate submissions.
- Disable submit actions while a request is in progress.
- Preserve entered values when an API request fails unless there is a clear reason to reset them.
- Reset forms only after a confirmed successful operation when appropriate.

Frontend validation improves the user experience but never replaces backend validation.

Use existing service functions and the shared Axios instance rather than making ad hoc requests directly inside every component.

## 9. API Integration and States

Keep API communication separate from presentation components.

Follow the existing architecture, including the shared Axios configuration, feature-specific services, and request/response types.

Use the configured environment variable for the API base URL. Never hardcode production URLs throughout the application.

Every data-driven page should account for the states relevant to that request:

- Initial loading
- Successful response
- Empty result
- Request failure
- Submission in progress
- Successful mutation
- Validation or server-side rejection

Use restrained skeletons or clear loading indicators. Keep error messages useful to the user without exposing stack traces, database details, credentials, or internal server exceptions.

Do not suppress errors or return fabricated successful responses.

Preserve the distinction between authentication failures, authorization failures, validation failures, missing resources, and unexpected server errors when the backend provides sufficient information.

## 10. Components and Code Organization

Use the project's existing conventions and organize new code by feature.

Prefer reusable components when they have a clear responsibility, for example:

- Application layout
- Navigation
- Page headings
- Buttons
- Form fields
- Summary metrics
- Expense rows
- Group cards
- Empty states
- Loading states
- Error messages

Avoid both extremes:

- A giant component containing the entire application.
- Excessive abstraction for tiny elements that do not need to be shared.

Keep components small enough to understand and test. Keep API calls, validation schemas, and shared types in appropriate files.

Do not rename or move working files without a clear benefit.

## 11. Buttons and Interactive Elements

Use soft, rounded primary buttons with forest-green or sage treatments.

- Primary actions should be visually prominent.
- Secondary actions should be quieter.
- Destructive actions should be recognizable and require confirmation when appropriate.
- Links should look like links and buttons should behave like buttons.
- Provide clear hover, active, disabled, and focus-visible states.
- Avoid overly animated interactions.

Use the following interaction tokens:

```css
transition:
  color var(--dp-motion-interaction) var(--dp-motion-easing),
  background-color var(--dp-motion-interaction) var(--dp-motion-easing),
  border-color var(--dp-motion-interaction) var(--dp-motion-easing),
  transform var(--dp-motion-interaction) var(--dp-motion-easing);
```

Do not apply every transition to every element. Respect reduced-motion preferences and remove nonessential transforms and transitions when requested by the operating system.

## 12. Botanical Visual Details

Use botanical design language through restrained editorial details:

- Fine ornamental lines
- Subtle paper-like surfaces
- Large rounded panels
- Carefully composed arch shapes where appropriate
- Occasional serif italic accents
- Sparse decorative illustrations, only when relevant

A faint paper-grain texture may be used if it does not reduce text clarity or create unnecessary rendering cost.

Do not add random plant photographs to financial pages. Use genuine product-related visuals, relevant group imagery, or restrained illustrations only when they improve understanding.

Decorative elements must be hidden from assistive technology when they convey no information.

Avoid excessive shadows, glassmorphism, bright gradients, oversized organic blobs, and dense decoration.

## 13. Responsive Behavior

The interface must work at desktop, tablet, and mobile widths.

### Above 1120px

- Use the full application shell.
- Give dashboards and transaction lists enough space.
- Keep editorial layouts balanced.

### At 1120px and below

- Tighten layout spacing.
- Reduce unnecessary columns.
- Move secondary actions beneath content where needed.

### At 760px and below

- Stack multi-column layouts.
- Move hero imagery beneath the introductory copy where applicable.
- Convert complex tables into responsive rows or another readable mobile layout.
- Collapse desktop navigation appropriately.
- Stack form layouts and financial summaries when needed.

### At 480px and below

- Use narrower panel padding and rounded corners.
- Stack feature groups and action areas.
- Keep monetary values legible without clipping.
- Ensure buttons and inputs fit the available width.
- Avoid horizontal scrolling.

Test actual rendered states at representative widths. Do not rely exclusively on CSS assumptions.

## 14. Accessibility

- Use semantic HTML.
- Maintain logical reading and tab order.
- Provide accessible names for controls.
- Make all functionality available through a keyboard.
- Keep focus indicators visible.
- Maintain sufficient text and control contrast.
- Associate validation errors with their fields.
- Announce important asynchronous success and error messages appropriately.
- Respect reduced-motion settings.
- Provide meaningful alternative text for informative images.
- Hide purely decorative visuals from assistive technology.

Do not remove browser focus outlines without providing an equally visible alternative.

## 15. Performance and Production Quality

- Keep dependencies minimal.
- Avoid unnecessary global state.
- Prevent repeated API calls caused by incorrect effect dependencies.
- Avoid duplicate submissions and stale UI state.
- Use efficient list rendering with stable keys.
- Keep images optimized and dimensions reserved.
- Use environment-based configuration.
- Keep secrets out of frontend code.
- Ensure the production build succeeds.
- Preserve linting and TypeScript checks.
- Test important interactions and error states.

Do not introduce a new state-management library, UI framework, icon package, or design system unless the project's requirements justify it.

## 16. Implementation Workflow

Before changing the interface:

1. Inspect the current project structure and existing CSS.
2. Inspect current routes, components, API services, types, and backend contracts.
3. Identify the smallest coherent implementation step.
4. Reuse existing patterns where they are sound.
5. Implement the change without removing working functionality.
6. Run the production build and applicable lint checks.
7. Test the actual rendered interface at desktop and mobile widths.
8. Check loading, empty, success, validation, and failure states where relevant.
9. Report which files changed and any remaining limitations.

Do not replace the entire application merely to apply the design system.

## Final Design Principle

Create a production-minded Expense Splitter that feels editorial, calm, warm, and trustworthy.

The visual identity should come from cream paper, forest-green typography, sage panels, terracotta accents, expressive Garamond headings, and thoughtful spacing.

The application must remain a functional financial utility first. Preserve the real API contracts, clear financial information, accessibility, responsive behavior, and maintainable React + TypeScript architecture above decorative styling.
