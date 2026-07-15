# Sirari Fitness

Sirari Fitness is a full-stack gym website and administration dashboard. It combines a public lead-generation website with authentication, membership plans, member records, payments, attendance APIs, live dashboard updates, and MongoDB persistence.

## Live services

- Backend: https://sirari-fitness-api.onrender.com
- Health check: https://sirari-fitness-api.onrender.com/api/health
- Frontend production URL: https://sirari-fitness.vercel.app
- Frontend development URL: http://localhost:5173
- Git branch: `gym-management`

The frontend is deployed on Vercel. The backend is deployed on Render and uses MongoDB Atlas.

## Technology stack

### Frontend

- React 19 and Vite
- React Router
- Tailwind CSS 4 with the official Vite plugin
- Axios
- Zustand
- Socket.IO Client
- Lucide icons
- Vitest, React Testing Library, and jsdom for module tests

Dashboard visual styles are colocated with their owning layouts, pages, and UI components. Shared legacy styles remain in `client/src/styles/app.css` for the public website, authentication screens, and common form primitives.

### Backend

- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT authentication
- bcrypt password hashing
- Socket.IO
- CORS and environment-based configuration
- Vitest and Supertest for unit, route-contract, and API-shell tests

## Project structure

```text
SyncBoard/
├── client/                 React and Vite frontend
│   ├── src/components/     Layout, authentication, and modal components
│   ├── src/pages/          Public website and admin pages
│   ├── src/test/           Shared jsdom setup, API fixtures, and render helpers
│   ├── src/lib/            API and Socket.IO clients
│   └── src/store/          Authentication and board stores
└── server/                 Express API and Socket.IO server
    └── src/
        ├── config/         Environment and database setup
        ├── controllers/    API request handlers
        ├── middleware/     JWT authentication and authorization
        ├── models/         Mongoose schemas
        ├── routes/         Express routes
        └── utils/          Authentication helpers
```

## Automated tests

Every React page and component has a colocated `*.spec.jsx` file. Tests cover module rendering, API contracts, primary forms/actions, role routing, protected routes, staff permissions, private member/trainer portals, progress tracking, search, notifications, and modal behavior.

Backend `*.spec.js` files cover JWT/permission middleware, public-user safety, trainer availability and approved leave, Mongoose schema contracts, every Express route group, and API root/health/404 behavior. Tests use mocks and an ephemeral Supertest listener; they never write to local MongoDB or MongoDB Atlas.

Run the suites:

```bash
cd client
npm test

cd ../server
npm test
```

Development watch mode is available with `npm run test:watch` in either folder. Production dependencies can be checked with `npm audit --omit=dev`.

Coverage reports are generated with `npm run test:coverage` and ignored by Git. Frontend coverage has an enforced 80% statements/lines floor; the current V1 baseline is 83.53% statements and lines. The GitHub Actions `V1 tests` workflow automatically runs frontend tests, lint, build, and backend tests on pushes to `gym-management`/`main` and on pull requests.

### Visual test dashboards

Start the interactive frontend test dashboard:

```bash
cd client
npm run test:ui
```

It opens at `http://localhost:51204/__vitest__/`. The backend dashboard uses the same workflow from `server/` and opens at `http://localhost:51205/__vitest__/`.

For file-by-file HTML coverage, run `npm run test:coverage`, then open `coverage/index.html` inside that folder. Green lines are covered, red lines are untested, and the summary reports statements, branches, functions, and lines.

## Implemented product flows

### Authentication

1. The first owner creates an account on `/register`; public owner registration then locks automatically.
2. The backend hashes the password with bcrypt and stores the user in MongoDB.
3. The backend returns a JWT and safe user details.
4. The frontend stores the session locally and sends the token as a Bearer token.
5. `/dashboard` and its child routes require a valid session.
6. The app verifies existing sessions through `/api/auth/me`.
7. Logout removes the local session and returns the user to `/login`.
8. Signed-in users can change their password after confirming the current password.
9. Owners can create scoped staff accounts, disable access immediately, and reset a forgotten staff password.

### Staff security flow

1. Only an owner can open Staff & Security, create staff accounts, choose module permissions, reset passwords, or disable accounts.
2. Staff land on a private shortcut workspace that only shows assigned modules and never exposes owner-wide totals; Analytics and every other module are separately selected by the owner.
3. Backend permission middleware enforces access even when someone manually changes a frontend URL or calls an API directly.
4. Disabled accounts cannot log in and existing tokens stop working because every request rechecks the database account state.
5. Successful dashboard POST, PUT, PATCH, and DELETE actions create audit records without storing request passwords or sensitive body data.
6. Email-delivered owner self-service password recovery will connect to the V2 communication service; V1 forgotten staff passwords are reset by the owner.

### Trainer access flow

1. An admin creates a trainer profile, assigns members, and can enable login credentials directly inside the Add Trainer form.
2. Existing trainer login credentials can be reset from the login-access section inside Edit Trainer.
3. The trainer signs in through the regular `/login` page and reaches a dedicated trainer workspace.
4. The backend scopes member queries to the trainer's assigned member IDs.
5. Trainers can add or update coaching progress notes for assigned members only.
6. Payments, leads, attendance administration, analytics, notifications, settings, reset tools, and other owner APIs reject trainer tokens with `403`.
7. Inactive trainer profiles cannot sign in. Legacy owner accounts with the `user` role retain full admin access.

### Member portal flow

1. An admin can enable member portal access directly inside Add Member and set a temporary password.
2. Existing member credentials can be reset from the login-access section inside Edit Member.
3. The member signs in through the regular `/login` page and reaches a private, responsive member workspace.
4. The portal shows only that member's plan, membership dates, assigned trainer, coaching progress, attendance, payment history, and printable receipts.
5. Dedicated backend scoping prevents a member from opening another member profile by changing a URL or ID.
6. Admin payment, attendance, plan, lead, trainer, analytics, notification, settings, and reset APIs reject member tokens with `403`.

### Member progress flow

1. Owner/authorized staff open **Progress** from the Members table; assigned trainers open **Full progress** from their private workspace.
2. Measurements store dated weight, height, body-fat, chest, waist, hips, biceps, thigh, goals, and coaching notes.
3. Overview charts show the latest 12 weight and body-fat records with exact values available on hover.
4. Coaches can build a structured workout plan with training day, exercise, sets, reps, load, and exercise notes.
5. Progress photos are resized and compressed in the browser before being stored, limited to 12 private photos per member.
6. Members can view their own progress and workout through `/dashboard/progress/me`; member accounts cannot edit the record.
7. Assigned-trainer and backend permission checks prevent trainers or staff from opening progress outside their authorized members/modules.

### Personal training session flow

1. An admin assigns a member to a trainer, then books a date, time, duration, and training focus from the Sessions tab.
2. The backend rejects overlapping bookings for either the trainer or the member.
3. Trainers see only their own schedule and can complete a session or mark a no-show with session notes.
4. Members see only their own upcoming and past sessions, including completed coaching notes.
5. Admins can reschedule, complete, cancel, or safely delete non-completed bookings. Completed sessions remain permanent history.

### Trainer availability and leave flow

1. Trainers submit dated leave requests from their private workspace and can cancel a request while it is pending.
2. Admins review pending requests from the Availability tab and approve or reject them with an optional note.
3. Leave approval is blocked until existing scheduled sessions inside that date range are rescheduled or cancelled.
4. New and edited session bookings are validated against the trainer's working days, morning/evening/full-day shift, approved leave, and Asia/Kolkata gym time.
5. Admins can also add an approved or pending leave record directly for an active trainer.

### Public lead flow

1. A visitor opens the public website.
2. They submit their name, phone number, and fitness goal.
3. The frontend sends the form to `POST /api/leads`.
4. MongoDB stores the lead.
5. Socket.IO emits a lead event.
6. The admin dashboard refreshes and shows the lead under Recent Leads.

### Membership plan flow

1. An authenticated admin opens `/dashboard/plans`.
2. They create a plan with its name, duration, price, and description.
3. The backend saves the plan in MongoDB.
4. Active plans become available in the New Member form.

Suggested initial plans:

| Plan | Duration | Example price |
| --- | ---: | ---: |
| Monthly | 1 month | ₹1,499 |
| Quarterly | 3 months | ₹3,999 |
| Annual | 12 months | ₹12,999 |

### Member flow

1. An authenticated admin selects New Member from the topbar.
2. They enter the member's contact details, plan, status, and membership dates.
3. The frontend saves the record through `POST /api/members`.
4. MongoDB stores the member and Socket.IO emits an update.
5. The dashboard active-member count refreshes.
6. The app redirects to `/dashboard/members`, where full member details can be searched and reviewed.

### Dashboard flow

The dashboard loads real API data and calculates:

- Active members
- Today's check-ins
- Current-month paid revenue
- Memberships ending within 30 days
- Recent leads
- Recent payments

Socket.IO refreshes relevant dashboard data after lead, member, payment, and attendance events.

### Attendance flow

1. Staff selects an active member and records a check-in.
2. Members already inside are removed from the check-in selector, while the backend also prevents duplicate open visits.
3. The visit appears as `Inside` until staff records check-out.
4. The app calculates visit duration from check-in and check-out timestamps.
5. Authorized staff can correct timestamps or notes and delete an incorrect record.
6. Socket.IO refreshes attendance history and dashboard check-in counts.

The manual attendance screen is the operational fallback and correction interface. The intended production flow is automatic self check-in through a compatible QR, RFID, or biometric attendance device.

## Dashboard tabs: current capability and future scope

### Release roadmap

**V1 completed scope**

- Staff management and security: staff accounts, scoped permissions, password change/owner reset, account disable controls, and audit logs.
- Member progress tracking: weight and body measurements, goals, workout plans, progress charts, compressed progress photos, and role-scoped access.

**V2 scope**

- Automated communication: WhatsApp and email reminders for renewals, payments, training sessions, and lead follow-ups.
- Payment production hardening: Razorpay webhooks, reconciliation, refunds, and GST invoices.

Biometric/RFID devices, multi-branch operations, group-class waitlists, and trainer payroll remain advanced future scope.

| Tab | Current capability | Future scope |
| --- | --- | --- |
| Dashboard | Live member, attendance, revenue, renewal, lead, and payment summaries; exact-result cross-module search; guarded test-data reset | Configurable widgets and saved owner layouts |
| Analytics | Protected date-range revenue, attendance, member-growth and lead metrics; adaptive daily/weekly/monthly charts; payment/plan breakdowns; CSV export | Scheduled reports, comparison periods, forecasting, PDF reports |
| Members | Add, search, view full details, clearly labeled edit action, status changes, safe delete, secure login/reset, and private member portal with plan, trainer, sessions, payments, receipts, attendance and coaching progress | Profile documents, freeze/transfer workflows |
| Member Progress | Private measurements and goals, weight/body-fat charts, workout plans, coaching notes, compressed progress photos, assigned-trainer access, and member read-only view | Cloud object storage, comparison slider, personal records, workout completion tracking |
| Plans | Add, edit, activate/inactivate, safe delete | Discounts, joining fees, plan benefits, family/corporate plans, recurring billing |
| Payments | Manual records, Razorpay checkout with server verification, transaction search, protected history, receipt preview, printing, and PDF saving | Webhooks, reconciliation, refunds through gateway, GST tax invoices |
| Attendance | Check-in, check-out, duration, search, corrections, and delete | QR/RFID self check-in, fingerprint terminal integration, device health, shift rules, anomaly alerts |
| Leads | Public/admin lead capture, modern drag-and-drop CRM Kanban, search, full details, edit, delete, and dashboard sync | Staff assignment, scheduled follow-ups, funnel analytics, reminders, WhatsApp integration |
| Renewals | Expired, 7-day, 30-day, and custom-range tracking with smart plan-duration renewal and live dashboard count | Automated reminders, renewal checkout links, staff assignments, retention analytics |
| Trainers | Add, edit, safe delete, specialties, shifts, working days, active status, bio, assignments, secure login/reset, dedicated assigned-member portal, progress notes, personal-training schedule, completion/no-show actions, leave requests, and backend role enforcement | Trainer attendance, commissions, performance analytics |
| Sessions | Admin booking/rescheduling, member-trainer assignment validation, overlap prevention, working-day/shift/leave validation, status tracking, trainer completion notes, member history, safe delete, Socket.IO refresh, and responsive role-specific views | Recurring sessions, capacity/group classes, waitlists, reminders, calendar sync |
| Availability | Trainer leave requests/cancellation, admin approval/rejection notes, manual leave entry, scheduled-session approval guard, filters, and live booking enforcement | Half-day leave, recurring availability exceptions, substitute trainers, leave balance |
| Staff & Security | Owner-only staff creation, custom module permissions, account enable/disable, password reset/change, locked owner registration, backend permission enforcement, and mutation audit log | Email-delivered owner password recovery in V2, login alerts, optional two-factor authentication |
| Settings | MongoDB-backed gym identity, contact details, receipt configuration, public-site sync, logo URL, and safe Razorpay status | Direct logo upload, multiple branches, per-branch tax and payment configuration |
| Notifications | Automatic renewal, pending-payment, and lead follow-up reminders; unread badge, priority, filters, read/dismiss actions, deep links, and Socket.IO refresh | WhatsApp/email delivery, scheduled templates, staff ownership, delivery logs |
| Member board | Mock operational notes and status movement | Replace mock data, drag-and-drop, comments, reminders, audit history |

### Future attendance-device architecture

```text
Member fingerprint, RFID, or QR scan
        ↓
Compatible attendance device or scanner application
        ↓
Authenticated device event API
        ↓
Member/device ID mapping and duplicate-event protection
        ↓
MongoDB attendance record
        ↓
Socket.IO dashboard update
```

The web application should not store raw fingerprint images. A biometric terminal or its approved SDK should perform biometric matching and send only a device member identifier, event type, timestamp, and device identifier to the backend. Manual attendance remains available for corrections and device outages.

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Gym website and callback form |
| `/register` | Public | Create an admin account |
| `/login` | Public | Sign in |
| `/dashboard` | Protected | Live gym overview |
| `/dashboard/analytics` | Protected | Date-filtered business analytics and CSV reports |
| `/dashboard/members` | Protected | Search and review members |
| `/dashboard/progress/:memberId` | Protected and role-scoped | Track measurements, goals, workout plans, charts, and photos |
| `/dashboard/plans` | Protected | Create and review membership plans |
| `/dashboard/payments` | Protected | Record and manage payment history |
| `/dashboard/attendance` | Protected | Check members in/out and manage visit history |
| `/dashboard/leads` | Protected | Manage enquiries and conversion status |
| `/dashboard/trainers` | Protected | Manage trainer profiles, schedules, and member assignment |
| `/dashboard` | Trainer | Dedicated assigned-member coaching workspace for trainer accounts |
| `/dashboard/renewals` | Protected | Track expired and upcoming memberships |
| `/dashboard/settings` | Protected | Configure gym, website, receipt, and contact details |
| `/dashboard/notifications` | Protected | Review and action automatic business reminders |
| `/dashboard/sessions` | Admin/owner | Book and manage personal training sessions |
| `/dashboard/availability` | Admin/owner | Review trainer availability and leave requests |
| `/dashboard/staff-security` | Owner only | Manage staff permissions, passwords, status, and audit history |
| `/dashboard/projects/:projectId` | Protected | Member operations board |

## API routes

| Endpoint | Methods | Access |
| --- | --- | --- |
| `/api/health` | GET | Public |
| `/api/auth/register` | POST | Public |
| `/api/auth/login` | POST | Public |
| `/api/auth/me` | GET | Protected |
| `/api/auth/change-password` | PATCH | Protected |
| `/api/admin/analytics` | GET | Protected |
| `/api/members` | GET, POST | Protected |
| `/api/members/:id` | GET, PATCH, DELETE | Protected |
| `/api/members/:id/account` | PUT | Admin/legacy owner only |
| `/api/members/me` | GET | Member only |
| `/api/plans` | GET, POST | Protected |
| `/api/plans/:id` | PATCH, DELETE | Protected |
| `/api/payments` | GET, POST | Protected |
| `/api/payments/checkout/order` | POST | Protected |
| `/api/payments/checkout/verify` | POST | Protected |
| `/api/payments/:id` | PATCH, DELETE | Protected |
| `/api/attendance` | GET | Protected |
| `/api/attendance/check-in` | POST | Protected |
| `/api/attendance/:id/check-out` | PATCH | Protected |
| `/api/attendance/:id` | PATCH, DELETE | Protected |
| `/api/leads` | POST | Public |
| `/api/leads` | GET | Protected |
| `/api/leads/:id` | PATCH | Protected |
| `/api/leads/:id` | DELETE | Protected |
| `/api/trainers` | GET, POST | Protected |
| `/api/trainers/:id` | PATCH, DELETE | Protected |
| `/api/trainers/:id/account` | PUT | Admin/legacy owner only |
| `/api/trainers/me` | GET | Trainer only |
| `/api/training-sessions` | GET | Admin/owner, trainer, or member (role-scoped) |
| `/api/training-sessions` | POST | Admin/legacy owner only |
| `/api/training-sessions/:id` | PATCH | Admin/legacy owner or assigned trainer |
| `/api/training-sessions/:id` | DELETE | Admin/legacy owner only |
| `/api/trainer-leaves` | GET, POST | Admin/owner or trainer (role-scoped) |
| `/api/trainer-leaves/:id` | PATCH | Admin/legacy owner only |
| `/api/trainer-leaves/:id` | DELETE | Admin/owner or requesting trainer |
| `/api/staff` | GET, POST | Owner only |
| `/api/staff/:id` | PATCH | Owner only |
| `/api/staff/:id/password` | PUT | Owner only |
| `/api/staff/audit/logs` | GET | Owner only |
| `/api/member-progress/:memberId` | GET | Members permission, assigned trainer, or own member account |
| `/api/member-progress/:memberId/measurements` | POST | Members permission or assigned trainer |
| `/api/member-progress/:memberId/measurements/:measurementId` | DELETE | Members permission or assigned trainer |
| `/api/member-progress/:memberId/workout-plan` | PUT | Members permission or assigned trainer |
| `/api/member-progress/:memberId/photos` | POST | Members permission or assigned trainer |
| `/api/member-progress/:memberId/photos/:photoId` | DELETE | Members permission or assigned trainer |
| `/api/settings/public` | GET | Public |
| `/api/settings` | GET, PATCH | Protected |
| `/api/notifications` | GET | Protected |
| `/api/notifications/read-all` | PATCH | Protected |
| `/api/notifications/:id/read` | PATCH | Protected |
| `/api/notifications/:id` | DELETE | Protected |

Protected routes expect this header:

```http
Authorization: Bearer <jwt-token>
```

## Local frontend setup

Requirements:

- Node.js 20.19+ or Node.js 22.12+
- npm

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

To use the deployed Render backend, configure `client/.env`:

```env
VITE_API_URL=https://sirari-fitness-api.onrender.com/api
VITE_SOCKET_URL=https://sirari-fitness-api.onrender.com
```

Vite reads environment values at startup. Restart `npm run dev` after changing `.env`.

## Local backend setup

The deployed backend is sufficient for normal frontend development. To run the backend locally:

```bash
cd server
npm install
cp .env.example .env
npm run db:local
```

Keep the local database command running, then open a second terminal:

```bash
cd server
npm run dev
```

For Wi-Fi networks that block MongoDB Atlas port `27017`, create an ignored `server/.env.local` with `MONGODB_URI=mongodb://127.0.0.1:27017/sirari_fitness_local`. This keeps test data on the laptop while Render continues to use MongoDB Atlas production data.

Configure `server/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/sirari_fitness
CLIENT_URL=http://localhost:5173
JWT_SECRET=<long-random-secret>
NODE_ENV=development
```

Never commit `.env`, MongoDB credentials, or JWT secrets. If port `5000` is occupied by macOS Control Center, use `5001` and update the client URLs to match.

## Render configuration

The backend Render Web Service uses:

| Setting | Value |
| --- | --- |
| Branch | `gym-management` |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Required Render environment variables:

```text
MONGODB_URI
JWT_SECRET
CLIENT_URL
CLIENT_URLS
NODE_ENV=production
```

Do not manually set `PORT` on Render. Render supplies it automatically. Free Render services can sleep after inactivity, so the first request can take longer while the service wakes.

Set `CLIENT_URLS` to a comma-separated allowlist when both local and deployed frontends need access:

```text
http://localhost:5173,https://your-frontend.vercel.app
```

## Vercel frontend configuration

Deploy the `client` directory as a Vite project:

| Setting | Value |
| --- | --- |
| Branch | `gym-management` |
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Required Vercel environment variables:

```text
VITE_API_URL=https://sirari-fitness-api.onrender.com/api
VITE_SOCKET_URL=https://sirari-fitness-api.onrender.com
```

`client/vercel.json` rewrites deep links such as `/dashboard/members` to the SPA entry point so React Router can handle browser refreshes.

## Verification

Frontend:

```bash
cd client
npm run lint
npm run build
```

Backend syntax check:

```bash
cd server
find src -name '*.js' -print0 | xargs -0 -n1 node --check
```

End-to-end smoke test:

1. Confirm `/api/health` reports `database: connected`.
2. Register an account and reach the protected dashboard.
3. Submit a public lead and verify it under Recent Leads.
4. Create a membership plan.
5. Add a member using that plan.
6. Verify the count and member details page.

## Roadmap

1. Trainer session booking, leave calendar, commissions, and performance analytics
2. Lead staff assignment, scheduled follow-ups, reminders, and conversion analytics
3. Dashboard analytics, exports, configurable widgets, and deeper global-search actions
4. Replace remaining mock member-board data
5. Deploy the frontend and update production CORS
6. Integrate Razorpay test checkout, signature verification, and webhooks
7. Add QR/RFID attendance-device API and idempotent event processing
8. Evaluate a compatible biometric terminal SDK without storing raw fingerprints
