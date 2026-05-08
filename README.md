# Smart AI-Based Admission Advisor

Full-stack project scaffold for Phase 1.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Axios + React Router
- Backend: FastAPI + SQLAlchemy + JWT + Passlib/bcrypt
- Database: Neon PostgreSQL

## Project Structure

```text
backend/
frontend/
```

## Backend Quick Start

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend Quick Start

```powershell
cd frontend
npm install
npm run dev
```

## API Endpoints (Phase 1)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me` (protected)

## API Testing

Use Swagger UI at:

- `http://127.0.0.1:8000/docs`

Or test via cURL:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Farhan Ali","email":"farhan@example.com","password":"StrongPass123"}'

curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farhan@example.com","password":"StrongPass123"}'

curl http://127.0.0.1:8000/api/v1/users/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
