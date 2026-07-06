from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone

from app.db.base import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String(20), default="customer")  # admin, customer, shipper
    
    # Relationships
    products = relationship("Product", back_populates="owner")
    orders = relationship("Order", back_populates="user", foreign_keys="Order.user_id")
    deliveries = relationship("Order", back_populates="shipper", foreign_keys="Order.shipper_id")
    cart = relationship("Cart", back_populates="user", uselist=False)


class Category(Base):
    """Category model for products"""
    __tablename__ = "categories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    """Product model (e.g., T-Shirt, Jeans)"""
    __tablename__ = "products"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    """Specific variant of a product (e.g., Size M, Color Red)"""
    __tablename__ = "product_variants"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    size: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g., S, M, L, XL, XXL
    color: Mapped[str] = mapped_column(String(50), nullable=False) # e.g., Red, Blue, Black
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    additional_price: Mapped[float] = mapped_column(Float, default=0.0) # Extra cost for this variant
    
    # Relationships
    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")
    cart_items = relationship("CartItem", back_populates="variant")


class Cart(Base):
    """Shopping Cart model"""
    __tablename__ = "carts"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    """Shopping Cart Item model"""
    __tablename__ = "cart_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cart_id: Mapped[int] = mapped_column(Integer, ForeignKey("carts.id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(Integer, ForeignKey("product_variants.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    
    # Relationships
    cart = relationship("Cart", back_populates="items")
    variant = relationship("ProductVariant", back_populates="cart_items")


class Order(Base):
    """Order model"""
    __tablename__ = "orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, processing, shipping, delivered, cancelled
    shipping_address: Mapped[str] = mapped_column(Text, nullable=False)
    shipper_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(20), default="COD")  # COD, BANK_TRANSFER
    payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")  # unpaid, paid, failed
    payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    shipper = relationship("User", back_populates="deliveries", foreign_keys=[shipper_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Order Item model - linked to specific ProductVariant"""
    __tablename__ = "order_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(Integer, ForeignKey("product_variants.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_at_time: Mapped[float] = mapped_column(Float, nullable=False) # Price including variant's additional_price
    
    # Relationships
    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant", back_populates="order_items")
