# Woolf CV Analysis Application

A full-stack application that analyzes CVs against job descriptions using AI, built with Node.js, tRPC, and React.

## 🚀 Features

- **PDF Upload**: Drag-and-drop interface for job descriptions and CVs
- **AI Analysis**: Powered by Gemini 1.5 Flash for intelligent CV evaluation
- **Real-time Results**: Instant feedback with visual alignment scores
- **Type-safe API**: Built with tRPC for end-to-end type safety
- **Modern UI**: Responsive design with Tailwind CSS
- **Comprehensive Error Handling**: Robust error handling throughout the application

## 🛠️ Tech Stack

### Backend
- **Node.js** with TypeScript
- **tRPC** for type-safe APIs
- **Express** web framework
- **Gemini 1.5 Flash** AI integration
- **PDF parsing** with pdf-parse
- **Zod** for validation

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Query v5** for state management
- **Lucide React** for icons

## 📁 Project Structure

```
woolf-cv/
├── apps/
│   ├── server/              # Node.js backend
│   │   ├── src/
│   │   │   ├── config/      # AI configuration
│   │   │   ├── services/    # AI and PDF services
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── router.ts    # tRPC routes
│   │   │   └── index.ts     # Server entry point
│   │   └── package.json
│   └── client/              # React frontend
│       ├── src/
│       │   ├── utils/       # tRPC client
│       │   ├── App.tsx      # Main component
│       │   └── main.tsx     # Entry point
│       └── package.json
├── packages/
│   └── shared/              # Shared types
└── package.json             # Root workspace config
```

## 🔧 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PDF files for testing

### Installation

```
git clone 
cd woolf-cv
npm install
```

### Environment Setup

Create `apps/server/.env`:
```
PORT=4000
NODE_ENV=development
GEMINI_ENDPOINT=https://intertest.woolf.engineering/invoke
AUTHORIZATION_TOKEN=your_authorization_token_here
CLIENT_URL=http://localhost:3000
```

### Start Development

```
npm run dev
```

This starts both:
- Backend server: http://localhost:4000
- Frontend app: http://localhost:3000

## 📖 Usage

### Web Interface
• Open http://localhost:3000
• Upload a job description PDF
• Upload a candidate CV PDF
• Click "Analyze CV"
• View detailed analysis results

### API Endpoints

#### Health Check
```
curl http://localhost:4000/health
```

#### AI Service Status
```
curl http://localhost:4000/trpc/checkAI
```

#### Text Analysis
```
curl -X POST http://localhost:4000/trpc/analyzeText \
  -H "Content-Type: application/json" \
  -d "{\"jobDescription\":\"Senior React Developer...\",\"cv\":\"Frontend developer...\"}"
```

## 🧪 Testing

### Automated Testing
```
./test-complete-app.sh
```

### Manual Testing
• Start both servers
• Upload test PDF files
• Verify analysis results
• Check error handling

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Production Build
```
npm run build
cd apps/server && npm run start
```

## 🔧 Development

### Available Scripts

```
npm run dev          # Start both server and client
npm run build        # Build all packages
npm run test         # Run automated tests
```

### Code Quality

- **TypeScript**: Strict type checking throughout
- **Error Handling**: Comprehensive error handling and validation
- **Environment Validation**: Startup checks for required configuration
- **Graceful Shutdown**: Proper cleanup on server termination

## 🆘 Troubleshooting

### Common Issues

**401 Authentication Error**
- Check your AUTHORIZATION_TOKEN in `.env`
- Verify endpoint URL is correct

**PDF Processing Fails**
- Ensure PDFs contain extractable text
- Check file size (max 10MB)

**Frontend Not Loading**
- Verify both servers are running
- Check proxy configuration in `vite.config.ts`

### Getting Help

• Check the logs in terminal
• Verify environment variables
• Test API endpoints individually
• Review network requests in browser DevTools

## 📝 License

This project is part of the Woolf Engineering Assessment.

---

Built with ❤️ for Woolf Engineering Assessment
