from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine
from app.core.config import settings
import sys

engine: Engine | None = None
database_backend: str = "unknown"


def _build_engine() -> Engine:
    global database_backend

    db_url = settings.normalized_database_url

    if db_url and not db_url.startswith("sqlite"):
        try:
            pg_engine = create_engine(
                db_url,
                echo=settings.DEBUG,
                pool_pre_ping=True,
                pool_recycle=3600,
                pool_size=5,
                max_overflow=10,
            )
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            database_backend = "postgresql"
            print("[DATABASE] Connected to PostgreSQL (Supabase)")
            return pg_engine
        except Exception as e:
            if not settings.USE_SQLITE_FALLBACK:
                print(
                    f"\n[DATABASE ERROR] Cannot connect to PostgreSQL: {e}",
                    file=sys.stderr,
                )
                print(
                    "[DATABASE ERROR] Set USE_SQLITE_FALLBACK=true in .env for local SQLite dev,\n"
                    "                 or fix DATABASE_URL in .env (Supabase → Settings → Database).\n",
                    file=sys.stderr,
                )
                raise SystemExit(1) from e
            print(
                f"\n[DATABASE WARNING] PostgreSQL unavailable: {e}",
                file=sys.stderr,
            )
            print("[DATABASE WARNING] Falling back to SQLite (shophub.db)\n", file=sys.stderr)

    if settings.USE_SQLITE_FALLBACK or not db_url:
        if not db_url:
            print(
                "[DATABASE WARNING] DATABASE_URL not set — using SQLite (shophub.db).\n"
                "                   Copy .env.example → .env and add your Supabase connection string.\n",
                file=sys.stderr,
            )
        database_backend = "sqlite"
        return create_engine(
            "sqlite:///./shophub.db",
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )

    raise RuntimeError("No database configuration available")


engine = _build_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_database_status() -> dict:
    """Return current database connection info for health checks."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        connected = True
    except Exception as exc:
        connected = False
        return {
            "backend": database_backend,
            "connected": False,
            "error": str(exc),
        }
    return {
        "backend": database_backend,
        "connected": connected,
        "url_configured": bool(settings.DATABASE_URL),
    }


def ensure_order_columns() -> None:
    """Add missing payment columns to the orders table if needed."""
    from sqlalchemy import inspect

    inspector = inspect(engine)
    if "orders" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("orders")}
    column_defs = {
        "payment_method": "VARCHAR(20) DEFAULT 'COD'",
        "payment_status": "VARCHAR(20) DEFAULT 'unpaid'",
        "payment_id": "VARCHAR(100)"
    }

    missing_columns = [
        (name, sql_type)
        for name, sql_type in column_defs.items()
        if name not in existing_columns
    ]

    if not missing_columns:
        return

    with engine.begin() as conn:
        for column_name, sql_type in missing_columns:
            conn.execute(text(f"ALTER TABLE orders ADD COLUMN {column_name} {sql_type}"))
            print(f"[MIGRATION] Added missing column: {column_name}")
