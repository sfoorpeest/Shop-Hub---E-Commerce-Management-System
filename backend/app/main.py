from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1 import auth, products, orders, admin, shipper

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Shop Hub - E-Commerce Management System API",
    version="1.0.0",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers from API v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(shipper.router, prefix=settings.API_V1_STR)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Server is running"}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }


# Include routers from API v1
@app.get(f"{settings.API_V1_STR}/info")
async def api_info():
    """API v1 information"""
    return {
        "api_version": "v1",
        "endpoints": {
            "auth": f"{settings.API_V1_STR}/auth",
            "products": f"{settings.API_V1_STR}/products",
            "orders": f"{settings.API_V1_STR}/orders",
            "admin": f"{settings.API_V1_STR}/admin",
            "shipper": f"{settings.API_V1_STR}/shipper",
        }
    }


# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_NAME,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )
