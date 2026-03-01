# Osomba Support Forum — Frontend

React + Vite + TypeScript + Tailwind frontend for the Osomba Customer Care Forum & AI Help Board.

## Prerequisites

- Node.js 18+
- npm 9+
- Backend running at `http://localhost:8000` (see `Phase_05/backend/README.md`)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env .env.local
```

Edit `.env.local` with your values:
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=us-east-1
```

## Run

```bash
npm run dev
```

Opens at **http://localhost:3000**

## Build for Production

```bash
npm run build
```

Output goes to `build/`.

## Pages

| Route | Page | Access |
|---|---|---|
| `/` | Home — search + recent posts | Public |
| `/faq` | FAQ list with voting | Public |
| `/thread/:id` | Thread detail + replies | Public |
| `/ai-help` | AI Help Board | Public |
| `/post-question` | Post a new question | Login required |
| `/agent-dashboard` | Agent queue + answer threads | Agent / Admin only |
| `/analytics` | KPI dashboard + category management | Admin only |

## Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| HTTP | axios |
| Auth | AWS Amplify (Cognito) |
| Routing | react-router-dom |
| Charts | recharts |
