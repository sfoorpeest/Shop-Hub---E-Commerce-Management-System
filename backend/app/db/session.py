from typing import Generator

import logging
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

logger = logging.getLogger("ShopHub.Database")

database_backend = "unknown"


def _build_engine() -> Engine:
    global database_backend

    db_url = settings.normalized_database_url

    if db_url and not db_url.startswith("sqlite"):

        try:

            engine = create_engine(
                db_url,
                echo=False,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_size=5,
                max_overflow=10,
                future=True,
            )

            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            database_backend = "postgresql"

            logger.info("Connected to PostgreSQL (Supabase)")

            return engine

        except Exception as e:

            logger.exception("Cannot connect PostgreSQL")

            if not settings.USE_SQLITE_FALLBACK:
                raise SystemExit(1)

            logger.warning("Fallback to SQLite")

    database_backend = "sqlite"

    engine = create_engine(
        "sqlite:///./shophub.db",
        connect_args={"check_same_thread": False},
        echo=False,
        future=True,
    )

    logger.info("Using SQLite")

    return engine


engine: Engine = _build_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db() -> Generator[Session, None, None]:

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


def get_database_status() -> dict:

    try:

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "backend": database_backend,
            "connected": True,
            "url_configured": bool(settings.DATABASE_URL),
        }

    except Exception as e:

        logger.exception(e)

        return {
            "backend": database_backend,
            "connected": False,
            "error": str(e),
        }


def ensure_order_columns() -> None:

    from sqlalchemy import inspect

    inspector = inspect(engine)

    if "orders" not in inspector.get_table_names():
        return

    existing = {
        c["name"]
        for c in inspector.get_columns("orders")
    }

    required = {
        "payment_method": "VARCHAR(20) DEFAULT 'COD'",
        "payment_status": "VARCHAR(20) DEFAULT 'unpaid'",
        "payment_id": "VARCHAR(100)",
    }

    missing = [
        (k, v)
        for k, v in required.items()
        if k not in existing
    ]

    if not missing:
        return

    with engine.begin() as conn:

        for name, sql in missing:

            conn.execute(
                text(
                    f"ALTER TABLE orders "
                    f"ADD COLUMN {name} {sql}"
                )
            )

            logger.info(f"Migration: added {name}")