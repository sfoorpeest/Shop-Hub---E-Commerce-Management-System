"""
Database seeding script
Drops all existing tables, recreates them, and inserts realistic starter data.
"""
from datetime import datetime, timedelta
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.models import User, Product, Order, OrderItem
from app.core.security import get_password_hash


def seed_db():
    print("Recreating database tables...")
    # Drop all existing tables for a clean slate
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables created successfully.")

    db = SessionLocal()
    try:
        print("Seeding Users...")
        # 1. Users
        password_hash = get_password_hash("password123")
        
        admin_user = User(
            username="admin",
            email="admin@shophub.com",
            hashed_password=password_hash,
            full_name="ShopHub Administrator",
            role="admin",
            is_admin=True
        )
        
        customer_user = User(
            username="customer",
            email="customer@shophub.com",
            hashed_password=password_hash,
            full_name="John Doe",
            role="customer",
            is_admin=False
        )
        
        shipper_user = User(
            username="shipper",
            email="shipper@shophub.com",
            hashed_password=password_hash,
            full_name="Express Shipper",
            role="shipper",
            is_admin=False
        )
        
        db.add_all([admin_user, customer_user, shipper_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(customer_user)
        db.refresh(shipper_user)
        print("[OK] Users seeded successfully.")

        print("Seeding Products...")
        # 2. Products
        products_data = [
            {
                "name": "iPhone 15 Pro",
                "description": "Titanium design, A17 Pro chip, customisable Action button, and a powerful 48MP main camera.",
                "price": 999.00,
                "quantity": 12,
                "category": "Electronics",
                "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop"
            },
            {
                "name": "Sony WH-1000XM5",
                "description": "Industry-leading noise cancelling wireless headphones with premium sound quality and smart listening controls.",
                "price": 349.99,
                "quantity": 18,
                "category": "Electronics",
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop"
            },
            {
                "name": "Nike Air Max Plus",
                "description": "Give your attitude an edge with the Nike Air Max Plus, a Tuned Air experience that offers premium stability.",
                "price": 179.99,
                "quantity": 25,
                "category": "Fashion",
                "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"
            },
            {
                "name": "Levi's 501 Original Jeans",
                "description": "The original blue jean since 1873. Crafted in high-quality denim with straight fit and signature button fly.",
                "price": 69.50,
                "quantity": 30,
                "category": "Fashion",
                "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop"
            },
            {
                "name": "Dyson V15 Detect Vacuum",
                "description": "Powerful cordless vacuum cleaner with laser illumination that reveals invisible dust on hard floors.",
                "price": 749.00,
                "quantity": 8,
                "category": "Home",
                "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop"
            },
            {
                "name": "Nespresso Vertuo Next",
                "description": "Elegant coffee and espresso maker that automatically adapts brewing parameters to each capsule size.",
                "price": 199.00,
                "quantity": 15,
                "category": "Home",
                "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop"
            },
            {
                "name": "Designing Data-Intensive Applications",
                "description": "The definitive guide to the system architectures of data processing and storage systems by Martin Kleppmann.",
                "price": 45.00,
                "quantity": 40,
                "category": "Books",
                "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop"
            },
            {
                "name": "Atomic Habits",
                "description": "An easy and proven way to build good habits and break bad ones, by world-renowned habits expert James Clear.",
                "price": 16.99,
                "quantity": 50,
                "category": "Books",
                "image_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop"
            }
        ]

        products_list = []
        for p in products_data:
            db_product = Product(
                name=p["name"],
                description=p["description"],
                price=p["price"],
                quantity=p["quantity"],
                category=p["category"],
                image_url=p["image_url"],
                owner_id=admin_user.id
            )
            db.add(db_product)
            products_list.append(db_product)
        
        db.commit()
        for p in products_list:
            db.refresh(p)
        print("[OK] Products seeded successfully.")

        print("Seeding Orders...")
        # 3. Orders & Order Items
        
        # Order 1: Processing, unclaimed (Ready for shipper to claim)
        order1 = Order(
            user_id=customer_user.id,
            total_amount=1044.00,
            status="processing",
            shipping_address="123 Nguyen Trai Street, District 1, Ho Chi Minh City",
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.add(order1)
        db.flush()
        
        item1_1 = OrderItem(order_id=order1.id, product_id=products_list[0].id, quantity=1, price=999.00) # iPhone
        item1_2 = OrderItem(order_id=order1.id, product_id=products_list[6].id, quantity=1, price=45.00)  # DDIA Book
        db.add_all([item1_1, item1_2])
        
        # Order 2: Claimed by shipper, currently shipping
        order2 = Order(
            user_id=customer_user.id,
            total_amount=249.49,
            status="shipping",
            shipping_address="456 Le Loi Street, Hai Chau District, Da Nang City",
            shipper_id=shipper_user.id,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(order2)
        db.flush()
        
        item2_1 = OrderItem(order_id=order2.id, product_id=products_list[2].id, quantity=1, price=179.99) # Nike
        item2_2 = OrderItem(order_id=order2.id, product_id=products_list[3].id, quantity=1, price=69.50)  # Levi's
        db.add_all([item2_1, item2_2])
        
        # Order 3: Delivered by shipper
        order3 = Order(
            user_id=customer_user.id,
            total_amount=199.00,
            status="delivered",
            shipping_address="789 Tran Hung Dao Street, Hoan Kiem District, Hanoi",
            shipper_id=shipper_user.id,
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(order3)
        db.flush()
        
        item3_1 = OrderItem(order_id=order3.id, product_id=products_list[5].id, quantity=1, price=199.00) # Nespresso
        db.add_all([item3_1])
        
        db.commit()
        print("[OK] Orders seeded successfully.")
        print("\nAll data seeded successfully! You are ready to run the project.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
