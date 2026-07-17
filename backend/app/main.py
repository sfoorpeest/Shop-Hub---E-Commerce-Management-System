import time
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logger import setup_logging
from app.db.session import (
    get_database_status,
    ensure_order_columns,
)

from app.api.v1 import (
    auth,
    products,
    categories,
    cart,
    orders,
    admin,
    shipper,
    ai,
    payment,
)

# --------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------

logger = setup_logging()

# --------------------------------------------------------------------
# FastAPI App
# --------------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Shop Hub - E-Commerce Management System API",
    version="1.0.0",
    redirect_slashes=False,
)

# --------------------------------------------------------------------
# Middleware
# --------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    """
    Log every HTTP request.
    """

    start = time.perf_counter()

    response = await call_next(request)

    elapsed = (time.perf_counter() - start) * 1000

    logger.info(
        "[%s] %s -> %s (%.2f ms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed,
    )

    return response


# --------------------------------------------------------------------
# Startup / Shutdown
# --------------------------------------------------------------------

@app.on_event("startup")
async def startup():

    logger.info("=" * 60)
    logger.info("Starting ShopHub Backend")

    ensure_order_columns()

    db = get_database_status()

    if db["connected"]:
        logger.info("Database connected (%s)", db["backend"])
    else:
        logger.error("Database unavailable")

    logger.info("Application startup complete")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown():

    logger.info("Application shutdown")


# --------------------------------------------------------------------
# Routers
# --------------------------------------------------------------------

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(cart.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(shipper.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(payment.router, prefix=settings.API_V1_STR)

# --------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------


@app.get("/")
async def root():

    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health")
async def health():

    return {
        "status": "ok",
        "database": get_database_status(),
    }


@app.get(f"{settings.API_V1_STR}/info")
async def api_info():

    return {
        "api_version": "v1",
        "endpoints": {
            "auth": "/auth",
            "products": "/products",
            "categories": "/categories",
            "cart": "/cart",
            "orders": "/orders",
            "admin": "/admin",
            "shipper": "/shipper",
            "ai": "/ai",
        },
    }


# --------------------------------------------------------------------
# Exception Handler
# --------------------------------------------------------------------


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):

    logger.warning(
        "ValueError at %s : %s",
        request.url.path,
        str(exc),
    )

    return JSONResponse(
        status_code=400,
        content={
            "detail": str(exc),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    logger.exception(
        "Unhandled exception at %s",
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
        },
    )


# --------------------------------------------------------------------
# Local Run
# --------------------------------------------------------------------

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_NAME,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
    )