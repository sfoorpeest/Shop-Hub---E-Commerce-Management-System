from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import User, Product, Category, ProductVariant, Cart, CartItem, Order, OrderItem
from app.core.security import get_password_hash
from app.core.config import settings
from app.schemas.schemas import (
    UserCreate, UserUpdate, ProductCreate, ProductUpdate, 
    CategoryCreate, CategoryUpdate, ProductVariantCreate, ProductVariantUpdate,
    CartItemCreate, CartItemUpdate
)


# ============= User CRUD =============

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    role_val = "customer"
    if user.admin_code and user.admin_code == settings.ADMIN_REGISTRATION_CODE:
        role_val = "admin"
        
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=role_val,
        is_admin=(role_val == "admin")
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 10) -> List[User]:
    """Get list of users"""
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Update user"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name  # type: ignore
    if user_update.email is not None:
        db_user.email = user_update.email  # type: ignore
    if user_update.password is not None:
        db_user.hashed_password = get_password_hash(user_update.password)  # type: ignore
    if user_update.role is not None:
        db_user.role = user_update.role  # type: ignore
        db_user.is_admin = (user_update.role == "admin")  # type: ignore
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    """Delete user"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True


# ============= Category CRUD =============

def create_category(db: Session, category: CategoryCreate) -> Category:
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()

def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()

def update_category(db: Session, category_id: int, category_update: CategoryUpdate) -> Optional[Category]:
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return None
    update_data = category_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int) -> bool:
    db_category = get_category_by_id(db, category_id)
    if not db_category:
        return False
    db.delete(db_category)
    db.commit()
    return True


# ============= Product CRUD =============

def create_product(db: Session, product: ProductCreate, owner_id: int) -> Product:
    """Create a new product with variants"""
    # Create the base product
    db_product = Product(
        name=product.name,
        description=product.description,
        base_price=product.base_price,
        image_url=product.image_url,
        category_id=product.category_id,
        owner_id=owner_id
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Create variants if provided
    if product.variants:
        for v in product.variants:
            db_variant = ProductVariant(
                product_id=db_product.id,
                **v.model_dump()
            )
            db.add(db_variant)
        db.commit()
        db.refresh(db_product)
        
    return db_product


def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    """Get product by ID"""
    return db.query(Product).filter(Product.id == product_id).first()


def get_products(db: Session, skip: int = 0, limit: int = 10) -> List[Product]:
    """Get list of products"""
    return db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()


def get_user_products(db: Session, owner_id: int, skip: int = 0, limit: int = 10) -> List[Product]:
    """Get products by owner"""
    return db.query(Product).filter(Product.owner_id == owner_id).offset(skip).limit(limit).all()


def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Optional[Product]:
    """Update product"""
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int) -> bool:
    """Delete product"""
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return False
    
    db.delete(db_product)
    db.commit()
    return True


# ============= Product Variant CRUD =============

def create_product_variant(db: Session, product_id: int, variant: ProductVariantCreate) -> ProductVariant:
    db_variant = ProductVariant(product_id=product_id, **variant.model_dump())
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    return db_variant

def get_variant_by_id(db: Session, variant_id: int) -> Optional[ProductVariant]:
    return db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()

def update_product_variant(db: Session, variant_id: int, variant_update: ProductVariantUpdate) -> Optional[ProductVariant]:
    db_variant = get_variant_by_id(db, variant_id)
    if not db_variant:
        return None
    update_data = variant_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_variant, field, value)
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    return db_variant

def delete_product_variant(db: Session, variant_id: int) -> bool:
    db_variant = get_variant_by_id(db, variant_id)
    if not db_variant:
        return False
    db.delete(db_variant)
    db.commit()
    return True


# ============= Cart CRUD =============

def get_cart_with_details(db: Session, user_id: int) -> Cart:
    """Get or create cart with items, variants, and products eager-loaded."""
    from sqlalchemy.orm import joinedload

    cart = (
        db.query(Cart)
        .options(
            joinedload(Cart.items)
            .joinedload(CartItem.variant)
            .joinedload(ProductVariant.product)
        )
        .filter(Cart.user_id == user_id)
        .first()
    )
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def _validate_variant_stock(variant: ProductVariant, quantity: int) -> None:
    from fastapi import HTTPException, status

    if variant.stock_quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient stock for {variant.size} - {variant.color}. "
                f"Available: {variant.stock_quantity}, requested: {quantity}"
            ),
        )


def add_item_to_cart(db: Session, cart_id: int, item: CartItemCreate) -> CartItem:
    variant = get_variant_by_id(db, variant_id=item.variant_id)
    if not variant:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found",
        )

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart_id,
        CartItem.variant_id == item.variant_id,
    ).first()

    new_qty = item.quantity if not existing_item else existing_item.quantity + item.quantity
    _validate_variant_stock(variant, new_qty)

    if existing_item:
        existing_item.quantity += item.quantity  # type: ignore
        db.commit()
        db.refresh(existing_item)
        return existing_item

    db_item = CartItem(cart_id=cart_id, **item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_cart_item(db: Session, item_id: int, item_update: CartItemUpdate) -> Optional[CartItem]:
    db_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not db_item:
        return None

    variant = get_variant_by_id(db, variant_id=db_item.variant_id)
    if variant:
        _validate_variant_stock(variant, item_update.quantity)

    db_item.quantity = item_update.quantity  # type: ignore
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_cart_item(db: Session, item_id: int) -> bool:
    db_item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not db_item:
        return False
    
    db.delete(db_item)
    db.commit()
    return True

def clear_cart(db: Session, cart_id: int) -> bool:
    db.query(CartItem).filter(CartItem.cart_id == cart_id).delete()
    db.commit()
    return True


# ============= Order CRUD =============

def create_order(db: Session, user_id: int, shipping_address: str, items: List) -> Order:
    # items is expected to be a list of dicts: [{"variant_id": x, "quantity": y, "price_at_time": z}]
    total_amount = sum(item["quantity"] * item["price_at_time"] for item in items)
    
    db_order = Order(
        user_id=user_id,
        shipping_address=shipping_address,
        total_amount=total_amount,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item in items:
        db_item = OrderItem(
            order_id=db_order.id,
            variant_id=item["variant_id"],
            quantity=item["quantity"],
            price_at_time=item["price_at_time"]
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_order)
    return db_order


def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
    """Get order by ID"""
    return db.query(Order).filter(Order.id == order_id).first()


def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> List[Order]:
    """Get orders by user"""
    return db.query(Order).filter(Order.user_id == user_id).offset(skip).limit(limit).all()


def update_order(db: Session, order_id: int, status: Optional[str] = None, shipping_address: Optional[str] = None) -> Optional[Order]:
    """Update order"""
    db_order = get_order_by_id(db, order_id)
    if not db_order:
        return None
    
    if status:
        db_order.status = status
    if shipping_address:
        db_order.shipping_address = shipping_address
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int) -> bool:
    """Delete order"""
    db_order = get_order_by_id(db, order_id)
    if not db_order:
        return False
    
    db.delete(db_order)
    db.commit()
    return True
