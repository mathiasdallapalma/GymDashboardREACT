from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
#from app.api.auth.login.router import router as login_router
from app.api.items.item import router as items_router
from app.api.auth.login import router as login_router

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
    app.include_router(login_router, prefix=f"{settings.API_V1_STR}/login", tags=["login"])
    app.include_router(items_router, prefix=f"{settings.API_V1_STR}/items", tags=["items"])

    # Exception handlers
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return app


app = create_app()
