from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import User, Product, Order, OrderItem
from app.core.security import get_password_hash
from app.schemas.schemas import UserCreate, UserUpdate, ProductCreate, ProductUpdate


# ============= User CRUD =============

def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    role_val = user.role if (hasattr(user, "role") and user.role) else "customer"
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
        db_user.full_name = user_update.full_name
    if user_update.email is not None:
        db_user.email = user_update.email
    if user_update.password is not None:
        db_user.hashed_password = get_password_hash(user_update.password)
    if user_update.role is not None:
        db_user.role = user_update.role
        db_user.is_admin = (user_update.role == "admin")
    
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


# ============= Product CRUD =============

def create_product(db: Session, product: ProductCreate, owner_id: int) -> Product:
    """Create a new product"""
    db_product = Product(
        **product.dict(),
        owner_id=owner_id
    )
    db.add(db_product)
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
    
    update_data = product_update.dict(exclude_unset=True)
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


# ============= Order CRUD =============

def create_order(db: Session, user_id: int, shipping_address: str, items: List) -> Order:
    """Create a new order"""
    total_amount = sum(item.get("price", 0) * item.get("quantity", 0) for item in items)
    
    db_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        shipping_address=shipping_address
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def get_order_by_id(db: Session, order_id: int) -> Optional[Order]:
    """Get order by ID"""
    return db.query(Order).filter(Order.id == order_id).first()


def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> List[Order]:
    """Get orders by user"""
    return db.query(Order).filter(Order.user_id == user_id).offset(skip).limit(limit).all()


def update_order(db: Session, order_id: int, status: str = None, shipping_address: str = None) -> Optional[Order]:
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
