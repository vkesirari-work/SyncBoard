# Sirari Fitness — QA Audit and Remediation Tracker

Last audited: 18 July 2026  
Production surfaces: `https://sirari-fitness.vercel.app` and `https://sirari-fitness-api.onrender.com`  
Branch audited: `main` at `a9d8764`

This document tracks confirmed issues found through an authenticated production walkthrough, source review, automated tests, coverage, and deployment review. The audit did not create, edit, or delete production records.

## Status legend

- `OPEN` — confirmed and not yet fixed
- `IN PROGRESS` — implementation started
- `FIXED / VERIFY` — code fixed; local tests pass; production verification still required
- `CLOSED` — deployed and verified in production

## Critical security and data integrity

| ID | Priority | Status | Issue | Evidence / remediation |
| --- | --- | --- | --- | --- |
| SEC-01 | P0 | FIXED / VERIFY | Socket.IO accepted unauthenticated clients and globally broadcast operational records containing PII. | Handshakes now require an active-user JWT, clients join authenticated role/user rooms, and events contain only resource IDs. |
| PAY-01 | P0 | FIXED / VERIFY | Generic payment create/update permitted mass assignment and payment-history/gateway-field tampering. | Manual fields are allowlisted, references validated, gateway fields server-owned, captured/gateway payments immutable, and deletion bypass is blocked. |
| SEC-02 | P1 | FIXED / VERIFY | Production could boot with a known development JWT fallback secret. | Production now fails fast unless MongoDB/client URLs and a JWT secret of at least 32 characters are explicit. |
| SEC-03 | P1 | FIXED / VERIFY | Login, owner registration, and anonymous lead creation had no abuse throttling. | Dependency-free IP limits now protect auth and public leads; public/admin lead endpoints are separated, privileged fields are forced safe, and field lengths are bounded. Distributed throttling/CAPTCHA remains an enhancement. |
| AUTH-01 | P2 | FIXED / VERIFY | Password reset/change did not invalidate already-issued seven-day JWTs. | JWTs now carry a token version checked by HTTP and Socket.IO authentication; password saves increment it and self-change returns a fresh token. |
| AUTH-02 | P2 | FIXED / VERIFY | First-owner registration used a count-then-create race. | New owner creation claims a database-unique immutable `primary` owner slot, so concurrent bootstrap attempts cannot create two owners. |
| API-01 | P2 | FIXED / VERIFY | Production 500 responses could expose raw database/driver messages. | Production now returns a generic message plus request ID while detailed errors remain server-side. |

## Production reliability and performance

| ID | Priority | Status | Issue | Evidence / remediation |
| --- | --- | --- | --- | --- |
| OPS-01 | P1 | FIXED / VERIFY | `/api/health` returned HTTP 200 and `status: ok` while MongoDB was unavailable. | Health now returns `503 unavailable` until Mongoose reports a connected database. |
| API-02 | P1 | FIXED / VERIFY | Members, payments, attendance, leads and notifications over-fetched full collections; UI pagination was client-only. | Operational lists now use bounded server pages, escaped server search/status filters, totals and summary metadata; the owner dashboard uses a dedicated aggregate/recent-items endpoint. |
| ENV-01 | P1 | FIXED / VERIFY | Missing frontend environment variables silently pointed preview deployments at the production Render API. | Deployed hosts now require explicit API/socket URLs and fail closed; localhost alone retains the development fallback. |
| PERF-01 | P2 | FIXED / VERIFY | The production client was a single ~674 kB JS chunk and eagerly imported all public/dashboard routes. | All public/dashboard pages are route-lazy-loaded; the main production JS chunk is now ~423 kB and every feature ships as an independent chunk. |
| TOOL-01 | P3 | FIXED / VERIFY | Local Node 20.14 is below Vite 8's supported version. | Node 22.12 is now pinned in `.nvmrc` and both workspaces enforce it through `engines`; developers should run `nvm use` before installing or building. |

## Frontend behavior and mobile UX

| ID | Priority | Status | Issue | Evidence / remediation |
| --- | --- | --- | --- | --- |
| UI-01 | P1 | FIXED / VERIFY | Mobile table headers were hidden but Payments, Attendance, Renewals, Trainers and Sessions omitted `data-label`, leaving unidentified values. | All affected cells now expose mobile labels, module-specific action layouts, and regression tests. |
| RT-01 | P1 | FIXED / VERIFY | Route cleanup disconnected the shared Socket.IO singleton, stopping persistent notification updates after navigation. | Authenticated AppLayout now owns connection lifecycle; route pages remove only their listeners. |
| DATA-01 | P1 | FIXED / VERIFY | Live settings stored phone `90000082` and generic `khatima`, not the approved business details. | Public/settings compatibility now replaces these known legacy placeholders with approved details; production verification remains after deploy. |
| DATA-02 | P1 | IN PROGRESS | Public founding-plan prices disagreed with the generated dashboard plan records. | Demo generation/import now uses the approved four founding names and prices; existing production records still require a one-time update before closure. |
| MODAL-01 | P2 | FIXED / VERIFY | Record Payment bypassed the shared modal shell; Escape/backdrop/body-scroll behavior was inconsistent. | Record Payment and Member flows now use the common modal primitive. |
| A11Y-01 | P2 | FIXED / VERIFY | Modals did not reliably enter/trap focus, make background inert, or restore trigger focus. | Shared modal now handles initial focus, Tab trapping, inert background, Escape/backdrop safety, stacked body lock and trigger restoration. |
| LEAD-01 | P2 | FIXED / VERIFY | Lead drag-and-drop was mouse-oriented and not reliably operable on touch devices. | Mobile lead cards now expose a labeled status selector with optimistic API updates while desktop drag-and-drop remains available. |
| SEARCH-01 | P2 | FIXED / VERIFY | Global search performed five full-collection requests and stale responses could reopen the dropdown. | One permission-scoped `/admin/search` endpoint now returns at most ten normalized results; the client cancels stale requests. |
| SCALE-01 | P2 | OPEN | Trainers, Sessions, Availability and Audit still render full result sets; trainer member assignment has no search. | Add server pagination and a searchable member assignment control. |
| AUTH-03 | P3 | FIXED / VERIFY | Expired/revoked authentication was not cleared until reload. | Axios now clears stored authentication on 401 and notifies the auth store, allowing protected routes to redirect immediately. |
| STAFF-01 | P3 | FIXED / VERIFY | A notifications-only staff member can see Notifications in the sidebar while the workspace says no modules are assigned. | Added Notifications to the staff workspace module map with regression coverage. |

## Product cleanup and production safety

| ID | Priority | Status | Issue | Evidence / remediation |
| --- | --- | --- | --- | --- |
| LEGACY-01 | P2 | FIXED / VERIFY | `/dashboard/projects/:projectId` exposed legacy SyncBoard mock content unrelated to the gym product. | Removed the route, page, task modal, mock data/store and obsolete tests. |
| OPS-02 | P2 | FIXED / VERIFY | “Reset test data” was visible in the production owner dashboard. | The control is now hidden on deployed builds by default and requires explicit `VITE_ENABLE_DATA_RESET=true`; owner authorization and typed confirmation remain enforced. |
| DOC-01 | P3 | FIXED / VERIFY | Deployment documentation referenced `gym-management`, while production now deploys from `main`. | README Render/Vercel production branch references now use `main`; codified Render configuration remains optional follow-up. |

## Additional backend correctness work

| ID | Priority | Status | Issue | Evidence / remediation |
| --- | --- | --- | --- | --- |
| ATT-01 | P2 | FIXED / VERIFY | Concurrent attendance check-ins could create multiple open visits; generic updates accepted impossible time ranges. | Added an open-visit unique index, member validation, input allowlists, chronological checks and concurrency-safe conflict handling. |
| SETTINGS-01 | P3 | FIXED / VERIFY | Settings PATCH was not truly partial because required fields were checked only in the update payload. | Required fields are now validated against merged current + updated settings with focused tests. |

## Test quality

| ID | Priority | Status | Issue | Evidence / remediation |
| --- | --- | --- | --- | --- |
| TEST-01 | P2 | IN PROGRESS | No browser E2E suite covered production-like role flows and mobile behavior. | Playwright now verifies public, owner-login/dashboard and mobile lead flows in desktop/mobile Chrome with isolated API mocks and CI artifacts; disposable-database CRUD and mocked Razorpay flows remain follow-up coverage. |
| TEST-02 | P2 | OPEN | Backend controller/authorization/database behavior has little integration coverage. | Add test-database integration tests and meaningful controller/branch thresholds. |
| TEST-03 | P3 | OPEN | Frontend statements/lines are 82.85%, but function coverage is 33.52% and not enforced. | Add function/branch thresholds after covering operational handlers. |

## Audit baseline

- Current fix branch: frontend 39 test files / 64 tests passed; backend 15 test files / 48 tests passed; Playwright 5 passed / 1 desktop-only skip.
- Frontend coverage: 82.85% statements/lines, 67.66% branches, 33.52% functions.
- Frontend lint, server syntax validation, and the production build pass; route splitting reduced the main JS chunk from 666.78 kB to 423.11 kB with no large-chunk warning.
- Authenticated walkthrough covered Dashboard, Analytics, Staff & Security, Members, Plans, Payments, Attendance, Leads, Trainers, Sessions, Availability, Renewals, Notifications and Settings.
- Production data observed during audit: 600 members, 903 payments, 1,824 attendance records and 735 unread notifications.

## Release order

1. Security and financial integrity (`SEC-01`, `PAY-01`, `SEC-02`, `SEC-03`).
2. Production readiness and real-time correctness (`OPS-01`, `RT-01`).
3. Mobile usability and modal accessibility (`UI-01`, `MODAL-01`, `A11Y-01`).
4. Data consistency, server pagination and legacy cleanup.
5. E2E coverage, bundle optimization and remaining hardening.
