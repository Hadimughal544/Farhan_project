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
