# Backend - Smart AI-Based Admission Advisor

Production-ready FastAPI backend with Neon PostgreSQL, SQLAlchemy, JWT authentication, and modular clean architecture.

## Run Locally

1. Create virtual environment
2. Install dependencies
3. Configure `.env`
4. Start API server

### Commands (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Base URL

- `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Auth Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me` (Bearer token required)

## Neon Setup

Paste Neon connection URL into `DATABASE_URL` inside `.env` and make sure `sslmode=require` is present.

## Optional AI Environment Variables

Add these to `backend/.env` for advanced advisor features:

- `AI_PROVIDER=local` (or `openai`, `gemini`)
- `ENABLE_EXTERNAL_AI=false`
- `OPENAI_API_KEY=`
- `GEMINI_API_KEY=`

When `ENABLE_EXTERNAL_AI=false`, the platform uses local deterministic recommendations.

## New Advanced API Endpoints

- `POST /api/v1/advanced/scholarships/recommendations`
- `POST /api/v1/advanced/career/recommend`
- `POST /api/v1/advanced/roadmap/generate`
- `POST /api/v1/advanced/universities/compare`
- `GET /api/v1/advanced/merit-trends`
- `POST /api/v1/advanced/admin/merit-trends` (admin)
- `GET /api/v1/advanced/student-dashboard`
- `GET /api/v1/advanced/prediction-history`
- `GET /api/v1/advanced/saved-universities`
