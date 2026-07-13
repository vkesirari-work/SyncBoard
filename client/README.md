# GymDesk

GymDesk is a React + Vite gym management dashboard for tracking members, renewals, payments, attendance notes, and daily gym operations.

## Current frontend status

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

1. Add drag/drop for the member board
2. Add auth state and protected routes
3. Add form validation
4. Create Node.js + Express backend
5. Add MongoDB models for members, plans, payments, attendance, and trainers
6. Add Socket.IO updates for live check-ins and payment notifications

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
