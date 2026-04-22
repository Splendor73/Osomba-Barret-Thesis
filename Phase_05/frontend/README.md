# Osomba Support Frontend

Separate React frontend for the Osomba Support forum, FAQ, AI help, and moderation dashboard.

## Production role

This frontend deploys separately from the marketplace frontend, but it uses the same Osomba Cognito user pool and points to the separate support backend.

Production frontend:

- `https://support.osomba.com`

Production API target:

- `https://api.osomba.com/support-api/api/v1`

## Current product behavior

- guest users can browse FAQ, forum threads, search, filters, and thread detail without login
- posting, replying, and reporting require login
- support moderation is available to agents and admins
- `Reported Content` and `User Review` are available from the support admin sidebar
- blocked users are visible in `User Review`
- French and English are supported
- Contact Us uses placeholder support details:
  - `support@osomba.com`
  - `+1 800 500 0011`

## Key routes

- `/` — public support home
- `/thread/:id` — public thread detail
- `/faq/:id` — public FAQ detail
- `/ai-help` — public AI/search support surface
- `/post` — authenticated create-question flow
- `/contact-us` — placeholder support contact info
- `/agent-dashboard` — agent/admin moderation and review

## Shared auth

Production Cognito values:

- `VITE_COGNITO_USER_POOL_ID=us-east-1_vf5HVszbN`
- `VITE_COGNITO_CLIENT_ID=513m3vscibhska2jie3ganrcn9`
- `VITE_COGNITO_REGION=us-east-1`

## Local development

```bash
cd Phase_05/frontend
npm install
npm run dev
```

Local `.env` should point at the support backend, not the marketplace backend:

```env
VITE_API_URL=http://localhost:8000/support-api/api/v1
VITE_COGNITO_USER_POOL_ID=us-east-1_vf5HVszbN
VITE_COGNITO_CLIENT_ID=513m3vscibhska2jie3ganrcn9
VITE_COGNITO_REGION=us-east-1
```

## Production build and deploy

Build:

```bash
cd Phase_05/frontend
npm install
npm run build
```

Production env file:

- `.env.production`

Static hosting target:

- S3 bucket: `osomba-support-frontend-prod-281505305629`
- CloudFront distribution: `E1K1SA4V13MTNM`

Deploy flow:

1. build the Vite bundle
2. sync `build/` to the S3 bucket
3. invalidate CloudFront
4. verify `https://support.osomba.com`

## Verification checklist

After deploy, verify:

- home page loads for guests
- forum and FAQ pages are readable without login
- post/reply/report are blocked for guests
- authenticated users can post and reply
- `Reported Content` and `User Review` render correctly for agent/admin
- blocked users appear in `User Review`
- mobile navbar still works
- support API base URL is `/support-api/api/v1`
