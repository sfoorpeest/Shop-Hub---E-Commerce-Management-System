from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# ============= User Schemas =============

class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Create user schema"""
    password: str
    role: Optional[str] = "customer"  # customer, admin, shipper


class UserUpdate(BaseModel):
    """Update user schema"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: int
    is_active: bool
    is_admin: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    """Schema for updating user role"""
    role: str


# ============= Product Schemas =============

class ProductBase(BaseModel):
    """Base product schema"""
    name: str
    description: Optional[str] = None
    price: float
    quantity: int = 0
    category: str = "General"
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    """Create product schema"""
    pass


class ProductUpdate(BaseModel):
    """Update product schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Product response schema"""
    id: int
    is_active: bool
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Order Schemas =============

class OrderItemBase(BaseModel):
    """Base order item schema"""
    product_id: int
    quantity: int
    price: float


class OrderItemCreate(BaseModel):
    """Create order item schema"""
    product_id: int
    quantity: int


class OrderItemResponse(OrderItemBase):
    """Order item response schema"""
    id: int
    order_id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    """Base order schema"""
    total_amount: float
    status: str = "pending"
    shipping_address: str


class OrderCreate(BaseModel):
    """Create order schema"""
    shipping_address: str
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    """Update order schema"""
    status: Optional[str] = None
    shipping_address: Optional[str] = None


class OrderResponse(OrderBase):
    """Order response schema"""
    id: int
    user_id: int
    shipper_id: Optional[int] = None
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Token Schemas =============

class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token data schema"""
    username: Optional[str] = None


# ============= Dashboard & Custom Schemas =============

class DashboardStatsResponse(BaseModel):
    """Dashboard statistics response"""
    total_products: int
    total_orders: int
    total_revenue: float
    total_users: int


class RevenueChartItem(BaseModel):
    """Item for revenue chart"""
    month: str
    revenue: float
