
# Admin Frontend (Vite + React + TS)

Elegant, responsive admin panel with dark mode, charts, and CRUD screens.
Designed to match a typical Spring Boot REST API. Wire it to your backend in minutes.

## Quick Start

```bash
pnpm i # or npm i / yarn
cp .env.example .env
# edit .env to point at your backend:
# VITE_API_BASE_URL=http://localhost:8081
# VITE_API_PREFIX=/api
pnpm dev
```

## Map to your Backend

Edit `src/config/entities.ts`:
- `name`: unique key (also the route under `/entities/:name`)
- `path`: REST collection path (e.g. `/products`)
- `id`: primary key field name (e.g. `id` or `uuid`)
- `fields`: the columns/inputs to render

The UI assumes conventional CRUD endpoints:
- `GET    {prefix}{path}` -> list (array) or object with `items`/`content`
- `GET    {prefix}{path}/{id}` -> detail
- `POST   {prefix}{path}` -> create
- `PUT    {prefix}{path}/{id}` -> update
- `DELETE {prefix}{path}/{id}` -> delete

### Dashboard Charts
The Dashboard calls `GET {prefix}/stats`. If your backend doesn't have it yet,
the UI falls back to sample data. You can point it to any endpoint by editing `src/pages/Dashboard.tsx`.

### Auth (optional)
If your backend uses JWT, call `setAuthToken(token)` from `src/lib/api.ts` after login.

## Tech
- React 18 + Vite + TypeScript
- TailwindCSS (dark mode by class)
- Recharts for visualizations
- axios for HTTP
- React Router v6

## Customize
- Add entities, adjust fields, change the sidebar and branding in `src/ui/AppLayout.tsx`.
- Create more dashboards/reports under `src/pages`.
