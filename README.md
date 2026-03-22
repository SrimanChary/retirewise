# RetireWise 🏦

A full-stack retirement portfolio management platform.

## Live Demo
👉 **[https://retirewise-frontend.onrender.com](https://retirewise-frontend.onrender.com)**

**Demo login:** demo@retirewise.com / password123

## Features

- **Double-entry ledger** — every transaction creates immutable DEBIT/CREDIT pairs, reconciliation endpoint included
- **Idempotency keys** — retry-safe transactions, no double-processing on network failures
- **JWT auth with refresh token rotation** — 15-minute access tokens, secure refresh cycle
- **Retirement projection simulator** — compound interest engine with inflation adjustment and 4% withdrawal rule
- **AI retirement advisor** — personalized advice based on your age, salary, and contribution rate
- **Role-based access control** — USER / ADVISOR / ADMIN roles
- **Full audit trail** — every action logged with timestamp, IP address, and metadata
- **Rate limiting** — per-user request limits to prevent abuse
- **Docker ready** — runs locally with a single `docker-compose up`

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Recharts, React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Refresh Token Rotation |
| AI | OpenAI GPT-4o-mini |
| Hosting | Render (backend + frontend), Neon (PostgreSQL) |
| DevOps | Docker, GitHub Actions |

## Architecture
```
┌─────────────────────────────────────────────────────────┐
│  React Frontend                                         │
│  Dashboard · Accounts · Simulator · AI Advisor         │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API + JWT Auth
┌─────────────────────▼───────────────────────────────────┐
│  Express API                                            │
│  Auth · Accounts · Transactions · Portfolio · Advisor  │
│  Rate limiting · Audit logging · Role-based access     │
└──────────────┬──────────────────────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────────────────────┐
│  PostgreSQL (Neon)                                      │
│  Users · Accounts · Transactions · LedgerEntries       │
│  Allocations · AuditLogs · RefreshTokens               │
└─────────────────────────────────────────────────────────┘
```

## Architecture Decisions

**Why idempotency keys?**
Network retries in financial systems can cause duplicate transactions. Idempotency keys ensure a request is processed only once, no matter how many times it is sent. This is a fundamental requirement in any payment or contribution system.

**Why JWT + refresh token rotation?**
Short-lived access tokens (15 min) limit the blast radius of token theft. Refresh token rotation means each refresh issues a brand new token and invalidates the old one, making stolen token reuse detectable immediately.

**Why PostgreSQL over MongoDB?**
Financial data has strong relational structure — accounts own transactions, transactions own ledger entries. ACID guarantees and foreign key constraints are essential for correctness when real money is involved.

## Quick Start

### 1. Clone and install
```bash
git clone https://github.com/SrimanChary/retirewise.git
cd retirewise

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment
```bash
cd backend
cp .env.example .env
# Set DATABASE_URL from neon.tech and JWT_SECRET
```

### 3. Set up database
```bash
npx prisma db push
npx prisma generate
npx ts-node prisma/seed.ts
```

### 4. Run
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000) and login with demo@retirewise.com / password123

### Or with Docker
```bash
docker-compose up
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Rotate refresh token |
| GET | /api/v1/accounts | List all accounts |
| POST | /api/v1/accounts | Create account |
| POST | /api/v1/accounts/:id/transactions | Submit transaction (idempotent) |
| GET | /api/v1/accounts/:id/reconcile | Verify ledger balance integrity |
| GET | /api/v1/portfolio/summary | Portfolio allocation summary |
| POST | /api/v1/portfolio/projection | Compound interest projection |
| POST | /api/v1/advisor/advice | AI-powered retirement advice |

## Project Structure
```
retirewise/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── services/      ← ledger, projection, AI logic
│       ├── middleware/    ← auth, rate limiting
│       ├── routes/
│       └── utils/
├── frontend/
│   └── src/
│       ├── api/           ← axios client + interceptors
│       ├── components/    ← charts, layout, UI
│       ├── hooks/         ← useAuth
│       ├── pages/         ← Dashboard, Accounts, Simulator, Advisor
│       ├── types/
│       └── utils/
├── docker-compose.yml
└── README.md
```

---
*[github.com/SrimanChary](https://github.com/SrimanChary)*
