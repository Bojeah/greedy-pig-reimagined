# Deployment

| Part | Where | Notes |
|---|---|---|
| Website | Vercel, Root Directory apps/web | Variable: VITE_API_URL = the server address |
| Server | Render free web service, Root Directory apps/server | Build: npm install && npx prisma migrate deploy. Start: npm start. Health check: /api/health |
| Database | Supabase PostgreSQL (session pooler string) | Two projects: dev and prod |

Server environment variables: DATABASE_URL, DIRECT_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV=production, NODE_VERSION=22. Values are never stored in this repository.

The free server sleeps after 15 minutes without traffic. Open /api/health a few minutes before a demo.