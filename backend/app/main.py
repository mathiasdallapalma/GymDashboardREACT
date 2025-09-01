from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import settings
#from app.api.auth.login.router import router as login_router
from app.api.items.item import router as items_router
from app.api.auth.login import router as login_router
from app.api.auth.admin import router as admin_router
from app.api.users.users import router as users_router
from app.api.exercies.exercise import router as exercises_router
from app.api.activities.activity import router as activities_router

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
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],  # This allows ALL methods including OPTIONS
        allow_headers=["*"],
    )    # Routers
    app.include_router(login_router, prefix=f"{settings.API_V1_STR}", tags=["auth"])
    app.include_router(admin_router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
    app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
    
    app.include_router(items_router, prefix=f"{settings.API_V1_STR}/items", tags=["items"])
    app.include_router(exercises_router, prefix=f"{settings.API_V1_STR}/exercises", tags=["exercises"])
    app.include_router(activities_router, prefix=f"{settings.API_V1_STR}/activities", tags=["activities"])
    
    

    # Exception handlers
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    # Add 422 validation error handler for debugging
    from fastapi.exceptions import RequestValidationError
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        print(f"=== VALIDATION ERROR DEBUG ===")
        print(f"URL: {request.url}")
        print(f"Method: {request.method}")
        print(f"Headers: {dict(request.headers)}")
        
        # Try to get the request body
        try:
            body = await request.body()
            print(f"Request body: {body}")
        except Exception as e:
            print(f"Could not read body: {e}")
            
        print(f"Validation errors: {exc.errors()}")
        print(f"Raw errors: {exc}")
        print("=== END VALIDATION ERROR ===")
        
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors(), "body": "Validation error"}
        )

    return app


app = create_app()
