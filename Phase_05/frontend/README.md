# Osomba Support Forum — Frontend

React + TypeScript + Tailwind CSS frontend for the Osomba Customer Care Forum, FAQ system, and AI Help Board. Built as part of the Barrett Honors Thesis project.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Auth | AWS Amplify (Cognito) |
| Routing | react-router-dom |
| Charts | Recharts |
| i18n | Custom EN/FR translation system |

## Pages

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home — FAQ + forum posts, unified search bar | Login required |
| `/thread/:id` | Thread Detail — question, replies, official answer | Login required |
| `/faq/:id` | FAQ Detail — full answer, voting, related FAQs | Login required |
| `/ai-help` | AI Help Board — semantic search with confidence scores | Login required |
| `/post` | Post Question — create new forum thread | Login required |
| `/agent-dashboard` | Agent Dashboard — open/unanswered threads queue | Agent or Admin |
| `/analytics` | Analytics Dashboard — deflection rate, response time, charts | Admin only |
| `/admin/users` | User Management — search users, change roles | Admin only |
| `/admin/categories` | Category Management — create/edit support categories | Admin only |
| `/settings` | Account Settings — notification preferences | Login required |
| `/login` | Login Page | Public |
| `/register` | Register Page | Public |

## Features

### Customer Features
- Browse forum threads and FAQ articles on a unified home page
- Search across FAQs and forum posts with one search bar
- AI Help Board with semantic search, confidence stars (out of 5), and percentage match
- Post new questions with category selection and tips sidebar
- Vote on FAQ helpfulness (thumbs up/down)

### Agent Features
- Agent Dashboard with filtered view of unanswered threads
- Mark replies as official answers (triggers email notification via SES)
- Lock/unlock threads
- Language toggle — switch between English and French (on-demand translation via Nova Micro)

### Admin Features
- Analytics Dashboard with 6 metric cards (total posts, answered, FAQs, AI queries, deflection rate, avg response time)
- Charts showing posts over time and category distribution
- User Management — search by email, change roles (customer/agent/admin)
- Category Management — create, edit, archive support categories
- Convert to FAQ — turn official forum answers into FAQ articles with one click
- Undo FAQ — revert a converted FAQ back to a normal post

## Project Structure

```
src/
├── App.tsx                    # Router and layout
├── pages/
│   ├── HomePage.tsx           # Forum + FAQ list with search
│   ├── ThreadDetailPage.tsx   # Thread with replies and agent controls
│   ├── FAQPage.tsx            # FAQ detail with voting
│   ├── AIHelpPage.tsx         # AI semantic search
│   ├── PostQuestionPage.tsx   # New question form
│   ├── AgentDashboardPage.tsx # Agent queue
│   ├── AnalyticsDashboardPage.tsx # Admin KPIs and charts
│   ├── UserManagementPage.tsx # Role management
│   ├── CategoryManagementPage.tsx # Category CRUD
│   ├── SettingsPage.tsx       # User settings
│   ├── LoginPage.tsx          # Cognito login
│   └── RegisterPage.tsx       # Cognito registration
├── components/
│   ├── Header.tsx             # Nav bar with role-based menu items
│   ├── Sidebar.tsx            # Category filter sidebar
│   ├── QuestionCard.tsx       # Thread/FAQ card component
│   ├── CategoryBadge.tsx      # Category tag component
│   ├── StatusBadge.tsx        # Open/Answered/Locked badge
│   ├── ProtectedRoute.tsx     # Auth guard for routes
│   └── OrganicBackground.tsx  # Decorative background
├── lib/
│   ├── api.ts                 # Axios instance with auth interceptor
│   └── auth.ts                # Cognito auth helpers
├── context/
│   ├── AuthContext.tsx         # Auth state (user, role, token)
│   └── LanguageContext.tsx     # i18n state (EN/FR)
└── i18n/
    ├── en.json                # English translations
    └── fr.json                # French translations
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Backend running at `http://localhost:8000` (see `Phase_05/backend/README.md`)

### 1. Install dependencies

```bash
cd Phase_05/frontend
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=us-east-1
```

### 3. Start the dev server

```bash
npm run dev
```

Opens at `http://localhost:3000` (or the port shown in terminal).

### 4. Build for production

```bash
npm run build
```

Output goes to `build/`. This is a static bundle that can be deployed to S3 + CloudFront or Amplify Hosting.

## Demo Accounts

Log in at `http://localhost:3000/login`:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@osomba.com` | `OsombaDemo123!` |
| Agent | `agent@osomba.com` | `OsombaDemo123!` |
| Admin | `admin@osomba.com` | `OsombaDemo123!` |

## Bilingual Support

The app supports English and French. Users can toggle the language from the header. When switched to French:

- Home page titles are translated on demand
- Thread content is translated when opened
- All UI labels switch to French (`src/i18n/fr.json`)
- Translation is powered by Amazon Nova Micro via the backend
