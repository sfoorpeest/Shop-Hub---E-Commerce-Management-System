"""
Database initialization script.
Creates all tables defined in SQLAlchemy models.
Run: python init_db.py
"""

import logging
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


def init_db():
    status = get_database_status()
    print(f"Database backend: {status['backend']}")
    print("Creating database tables...")

    Base.metadata.create_all(bind=engine)

    print("\n[OK] Tables created:")
    for table in TABLES:
        print(f"  - {table}")


if __name__ == "__main__":
    init_db()
