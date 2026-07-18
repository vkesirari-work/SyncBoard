# Sirari Fitness v1.0.0

Released: July 18, 2026  
Status: Stable pre-launch release

Sirari Fitness V1 establishes the complete pre-launch website and gym-management foundation. It is intended for development, demonstrations, test data, and workflow validation before the planned 2027 opening.

## Release highlights

- Mobile-first public website with 2027 launch messaging, founding plans, lead capture, WhatsApp, Instagram, Google Maps, and dashboard login.
- Responsive owner dashboard covering members, plans, payments, attendance, leads, trainers, sessions, availability, renewals, notifications, analytics, settings, staff security, and member progress.
- Secure owner, staff, trainer, and member authentication with role-scoped APIs and private workspaces.
- Razorpay test checkout with server-side signature verification, printable receipts, and PDF support.
- Member measurement history, progress charts/photos, structured workout plans, and coaching notes.
- Trainer assignment, working schedules, leave approval, conflict-safe personal-training bookings, completion, and no-show flows.
- Paginated operational APIs, permission-scoped global search, Socket.IO refresh events, audit logging, and guarded test-data reset.
- Route-level code splitting and mobile card layouts for high-density dashboard tables.

## Public business details

- Name: Sirari Fitness
- Address: Sirari Complex, Charubeta, Chanda Mod, Khatima
- Phone: 9012752982
- Hours: Monday–Saturday, 4:00 AM–11:00 PM; Sunday closed
- Instagram: `@lifebyvke`
- Planned opening: 2027

## Quality baseline

- 40 frontend unit/integration test files with 66 passing tests at the V1 closure checkpoint.
- 15 backend test files with 48 passing tests.
- Desktop and mobile Playwright smoke coverage for public, authentication, dashboard, lead, and responsive-table journeys.
- Frontend coverage floor enforced at 80% statements and lines; V1 closure baseline: 82.85%.
- Automated GitHub Actions checks for frontend tests, lint, production build, backend tests, and browser smoke tests.
- Verified responsive behavior from 320px phones through tablet and desktop layouts.

## Deployment

- Frontend: [sirari-fitness.vercel.app](https://sirari-fitness.vercel.app)
- Backend: [sirari-fitness-api.onrender.com](https://sirari-fitness-api.onrender.com)
- Health: [API health check](https://sirari-fitness-api.onrender.com/api/health)
- Database: MongoDB Atlas

The current free Render service may sleep after inactivity, so its first request can be slower while the backend wakes. V1 should remain on test data and Razorpay test mode until production hardening begins.

## Deferred to V2

- Automated WhatsApp/email communication and delivery logs.
- Razorpay webhooks, reconciliation, refunds, GST invoices, and production payment monitoring.
- QR, RFID, or compatible biometric attendance-device integration.
- Automated backups, error monitoring, uptime alerts, custom domain, and paid always-on hosting.
- Optional two-factor authentication, owner email recovery, trainer commissions, recurring/group sessions, and scheduled reports.

## Upgrade and rollback notes

- No manual database migration is required for this release.
- Keep all `.env` files and credentials outside Git.
- The destructive reset feature must remain disabled in production.
- The annotated Git tag `v1.0.0` is the permanent rollback point for this release.
