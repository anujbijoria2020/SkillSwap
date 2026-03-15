# SkillSwapNetwork

A platform where people exchange skills — teach what you know, learn what you don't.

## What it does

SkillSwapNetwork connects people who want to trade skills directly. If you know
graphic design and want to learn guitar, you can find someone who teaches guitar
and wants to learn design. No money changes hands — just skills.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma 7
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Realtime**: Socket.io

## Modules

- **Auth** — register, login with JWT
- **Users** — profiles, skills offered and wanted
- **Match** — find users whose skills align with yours
- **Swaps** — propose and manage skill exchange agreements
- **Sessions** — schedule and track learning sessions
- **Messages** — chat within a swap
- **Reviews** — rate and review after a completed swap

## Getting Started

### Prerequisites
- Node.js 18+
- Docker

### Setup

1. Clone the repo
   git clone https://github.com/your-username/SkillSwapNetwork.git
   cd SkillSwapNetwork

2. Start the database
   docker compose up -d

3. Install dependencies
   cd Backend
   npm install

4. Set up environment variables
   cp .env.example .env
   # fill in your values

5. Run migrations
   npm run prisma:migrate -- --name init

6. Start the server
   npm run dev

Server runs at http://localhost:5000

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Users
- GET  /api/users/me
- PUT  /api/users/me

### Swaps
- POST /api/swaps
- GET  /api/swaps
- PUT  /api/swaps/:id

### Sessions
- POST /api/sessions
- GET  /api/sessions

### Reviews
- POST /api/reviews

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key for signing JWTs |
| JWT_EXPIRES_IN | Token expiry e.g. 7d |
| PORT | Server port |
| NODE_ENV | development or production |
