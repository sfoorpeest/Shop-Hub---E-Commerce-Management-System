from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
import sys

# Try connecting to PostgreSQL first. If it fails, fall back to SQLite.
engine = None
fallback_to_sqlite = False

try:
    # Check if DATABASE_URL is set and not empty
    if settings.DATABASE_URL and not settings.DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,  # Log SQL queries in debug mode
            pool_pre_ping=True,   # Test connections before using them
            pool_recycle=3600,    # Recycle connections after 1 hour
        )
        # Force a quick connection test to check if database is online
        with engine.connect() as conn:
            print("✓ Successfully connected to PostgreSQL cloud database!")
    else:
        fallback_to_sqlite = True
except Exception as e:
    print(f"\n[DATABASE WARNING] Failed to connect to PostgreSQL cloud database: {e}", file=sys.stderr)
    print("[DATABASE WARNING] Falling back to local SQLite database (shophub.db) for local development.\n", file=sys.stderr)
    fallback_to_sqlite = True

if fallback_to_sqlite:
    # Use SQLite for local development fallback
    sqlite_url = "sqlite:///./shophub.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False},  # Required for SQLite in FastAPI
        echo=settings.DEBUG,
    )

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Session:
    """Get database session for dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
