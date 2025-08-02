from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.config import settings
from api.auth.router import router as auth_router
from src.posts.router import router as posts_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="My Cool API",
        version=settings.APP_VERSION,
        openapi_url="/openapi.json" if settings.ENVIRONMENT in {"local", "staging"} else None,
        docs_url="/docs" if settings.ENVIRONMENT in {"local", "staging"} else None,
        redoc_url=None,
    )

    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_origin_regex=settings.CORS_ORIGINS_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=settings.CORS_HEADERS,
    )

    # Routers
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(posts_router, prefix="/posts", tags=["posts"])

    # Exception handlers
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
