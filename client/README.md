# Sirari Fitness frontend

React and Vite frontend for the Sirari Fitness public website and administration dashboard.

See the repository-level [`README.md`](../README.md) for architecture, completed product flows, API routes, MongoDB and Render configuration, and the complete setup guide.

## Start locally

```bash
npm install
cp .env.example .env
npm run dev
```

Configure the deployed backend in `.env`:

```env
VITE_API_URL=https://sirari-fitness-api.onrender.com/api
VITE_SOCKET_URL=https://sirari-fitness-api.onrender.com
```

## Checks

```bash
npm run lint
npm run build
```
