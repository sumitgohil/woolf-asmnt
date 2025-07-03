# Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Environment variables configured

## Environment Variables

### Required

```
AUTHORIZATION_TOKEN=your_woolf_token_here
GEMINI_ENDPOINT=https://intertest.woolf.engineering/invoke
```

### Optional

```
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

## Production Deployment

### Build Applications

```
npm run build
```

### Start Production Server

```
cd apps/server
npm run start
```

### Serve Frontend

```
cd apps/client
npm run preview
```

## Health Checks

- Server: `GET /health`
- AI Service: `GET /trpc/checkAI`

## Troubleshooting

### Common Issues

**401 Authentication Error**

- Check AUTHORIZATION_TOKEN is set correctly
- Verify token is valid and not expired

**PDF Processing Fails**

- Ensure PDFs contain extractable text
- Check file size (max 10MB)

**Frontend Not Loading**

- Verify both servers are running
- Check CORS configuration
