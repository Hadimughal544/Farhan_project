from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import time

from app.config import settings
from app.database import Base, engine
from app.middleware.error_handler import register_exception_handlers
from app.routes import auth_routes, user_routes, prediction_routes, admin_routes, chatbot_routes
from app.models.university import University  # Import to register model with Base
from app.models.chatbot_kb_entry import ChatbotKnowledgeEntry  # Import to register model with Base

# Setup basic logging (console only)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    
    # Log request details
    logger.info(f"\n{'='*70}")
    logger.info(f"📨 INCOMING REQUEST: {request.method} {request.url.path}")
    logger.info(f"   Query: {request.url.query if request.url.query else 'None'}")
    
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"✓ Response Status: {response.status_code} | Time: {process_time:.3f}s")
    logger.info(f"{'='*70}\n")
    return response

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
app.include_router(prediction_routes.router, prefix=settings.api_v1_prefix)
app.include_router(admin_routes.router, prefix=settings.api_v1_prefix)
app.include_router(chatbot_routes.router, prefix=settings.api_v1_prefix)


@app.get("/")
async def health_check():
    return {"status": "ok", "service": settings.app_name}
