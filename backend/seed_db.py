"""
Database seeding script for Shop Hub (clothing e-commerce).
Drops all tables, recreates them, and inserts starter data.

Run: python seed_db.py
Requires: DATABASE_URL in .env (or USE_SQLITE_FALLBACK=true)
"""

from datetime import datetime, timedelta, timezone

from app.db.session import engine, SessionLocal, get_database_status
from app.db.base import Base
from app.models.models import (
    User,
    Category,
    Product,
    ProductVariant,
    Cart,
    CartItem,
    Order,
    OrderItem,
)
from app.core.security import get_password_hash


def _variants(sizes, colors, stock=20, extra_price=0.0):
    """Helper to generate size × color variant combinations."""
    result = []
    for size in sizes:
        for color in colors:
            result.append(
                ProductVariant(
                    size=size,
                    color=color,
                    stock_quantity=stock,
                    additional_price=extra_price,
                )
            )
    return result


def seed_db():
    status = get_database_status()
    print(f"Seeding database ({status['backend']})...")

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables recreated.")

    db = SessionLocal()
    try:
        password_hash = get_password_hash("password123")

        # --- Users ---
        admin = User(
            username="admin",
            email="admin@shophub.com",
            hashed_password=password_hash,
            full_name="ShopHub Administrator",
            role="admin",
            is_admin=True,
        )
        customer = User(
            username="customer",
            email="customer@shophub.com",
            hashed_password=password_hash,
            full_name="Nguyen Van A",
            role="customer",
        )
        shipper = User(
            username="shipper",
            email="shipper@shophub.com",
            hashed_password=password_hash,
            full_name="Tran Shipper",
            role="shipper",
        )
        db.add_all([admin, customer, shipper])
        db.commit()
        db.refresh(admin)
        db.refresh(customer)
        db.refresh(shipper)
        print("[OK] Users: admin / customer / shipper (password: password123)")

        # --- Categories ---
        categories_data = [
            ("Áo thun", "Áo thun nam nữ basic và oversize"),
            ("Quần jean", "Quần jean slim, straight và baggy"),
            ("Áo khoác", "Áo khoác hoodie, bomber và denim"),
            ("Váy & Đầm", "Váy và đầm thời trang nữ"),
            ("Phụ kiện", "Mũ, túi và phụ kiện thời trang"),
        ]
        categories = {}
        for name, desc in categories_data:
            cat = Category(name=name, description=desc)
            db.add(cat)
            db.flush()
            categories[name] = cat
        db.commit()
        print(f"[OK] Categories: {len(categories_data)}")

        # --- Products (clothing) ---
        products_spec = [
            {
                "name": "Áo Thun Cotton Basic",
                "description": "Áo thun 100% cotton thoáng mát, form regular fit. Phù hợp đi làm và dạo phố.",
                "base_price": 199000,
                "category": "Áo thun",
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
                "variants": _variants(["S", "M", "L", "XL"], ["Trắng", "Đen", "Xám"], stock=25),
            },
            {
                "name": "Áo Thun Oversize Street",
                "description": "Áo oversize phong cách streetwear, chất liệu cotton pha co giãn nhẹ.",
                "base_price": 249000,
                "category": "Áo thun",
                "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop",
                "variants": _variants(["M", "L", "XL", "XXL"], ["Đen", "Be", "Olive"], stock=18),
            },
            {
                "name": "Quần Jean Slim Fit",
                "description": "Quần jean co giãn, form slim ôm vừa phải. Màu indigo classic.",
                "base_price": 449000,
                "category": "Quần jean",
                "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop",
                "variants": _variants(["28", "30", "32", "34"], ["Indigo", "Đen"], stock=15),
            },
            {
                "name": "Quần Jean Baggy",
                "description": "Quần jean baggy trend Gen-Z, ống rộng thoải mái.",
                "base_price": 499000,
                "category": "Quần jean",
                "image_url": "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&auto=format&fit=crop",
                "variants": _variants(["28", "30", "32"], ["Xanh nhạt", "Đen"], stock=12, extra_price=20000),
            },
            {
                "name": "Hoodie Unisex Fleece",
                "description": "Áo hoodie nỉ bông ấm áp, có mũ trùm và túi kangaroo.",
                "base_price": 399000,
                "category": "Áo khoác",
                "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop",
                "variants": _variants(["S", "M", "L", "XL"], ["Đen", "Xám", "Navy"], stock=20),
            },
            {
                "name": "Áo Khoác Bomber",
                "description": "Áo bomber phong cách pilot, chống gió nhẹ, lót polyester.",
                "base_price": 599000,
                "category": "Áo khoác",
                "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop",
                "variants": _variants(["M", "L", "XL"], ["Đen", "Olive"], stock=10, extra_price=50000),
            },
            {
                "name": "Váy Midi Linen",
                "description": "Váy midi chất liệu linen thoáng mát, tôn dáng thanh lịch.",
                "base_price": 349000,
                "category": "Váy & Đầm",
                "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop",
                "variants": _variants(["S", "M", "L"], ["Trắng", "Be", "Hồng pastel"], stock=14),
            },
            {
                "name": "Mũ Bucket Cotton",
                "description": "Mũ bucket phong cách Hàn Quốc, chất liệu cotton cao cấp.",
                "base_price": 129000,
                "category": "Phụ kiện",
                "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop",
                "variants": _variants(["Free"], ["Đen", "Be", "Kem"], stock=30),
            },
        ]

        products = []
        first_variants = []
        for spec in products_spec:
            variants = spec.pop("variants")
            cat_name = spec.pop("category")
            product = Product(
                **spec,
                category_id=categories[cat_name].id,
                owner_id=admin.id,
            )
            db.add(product)
            db.flush()
            for v in variants:
                v.product_id = product.id
                db.add(v)
            first_variants.append(variants[0])
            products.append(product)
        db.commit()
        print(f"[OK] Products: {len(products)} (with size/color variants)")

        # --- Sample orders ---
        now = datetime.now(timezone.utc)
        v0 = first_variants[0]
        v2 = first_variants[2]
        db.refresh(v0)
        db.refresh(v2)

        order1 = Order(
            user_id=customer.id,
            total_amount=products[0].base_price + v0.additional_price,
            status="processing",
            shipping_address="123 Nguyễn Trãi, Quận 1, TP.HCM",
            created_at=now - timedelta(hours=3),
        )
        db.add(order1)
        db.flush()
        db.add(
            OrderItem(
                order_id=order1.id,
                variant_id=v0.id,
                quantity=1,
                price_at_time=products[0].base_price + v0.additional_price,
            )
        )

        order2 = Order(
            user_id=customer.id,
            total_amount=(products[2].base_price + v2.additional_price) * 2,
            status="shipping",
            shipping_address="456 Lê Lợi, Đà Nẵng",
            shipper_id=shipper.id,
            created_at=now - timedelta(days=1),
        )
        db.add(order2)
        db.flush()
        db.add(
            OrderItem(
                order_id=order2.id,
                variant_id=v2.id,
                quantity=2,
                price_at_time=products[2].base_price + v2.additional_price,
            )
        )

        db.commit()
        print("[OK] Sample orders seeded.")
        print("\n=== Seed complete! ===")
        print("Login: customer / password123  |  admin / password123")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
