# 🚀 CloudExecX — Auto-Scaling Code Execution Platform

A secure, scalable platform where users write and execute code in isolated Docker environments with real-time output, featuring queue-based auto-scaling simulation.

**100% Free Tier** — No paid services required.

## Architecture

```
User → Next.js Frontend → Express API → BullMQ Queue → Worker → Docker Sandbox → MongoDB
```

| Component | Technology | Deployment |
|-----------|-----------|------------|
| Frontend | Next.js 14, Tailwind v4, ShadCN UI, Monaco Editor | Vercel |
| Backend | Express.js, TypeScript | Render |
| Worker | BullMQ, Dockerode | Render |
| Queue | Upstash Redis | Upstash |
| Database | MongoDB Atlas (512MB) | MongoDB Atlas |
| Auth | Clerk (Email + Google) | Clerk |

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Free accounts: [Clerk](https://clerk.com), [Upstash](https://upstash.com), [MongoDB Atlas](https://mongodb.com/atlas)

### 1. Clone & Install
```bash
git clone <repo-url> cloudexecx && cd cloudexecx
cp .env.example .env  # Fill in your credentials
```

### 2. Build Execution Images
```bash
docker-compose -f docker/docker-compose.yml build
```

### 3. Start Backend
```bash
cd backend && npm install && npm run dev
```

### 4. Start Worker
```bash
cd worker && npm install && npm run dev
```

### 5. Start Frontend
```bash
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cloudexecx/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express API server
├── worker/            # BullMQ job processor
├── docker/execution/  # Sandbox Dockerfiles
├── shared/            # Types, constants, utils
├── docker-compose.yml # Local dev orchestration
└── .env.example       # Environment template
```

## Security

Every code execution runs inside a Docker container with:
- 🔒 **Network disabled** — no internet access
- 🧠 **128MB memory limit** — prevents memory bombs
- ⚡ **50% CPU cap** — fair resource sharing
- ⏱️ **5-second timeout** — kills infinite loops
- 📁 **Read-only filesystem** — only `/tmp` writable
- 👤 **Non-root user** — runs as `nobody`
- 🛡️ **All capabilities dropped** — minimal permissions

## Supported Languages

| Language | Runtime | Version |
|----------|---------|---------|
| Python | CPython | 3.11 |
| JavaScript | Node.js | 20 |
| C++ | GCC | 13 (C++17) |

## Free Tier Limits

| Service | Limit | Mitigation |
|---------|-------|------------|
| Render | 15min sleep | Polling with retry |
| MongoDB Atlas | 512MB | Output truncation, TTL indexes |
| Upstash Redis | 10K cmds/day | Efficient queue ops |
| Vercel | 100GB bandwidth | Static optimization |
| Clerk | 10K MAU | Sufficient for demo |

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## License

MIT
