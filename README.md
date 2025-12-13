# POS App

A point-of-sale platform for a hardware store featuring dashboards, product management, sales tracking, inventory, cashier tools, reporting, and transaction history.

## Structure

- `frontend` – React + Vite SPA with Tailwind CSS, Axios, and Zustand.
- `backend` – Express API powered by Prisma, PostgreSQL, and JWT auth utilities.

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Create a `.env` in `backend` based on `.env.example` and provide a valid `DATABASE_URL`.


