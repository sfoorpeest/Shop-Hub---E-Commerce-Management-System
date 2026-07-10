"""
Database initialization script.
Creates all tables defined in SQLAlchemy models.
Run: python init_db.py
"""

import logging
from sqlalchemy import inspect, text
from app.db.session import engine, get_database_status
from app.db.base import Base

# Import all models so metadata is registered
from app.models.models import (  # noqa: F401
    User,
    Category,
    Product,
    ProductVariant,
    Cart,
    CartItem,
    Order,
    OrderItem,
)

logger = logging.getLogger(__name__)

TABLES = [
    "users",
    "categories",
    "products",
    "product_variants",
    "carts",
    "cart_items",
    "orders",
    "order_items",
]

ORDER_COLUMNS = {
    "payment_method": "VARCHAR(20) DEFAULT 'COD'",
    "payment_status": "VARCHAR(20) DEFAULT 'unpaid'",
    "payment_id": "VARCHAR(100)",
}


def ensure_order_columns():
    """Add missing payment columns to the orders table if needed."""
    inspector = inspect(engine)
    if "orders" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("orders")}
    missing_columns = [
        (name, sql_type)
        for name, sql_type in ORDER_COLUMNS.items()
        if name not in existing_columns
    ]

    if not missing_columns:
        print("[OK] orders table already contains the required payment columns.")
        return

    with engine.begin() as conn:
        for column_name, sql_type in missing_columns:
            conn.execute(
                text(f"ALTER TABLE orders ADD COLUMN {column_name} {sql_type}")
            )
            print(f"[MIGRATION] Added missing column: {column_name}")


def init_db():
    status = get_database_status()
    print(f"Database backend: {status['backend']}")
    print("Creating database tables...")

    Base.metadata.create_all(bind=engine)
    ensure_order_columns()

    print("\n[OK] Tables created or updated:")
    for table in TABLES:
        print(f"  - {table}")


if __name__ == "__main__":
    init_db()
