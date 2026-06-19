"""
Database initialization script
Run this script to create all tables in the database
"""

from app.db.session import engine
from app.db.base import Base
from app.models.models import User, Product, Order, OrderItem


def init_db():
    """Initialize database by creating all tables"""
    print("Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("✓ Database tables created successfully!")
    print("\nAvailable tables:")
    print("  - users")
    print("  - products")
    print("  - orders")
    print("  - order_items")


if __name__ == "__main__":
    init_db()
