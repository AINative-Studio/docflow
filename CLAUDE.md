# DocFlow HR

**Tech Stack**: Next.js 13.5 (App Router) + FastAPI + Supabase
**Repository**: https://github.com/AINative-Studio/docflow
**Last Updated**: 2025-01-03

## Project Overview

DocFlow HR is a **secure, multi-channel employee document intake and compliance platform** that allows employees to submit employment-related documents via upload, email, SMS, or cloud storage. Documents are automatically classified, validated, retained by **state-specific rules**, and **bi-directionally synced** with leading HRIS platforms (ADP, Gusto, Workday).

## Architecture

### Frontend (`/frontend`)
- **Framework**: Next.js 13.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Supabase Auth
- **State**: React hooks + Supabase real-time

### Backend (`/backend`)
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Validation**: Pydantic v2
- **Auth**: JWT (python-jose)
- **Database**: ZeroDB (via API)

## Directory Structure

```
docflow/
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Authentication routes
│   │   ├── (employee)/      # Employee portal
│   │   ├── (hr)/            # HR admin dashboard
│   │   ├── (marketing)/     # Public marketing pages
│   │   └── (settings)/      # Settings pages
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities (cn, etc.)
├── backend/
│   └── app/
│       ├── api/             # API route handlers
│       ├── core/            # Core utilities (auth, security)
│       ├── db/              # Database connections
│       ├── middleware/      # Request middleware
│       ├── models/          # Data models
│       ├── schemas/         # Pydantic schemas
│       └── services/        # Business logic
└── docs/                    # Documentation files
```

## Coding Conventions

### Frontend (TypeScript/React)
- **Files**: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase` function components with explicit return types
- **Hooks**: `useCamelCase` prefix
- **Constants**: `UPPER_SNAKE_CASE`
- Use shadcn/ui components from `@/components/ui`
- Import utilities from `@/lib/utils`

### Backend (Python)
- **Files**: `snake_case.py`
- **Functions**: `snake_case`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- Use Pydantic models for all request/response schemas
- Type hints required for all function signatures

## Critical Files

| File | Purpose |
|------|---------|
| `frontend/app/layout.tsx` | Root layout with providers |
| `frontend/lib/utils.ts` | Utility functions (cn helper) |
| `backend/app/main.py` | FastAPI app entry point |
| `backend/app/config.py` | Environment configuration |
| `backend/app/core/auth.py` | JWT authentication logic |

## Development Workflow

### Setup
```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Running Locally
```bash
# Frontend (port 3000)
cd frontend && npm run dev

# Backend (port 8000)
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Testing
```bash
# Frontend
cd frontend && npm run typecheck && npm run lint

# Backend
cd backend && pytest
```

## Environment Variables

### Frontend
Required in `frontend/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

### Backend
Required in `backend/.env`:
- `ZERODB_API_KEY` - ZeroDB API key
- `ZERODB_PROJECT_ID` - ZeroDB project ID
- `JWT_SECRET_KEY` - Secret for JWT signing
- `CORS_ORIGINS` - Allowed CORS origins

## Branch Naming

- `feature/{issue-number}-{short-description}` - New features
- `bugfix/{issue-number}-{short-description}` - Bug fixes
- `chore/{issue-number}-{short-description}` - Maintenance tasks

## Commit Convention

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance

## Security Guidelines

- Never commit `.env` files or API keys
- Validate all user inputs (frontend and backend)
- Use parameterized queries for database operations
- Sanitize file uploads and check MIME types
- Apply RBAC for all protected routes

## Notes for Claude

- This is an HR compliance platform - security and audit trails are critical
- Always validate Pydantic schemas match API contracts
- Use shadcn/ui components consistently; check `/components/ui` before creating new ones
- Backend uses ZeroDB via HTTP API, not direct database connections
- State-based retention rules are enforced automatically - be careful with deletion logic
- Legal hold features must maintain immutable audit trails
