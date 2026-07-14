# Sirari Fitness

Sirari Fitness is a full-stack gym website and administration dashboard. It combines a public lead-generation website with authentication, membership plans, member records, payments, attendance APIs, live dashboard updates, and MongoDB persistence.

## Live services

- Backend: https://sirari-fitness-api.onrender.com
- Health check: https://sirari-fitness-api.onrender.com/api/health
- Frontend development URL: http://localhost:5173
- Git branch: `gym-management`

The frontend is currently run locally. The backend is deployed on Render and uses MongoDB Atlas.

## Technology stack

### Frontend

- React 19 and Vite
- React Router
- Axios
- Zustand
- Socket.IO Client
- Lucide icons

### Backend

- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT authentication
- bcrypt password hashing
- Socket.IO
- CORS and environment-based configuration

## Project structure

```text
SyncBoard/
├── client/                 React and Vite frontend
│   ├── src/components/     Layout, authentication, and modal components
│   ├── src/pages/          Public website and admin pages
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

## Implemented product flows

### Authentication

1. An owner creates an account on `/register`.
2. The backend hashes the password with bcrypt and stores the user in MongoDB.
3. The backend returns a JWT and safe user details.
4. The frontend stores the session locally and sends the token as a Bearer token.
5. `/dashboard` and its child routes require a valid session.
6. The app verifies existing sessions through `/api/auth/me`.
7. Logout removes the local session and returns the user to `/login`.

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
2. The backend prevents a second open visit for the same member.
3. The visit appears as `Inside` until staff records check-out.
4. The app calculates visit duration from check-in and check-out timestamps.
5. Authorized staff can correct timestamps or notes and delete an incorrect record.
6. Socket.IO refreshes attendance history and dashboard check-in counts.

The manual attendance screen is the operational fallback and correction interface. The intended production flow is automatic self check-in through a compatible QR, RFID, or biometric attendance device.

## Dashboard tabs: current capability and future scope

| Tab | Current capability | Future scope |
| --- | --- | --- |
| Dashboard | Live member, attendance, revenue, renewal, lead, and payment summaries | Date-range analytics, charts, exports, configurable widgets |
| Members | Add, search, view full details, edit, status changes, and safe delete | Profile photos, documents, measurements, workout history, freeze/transfer workflows |
| Plans | Add, edit, activate/inactivate, safe delete | Discounts, joining fees, plan benefits, family/corporate plans, recurring billing |
| Payments | Record, search, filter, edit, refund status, and protected financial history | Razorpay checkout, UPI QR/Intent, cards, receipts, webhooks, reconciliation, tax invoices |
| Attendance | Check-in, check-out, duration, search, corrections, and delete | QR/RFID self check-in, fingerprint terminal integration, device health, shift rules, anomaly alerts |
| Leads | Public lead capture and recent-lead dashboard feed | Lead details, assignment, follow-ups, conversion funnel, reminders, WhatsApp integration |
| Trainers | Database model foundation | Trainer CRUD, schedules, member assignment, sessions, commissions, availability |
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
| `/dashboard/members` | Protected | Search and review members |
| `/dashboard/plans` | Protected | Create and review membership plans |
| `/dashboard/payments` | Protected | Record and manage payment history |
| `/dashboard/attendance` | Protected | Check members in/out and manage visit history |
| `/dashboard/projects/:projectId` | Protected | Member operations board |

## API routes

| Endpoint | Methods | Access |
| --- | --- | --- |
| `/api/health` | GET | Public |
| `/api/auth/register` | POST | Public |
| `/api/auth/login` | POST | Public |
| `/api/auth/me` | GET | Protected |
| `/api/members` | GET, POST | Protected |
| `/api/members/:id` | GET, PATCH, DELETE | Protected |
| `/api/plans` | GET, POST | Protected |
| `/api/plans/:id` | PATCH, DELETE | Protected |
| `/api/payments` | GET, POST | Protected |
| `/api/payments/:id` | PATCH, DELETE | Protected |
| `/api/attendance` | GET | Protected |
| `/api/attendance/check-in` | POST | Protected |
| `/api/attendance/:id/check-out` | PATCH | Protected |
| `/api/attendance/:id` | PATCH, DELETE | Protected |
| `/api/leads` | POST | Public |
| `/api/leads` | GET | Protected |
| `/api/leads/:id` | PATCH | Protected |

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
npm run dev
```

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
NODE_ENV=production
```

Do not manually set `PORT` on Render. Render supplies it automatically. Free Render services can sleep after inactivity, so the first request can take longer while the service wakes.

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

1. Lead details, assignment, status, follow-up, and delete management
2. Trainer CRUD, schedules, and member assignment
3. Final dashboard navigation, global search, analytics, and exports
4. Replace remaining mock member-board data
5. Deploy the frontend and update production CORS
6. Integrate Razorpay test checkout, signature verification, and webhooks
7. Add QR/RFID attendance-device API and idempotent event processing
8. Evaluate a compatible biometric terminal SDK without storing raw fingerprints
