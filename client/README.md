# Sirari Fitness

Sirari Fitness is a React + Vite public gym website with an admin dashboard for tracking members, renewals, payments, attendance notes, and daily gym operations.

## Current frontend status

- Sirari Fitness public gym website landing page
- Dashboard layout with gym metrics
- Sidebar and topbar navigation
- Member status board
- Add member note modal
- Move member notes across statuses
- Login and register pages
- Mock data foundation
- API and Socket.IO placeholders for a future backend
- Zustand store for board behavior

## Next roadmap

1. Connect public lead form to backend
2. Add drag/drop for the member board
3. Add auth state and protected routes
4. Add form validation
5. Create Node.js + Express backend
6. Add MongoDB models for members, plans, payments, attendance, and trainers
7. Add Socket.IO updates for live check-ins and payment notifications

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm

## Local development

Run the frontend from the `client` directory:

```bash
npm install
npm run dev
```

Vite prints the local URL when it starts (normally `http://localhost:5173`).

## Backend integration

This repository does not currently include a backend service. The frontend is ready to connect to a future API and Socket.IO server on port `5000` by default:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Add these values to `client/.env` only when the backend runs at different URLs. Until a backend is added, the dashboard uses its mock data and API-backed features are unavailable.

## Available scripts

```bash
# Start the development server
npm run dev

# Create a production build
npm run build

# Check the source with Oxlint
npm run lint

# Preview the production build locally
npm run preview
```

If dependencies are not installed yet, run:

```bash
npm install
```
