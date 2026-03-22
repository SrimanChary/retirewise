# RetireWise 🏦

A full-stack retirement portfolio management platform built from my experience working on financial systems at PayPal.

## CI/CD Pipeline
![CI](https://github.com/SrimanChary/retirewise/actions/workflows/ci.yml/badge.svg)

## Live Demo
**Login:** demo@retirewise.com / password123

## Features

- **Double-entry ledger** — every transaction creates immutable DEBIT/CREDIT pairs with balance reconciliation
- **Idempotency keys** — retry-safe transactions, no double-processing on network failures
- **JWT auth with refresh token rotation** — short-lived access tokens, secure refresh cycle
- **Retirement projection simulator** — compound interest engine with inflation adjustment and 4% withdrawal rule
- **AI retirement advisor** — GPT-4o-mini powered personalized advice based on your profile
- **Role-based access control** — USER / ADVISOR / ADMIN roles
- **Full audit trail** — every action logged with timestamp, IP, and metadata
- **CI/CD pipeline** — GitHub Actions on every push, Docker ready

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Recharts, React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + Refresh Token Rotation |
| AI | OpenAI GPT-4o-mini |
| DevOps | Docker, GitHub Actions |

## Architecture
```
┌─────────────────────────────────────────────────────────┐
│  React Frontend (port 3000)                             │
│  Dashboard · Accounts · Simulator · AI Advisor         │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────┐
│  Express API (port 4000)                                │
│  Auth · Accounts · Transactions · Portfolio · Advisor  │
│  Rate limiting · JWT middleware · Audit logging        │
└──────────────┬──────────────────────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────────────────────┐
│  PostgreSQL                                             │
│  Users · Accounts · Transactions · LedgerEntries       │
│  Allocations · AuditLogs · RefreshTokens               │
└─────────────────────────────────────────────────────────┘
```

## Architecture Decisions

**Why double-entry ledger?**
Every financial balance change needs an immutable record. Double-entry ensures that every CREDIT has a matching transaction and balance integrity can be verified at any time via the `/reconcile` endpoint. This is the pattern used in production payment systems — I implemented a version of this at PayPal.

**Why idempotency keys?**
Network retries in financial systems can cause duplicate transactions. Idempotency keys ensure a request is only processed once — a fundamental requirement in any payment or contribution system.

**Why JWT + refresh token rotation?**
Short-lived access tokens (15 min) limit the blast radius of token theft. Refresh token rotation means each refresh issues a brand new token and invalidates the old one, making token reuse attacks detectable immediately.

**Why PostgreSQL over MongoDB?**
Financial data has strong relational structure — accounts own transactions, transactions own ledger entries. ACID guarantees and foreign key constraints are essential for correctness when real money is involved.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (or free cloud DB from neon.tech)

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
# Add your DATABASE_URL from neon.tech and JWT_SECRET
```

### 3. Set up database
```bash
cd backend
npx prisma db push
npx prisma generate
npx ts-node prisma/seed.ts
```

### 4. Run
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

Open http://localhost:3000 — login with demo@retirewise.com / password123

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
│       ├── services/
│       ├── middleware/
│       ├── routes/
│       └── utils/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── types/
│       └── utils/
├── .github/workflows/ci.yml
└── docker-compose.yml
```

---# retirewise
