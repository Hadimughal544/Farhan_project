from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.middleware.error_handler import register_exception_handlers
from app.routes import auth_routes, user_routes


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_routes.router, prefix=settings.api_v1_prefix)
app.include_router(user_routes.router, prefix=settings.api_v1_prefix)


@app.get("/")
async def health_check():
    return {"status": "ok", "service": settings.app_name}
